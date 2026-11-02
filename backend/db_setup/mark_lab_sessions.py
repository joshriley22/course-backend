"""Mark every single-day Class of a Course that also has a 2+ day Class as a lab/discussion (is_lab = true).

Runs automatically at the end of sis_api_manager.initialize_classes; run it directly to update an existing database.

Usage (from the project root):
    python -m backend.db_setup.mark_lab_sessions
"""
from backend.db import db
from backend.services.class_service import ClassService


def mark_lab_sessions():
    with db.get_session() as session:
        return ClassService().mark_single_day_labs(session)


if __name__ == "__main__":
    print(f"Marked {mark_lab_sessions()} sessions as labs/discussions")
