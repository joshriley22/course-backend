from fastapi import APIRouter
from backend.db import db
from backend.services.major_service import MajorService

major_service = MajorService()
router = APIRouter()

@router.get("/majors")
def get_majors():
    with db.get_session() as session:
        return major_service.get_majors(session)