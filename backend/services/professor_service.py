from backend.repositories.professor_repository import ProfessorRepository

class ProfessorService:

    def __init__(self):
        self.repo = ProfessorRepository()

    def create_professor(self, session, professor):

        return self.repo.create_professor(
            session,
            professor.name,
            professor.rating
        )

    def get_professor(self, session, name):

        return self.repo.get_professor(session, name)

    def get_professors(self, session):

        return self.repo.get_professors(session)

    def professor_exists(self, session, name):

        return self.repo.professor_exists(session, name)