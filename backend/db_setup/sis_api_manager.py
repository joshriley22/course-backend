import json

import requests

from backend.routers import course_router, class_router
from backend.schemas.class_schema import ClassSessionCreate
from backend.schemas.course_schema import CourseCreate


def initialize_courses(url):
    count = int(get_page_count(url))
    for i in range(1, count):
        url_with_page_number=url + "&page=" + str(i)
        try:
            response = requests.get(url_with_page_number)
            api_json = response.json()
        except:
            print("error")
        class_list = api_json['classes']
        course_list = []
        for class_ in class_list:
            if class_["campus_descr"] == "Main Campus" and class_["campus"] == "MAIN" and class_["descr"] != "Capstone Research":
                if (str(class_["subject"]) + " " + str(class_["catalog_nbr"])) not in course_list:
                    subject = class_["subject"]
                    course_number = class_["catalog_nbr"]
                    course_name = class_["descr"]
                    if int(course_number[0:4]) < 5000:
                        course = CourseCreate(code=subject, number=course_number, name=course_name, difficulty=0.0, credits=class_["units"], is_integration=False, elective_status=0)
                        course_router.create_course(course)
                        course_list.append(str(subject) + " " + str(course_number))

def initialize_classes(url):
    count = int(get_page_count(url))
    for i in range(1, count):
        url_with_page_number = url + "&page=" + str(i)
        try:
            response = requests.get(url_with_page_number)
            api_json = response.json()
        except:
            print("error")
        class_list = api_json['classes']

        for class_ in class_list:
            if course_router.course_exists(class_["subject"], class_["catalog_nbr"]):
                if class_["campus_descr"] == "Main Campus" and class_["campus"] == "MAIN" and class_[
                    "descr"] != "Capstone Research":
                    meetings = class_["meetings"]
                    is_lab = False
                    if class_["section_type"] == "Laboratory":
                        is_lab = True
                    for meeting in meetings:
                        class_session = ClassSessionCreate(class_id=class_["class_nbr"], start_time=str(meeting["start_time"]), end_time=str(meeting["end_time"]), days=meeting["days"], enrollment_available=int(class_["enrollment_available"]), is_lab=is_lab, course_code=class_["subject"], course_number=class_["catalog_nbr"], professor_name=meeting["instructor"])
                        class_router.create_class(class_session)


def get_page_count(url):
    page_count = 0
    try:
        response = requests.get(url)
        api_json = response.json()
        page_count = api_json['pageCount']
    except json.decoder.JSONDecodeError:
        print("error")
    return page_count

