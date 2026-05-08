from fastapi import APIRouter, Response, status, HTTPException
from backend.db import db
from backend.routers.course_router import course_exists
from backend.routers.professor_router import professor_exists
from backend.services.class_service import ClassService
from backend.schemas.class_schema import ClassSessionCreate

router = APIRouter()

service = ClassService()

@router.post("/classes", status_code=status.HTTP_201_CREATED,)
def create_class(class_instance: ClassSessionCreate):

    with db.get_session() as session:
        service.create_class(session, class_instance)

@router.get("/classes")
def get_classes():

    with db.get_session() as session:
        classes = service.get_classes(session)

    if not classes:
        return Response(status_code=status.HTTP_404_NOT_FOUND)

    return classes

@router.get("/classes/by-course/{course_code}/{course_number}")
def get_classes_by_course(course_code: str, course_number: str):

    if not course_exists(course_code, course_number):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail= course_code + course_number + " not found!")

    with db.get_session() as session:
        classes = service.get_classes_by_course(session, course_code, course_number)

    return classes

@router.get("/classes/by-professor/{professor_name}")
def get_classes_by_professor(professor_name: str):

    if not professor_exists(professor_name):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail= professor_name + " not found!")

    with db.get_session() as session:
        classes = service.get_classes_by_professor(session, professor_name)

    return classes