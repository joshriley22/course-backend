from fastapi import FastAPI

from backend.routers import course_router
from backend.routers.course_router import router as router

app = FastAPI()

app.include_router(router)

cs_courses = course_router.get_courses_by_code("CS")
for course in cs_courses:
    print(course["code"] + course["number"])
    print(course_router.get_co_prereqs(course["code"], course["number"]))


