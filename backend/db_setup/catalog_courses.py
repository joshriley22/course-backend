"""Fill in Course nodes for every undergraduate course the Undergraduate Record lists under a subject.

Courses are otherwise created from SIS class listings (sis_api_manager.py), so anything not offered in the loaded
terms is missing. Major scripts whose requirements are rules like "CS courses at the 3000 level or higher" call
add_catalog_courses() first so the rule matches every catalog course, not just the ones currently offered.
"""
import re
import time
import uuid

from bs4 import BeautifulSoup
from playwright.sync_api import Error as PlaywrightError, sync_playwright

BASE_URL = "https://records.ureg.virginia.edu"
CATOID = 72
COURSE_DESCRIPTIONS_NAVOID = 6707
LISTING_URL = (f"{BASE_URL}/content.php?catoid={CATOID}&navoid={COURSE_DESCRIPTIONS_NAVOID}"
               "&filter%5B27%5D={subject}&filter%5Bcourse_type%5D=-1&filter%5B32%5D=1&filter%5Bcpage%5D={page}"
               f"&cur_cat_oid={CATOID}&search_database=Filter")
COURSE_RE = re.compile(r"^([A-Z]{2,5})\s+(\d{4})\s+-\s+(.+)$")
CREDITS_RE = re.compile(r"Credits(?:\s*/\s*Units)?:\s*([\d.]+(?:\s*to\s*[\d.]+)?)")


def retry(action, attempts=4):
    """The site occasionally stalls or returns an empty bot-check page; retry with a short backoff."""
    for attempt in range(attempts):
        try:
            result = action()
            if result:
                return result
        except PlaywrightError:
            if attempt == attempts - 1:
                raise
        time.sleep(2 * (attempt + 1))
    return result


def fetch(page, url):
    return retry(lambda: page.evaluate("async (url) => await (await fetch(url)).text()", url))


def fetch_subject(page, subject):
    """Return [(code, number, name, course url)] for one subject, following the listing's pagination."""
    courses, page_number = [], 1
    while True:
        soup = BeautifulSoup(fetch(page, LISTING_URL.format(subject=subject, page=page_number)), "html.parser")
        found = []
        for link in soup.select('a[href*="preview_course"]'):
            match = COURSE_RE.match(link.get_text(" ", strip=True))
            if match and match[1] == subject:
                found.append((*match.groups(), BASE_URL + "/" + link["href"].lstrip("/")))
        if not found:
            return courses
        courses += found
        page_number += 1
        if not soup.find("a", href=re.compile(rf"filter%5Bcpage%5D={page_number}|filter\[cpage\]={page_number}")):
            return courses


def fetch_all(page, urls, batch_size=10):
    texts = []
    for i in range(0, len(urls), batch_size):
        batch = urls[i:i + batch_size]
        texts += retry(lambda: page.evaluate(
            "async (urls) => Promise.all(urls.map(async (u) => await (await fetch(u)).text()))", batch))
    return texts


def parse_credits(html):
    match = CREDITS_RE.search(BeautifulSoup(html, "html.parser").get_text(" "))
    return match[1].replace(" to ", " - ") if match else "0"  # SIS stores ranges as "1 - 3"


def catalog_courses(subjects, known=(), keep=lambda code, number: True):
    """Return [(code, number, name, credits)] for every undergraduate course in the catalog for these subjects that
    `keep` accepts. Credits are only looked up (one page fetch each) for courses not in `known`."""
    known = set(known)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Loading a page in the browser clears the site's bot check so later fetches return content
            retry(lambda: page.goto(LISTING_URL.format(subject=subjects[0], page=1), wait_until="load",
                                    timeout=90000))
            listed = [c for subject in subjects for c in fetch_subject(page, subject)
                      if c[1] < "5000" and keep(c[0], c[1])]
            new = [c for c in listed if c[:2] not in known]
            credits = dict(zip((c[:2] for c in new), map(parse_credits, fetch_all(page, [c[3] for c in new]))))
            return [(code, number, name, credits.get((code, number))) for code, number, name, _ in listed]
        finally:
            browser.close()


def add_catalog_courses(session, subjects, listed=()):
    """Create a Course node for every catalog course in `subjects`, plus the individually `listed` (code, number)
    courses, that the database doesn't have yet. Returns the (code, number) of those catalog courses and prints the
    ones it created."""
    known = {(r["code"], r["number"]) for r in
             session.run("MATCH (c:Course) RETURN DISTINCT c.code AS code, c.number AS number")}
    listed = set(listed) - known
    all_subjects = list(dict.fromkeys([*subjects, *sorted({code for code, _ in listed})]))
    if not all_subjects:
        return []
    courses = catalog_courses(all_subjects, known, keep=lambda code, number: code in subjects or (code, number) in listed)
    missing = [{"code": c, "number": n, "name": name, "credits": credits, "uuid": str(uuid.uuid4())}
               for c, n, name, credits in courses if (c, n) not in known]
    session.run(
        """
        UNWIND $courses AS course
        MERGE (c:Course {code:course.code, number:course.number})
        ON CREATE SET c.name = course.name, c.credits = course.credits, c.rating = 0.0, c.uuid = course.uuid
        """,
        courses=missing,
    )
    if missing:
        print(f"added {len(missing)} catalog courses: " + ", ".join(f"{c['code']} {c['number']}" for c in missing))
    return [(c, n) for c, n, _, _ in courses]
