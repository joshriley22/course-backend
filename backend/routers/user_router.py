from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel
from backend.db import db
from backend.services.user_service import UserService

router = APIRouter()
service = UserService()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/users/login")
def login(credentials: LoginRequest):
    with db.get_session() as session:
        user = service.validate_user(session, credentials.username, credentials.password)
        if user:
            return {"message": "Login successful"}
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")