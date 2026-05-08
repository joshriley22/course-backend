from pystreamapi import Stream
from backend.routers import class_router


def create_score_stream():
    class_list = Stream.of(class_router.list_classes()).sorted(compare_score).filter(is_unique_course).limit(5).to_list()
    for class_instance in class_list:
        print(class_instance)

def compare_score(class_instance: dict, other_instance : dict):
    class_instance_time_bonus = 0.0
    other_instance_time_bonus = 0.0
    if 1100 < int((class_instance["start"])[0:4].replace('.', '')) < 1400:
        class_instance_time_bonus = 3.0
    if 1100 < int((other_instance["start"])[0:4].replace('.', '')) < 1400:
        other_instance_time_bonus = 3.0
    if(class_instance["difficulty"] + class_instance["professor_rating"] + class_instance_time_bonus) > (other_instance["difficulty"] + other_instance["professor_rating"] + other_instance_time_bonus):
        return 1
    elif(class_instance["difficulty"] + class_instance["professor_rating"] + class_instance_time_bonus) < (other_instance["difficulty"] + other_instance["professor_rating"] + other_instance_time_bonus):
        return -1
    else:
        return 0

seen_courses = set()

def is_unique_course(class_instance: dict):
    name = class_instance["name"]
    if name in seen_courses:
        return False
    seen_courses.add(name)
    return True