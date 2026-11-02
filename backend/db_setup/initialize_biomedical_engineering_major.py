"""Create the "Biomedical Eng" Major (Biomedical Engineering B.S.) and link it to the existing Courses for each field.

Sources: the Undergraduate Record's Biomedical Engineering B.S. page (records.ureg.virginia.edu, catoid=72&poid=11689)
for the required courses, and the BME department's undergraduate electives page (engineering.virginia.edu, .../
bs-biomedical-engineering/bme-undergraduate-electives) for the BME, Engineering and Technical elective rules.
SEAS general requirements, HSS, Math/Science and unrestricted electives are left to the "Engineering" Major
(see initialize_engineering_major.py).

Usage (from the project root):
    python -m backend.db_setup.initialize_biomedical_engineering_major
"""
import re
import uuid

from backend.db import db
from backend.db_setup.major_credits import field_credits
from backend.db_setup.catalog_courses import add_catalog_courses
from backend.db_setup.initialize_majors import clear_choices, link_choices
from backend.db_setup.initialize_engineering_major import REQUIRED_COURSES as SEAS_REQUIRED_COURSES

NAME = "Biomedical Eng"
LONG_NAME = "Biomedical Engineering"

# field -> explicitly listed courses (labels live in frontend/src/utils/FieldFormatter.tsx)
REQUIRED_COURSES = {
    # APMA 3110 may replace APMA 3100
    "math": [("APMA", "2130"), ("APMA", "3100"), ("APMA", "3110")],
    "core": [("BME", "2000"), ("BME", "2101"), ("BME", "2102"), ("BME", "2104"), ("BME", "2220"), ("BME", "2315"),
             ("BME", "3080"), ("BME", "3090"), ("BME", "3240"), ("BME", "3310")],
    # only one of the non-BME courses counts, and only with BME-specific content
    "elective": [("CHE", "3347"), ("CHE", "4448"), ("ECE", "4750")],
    "engineering": [],
    "technical": [],
    "capstone": [("BME", "4063"), ("BME", "4064")],
}
FIELDS = list(REQUIRED_COURSES)
# either/or groups, written as MAJOR_REL "or" edges (see initialize_majors.link_choices)
CHOICES = {"math": "APMA 3100 3110"}
REQUIRED = {c for listed in REQUIRED_COURSES.values() for c in listed}
SEAS_REQUIRED = {c for field in ("calculus", "chemistry", "physics", "programming", "foundations", "sts")
                 for c in SEAS_REQUIRED_COURSES[field]}
NOT_ELECTIVE = REQUIRED - set(REQUIRED_COURSES["elective"]) | SEAS_REQUIRED

ENGINEERING_SUBJECTS = ["BME", "CE", "CHE", "CS", "ECE", "MAE", "MSE", "SYS"]  # no APMA, STS or ENGR
TECHNICAL_SUBJECTS = ["APMA", "BME", "CE", "CHE", "CS", "ECE", "ENGR", "MAE", "MSE", "SYS",  # engineering
                      "MATH", "DS",  # math, data science
                      "ASTR", "BIOL", "CHEM", "EVSC", "PHYS", "PSYC"]  # science


def parse_courses(text):
    """"CS 4970 4971 / PSYC 2300-3110" -> {code: [(low, high)]}"""
    ranges = {}
    for group in text.split("/"):
        code, *numbers = group.split()
        for n in numbers:
            low, _, high = n.partition("-")
            ranges.setdefault(code, []).append((low, high or low))
    return ranges


def listed_in(ranges, code, number):
    return any(low <= number <= high for low, high in ranges.get(code, []))


# "NO" lists from the BME electives page
ENGINEERING_EXCLUDED = parse_courses(
    "BME 4995 / CHE 4995 / CE 4000 4500 4990 4991 4995 / CS 4753 4970 4971 4980 4993"
    " / ECE 2066 3750 4907 4908 4991 / MAE 4511 4512 4513 4514 4990 / MSE 2010 2090 4960"
    " / SYS 2055 2056 2057 4000 4044 4995 3055 4053 4054 4055"
)
TECHNICAL_EXCLUDED = parse_courses(
    "ASTR 3410 3420 3460 3470 3480 4998 / BIOL 2900 3000 3200 3210 3230 4900 4910 4920 / BME 4995 / CHE 4995"
    " / CHEM 3910 3920 3951 3961 4951 4961 / CE 4991 4995 / CS 4970 4971 4980 4998 / ECE 3750 4907 4908"
    " / ENGR 4880 4890 4920 / EVSC 2010 2900 2050 2220 2030 3020 4030 4040 4050 4070 4995"
    " / MATH 2310 3100 3120 3250 3255 / MSE 2010 4960 / MAE 4511 4512 4513 4514"
    " / PHYS 2010 2020 2030 2040 2360 2640 2310 2320 2660 3040"
    " / PSYC 2100 2150 2210 2300-3110 3410-4180 4300-5200 / SYS 3055 4053 4054 4055"
)


