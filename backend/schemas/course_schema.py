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

class ScheduledSession(BaseModel):
    days: str | None = None
    start_time: str | None = None
    end_time: str | None = None

# A course already on the user's schedule; recommendations fill around it
class ScheduledCourse(BaseModel):
    code: str
    number: str
    credits: float | None = None
    sessions: list[ScheduledSession] = []

class RecommendationsRequest(BaseModel):
    course_taken_list: list[str]
    major_list: list[str]
    selected_courses: list[ScheduledCourse] = []
    min_credits: float = 13
    max_credits: float = 18
