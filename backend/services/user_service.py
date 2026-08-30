from backend.repositories.user_repository import UserRepository

class UserService:

    def __init__(self):
        self.repo = UserRepository()

    def validate_user(self, session, username, password):

        return self.repo.validate_user(session, username, password)