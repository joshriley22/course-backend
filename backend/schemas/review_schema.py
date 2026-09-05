from pydantic import BaseModel

class ReviewCreate(BaseModel):
    course_code: str
    course_number: str
    review_text: str
    rating: float
    username: str
