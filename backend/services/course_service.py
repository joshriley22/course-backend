from backend.repositories.course_repository import CourseRepository

class CourseService:

    def __init__(self):
        self.repo = CourseRepository()

    def create_course(self, session, course):

        return self.repo.create_course(
            session,
            course.code,
            course.number,
            course.name,
            course.difficulty,
            course.credits,
            course.is_integration,
            course.elective_status,
        )

    def get_course_details(self, session, code, number):

        return self.repo.get_course_details(session, code, number)

    # def get_prerequisites(self, session, code, number):
    #
    #     return self.repo.get_prerequisites(session, code, number)
    #
    # def get_co_prereqs(self, session, parent_code, parent_number):
    #
    #     return self.repo.get_co_prereqs(session, parent_code, parent_number)

    def get_courses_by_code(self, session, course_code):

        return self.repo.get_courses_by_code(session, course_code)

    def get_courses(self, session):

        return self.repo.get_courses(session)

    def create_prereq_edge(self, session, course_code, course_number, prereq_code, prereq_number):

        return self.repo.create_prereq_edge(session, course_code, course_number, prereq_code, prereq_number)

    def create_prereq_rel_edge(self, session, course_code, course_number, prereq1_code, prereq1_number, prereq2_code, prereq2_number, rel):

        return self.repo.create_prereq_rel_edge(session, course_code, course_number, prereq1_code, prereq1_number, prereq2_code, prereq2_number, rel)

    def get_children(self, session, course_code, course_number):

        return self.repo.get_children(session, course_code, course_number)

    def get_parents(self, session, course_code, course_number):

        return self.repo.get_parents(session, course_code, course_number)

    def get_co_prereqs_for_course(self, session, prereq_code, prereq_number, course_code, course_number):

        return self.repo.get_co_prereqs_for_course(session, prereq_code, prereq_number, course_code, course_number)

    def course_exists(self, session, course_code, course_number):

        return self.repo.course_exists(session, course_code, course_number)

    def get_course_uuid(self, session, course_code, course_number):

        return self.repo.get_course_uuid(session, course_code, course_number)

    def get_course_edges(self, session, major_name, field):

        edges = self.repo.get_course_edges(session, major_name, field)
        return edges

    def get_co_prereq_edges(self, session, major_name, field):

        edges = self.repo.get_co_prereq_edges(session, major_name, field)
        return edges

    def get_codes(self, session):

        return self.repo.get_codes(session)

    def get_eligible_next_courses(self, session, course_taken_list, elective_list, major_list):

        return self.repo.get_eligible_next_courses(session, course_taken_list, elective_list, major_list)

