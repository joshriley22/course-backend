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

    def get_course(self, session, code, number):

        return self.repo.get_course(session, code, number)

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

    def get_starter_courses(self, session):

        return self.repo.get_starter_courses(session)

    def get_starter_courses_by_code(self, session, code):

        return self.repo.get_starter_course_by_code(session, code)

    def get_course_edges(self, session, code):

        edges = self.repo.get_course_edges(session, code)
        sinks = self.repo.get_sink_nodes(session, code)

        for sink in sinks:
            edges.append({"source_code": sink["code"], "source_number": sink["number"], "source_status": sink["elective_status"], "target_code": None, "target_number": None, "target_status": None, "depth": 1})

        return edges

    def get_codes(self, session):

        return self.repo.get_codes(session)

