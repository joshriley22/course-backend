from fastapi import APIRouter, Response, status
from backend.db import db
from backend.services.professor_service import ProfessorService
from backend.schemas.professor_schema import ProfessorCreate

router = APIRouter()
service = ProfessorService()

@router.post("/professors", status_code=status.HTTP_201_CREATED,)
def create_professor(prof: ProfessorCreate):

    with db.get_session() as session:
        service.create_professor(session, prof)

@router.get("/professors/{name}")
def get_professor(name: str):

    with db.get_session() as session:
        professor = service.get_professor(session, name)

    return professor

@router.get("/professors")
def get_professors():
    with db.get_session() as session:
        professors = service.get_professors(session)

    return professors

def professor_exists(name: str):

    with db.get_session() as session:
        return service.professor_exists(session, name)