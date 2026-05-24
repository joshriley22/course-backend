from backend.responses.course import Course
from backend.responses.edge import Requirement, Edge
from backend.services.course_service import CourseService

service = CourseService()

def get_requirements(session, course_code: str, course_number: str):
    parents = service.get_parents(session, course_code, course_number)
    edge_list = []

    for parent_course in parents:
        prereq_list = service.get_co_prereqs_for_course(session, parent_course["code"], parent_course["number"], course_code, course_number)
        while len(prereq_list) > 0:
            edge_list.append(prereq_list.pop(0))

    return edge_list


def get_next_courses(session, course_list):

    next_courses = get_next_courses_from_list(session, course_list)

    starter_courses = service.get_starter_courses(session)

    for course in next_courses:
        redundant_course = get_code_in_list(course["code"], starter_courses)
        if redundant_course is not None:
            starter_courses.remove(redundant_course)

    next_courses.extend(starter_courses)
    return next_courses

def get_code_in_list(code: str, course_list):
    for course in course_list:
        if course["code"] == code:
            return course
    return None

def get_next_courses_from_list(session, course_list):

    eligible_next_courses = []
    possible_next_courses = []

    for course in course_list:
        course_children = service.get_children(session, course["code"], course["number"])
        possible_next_courses.extend(course_children)

    for next_course in possible_next_courses:
        if course_eligible(session, next_course, course_list):
            eligible_next_courses.append(next_course)

    return eligible_next_courses

def course_eligible(session, course: Course, course_list):
    requirements = get_requirements(session, course["code"], course["number"])
    print(requirements)
    # for requirement in requirements:



    return False
