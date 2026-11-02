"""Create every Major in major_specs.py and link it to the Courses for each of its fields.

Each field lists courses explicitly and/or by level rules ("ANTH courses at the 3000 level or higher"). Before linking,
every catalog course in a rule's subjects (and every listed course) is added to the database via catalog_courses.py,
so rules match the full Undergraduate Record rather than just the courses currently offered. Each major's links are
rebuilt from scratch, and an existing Major keeps its uuid.

Usage (from the project root):
    python -m backend.db_setup.initialize_majors                 # every major in major_specs.py
    python -m backend.db_setup.initialize_majors "Anthropology"  # just the named majors
    python -m backend.db_setup.initialize_majors --choices-only  # just relink the either/or MAJOR_REL edges
    python -m backend.db_setup.initialize_majors --credits-only  # just rewrite each Major's credits

Each Major's `credits` (from major_credits.py) lines up index-for-index with its `fields`. Fields' `choices` become MAJOR_REL edges ({for_major_name, for_field}) chained through each group of alternatives,
which the Explore page draws as "or" edges. A field with `subfields` is split into one field per sub-field.
"""
import re
import sys
import uuid
from dataclasses import dataclass, field as dataclass_field, replace

from backend.db import db
from backend.db_setup.catalog_courses import add_catalog_courses
from backend.db_setup.major_credits import field_credits


def parse_courses(text):
    """"ANTH 1010 2000 / PSYC 2300-3110" -> {code: [(low, high)]}"""
    ranges = {}
    for group in text.split("/"):
        if group.strip():
            code, *numbers = group.split()
            for n in numbers:
                low, _, high = n.partition("-")
                ranges.setdefault(code, []).append((low, high or low))
    return ranges


def listed_in(ranges, code, number):
    return any(low <= number <= high for low, high in ranges.get(code, []))


def explicit_courses(text):
    """Courses named individually (not as ranges) in a parse_courses string."""
    return {(code, low) for code, rs in parse_courses(text).items() for low, high in rs if low == high}


@dataclass
class Rule:
    """Every course in `subjects` numbered from `min` up to `max` (inclusive), minus `exclude`, minus any course whose
    name matches `exclude_name` (or doesn't match `name`, when given), minus independent study/research (x99x numbers)
    unless `research` is set."""
    subjects: str
    min: str = "1000"
    max: str = "4999"
    exclude: str = ""
    exclude_name: str = ""
    name: str = ""
    research: bool = False

    def matches(self, code, number, name):
        return (code in self.subjects.split() and self.min <= number <= self.max
                and not listed_in(parse_courses(self.exclude), code, number)
                and not (self.exclude_name and re.search(self.exclude_name, name or "", re.I))
                and not (self.name and not re.search(self.name, name or "", re.I))
                and (self.research or number[1:3] != "99"))


@dataclass
class Field:
    key: str  # labels live in frontend/src/utils/FieldFormatter.tsx
    courses: str = ""  # parse_courses format; ranges are only matched against courses in the database
    rules: list = dataclass_field(default_factory=list)
    include_required: bool = False  # rule matches may include courses listed in the major's other fields
    choices: str = ""  # either/or groups, "|"-separated, e.g. "CS 1110 1111 / DS 1002 | MATH 1210 1310"
    # sub-field key -> courses (parse_courses format), or a Field for one with rules (its own key is ignored). A field
    # with subfields is replaced in its Major by one field per sub-field, keyed "<subfield> (<field>)", e.g.
    # "linalg (core)"
    subfields: dict = dataclass_field(default_factory=dict)


def subfield(parent, key, spec):
    key = f"{key} ({parent.key})"
    return replace(spec, key=key) if isinstance(spec, Field) else Field(key, spec)


@dataclass
class Major:
    name: str
    long_name: str
    fields: list

    def __post_init__(self):
        self.fields = [sub for f in self.fields
                       for sub in ([subfield(f, key, spec) for key, spec in f.subfields.items()]
                                   if f.subfields else [f])]


def field_courses(major, field, named):
    listed = parse_courses(field.courses)
    others = set().union(*(explicit_courses(f.courses) for f in major.fields if f is not field))
    result = {(c, n) for c, n, _ in named if listed_in(listed, c, n)}
    result |= {(c, n) for c, n, name in named
               if any(rule.matches(c, n, name) for rule in field.rules)
               and (field.include_required or (c, n) not in others)}
    return result


