from fastapi import APIRouter, status, HTTPException
from backend.schemas.user_schema import User
from backend.db import db
from backend.services.user_service import UserService
from backend.hashing import verify_password, hash_password

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