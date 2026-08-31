from backend.repositories.user_repository import UserRepository

class UserService:

    def __init__(self):
        self.repo = UserRepository()

    def get_user(self, session, username):

        return self.repo.get_user(session, username)

    def create_user(self, session, username, password):

        return self.repo.create_user(session, username, password)