# Other departments' capstone design sequences, which the page's lists don't name
CAPSTONE_DESIGN = parse_courses("CE 4981 4982 / CHE 4476 / DS 4002 4022 / ECE 4440 / MAE 4610 4620 / MSE 4610 4620")
RESEARCH_OR_CAPSTONE_RE = re.compile(r"capstone|thesis|distinguished major|research in|research experience", re.I)


def is_research_or_capstone(code, number, name):
    """Neither elective allows research-for-credit or capstone design courses; x99x numbers are independent study
    and research."""
    return (number[1:3] == "99" or listed_in(CAPSTONE_DESIGN, code, number)
            or bool(RESEARCH_OR_CAPSTONE_RE.search(name or "")))


def is_bme_elective(code, number, name):
    """3000+ BME course that isn't required; BME 4995 is allowed (up to 3 credits)."""
    return code == "BME" and number >= "3000" and (code, number) not in NOT_ELECTIVE


def is_engineering_elective(code, number, name):
    return (code in ENGINEERING_SUBJECTS and number >= "2000" and not is_research_or_capstone(code, number, name)
            and not listed_in(ENGINEERING_EXCLUDED, code, number) and (code, number) not in NOT_ELECTIVE)


def is_technical_elective(code, number, name):
    return (code in TECHNICAL_SUBJECTS and number >= "2000" and not is_research_or_capstone(code, number, name)
            and not listed_in(TECHNICAL_EXCLUDED, code, number) and (code, number) not in NOT_ELECTIVE)


def main():
    with db.get_session() as session:
        # BME, engineering and technical electives are all level rules over whole subjects
        add_catalog_courses(session, TECHNICAL_SUBJECTS, listed=REQUIRED)
        named = [(r["code"], r["number"], r["name"]) for r in
                 session.run("MATCH (c:Course) RETURN DISTINCT c.code AS code, c.number AS number, c.name AS name")]
        courses = [c[:2] for c in named]

        by_field = {field: set(listed) for field, listed in REQUIRED_COURSES.items()}
        by_field["elective"] |= {c[:2] for c in named if is_bme_elective(*c)}
        by_field["engineering"] = {c[:2] for c in named if is_engineering_elective(*c)}
        by_field["technical"] = {c[:2] for c in named if is_technical_elective(*c)}

        session.run(
            """
            MERGE (m:Major {name:$name})
            ON CREATE SET m.uuid = $uuid
            SET m.long_name = $long_name, m.fields = $fields, m.credits = $credits
            """,
            name=NAME, uuid=str(uuid.uuid4()), long_name=LONG_NAME, fields=FIELDS, credits=field_credits(NAME, FIELDS),
        )
        # relink from scratch so courses dropped by a rule change don't linger
        session.run("MATCH (:Major {name:$name})-[r:COURSE_OF]->() DELETE r", name=NAME)
        for field in FIELDS:
            linked = session.run(
                """
                MATCH (m:Major {name:$name})
                UNWIND $courses AS course
                CALL (course) {
                    MATCH (c:Course {code:course[0], number:course[1]})
                    RETURN c ORDER BY c.credits = '0' LIMIT 1
                }
                MERGE (m)-[:COURSE_OF {relationship:$field}]->(c)
                RETURN count(c) AS n
                """,
                name=NAME, field=field, courses=[list(c) for c in sorted(by_field[field])],
            ).single()["n"]
            missing = sorted(f"{c} {n}" for c, n in set(REQUIRED_COURSES[field]) - set(courses))
            print(f"{field:12} linked {linked:4}" + (f"  not in DB: {', '.join(missing)}" if missing else ""))
        clear_choices(session, NAME)
        print(f"or-edges     {sum(link_choices(session, NAME, f, c) for f, c in CHOICES.items())}")


if __name__ == "__main__":
    main()
