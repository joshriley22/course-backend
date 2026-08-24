from fastapi import FastAPI

#from backend.logic.course_logic
from backend.routers import course_router
from backend.routers.course_router import router as course_router, get_co_prereqs_for_course, create_prereq_edge, get_requirements, get_next_courses
from backend.routers.major_router import router as major_router

app = FastAPI()

app.include_router(course_router)
app.include_router(major_router)

# print(get_next_courses([{"code": "CS", "number": "1110"}]))
#create_prereq_edge("CS", "2130", "CS", "1110")

