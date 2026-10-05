from backend.repositories.review_repository import ReviewRepository

class ReviewService:

    def __init__(self):
        self.repo = ReviewRepository()

    def create_review(self, session, course_code, course_number, review_text, rating, username):

        return self.repo.create_review(session, course_code, course_number, review_text, rating, username)

    def delete_review(self, session, course_code, course_number, username, created_at):

        return self.repo.delete_review(session, course_code, course_number, username, created_at)

    def get_reviews_by_user(self, session, username):

        return self.repo.get_reviews_by_user(session, username)

    def get_reviews_by_course(self, session, course_code, course_number):

        return self.repo.get_reviews_by_course(session, course_code, course_number)
