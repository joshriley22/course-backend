from backend.repositories.major_repository import MajorRepository

class MajorService:

    def __init__(self):
        self.repo = MajorRepository()

    def get_majors(self, session):
        return self.repo.get_majors(session)

    def get_fields(self, session, major_name):
        return self.repo.get_fields(session, major_name)
