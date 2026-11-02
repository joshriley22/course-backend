"""Replace every Class session in the database with the sections SIS lists for one term, so the sessions match the
newest SIS data. Courses with no sections that term are left with no sessions, which hides them from the Explore graph
and the course suggestions.

Usage (from the project root):
    python -m backend.db_setup.sync_class_sessions [term]   # term defaults to TERM, e.g. 1272 = Spring 2027
"""
import sys

from backend.db import db
from backend.db_setup.initialize_gen_ed_major import fetch_term
from backend.services.class_service import ClassService

TERM = "1272"  # Spring 2027


def to_sessions(classes):
    sessions = []
    for class_ in classes:
        if class_["campus_descr"] != "Main Campus" or class_["campus"] != "MAIN" or class_["descr"] == "Capstone Research":
            continue
        if class_["class_stat"] != "A":  # cancelled or stopped sections
            continue
        for meeting in class_["meetings"]:
            sessions.append({
                "class_id": class_["class_nbr"],
                "start_time": str(meeting["start_time"]),
                "end_time": str(meeting["end_time"]),
                "days": meeting["days"],
                "enrollment_available": int(class_["enrollment_available"]),
                "is_lab": class_["section_type"] == "Laboratory",
                "course_code": class_["subject"],
                "course_number": class_["catalog_nbr"],
                "professor_name": meeting["instructor"],
            })
    return sessions


def replace_sessions(tx, sessions):
    removed = tx.run("MATCH (c:Class) DETACH DELETE c RETURN count(c) AS n").single()["n"]
    # A course listed twice (e.g. a 0-credit lab duplicate) gets its own copy of each session, as before
    created = tx.run(
        """
        UNWIND $sessions AS s
        MATCH (course:Course {code:s.course_code, number:s.course_number})
        CREATE (c:Class {class_id:s.class_id, start_time:s.start_time, end_time:s.end_time, days:s.days,
                         enrollment_available:s.enrollment_available, is_lab:s.is_lab})
        CREATE (c)-[:SESSION_OF]->(course)
        MERGE (p:Professor {name:s.professor_name})
        ON CREATE SET p.rating = 0.0
        CREATE (p)-[:PROFESSOR_OF]->(c)
        RETURN count(c) AS n
        """,
        sessions=sessions,
    ).single()["n"]
    return removed, created


def main(term=TERM):
    sessions = to_sessions(fetch_term(term))
    with db.get_session() as session:
        removed, created = session.execute_write(replace_sessions, sessions)
        marked = ClassService().mark_single_day_labs(session)
        offered = session.run("MATCH (c:Course) WHERE EXISTS { (:Class)-[:SESSION_OF]->(c) } RETURN count(c) AS n").single()["n"]
    print(f"term {term}: removed {removed} sessions, created {created}, marked {marked} as labs/discussions; "
          f"{offered} courses now have sessions")


if __name__ == "__main__":
    main(*sys.argv[1:2])
