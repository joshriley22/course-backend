import re

from backend.repositories.major_repository import MajorRepository


def course_credits(credits):
    """A Course's credits string ("3", "1 - 3", "4.5") -> the credits it's guaranteed to give (the low end)."""
    match = re.search(r"\d+(\.\d+)?", str(credits or ""))
    return float(match.group()) if match else 0.0


class MajorService:

    def __init__(self):
        self.repo = MajorRepository()

    def get_majors(self, session):
        return self.repo.get_majors(session)

    def get_fields(self, session, major_name):
        return self.repo.get_fields(session, major_name)

    def get_field_progress(self, session, major_name, field, course_taken_list):
        # A course listed under the same code/number more than once (e.g. a 0-credit lab section) counts once
        courses = {}
        for course in self.repo.get_taken_field_courses(session, major_name, field, course_taken_list):
            key = (course["code"], course["number"])
            credits = course_credits(course["credits"])
            if credits >= courses.get(key, {}).get("credits", -1):
                courses[key] = {**course, "credits": credits}
        # the credits the field needs come with its major's fields (GET /majors/{major_name}/fields)
        return {
            "earned": sum(c["credits"] for c in courses.values()),
            "courses": list(courses.values()),
        }