def link_choices(session, major_name, field, choices):
    """Chain MAJOR_REL ("or") edges through each group of alternatives, between the major's linked Course nodes for
    that field, in the order listed (a -> b -> c reads "a or b or c"); courses not linked in the field are skipped so
    the chain stays connected. Returns the number of edges."""
    linked = {(r["code"], r["number"]) for r in session.run(
        "MATCH (:Major {name:$name})-[:COURSE_OF {relationship:$field}]->(c) RETURN c.code AS code, c.number AS number",
        name=major_name, field=field)}
    pairs = []
    for group in filter(str.strip, choices.split("|")):
        courses = [(code, low) for code, ranges in parse_courses(group).items() for low, _ in ranges
                   if (code, low) in linked]
        pairs += [[list(a), list(b)] for a, b in zip(courses, courses[1:])]
    return session.run(
        """
        UNWIND $pairs AS pair
        MATCH (m:Major {name:$name})-[:COURSE_OF {relationship:$field}]->(a:Course {code:pair[0][0], number:pair[0][1]})
        MATCH (m)-[:COURSE_OF {relationship:$field}]->(b:Course {code:pair[1][0], number:pair[1][1]})
        MERGE (a)-[:MAJOR_REL {for_major_name:$name, for_field:$field}]->(b)
        RETURN count(*) AS n
        """,
        name=major_name, field=field, pairs=pairs,
    ).single()["n"]


def clear_choices(session, major_name):
    session.run("MATCH ()-[r:MAJOR_REL {for_major_name:$name}]->() DELETE r", name=major_name)


def write_credits(session, major):
    """Set the Major's `credits`, aligned with its `fields`."""
    fields = [f.key for f in major.fields]
    session.run("MATCH (m:Major {name:$name}) SET m.credits = $credits",
                name=major.name, credits=field_credits(major.name, fields))


def write_major(session, major, named):
    known = {(c, n) for c, n, _ in named}
    fields = [f.key for f in major.fields]
    session.run(
        """
        MERGE (m:Major {name:$name})
        ON CREATE SET m.uuid = $uuid
        SET m.long_name = $long_name, m.fields = $fields, m.credits = $credits
        """,
        name=major.name, uuid=str(uuid.uuid4()), long_name=major.long_name, fields=fields,
        credits=field_credits(major.name, fields),
    )
    session.run("MATCH (:Major {name:$name})-[r:COURSE_OF]->() DELETE r", name=major.name)
    report = []
    for field in major.fields:
        courses = field_courses(major, field, named)
        session.run(
            """
            MATCH (m:Major {name:$name})
            UNWIND $courses AS course
            CALL (course) {
                MATCH (c:Course {code:course[0], number:course[1]})
                RETURN c ORDER BY c.credits = '0' LIMIT 1
            }
            MERGE (m)-[:COURSE_OF {relationship:$field}]->(c)
            """,
            name=major.name, field=field.key, courses=[list(c) for c in sorted(courses)],
        )
        missing = sorted(f"{c} {n}" for c, n in explicit_courses(field.courses) - known)
        report.append(f"{field.key}={len(courses)}" + (f" (not in catalog: {', '.join(missing)})" if missing else ""))
    clear_choices(session, major.name)
    ors = sum(link_choices(session, major.name, field.key, field.choices) for field in major.fields if field.choices)
    print(f"{major.name:22} " + "  ".join(report) + (f"  | {ors} or-edges" if ors else ""))


def main(names, choices_only=False, credits_only=False):
    from backend.db_setup.major_specs import MAJORS

    majors = [m for m in MAJORS if not names or m.name in names]
    for major in majors:  # fail before writing anything if a field has no credits
        field_credits(major.name, [f.key for f in major.fields])
    subjects = sorted({s for m in majors for f in m.fields for r in f.rules for s in r.subjects.split()})
    listed = set().union(*(explicit_courses(f.courses) for m in majors for f in m.fields))
    with db.get_session() as session:
        if choices_only:  # relink just the either/or edges, leaving courses and COURSE_OF links alone
            for major in majors:
                clear_choices(session, major.name)
                n = sum(link_choices(session, major.name, f.key, f.choices) for f in major.fields if f.choices)
                print(f"{major.name:22} {n} or-edges")
            return
        if credits_only:  # rewrite just each Major's credits list
            for major in majors:
                write_credits(session, major)
                print(f"{major.name:22} {field_credits(major.name, [f.key for f in major.fields])}")
            return
        add_catalog_courses(session, subjects, listed=listed)
        named = [(r["code"], r["number"], r["name"]) for r in session.run(
            "MATCH (c:Course) RETURN DISTINCT c.code AS code, c.number AS number, c.name AS name")]
        for major in majors:
            write_major(session, major, named)


if __name__ == "__main__":
    args = sys.argv[1:]
    main([a for a in args if a not in ("--choices-only", "--credits-only")], choices_only="--choices-only" in args,
         credits_only="--credits-only" in args)
