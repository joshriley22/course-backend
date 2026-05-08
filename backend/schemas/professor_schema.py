from pydantic import BaseModel

class ProfessorCreate(BaseModel):
    id: int
    name: str
    rating: float
