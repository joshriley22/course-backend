from pydantic import BaseModel

class ClassSessionCreate(BaseModel):
    class_id: int
    start_time: str | None = "TBA"
    end_time: str | None = "TBA"
    days: str
    enrollment_available: int
    is_lab: bool
    course_code: str
    course_number: str
    professor_name: str


