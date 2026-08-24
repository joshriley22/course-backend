from pydantic import BaseModel

class MajorSessionCreate(BaseModel):
    name: str
    long_name: str
    fields: list[str]
    courses: list[int]

