import re
from urllib.parse import urljoin, urlparse, parse_qs

from bs4 import BeautifulSoup
from fastapi import HTTPException
from playwright.sync_api import sync_playwright

from backend.db import db
from backend.repositories.major_repository import MajorRepository
from backend.routers import course_router
from backend.db_setup.scrape_hoolist_page_manager import is_abbreviation, is_digit, is_operator, strip_text, treeify

major_repo = MajorRepository()

SHOW_COURSE_RE = re.compile(r"showCourse\('(\d+)',\s*'(\d+)'")

FETCH_COURSE_JS = """
async (args) => {
    const [catoid, coid] = args;
    const res = await fetch('/ajax/preview_course.php?catoid=' + catoid + '&coid=' + coid + '&show', {
        headers: {'X-Requested-With': 'XMLHttpRequest'}
    });
    const text = await res.text();
    const div = document.createElement('div');
    div.innerHTML = text.replace(/></g, '> <');
    return div.textContent.replace(/\\s+/g, ' ').trim();
}
"""


def initialize_majors(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            majors = get_ba_majors(page, url)
            with db.get_session() as session:
                for major_name, major_url, catoid in majors:
                    scrape_major(page, session, major_name, major_url, catoid)
        finally:
            browser.close()


def get_ba_majors(page, url):
    page.goto(url, wait_until="networkidle")
    soup = BeautifulSoup(page.content(), "html.parser")
    table = find_degrees_offered_table(soup)

    majors = []
    for row in table.find_all("tr")[1:]:
        cells = row.find_all("td")
        if not cells:
            continue
        link = cells[0].find("a")
        if not link:
            continue
        major_name = link.get_text(strip=True)
        if not major_name.endswith("B.A."):
            continue
        href = link.get("href")
        catoid = parse_qs(urlparse(href).query).get("catoid", ["72"])[0]
        majors.append((major_name, urljoin(url, href), catoid))
    return majors


def find_degrees_offered_table(soup):
    for table in soup.find_all("table"):
        first_row = table.find("tr")
        if first_row and "Degrees Offered" in first_row.get_text():
            return table
    raise ValueError("Could not find the 'Degrees Offered' table on the page")


def scrape_major(page, session, major_name, major_url, catoid):
    major_repo.create_major(session, major_name)

    page.goto(major_url, wait_until="networkidle")
    soup = BeautifulSoup(page.content(), "html.parser")

    fields = []
    for h3 in soup.find_all("h3"):
        links = [a for ul in h3.parent.find_all("ul") for a in ul.find_all("a")]
        if not links:
            continue

        field = h3.get_text(strip=True)
        fields.append(field)
        for link in links:
            add_course_from_link(page, session, major_name, field, link, catoid)

    if fields:
        major_repo.set_major_fields(session, major_name, sorted(set(fields)))


def add_course_from_link(page, session, major_name, field, link, catoid):
    parts = link.get_text(strip=True).split()
    if len(parts) < 2:
        return

    course_code, course_number = parts[0], parts[1]
    if not course_router.course_exists(course_code, course_number):
        return

    major_repo.add_course_to_major(session, major_name, course_code, course_number, field)

    if int(course_number) >= 5000:
        return

    match = SHOW_COURSE_RE.search(link.get("onclick") or "")
    if not match:
        return

    coid = match.group(2)
    popup_text = page.evaluate(FETCH_COURSE_JS, [catoid, coid])
    prereqs = get_prereqs_from_popup(popup_text, course_code + " " + course_number)
    add_prereq_edges(course_code, course_number, prereqs)


def get_prereqs_from_popup(text, course_name):
    sentence = extract_prereq_sentence(text)
    if not sentence:
        return {"rel": None, "prereqs": []}

    tokens = sentence.split()
    prereq_list = []
    i = 0
    while i < len(tokens):
        token = strip_text(tokens[i])
        next_token = strip_text(tokens[i + 1]) if i < len(tokens) - 1 else ""
        if is_abbreviation(token) and is_digit(next_token) and is_valid_prereq(token, next_token, course_name):
            candidate = token + " " + next_token
            if candidate not in prereq_list:
                prereq_list.append(candidate)
            i += 1
        elif is_digit(token) and i > 0 and is_operator(strip_text(tokens[i - 1])):
            abbrev = ""
            j = i
            while j > 0 and not is_abbreviation(strip_text(tokens[j])):
                j -= 1
                abbrev = strip_text(tokens[j])
            if abbrev and is_valid_prereq(abbrev, token, course_name):
                prereq_list.append(abbrev + " " + token)
        elif is_operator(token) and not (prereq_list and is_operator(prereq_list[-1])):
            prereq_list.append("or" if token.lower() == "or" else "and")
        i += 1

    while prereq_list and (is_operator(prereq_list[-1]) or is_abbreviation(prereq_list[-1])):
        prereq_list.pop(-1)
    while prereq_list and (is_operator(prereq_list[0]) or is_abbreviation(prereq_list[0])):
        prereq_list.pop(0)

    if not prereq_list:
        return {"rel": None, "prereqs": []}
    return treeify(prereq_list)


def extract_prereq_sentence(text):
    match = re.search(r"Prerequisites?:?", text)
    if not match:
        return ""
    rest = text[match.end():]
    end = rest.find(".")
    return rest[:end] if end != -1 else rest


def is_valid_prereq(code, number, course_name):
    full_name = code + " " + number
    return full_name != course_name and course_router.course_exists(code, number)


def add_prereq_edges(course_code, course_number, prereqs):
    rel = prereqs["rel"]
    prereq_list = prereqs["prereqs"]
    if not prereq_list:
        return

    for i in range(len(prereq_list)):
        prereq_code, prereq_number = prereq_list[i].split()
        try:
            course_router.create_prereq_edge(course_code, course_number, prereq_code, prereq_number)
        except HTTPException:
            print("Error creating relationship for " + course_code + course_number + " and " + prereq_code + prereq_number)

        if rel and i < len(prereq_list) - 1:
            prereq2_code, prereq2_number = prereq_list[i + 1].split()
            try:
                course_router.create_prereq_rel_edge(course_code, course_number, prereq_code, prereq_number, prereq2_code, prereq2_number, rel.pop(0))
            except HTTPException:
                print("Error creating relationship for " + course_code + course_number + " and " + prereq_code + prereq_number)
