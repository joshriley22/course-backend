"""Create the "CS (Engineering)" Major (Computer Science B.S.) and link it to the existing Courses for each field.

Source: the Undergraduate Record's Computer Science B.S. page (records.ureg.virginia.edu, catoid=72&poid=11700).
The prereq field is copied from the hand-curated "CS (Arts)" Major. SEAS general requirements, HSS, Math/Science and
unrestricted electives are left to the "Engineering" Major (see initialize_engineering_major.py).

Usage (from the project root):
    python -m backend.db_setup.initialize_cs_engineering_major
"""
import uuid

from backend.db import db
from backend.db_setup.major_credits import field_credits
from backend.db_setup.catalog_courses import add_catalog_courses
from backend.db_setup.initialize_majors import clear_choices, link_choices

NAME = "CS (Engineering)"
LONG_NAME = "Computer Science (Engineering)"
PREREQ_SOURCE = "CS (Arts)"

# field -> explicitly listed courses (labels live in frontend/src/utils/FieldFormatter.tsx)
REQUIRED_COURSES = {
    "prereq": [],  # copied from PREREQ_SOURCE
    # Foundation Courses + the upper-level Software Engineering requirement
    "core": [("CS", "2100"), ("CS", "2120"), ("CS", "2130"), ("CS", "3100"), ("CS", "3120"), ("CS", "3130"),
             ("CS", "3140"), ("CS", "3240")],
    "elective": [("CS", "4993")],  # up to 3 credits of Independent Study count
    # CS 4991 is paired with a graded CS 4000-level course not used elsewhere
    "capstone": [("CS", "4980"), ("CS", "4971"), ("CS", "4991")],
    # APMA 3100 plus two of the other four
    "apma": [("APMA", "3100"), ("APMA", "2130"), ("APMA", "3080"), ("APMA", "3120"), ("APMA", "3150")],
}
FIELDS = list(REQUIRED_COURSES)
# either/or groups, written as MAJOR_REL "or" edges (see initialize_majors.link_choices)
CHOICES = {"prereq": "CS 1110 1112", "capstone": "CS 4980 4971 4991"}


def is_cs_elective(code, number):
    """CS mnemonic, 3000+, second digit not 0 or 9, and not a core or capstone course."""
    return (code == "CS" and number >= "3000" and number[1] not in "09"
            and (code, number) not in REQUIRED_COURSES["core"] + REQUIRED_COURSES["capstone"])


def main():
    with db.get_session() as session:
        # electives are any CS course at the 3000 level or higher
        add_catalog_courses(session, ["CS"], listed=[c for cs in REQUIRED_COURSES.values() for c in cs])
        courses = [(r["code"], r["number"]) for r in
                   session.run("MATCH (c:Course) RETURN DISTINCT c.code AS code, c.number AS number")]
        prereqs = [(r["code"], r["number"]) for r in session.run(
            "MATCH (:Major {name:$name})-[:COURSE_OF {relationship:'prereq'}]->(c) "
            "RETURN DISTINCT c.code AS code, c.number AS number",
            name=PREREQ_SOURCE,
        )]

        by_field = {field: set(listed) for field, listed in REQUIRED_COURSES.items()}
        by_field["prereq"] = set(prereqs)
        by_field["elective"] |= {c for c in courses if is_cs_elective(*c)}

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
            print(f"{field:9} linked {linked:4}" + (f"  not in DB: {', '.join(missing)}" if missing else ""))
        clear_choices(session, NAME)
        print(f"or-edges  {sum(link_choices(session, NAME, f, c) for f, c in CHOICES.items())}")


if __name__ == "__main__":
    main()
