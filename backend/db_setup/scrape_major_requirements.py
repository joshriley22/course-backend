"""Create a Major node for every undergraduate degree program in the UVA Undergraduate Record and link it
to the courses listed on its requirements page.

Superseded by initialize_majors.py (field-by-field specs in major_specs.py) and the Engineering initialize_*_major.py
scripts; running this with --write would overwrite their fields with the generic prereq/core/elective/integration ones.

Concentrations, specializations, tracks, advanced pathways and Distinguished Majors Programs are omitted.
Each linked course is classified as prereq / core / elective / integration from the headings above it.
Only courses that already exist as Course nodes are linked; majors that end up with no courses are not created.

Usage (from the project root):
    python -m backend.db_setup.scrape_major_requirements            # dry run, prints what would be written
    python -m backend.db_setup.scrape_major_requirements --write    # writes to Neo4j
"""
import re
import sys
import uuid

from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

from backend.db import db

BASE_URL = "https://records.ureg.virginia.edu"
CATOID = 72
FIELD_ORDER = ["prereq", "core", "elective", "integration"]

# poid -> (short name, long name)
PROGRAMS = {
    11850: ("Arch History", "Architectural History"),
    11848: ("Architecture", "Architecture"),
    11851: ("Urban Planning", "Urban and Environmental Planning"),
    11677: ("AAS", "African American and African Studies"),
    11681: ("Anthropology", "Anthropology"),
    11788: ("Applied Stats", "Applied Statistics"),
    11724: ("Latin Am. Studies", "Latin American Studies"),
    11716: ("Art History", "History of Art"),
    11750: ("Studio Art", "Studio Art"),
    11842: ("Astronomy (Arts)", "Astronomy (Arts)"),
    11686: ("Astronomy (Science)", "Astronomy (Science)"),
    11794: ("Behavioral Neuro", "Behavioral Neuroscience"),
    11688: ("Biology (Arts)", "Biology (Arts)"),
    11843: ("Biology (Science)", "Biology (Science)"),
    11844: ("Chemistry (Arts)", "Chemistry (Arts)"),
    11691: ("Chemistry (Science)", "Chemistry (Science)"),
    11847: ("Classics", "Classics"),
    11704: ("Drama", "Drama"),
    11854: ("Economics", "Economics"),
    11709: ("English", "English"),
    11862: ("Env Sci (Arts)", "Environmental Sciences (Arts)"),
    11859: ("Env Sci (Science)", "Environmental Sciences (Science)"),
    11878: ("Foreign Affairs", "Foreign Affairs"),
    11712: ("French", "French"),
    11713: ("German", "German"),
    11877: ("Government", "Government"),
    11715: ("History", "History"),
    11680: ("American Studies", "American Studies"),
    11682: ("Archaeology", "Archaeology"),
    11889: ("Chinese", "Chinese Language & Literature"),
    11694: ("Cognitive Science", "Cognitive Science"),
    11705: ("East Asian Studies", "East Asian Studies"),
    11711: ("ETP", "Environmental Thought & Practice"),
    11714: ("German Studies", "German Studies"),
    11770: ("Global Studies", "Global Studies"),
    11717: ("Human Biology", "Human Biology"),
    11891: ("Japanese", "Japanese Language & Literature"),
    11722: ("Jewish Studies", "Jewish Studies"),
    11727: ("Linguistics", "Linguistics"),
    11732: ("Medieval Studies", "Medieval Studies"),
    11897: ("MELL", "Middle Eastern Languages and Literatures"),
    11900: ("MEST", "Middle Eastern Studies"),
    11737: ("Neuroscience", "Neuroscience"),
    11741: ("PST", "Political & Social Thought"),
    11742: ("PPL", "Political Philosophy, Policy, & Law"),
    11902: ("SALL", "South Asian Languages and Literatures"),
    11901: ("SAST", "South Asian Studies"),
    11749: ("WGS", "Women, Gender, and Sexuality"),
    11836: ("Italian", "Italian"),
    11731: ("Media Studies", "Media Studies"),
    11735: ("Music", "Music"),
    11739: ("Philosophy", "Philosophy"),
    11871: ("Physics (Arts)", "Physics (Arts)"),
    11740: ("Physics (Science)", "Physics (Science)"),
    11744: ("Psychology", "Psychology"),
    11837: ("Religious Studies", "Religious Studies"),
    11746: ("Slavic", "Slavic Languages and Literatures"),
    11747: ("Sociology", "Sociology"),
    11748: ("Spanish", "Spanish"),
    11785: ("Statistics", "Statistics"),
    11703: ("Commerce", "Commerce"),
    11765: ("Health Sci Mgmt", "Health Sciences Management"),
    11687: ("BIS", "Interdisciplinary Studies"),
    11828: ("Data Science", "Data Science"),
    11778: ("Elementary Ed", "Elementary Education"),
    11780: ("Early Childhood Ed", "Early Childhood Education"),
    11907: ("ESL Ed", "English as a Second Language Education"),
    11779: ("Special Ed", "Special Education"),
    11723: ("Kinesiology", "Kinesiology"),
    11906: ("Secondary Ed", "Secondary Education"),
    11696: ("Speech Disorders", "Speech Communication Disorders"),
    11766: ("YSI", "Youth and Social Innovation"),
    11676: ("Aerospace Eng", "Aerospace Engineering"),
    11689: ("Biomedical Eng", "Biomedical Engineering"),
    11690: ("Chemical Eng", "Chemical Engineering"),
    11692: ("Civil Eng", "Civil Engineering"),
    11698: ("Computer Eng", "Computer Engineering"),
    11700: ("CS (Engineering)", "Computer Science (Engineering)"),
    11707: ("Electrical Eng", "Electrical Engineering"),
    11708: ("Engineering Science", "Engineering Science"),
    11728: ("Materials Sci & Eng", "Materials Science and Engineering"),
    11730: ("Mechanical Eng", "Mechanical Engineering"),
    11751: ("Systems Eng", "Systems Engineering"),
    11768: ("Public Policy", "Public Policy and Leadership"),
    11738: ("Nursing", "Nursing"),
    # Already curated by hand in the database; not overwritten:
    # 11789 Computer Science, B.A. -> "CS (Arts)", 11827 Mathematics, B.A. -> "Math"
    # 11721 Interdisciplinary Major Program is an overview page with no requirements.
}

