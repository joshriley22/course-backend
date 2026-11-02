"""Create a single "Engineering" Major whose fields are the School of Engineering and Applied Science general
education requirements, linked to the existing Courses that satisfy each one.

Sources: the Undergraduate Record's SEAS Curricular Requirements (records.ureg.virginia.edu, catoid=72&navoid=6621)
and the SEAS Undergraduate Electives page for the HSS and Math/Science Elective I lists. Unrestricted electives are
omitted since nearly any course qualifies.

Usage (from the project root):
    python -m backend.db_setup.initialize_engineering_major
"""
import uuid

from backend.db import db
from backend.db_setup.major_credits import field_credits
from backend.db_setup.catalog_courses import add_catalog_courses
from backend.db_setup.initialize_majors import clear_choices, link_choices

NAME = "Engineering General Requirements"
LONG_NAME = "School of Engineering and Applied Science"

# field -> explicitly listed courses (labels live in frontend/src/utils/FieldFormatter.tsx)
REQUIRED_COURSES = {
    "foundations": [("ENGR", "1010"), ("ENGR", "1020"), ("ENGR", "1410"), ("ENGR", "1420")],
    "calculus": [("APMA", "1090"), ("APMA", "1110"), ("APMA", "2120")],
    "chemistry": [("CHEM", "1410"), ("CHEM", "1411")],
    "physics": [("PHYS", "1425"), ("PHYS", "1429"), ("MAE", "2501")],
    "programming": [("CS", "1110"), ("CS", "1111"), ("CS", "1112"), ("CS", "1113")],
    "sts": [("STS", "2600"), ("STS", "4500"), ("STS", "4600")],
    "mathsci": [("BIOL", "2100"), ("BIOL", "2200"), ("CE", "2001"), ("CHEM", "1420"), ("PHYS", "2620"),
                ("MSE", "2090"), ("EVSC", "2800"), ("EVSC", "3200"), ("EVSC", "3300")],
    "hss": [],
}
FIELDS = list(REQUIRED_COURSES)
# either/or groups, written as MAJOR_REL "or" edges (see initialize_majors.link_choices)
CHOICES = {"programming": "CS 1110 1111 1112 1113"}

HSS_SUBJECTS = """
AAS AMEL AMST AMTR ANTH ARH ARAB ARTH ARTR ASL BULG CCFA CCIA CCLT CCSS CHIN CHTR CLAS CPLT CZ EAST ECON EDLF
ENAM ENCR ENCW ENEC ENGL ENGN ENLS ENLT ENMC ENMD ENNC ENRN ENSP ENWR ETP FREN FRTR GDS GERM GETR GREE HEBR HIAF
HIEA HIEU HILA HIME HIND HISA HIST HIUS ITAL ITTR JAPN JPTR KOR LATI LING LNGS MDST MEST MSP PERS PETR PHIL PLAD
PLAP PLCP PLIR PLPT POL PORT POTR PSYC RELA RELB RELC RELG RELH RELI RELJ RELS RUSS RUTR SANS SATR SCAN SLAV SLFK
SLTR SOC SPAN SPTR SRBC STS SWAG SWAH SWED TBTN TURK UKR URDU WGS YIDD
""".split()
HSS_ONLY = {"ETP": {"2020", "2030", "3870", "4800"}}
HSS_EXCLUDED = {
    "ANTH": "1090 3810 3820 4991 4993 4998 4999 5080 5800 5870 5880 5989",
    "ECON": "3710 3720 4010 4350 4710 5090 5100",
    "ENSP": "1600",
    "GDS": "1100 4951 4952",
    "MDST": "3702",
    "PSYC": "2005 2200 2210 2220 3005 3006 3210 3310 3870 3590 4111 4125 4200 4290 4330 4500 4910 4970 4930 4940 "
            "4980 5200 5210 5260 5330 5350 5401",
    "SOC": "4800 4810 4820 4970 5100 5110 5120 5595 5596",
    # STS 1800/4110/4810 never count; the required STS courses can't double count as HSS
    "STS": "1800 4110 4810 2600 4500 4600",
}
TEMPORARY_NUMBER_SUFFIXES = ("559", "595", "599")  # need a petition


def is_hss(code, number):
    if code not in HSS_SUBJECTS or number[1:] in TEMPORARY_NUMBER_SUFFIXES:
        return False
    if code in HSS_ONLY:
        return number in HSS_ONLY[code]
    return number not in HSS_EXCLUDED.get(code, "").split()


def main():
    with db.get_session() as session:
        # Math/Science Elective I accepts any APMA course 2000+
        add_catalog_courses(session, ["APMA"], listed=[c for cs in REQUIRED_COURSES.values() for c in cs])
        courses = [(r["code"], r["number"]) for r in
                   session.run("MATCH (c:Course) RETURN DISTINCT c.code AS code, c.number AS number")]

        by_field = {field: set(listed) for field, listed in REQUIRED_COURSES.items()}
        by_field["hss"] = {c for c in courses if is_hss(*c)}
        # Math/Science Elective I also accepts any APMA course 2000+ not already required
        by_field["mathsci"] |= {(code, number) for code, number in courses
                                if code == "APMA" and number >= "2000" and (code, number) not in by_field["calculus"]}

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
