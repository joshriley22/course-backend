from backend.repositories.user_repository import UserRepository

class UserService:

    def __init__(self):
        self.repo = UserRepository()

    def get_user(self, session, username):

        return self.repo.get_user(session, username)

    def create_user(self, session, username, password):

        return self.repo.create_user(session, username, password)

    def add_taken_course(self, session, username, course_code, course_number):

        return self.repo.add_taken_course(session, username, course_code, course_number)

    def get_taken_courses(self, session, username):

        return self.repo.get_taken_courses(session, username)

    def remove_taken_course(self, session, username, course_code, course_number):

        return self.repo.remove_taken_course(session, username, course_code, course_number)
