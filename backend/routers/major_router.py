from fastapi import APIRouter
from backend.db import db
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