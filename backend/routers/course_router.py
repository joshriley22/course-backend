from fastapi import APIRouter, status, HTTPException
from backend.db import db
from backend.services.course_service import CourseService
from backend.schemas.course_schema import CourseCreate

router = APIRouter()

service = CourseService()

@router.post("/courses", status_code=status.HTTP_201_CREATED,)
def create_course(course: CourseCreate):

    with db.get_session() as session:
        service.create_course(session, course)


@router.get("/courses/{course_code}/{course_number}")
def get_course(course_code, course_number):

    if not course_exists(course_code, course_number):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found!")

    with db.get_session() as session:
        course = service.get_course(session, course_code, course_number)

    return course

@router.get("/courses/{course_code}/{course_number}/prerequisites")
def get_prerequisites(course_code, course_number):

    if not course_exists(course_code, course_number):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found!")

    with db.get_session() as session:
        prereqs = service.get_prerequisites(session, course_code, course_number)

    return prereqs

@router.get("/courses/{course_code}/{course_number}/tree")
def get_courses_by_code(course_code):
    with db.get_session() as session:
        courses = service.get_courses_by_code(session, course_code)

    return courses

@router.get("/courses/{course_code}/{course_number}/co-prerequisites")
def get_co_prereqs(parent_code, parent_number):

    if not course_exists(parent_code, parent_number):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail= parent_code+ parent_number+" not found!")

    with db.get_session() as session:
        co_prereqs = service.get_co_prereqs(session, parent_code, parent_number)

    return co_prereqs

@router.get("/courses")
def get_courses():

    with db.get_session() as session:
        courses = service.get_courses(session)

    return courses

@router.post("/courses/{course_code}/{course_number}/prerequisites", status_code=status.HTTP_201_CREATED)
def create_prereq_edge(course_code: str, course_number: str, prereq_code: str, prereq_number: str):

    if not course_exists(course_code, course_number):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=course_code + course_number + "not found!")

    if not course_exists(prereq_code, prereq_number):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=prereq_code + prereq_number + "not found!")

    with db.get_session() as session:
        service.create_prereq_edge(session, course_code, course_number, prereq_code, prereq_number)

#Horrible number of arguments but encapsulating the code and the number for these functions feels unnecessary for now
@router.post("/courses/{course_code}/{course_number}/prerequisites/relationship", status_code=status.HTTP_201_CREATED)
def create_prereq_rel_edge(course_code: str, course_number: str, prereq1_code: str, prereq1_number: str, prereq2_code: str, prereq2_number: str, rel: str):

    if not course_exists(course_code, course_number):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail= course_code + course_number + "not found!")

    if not course_exists(prereq1_code, prereq1_number):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=prereq1_code + prereq1_number + "not found!")

    if not course_exists(prereq2_code, prereq2_number):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=prereq2_code + prereq2_number + "not found!")

    with db.get_session() as session:
        service.create_prereq_rel_edge(session, course_code, course_number, prereq1_code, prereq1_number, prereq2_code, prereq2_number, rel)


@router.get("/courses/{course_code}/{course_number}/children")
def get_children(course_code: str, course_number: str):

    if not course_exists(course_code, course_number):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=course_code + course_number + "not found!")

    with db.get_session() as session:
        children = service.get_children(session, course_code, course_number)

    return children

def course_exists(course_code: str, course_number: str):

    with db.get_session() as session:
        return service.course_exists(session, course_code, course_number)

