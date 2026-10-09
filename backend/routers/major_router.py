from fastapi import APIRouter
from backend.db import db
from backend.schemas.major_schema import FieldProgressRequest
from backend.services.major_service import MajorService

major_service = MajorService()
router = APIRouter()

@router.get("/majors")
def get_majors():
    with db.get_session() as session:
        return major_service.get_majors(session)

@router.get("/majors/{major_name}/fields")
def get_fields(major_name: str):
    with db.get_session() as session:
        return major_service.get_fields(session, major_name)

@router.post("/majors/{major_name}/fields/{field}/progress")
def get_field_progress(major_name: str, field: str, request: FieldProgressRequest):
    with db.get_session() as session:
        return major_service.get_field_progress(session, major_name, field, request.course_taken_list)
