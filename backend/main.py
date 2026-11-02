from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware



from backend.routers.course_router import router as course_router
from backend.routers.major_router import router as major_router
from backend.routers.user_router import router as user_router
from backend.routers.review_router import router as review_router

origins = [
    "http://localhost:5173",
]

app = FastAPI()

app.include_router(course_router)
app.include_router(major_router)
app.include_router(user_router)
app.include_router(review_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

