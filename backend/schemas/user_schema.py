from pydantic import BaseModel


class User(BaseModel):
    username: str
    password: str


class TakenCourseCreate(BaseModel):
    course_code: str
    course_number: str