SKIP_RE = re.compile(
    r"concentration|specializ|specialist|\btrack\b|distinguish|\bdmp\b|honors|thesis|advanced (core|major|pathway)"
    r"|learning objectives|universal|general education|\bminor\b|independent (study|research)|b\.a\.-m\.a"
    r"|course descriptions|course information|study abroad|footnotes|\bnotes\b|transfer|rn to bsn|licensure"
    r"|internship|substitut|duplication|grade|grading|placement|scholarships|centers and programs"
    r"|additional information|language requirement|prizes|research opportunities",
    re.I,
)
# Program-specific sections that belong to another degree
EXTRA_SKIP = {11740: re.compile(r"astronomy-physics", re.I)}

PREREQ_RE = re.compile(r"prerequisite|prequisite|declar|entrance", re.I)
INTEGRATION_RE = re.compile(r"integration", re.I)
ELECTIVE_RE = re.compile(r"elective|approved|course list|supporting|additional course|distribution", re.I)
COURSE_RE = re.compile(r"^([A-Z]{2,5})\s+(\d{4})\b")


def fetch_program_html(page, poid):
    return page.evaluate(
        "async (url) => await (await fetch(url)).text()",
        f"/preview_program.php?catoid={CATOID}&poid={poid}",
    )


def classify(path):
    text = " / ".join(path)
    if PREREQ_RE.search(text):
        return "prereq"
    if INTEGRATION_RE.search(text):
        return "integration"
    if ELECTIVE_RE.search(text):
        return "elective"
    return "core"


def parse_program(html, poid):
    """Return {field: set((code, number))} for the courses on a program page."""
    soup = BeautifulSoup(html, "html.parser")
    extra_skip = EXTRA_SKIP.get(poid)
    stack = []  # [(level, heading text)]
    courses = {}

    for core in soup.select(".acalog-core"):
        heading = core.find(["h2", "h3", "h4", "h5", "h6"])
        if heading:
            level = int(heading.name[1])
            while stack and stack[-1][0] >= level:
                stack.pop()
            stack.append((level, heading.get_text(" ", strip=True)))
        path = [text for _, text in stack]

        if any(SKIP_RE.search(t) or (extra_skip and extra_skip.search(t)) for t in path):
            continue

        field = classify(path)
        for link in core.find_all("a"):
            if not re.search(r"showCourse|preview_course", (link.get("onclick") or "") + (link.get("href") or "")):
                continue
            match = COURSE_RE.match(link.get_text(" ", strip=True))
            if match:
                courses.setdefault(field, set()).add(match.groups())
    return courses


def existing_courses(session):
    result = session.run("MATCH (c:Course) RETURN DISTINCT c.code AS code, c.number AS number")
    return {(r["code"], r["number"]) for r in result}


def write_major(session, name, long_name, courses):
    fields = [f for f in FIELD_ORDER if courses.get(f)]
    session.run(
        """
        MERGE (m:Major {name:$name})
        ON CREATE SET m.uuid = $uuid
        SET m.long_name = $long_name, m.fields = $fields
        """,
        name=name, uuid=str(uuid.uuid4()), long_name=long_name, fields=fields,
    )
    for field in fields:
        session.run(
            """
            MATCH (m:Major {name:$name})
            UNWIND $courses AS course
            CALL (course) {
                MATCH (c:Course {code:course[0], number:course[1]})
                RETURN c ORDER BY c.credits = '0' LIMIT 1
            }
            MERGE (m)-[:COURSE_OF {relationship:$field}]->(c)
            """,
            name=name, field=field, courses=[list(c) for c in sorted(courses[field])],
        )


def main(write):
    with db.get_session() as session:
        known = existing_courses(session)

    report = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Loading a program page in the browser clears the site's bot check so later fetches return content
            page.goto(f"{BASE_URL}/preview_program.php?catoid={CATOID}&poid={next(iter(PROGRAMS))}", wait_until="networkidle")
            with db.get_session() as session:
                for poid, (name, long_name) in PROGRAMS.items():
                    scraped = parse_program(fetch_program_html(page, poid), poid)
                    linked = {f: {c for c in cs if c in known} for f, cs in scraped.items()}
                    linked = {f: cs for f, cs in linked.items() if cs}
                    n_scraped = len(set().union(*scraped.values())) if scraped else 0
                    n_linked = len(set().union(*linked.values())) if linked else 0
                    report.append((name, n_scraped, n_linked, {f: len(cs) for f, cs in linked.items()}))
                    if write and linked:
                        write_major(session, name, long_name, linked)
        finally:
            browser.close()

    for name, n_scraped, n_linked, by_field in report:
        status = "" if n_linked else "  <- not created"
        print(f"{name:22} listed {n_scraped:3}  linked {n_linked:3}  {by_field}{status}")


if __name__ == "__main__":
    main(write="--write" in sys.argv)
