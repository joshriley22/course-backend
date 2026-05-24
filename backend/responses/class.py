class Class:
    class_id: int
    start_time: str | None = "TBA"
    end_time: str | None = "TBA"
    days: str
    enrollment_available: int
    is_lab: bool
    course_code: str
    course_number: str
    professor_name: str
    elective_status: int

    def __init__(self, class_id, start_time, end_time, days, enrollment_available, is_lab, course_code, course_number, elective_status, professor_name):
        self.class_id = class_id
        self.start_time = start_time
        self.end_time = end_time
        self.days = days
        self.enrollment_available = enrollment_available
        self.is_lab = is_lab
        self.course_code = course_code
        self.course_number = course_number
        self.professor_name = professor_name
        self.elective_status = elective_status