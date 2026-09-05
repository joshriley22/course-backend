from fastapi import APIRouter, status, HTTPException
from backend.db import db
from backend.services.review_service import ReviewService
from backend.schemas.review_schema import ReviewCreate
from backend.routers.course_router import course_exists

router = APIRouter()

service = ReviewService()

@router.post("/reviews", status_code=status.HTTP_201_CREATED)
def create_review(review: ReviewCreate):

    if not course_exists(review.course_code, review.course_number):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=review.course_code + review.course_number + " not found!")

    with db.get_session() as session:
        service.create_review(session, review.course_code, review.course_number, review.review_text, review.rating, review.username)


@router.get("/users/{username}/reviews")
def get_reviews_by_user(username: str):

    with db.get_session() as session:
        return service.get_reviews_by_user(session, username)


@router.get("/courses/{course_code}/{course_number}/reviews")
def get_reviews_by_course(course_code: str, course_number: str):

    if not course_exists(course_code, course_number):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found!")

    with db.get_session() as session:
        return service.get_reviews_by_course(session, course_code, course_number)
