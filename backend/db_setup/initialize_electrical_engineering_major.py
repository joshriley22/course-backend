"""Create the "Electrical Eng" Major (Electrical Engineering B.S.) and link it to the existing Courses for each field.

Source: the Undergraduate Record's Electrical Engineering B.S. page (records.ureg.virginia.edu, catoid=72&poid=11707).
SEAS general requirements, HSS, Math/Science and unrestricted electives are left to the "Engineering" Major
(see initialize_engineering_major.py).

Usage (from the project root):
    python -m backend.db_setup.initialize_electrical_engineering_major
"""
import uuid

from backend.db import db
from backend.db_setup.major_credits import field_credits
from backend.db_setup.catalog_courses import add_catalog_courses
from backend.db_setup.initialize_majors import clear_choices, link_choices
from backend.db_setup.initialize_engineering_major import REQUIRED_COURSES as SEAS_REQUIRED_COURSES, is_hss

NAME = "Electrical Eng"
LONG_NAME = "Electrical Engineering"

# field -> explicitly listed courses (labels live in frontend/src/utils/FieldFormatter.tsx)
REQUIRED_COURSES = {
    "math": [("APMA", "2130"), ("APMA", "3100")],
    "mathelective": [],
    # CS 2130 may replace ECE 2435
    "ece": [("ECE", "2300"), ("ECE", "2330"), ("ECE", "2410"), ("ECE", "2435"), ("CS", "2130"), ("ECE", "2600"),
            ("ECE", "2700"), ("ECE", "3430")],
    "elective": [],  # includes the 1.5 credit ECE lab elective
    "design": [("ECE", "4991"), ("ECE", "4440")],
    "technical": [],
}
FIELDS = list(REQUIRED_COURSES)
# either/or groups, written as MAJOR_REL "or" edges (see initialize_majors.link_choices)
CHOICES = {"ece": "ECE 2435 / CS 2130", "design": "ECE 4991 4440"}
REQUIRED = {c for listed in REQUIRED_COURSES.values() for c in listed}
SEAS_REQUIRED = {c for field in ("calculus", "chemistry", "physics", "programming", "foundations")
                 for c in SEAS_REQUIRED_COURSES[field]}

MATH_SUBJECTS = ["APMA", "MATH"]
ENGINEERING_SUBJECTS = ["APMA", "BME", "CE", "CHE", "CS", "ECE", "ENGR", "MAE", "MSE", "SYS"]
SCIENCE_SUBJECTS = ["ASTR", "BIOL", "CHEM", "EVSC", "PHYS"]
TECHNICAL_SUBJECTS = list(dict.fromkeys(ENGINEERING_SUBJECTS + MATH_SUBJECTS + SCIENCE_SUBJECTS))


def is_math_elective(code, number):
    """Applied math or mathematics at the 2000 level or higher, not already required."""
    return code in MATH_SUBJECTS and number >= "2000" and (code, number) not in REQUIRED | SEAS_REQUIRED


def is_ece_elective(code, number):
    """ECE mnemonic, 3000+, and not a required course."""
    return code == "ECE" and number >= "3000" and (code, number) not in REQUIRED


def is_technical_elective(code, number):
    """Engineering, mathematics, or science at the 2000 level or higher, not required and not an approved HSS course."""
    return (code in TECHNICAL_SUBJECTS and number >= "2000" and not is_hss(code, number)
            and (code, number) not in REQUIRED | SEAS_REQUIRED)


def main():
    with db.get_session() as session:
        # math, ECE and technical electives are all level rules over whole subjects
        add_catalog_courses(session, TECHNICAL_SUBJECTS, listed=REQUIRED)
        courses = [(r["code"], r["number"]) for r in
                   session.run("MATCH (c:Course) RETURN DISTINCT c.code AS code, c.number AS number")]

        by_field = {field: set(listed) for field, listed in REQUIRED_COURSES.items()}
        by_field["mathelective"] = {c for c in courses if is_math_elective(*c)}
        by_field["elective"] = {c for c in courses if is_ece_elective(*c)}
        by_field["technical"] = {c for c in courses if is_technical_elective(*c)}

        session.run(
            """
            MERGE (m:Major {name:$name})
            ON CREATE SET m.uuid = $uuid
            SET m.long_name = $long_name, m.fields = $fields, m.credits = $credits
            """,
            name=NAME, uuid=str(uuid.uuid4()), long_name=LONG_NAME, fields=FIELDS, credits=field_credits(NAME, FIELDS),
        )
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
