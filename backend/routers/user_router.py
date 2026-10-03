from fastapi import APIRouter, status, HTTPException
from backend.schemas.user_schema import User, TakenCourseCreate
from backend.db import db
from backend.services.user_service import UserService
from backend.hashing import verify_password, hash_password
from backend.routers.course_router import course_exists

router = APIRouter()
service = UserService()

@router.post("/users/login")
async def login(credentials: User):
    with db.get_session() as session:
        user = service.get_user(session, credentials.username)
        if user is None or not await verify_password(credentials.password, user["password"]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
        return {"message": "Login successful"}


@router.post("/users/register", status_code=status.HTTP_201_CREATED)
async def create_user(user: User):

    with db.get_session() as session:
        password = await hash_password(user.password)
        service.create_user(session, user.username, password)


@router.post("/users/{username}/courses", status_code=status.HTTP_201_CREATED)
def add_taken_course(username: str, course: TakenCourseCreate):

    if not course_exists(course.course_code, course.course_number):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=course.course_code + course.course_number + " not found!")

    with db.get_session() as session:
        if service.get_user(session, username) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found!")

        service.add_taken_course(session, username, course.course_code, course.course_number)


@router.get("/users/{username}/courses")
def get_taken_courses(username: str):

    with db.get_session() as session:
        return service.get_taken_courses(session, username)


@router.delete("/users/{username}/courses/{course_code}/{course_number}", status_code=status.HTTP_204_NO_CONTENT)
def remove_taken_course(username: str, course_code: str, course_number: str):

    with db.get_session() as session:
        service.remove_taken_course(session, username, course_code, course_number)
