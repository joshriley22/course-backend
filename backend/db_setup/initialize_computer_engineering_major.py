"""Create the "Computer Eng" Major (Computer Engineering B.S.) and link it to the existing Courses for each field.

Source: the Undergraduate Record's Computer Engineering B.S. page (records.ureg.virginia.edu, catoid=72&poid=11698).
SEAS general requirements, HSS, Math/Science and unrestricted electives are left to the "Engineering" Major
(see initialize_engineering_major.py).

Usage (from the project root):
    python -m backend.db_setup.initialize_computer_engineering_major
"""
import uuid

from backend.db import db
from backend.db_setup.major_credits import field_credits
from backend.db_setup.catalog_courses import add_catalog_courses

NAME = "Computer Eng"
LONG_NAME = "Computer Engineering"

# field -> explicitly listed courses (labels live in frontend/src/utils/FieldFormatter.tsx)
REQUIRED_COURSES = {
    "math": [("APMA", "2130"), ("APMA", "3100")],
    "ece": [("ECE", "2330"), ("ECE", "2300"), ("ECE", "2700"), ("ECE", "2600"), ("ECE", "3430"), ("ECE", "4435")],
    "cs": [("CS", "2100"), ("CS", "2120"), ("CS", "2130"), ("CS", "3130"), ("CS", "3140")],
    "elective": [],
    "design": [("ECE", "4440")],
}
FIELDS = list(REQUIRED_COURSES)
REQUIRED = {c for listed in REQUIRED_COURSES.values() for c in listed}


def is_elective(code, number):
    """ECE or CS mnemonic, 3000+, and not a required course."""
    return code in ("ECE", "CS") and number >= "3000" and (code, number) not in REQUIRED


def main():
    with db.get_session() as session:
        # electives are any ECE/CS course at the 3000 level or higher
        add_catalog_courses(session, ["ECE", "CS"], listed=REQUIRED)
        courses = [(r["code"], r["number"]) for r in
                   session.run("MATCH (c:Course) RETURN DISTINCT c.code AS code, c.number AS number")]

        by_field = {field: set(listed) for field, listed in REQUIRED_COURSES.items()}
        by_field["elective"] = {c for c in courses if is_elective(*c)}

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


if __name__ == "__main__":
    main()
