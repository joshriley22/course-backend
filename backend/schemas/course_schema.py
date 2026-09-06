from pydantic import BaseModel

class CourseCreate(BaseModel):
    code: str
    number: str
    name: str
    difficulty: float
    credits: str  | None= "-1"
    is_integration: bool
    elective_status: int

class EligibleNextCoursesRequest(BaseModel):
    course_taken_list: list[str]
    elective_list: list[str]
    major_list: list[str]
