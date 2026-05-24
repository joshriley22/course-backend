
import requests
from bs4 import BeautifulSoup
from fastapi import HTTPException

from backend.routers import course_router
from backend.routers.course_router import create_prereq_rel_edge, create_prereq_edge


def create_relationship_from_catalog(url):
    for course in get_courses_from_catalog(url):
        if not course_router.course_exists(course["name"].split()[0], course["name"].split()[1]):
            continue
        course_name = course["name"]
        course_code = course_name.split()[0]
        course_number = course_name.split()[1]
        if int(course_number) < 5000:
            prereqs = course["prereqs"]
            rel = prereqs["rel"]
            prereq_list = prereqs["prereqs"]
            if prereq_list:
                for i in range(len(prereq_list)):
                    prereq_code = prereq_list[i].split()[0]
                    prereq_number = prereq_list[i].split()[1]
                    try:
                        create_prereq_edge(course_code, course_number, prereq_code, prereq_number)
                    except HTTPException:
                        print("Error creating relationship for " + course_code + course_number + " and " + prereq_code + prereq_number)
                    if i < len(prereq_list) - 1 and rel:
                        prereq2_code = prereq_list[i+1].split()[0]
                        prereq2_number = prereq_list[i+1].split()[1]
                        try:
                            create_prereq_rel_edge(course_code, course_number, prereq_code, prereq_number, prereq2_code, prereq2_number, rel.pop(0))
                        except HTTPException:
                            print("Error creating relationship for " + course_code + course_number + " and " + prereq_code + prereq_number)


def get_courses_from_catalog(url):
    html = get_catalog_html(url)
    return get_courses_from_html(html)

def get_catalog_html(url):
    try:
        response = requests.get(url)
        html = BeautifulSoup(response.text, 'html.parser')
        return html
    except Exception as e:
        print(e)

def get_courses_from_html(html):
    course_entries = html.find_all(class_='row course-item')
    course_list = []
    title_list = []
    for i in range(len(course_entries)):
        header = course_entries[i].find_all(class_='h6 mb-0')
        for element in header:
            class_open_status = element.find_all(class_='badge border')
            if class_open_status:
                entry_body = course_entries[i].find_all(class_='mb-2 small text-body-secondary')
                desc = entry_body[0].get_text().strip() if entry_body else ""
                title = header[0].get_text().strip()
                title_list.append(title)
                if desc != "":
                    course_list.append({"name": title, "prereqs": get_prereqs_from_text(desc, title_list, title)})
    return course_list

def get_prereqs_from_text(text, title_list, course_name):
    text_list = text.split()
    prereq_list = []
    start_looking = False
    i=0
    while i < len(text_list):
        text = strip_text(text_list[i])
        text_next = strip_text(text_list[i+1]) if i < len(text_list) - 1 else ""
        if text[0:6] == "Prereq" or text.lower() == "completed":
            start_looking = True
        if text == "Note:":
            start_looking = False
        if start_looking and i < len(text_list) - 1 and (is_abbreviation(text) and is_digit(strip_text(text_next)) and valid_course(text + " " + text_next, title_list, course_name) and not prereq_list.__contains__(text + " " + text_next)):
            prereq_list.append(text + " " + text_next)
            i += 1
        elif start_looking and is_digit(text) and is_operator(strip_text(text_list[i-1])):
            j = i
            abbrev = ""
            while not is_abbreviation(strip_text(text_list[j])) and j > 0:
                j -= 1
                abbrev = strip_text(text_list[j])
            prereq_list.append(abbrev + " " + text)
        elif start_looking and is_operator(text) and not (prereq_list and is_operator(prereq_list[-1])):
            if text.lower() == "or":
                prereq_list.append("or")
            else:
                prereq_list.append("and")
        i += 1
    if not prereq_list:
        return {"rel": None, "prereqs":[]}
    while prereq_list and (is_operator(prereq_list[-1]) or is_abbreviation(prereq_list[-1])):
        prereq_list.pop(-1)
    while prereq_list and (is_operator(prereq_list[0]) or is_abbreviation(prereq_list[0])):
        prereq_list.pop(0)
    return treeify(prereq_list)

def treeify(prereq_list):
    tree_structure = {"rel": get_operators_of(prereq_list), "prereqs": []}
    for i in range(len(prereq_list)):
        text = strip_text(prereq_list[i])
        if not is_operator(text):
            tree_structure["prereqs"].append(text)
    return tree_structure

def get_operators_of(prereq_list):
    operator_list = []
    for i in range(len(prereq_list)):
        text = strip_text(prereq_list[i])
        if not is_operator(text):
            if get_next_operator(prereq_list, i) is not None:
                operator_list.append(get_next_operator(prereq_list, i))
    return operator_list if operator_list else []

def get_next_operator(list, index):
    for i in range(index+1, len(list)):
        text = strip_text(list[i])
        if is_operator(text):
            return text
    return None

def is_operator(text):
    return strip_text(text.lower().strip()) == "or" or strip_text(text.lower().strip()) == "and" or strip_text(text.strip()) == "&"

def is_abbreviation(text):
    if len(text) > 4 or len(text) < 2 or text.islower() or text == "SEAS" or text == "BACS" or text == "BSCS" or not text.isalpha():
        return False
    if text.isupper():
        return True
    return False

def strip_text(text):
    return text.replace(",","").replace(".","").replace("(","").replace(")","")

def is_digit(text):
    stripped_text = strip_text(text)
    return (stripped_text.isdigit() and len(stripped_text) == 4) or stripped_text == "111x"

def valid_course(text, title_list, course_name):
    return strip_text(text) in title_list and strip_text(text) != course_name



