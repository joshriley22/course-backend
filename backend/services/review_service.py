from backend.repositories.review_repository import ReviewRepository

class ReviewService:

    def __init__(self):
        self.repo = ReviewRepository()

    def create_review(self, session, course_code, course_number, review_text, rating, username):

        return self.repo.create_review(session, course_code, course_number, review_text, rating, username)

    def get_reviews_by_user(self, session, username):

        return self.repo.get_reviews_by_user(session, username)

    def get_reviews_by_course(self, session, course_code, course_number):

        return self.repo.get_reviews_by_course(session, course_code, course_number)
