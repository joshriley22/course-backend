from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


#from backend.logic.course_logic
from backend.routers import course_router
from backend.routers.course_router import router as course_router, get_co_prereqs_for_course, create_prereq_edge, get_requirements, get_next_courses
from backend.routers.major_router import router as major_router
from backend.routers.user_router import router as user_router

origins = [
    "http://localhost:5173",
]

app = FastAPI()

app.include_router(course_router)
app.include_router(major_router)
app.include_router(user_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# print(get_next_courses([{"code": "CS", "number": "1110"}]))
#create_prereq_edge("CS", "2130", "CS", "1110")

