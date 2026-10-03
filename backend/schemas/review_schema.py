from pydantic import BaseModel, Field

class ReviewCreate(BaseModel):
    course_code: str
    course_number: str
    review_text: str = Field(max_length=2000)
    rating: float = Field(ge=1, le=5)
    username: str
