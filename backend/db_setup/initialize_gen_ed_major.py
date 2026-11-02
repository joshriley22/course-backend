"""Create a single "Arts & Sciences" Major whose fields are the College of Arts & Sciences Disciplines and
writing requirements, linked to every existing Course that carries the matching SIS course attribute.

Usage (from the project root):
    python -m backend.db_setup.initialize_gen_ed_major
"""
import uuid
from concurrent.futures import ThreadPoolExecutor

import requests

from backend.db import db
from backend.db_setup.major_credits import field_credits

NAME = "Arts & Sciences General Requirements"
LONG_NAME = "College of Arts & Sciences"
TERMS = ["1262", "1268", "1272"]  # Spring 2026, Fall 2026, Spring 2027
SIS_URL = ("https://sisuva.admin.virginia.edu/psc/ihprd/UVSS/SA/s/"
           "WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_ClassSearch?institution=UVA01&term={term}&page={page}")

# SIS course attribute value -> major field (labels live in frontend/src/utils/FieldFormatter.tsx)
ATTRIBUTE_FIELDS = {
    "ASUD-AIP": "aip",   # Artistic, Interpretive, and Philosophical Inquiry
    "ASUD-CMP": "cmp",   # The Chemical, Mathematical, and Physical Universe
    "ASUD-CSW": "csw",   # Cultures and Societies of the World
    "ASUD-HP": "hp",     # Historical Perspectives
    "ASUD-LS": "ls",     # Living Systems
    "ASUD-SS": "ss",     # Science and Society
    "ASUD-SES": "ses",   # Social and Economic Systems
    "ASUR-R21C1": "writing1",  # First Writing Requirement
    "ASUR-R21C2": "writing2",  # Second Writing Requirement
}
FIELDS = list(ATTRIBUTE_FIELDS.values())

# First Writing Requirement paths named in the Undergraduate Record; SIS only tags a few of these
FIRST_WRITING_COURSES = [("ENWR", n) for n in ["1505", "1506", "1507", "1508", "1510", "1520", "1530", "2510"]] \
    + [("ENCW", "2300"), ("ENCW", "2600")]


def fetch_term(term):
    first = requests.get(SIS_URL.format(term=term, page=1), timeout=120).json()
    pages = range(2, first["pageCount"] + 1)
    with ThreadPoolExecutor(8) as ex:
        rest = ex.map(lambda p: requests.get(SIS_URL.format(term=term, page=p), timeout=120).json()["classes"], pages)
        return first["classes"] + [c for page in rest for c in page]


def courses_by_field():
    by_field = {field: set() for field in FIELDS}
    for term in TERMS:
        for class_ in fetch_term(term):
            for value in (class_.get("crse_attr_value") or "").split(","):
                field = ATTRIBUTE_FIELDS.get(value)
                if field:
                    by_field[field].add((class_["subject"], class_["catalog_nbr"]))
    by_field["writing1"].update(FIRST_WRITING_COURSES)
    return by_field


def main():
    by_field = courses_by_field()
    with db.get_session() as session:
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
            print(f"{field:9} in SIS {len(by_field[field]):4}  linked {linked:4}")


if __name__ == "__main__":
    main()
