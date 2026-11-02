"""Credits needed to satisfy each field of every major in major_specs.py, read off each program's page in the
Undergraduate Record (records.ureg.virginia.edu, catoid=72). initialize_majors.py writes them to each Major as
`credits`, aligned index-for-index with `fields`.

A field satisfied by one of several courses counts the smallest option (e.g. MATH 1210 at 3 credits rather than
MATH 1310 at 4). Where major_specs.py merges concentrations or tracks into one field, the field counts a single
concentration's requirement. Fields that overlap (e.g. "upper" within "elective") each count their own requirement,
so a major's credits can sum to more than its total.
"""

CREDITS = {
    "Arch History": {"core": 12, "elective": 24, "preservation": 18},
    "Architecture": {"core": 60, "physics": 3},
    "Urban Planning": {"core": 30, "application": 3, "politics": 6, "professional": 9, "elective": 6},
    "African American and African Studies": {"prereq": 8, "elective": 18, "upper": 9, "seminar": 3},
    "Anthropology": {"gateway": 3, "foundation": 3, "capstone": 3, "sociocultural (distribution)": 3,
                     "archaeology (distribution)": 3, "linguistic (distribution)": 3, "upper": 9},
    "Applied Stats": {"calc2 (prereq)": 3, "introstats (prereq)": 3, "programming (prereq)": 3, "core": 15,
                      "capstone": 3, "analysis (restricted)": 6, "computational (restricted)": 6},
    "Latin Am. Studies": {"language": 3, "seminar": 3, "elective": 30},
    "Art History": {"prereq": 3, "premodern": 3, "modern": 3, "global": 3, "upper": 6, "capstone": 6, "elective": 6},
    "Studio Art": {"concentration": 9, "elective": 12, "upper": 3, "arthistory": 3, "departmental": 3},
    "Astronomy (Arts)": {"core": 10, "elective": 15, "math": 12, "physics": 9},
    "Astronomy (Science)": {"core": 13, "elective": 6, "math": 19, "physics": 36},
    "Behavioral Neuro": {"prereq": 16, "core": 16, "research": 3, "topics": 6, "foundation": 3, "science": 6,
                         "elective": 6},
    "Biology (Arts)": {"prereq": 4, "core": 9, "elective": 15, "lab": 3, "chemistry": 8, "physics": 8,
                       "quantitative": 7},
    "Biology (Science)": {"prereq": 8, "core": 15, "elective": 12, "advanced": 9, "lab": 3, "research": 4,
                          "capstone": 1, "chemistry": 16, "physics": 8, "quantitative": 10},
    "Chemistry (Arts)": {"core": 32, "elective": 3, "math": 6, "physics": 8},
    "Chemistry (Science)": {"core": 44, "lab": 3, "research": 6, "math": 10, "physics": 8},
    # Greek and Latin each count as the primary language of their concentration
    "Classics": {"greek": 18, "latin": 18, "civilization": 6, "related": 6},
    "Drama": {"discovery": 9, "interpretation (learningareas)": 3, "critical (learningareas)": 3,
              "creating (learningareas)": 3, "crafting (learningareas)": 3, "focused": 12},
    "Economics": {"calculus (prereq)": 3, "intermicro (prereq)": 4, "statistics (prereq)": 3, "core": 16,
                  "elective": 12, "advanced": 6},
    "English": {"prereq": 3, "core": 6, "premodern": 3, "period1700": 3, "seminar": 3, "elective": 12},
    "Env Sci (Arts)": {"core": 13, "elective": 17, "science": 9},
    "Env Sci (Science)": {"core": 17, "elective": 24, "science": 27},
    "Foreign Affairs": {"american": 3, "comparative": 3, "international": 3, "theory": 3, "track": 9, "upper": 15,
                        "elective": 9, "related": 12},
    "French": {"core": 3, "elective": 27, "advanced": 9},
    "German": {"prereq": 3, "core": 6, "elective": 24},
    "Government": {"american": 3, "comparative": 3, "international": 3, "theory": 3, "track": 9, "upper": 15,
                   "elective": 9, "related": 12},
    "History": {"workshop": 3, "seminar": 3, "elective": 24},
    "American Studies": {"intro": 3, "elective": 24, "upper": 15, "seminar": 3},
    # supporting and topics together make up the five supporting courses
    "Archaeology": {"core": 9, "supporting": 12, "topics": 3, "related": 6},
    "Chinese": {"core": 15, "language": 15, "capstone": 1},
    "Cognitive Science": {"math": 3, "psychology (coreareas)": 3, "computing (coreareas)": 3,
                          "linguistics (coreareas)": 3, "neuroscience (coreareas)": 3, "philosophy (coreareas)": 3,
                          "elective": 12},
    "East Asian Studies": {"intro": 3, "language": 6, "history": 3, "capstone": 1, "elective": 18},
    "Environmental Thought & Practice": {"core": 15, "values (elective)": 3, "policy (elective)": 3,
                                         "science (elective)": 6},
    "German Studies": {"prereq": 3, "core": 3, "language": 9, "advanced": 3, "studies": 15},
    "Human Biology": {"biology (prereq)": 8, "chemistry (prereq)": 8, "calcstats (prereq)": 3, "core": 13,
                      "science": 6, "publichealth": 6, "capstone": 8, "humanities": 9},
    # each concentration is 30 credits
    "Global Studies": {"prereq": 3, "commerce": 30, "development": 30, "sustainability": 30, "mesa": 30,
                       "publichealth": 30, "security": 30},
    "Japanese": {"core": 12, "language": 15, "capstone": 1},
    "Jewish Studies": {"history (distributionreq)": 3, "belief (distributionreq)": 3, "culture (distributionreq)": 3,
                       "elective": 18, "capstone": 3},
    "Linguistics": {"core": 3, "historical": 3, "structure": 3, "theoretical": 3, "elective": 18},
    "Medieval Studies": {"core": 3, "elective": 27},
    "Middle Eastern Lang & Lit": {"prereq": 6, "language": 12, "advanced": 6, "related": 12},
    "Middle Eastern Studies": {"prereq": 6, "language": 6, "capstone": 3, "literature": 3, "history": 3,
                               "regional": 15},
    "Neuroscience": {"biology (sciencefoundation)": 4, "chemistry (sciencefoundation)": 8,
                     "calculus (sciencefoundation)": 3, "statistics (sciencefoundation)": 3,
                     "physics (sciencefoundation)": 8, "core": 12, "lab": 3, "cellular (elective)": 3,
                     "behavioral (elective)": 3, "related (elective)": 3},
    "Political & Social Thought": {"seminar": 8, "foundation": 6, "thesis": 6},
    "Political Philosophy, Policy, & Law": {"corequisite": 9, "core": 6, "theoretical (interdisciplinary)": 9,
                                            "policy (interdisciplinary)": 9},
    "South Asian Lang & Lit": {"prereq": 6, "language": 12, "advanced": 6, "related": 12},
    "South Asian Studies": {"prereq": 6, "language": 6, "capstone": 3, "literature": 3, "history": 3,
                            "regional": 15},
    "Women, Gender, and Sexuality": {"core": 9, "theory": 3, "seminar": 6, "elective": 12},
    "Italian": {"prereq": 3, "language": 6, "literature": 18, "context": 6},
    "Media Studies": {"core": 12, "practice": 3, "diversity": 3, "elective": 12},
    "Music": {"intro": 3, "theory (core)": 3, "critical (core)": 3, "cct (core)": 3,
              "musicianship (performancereq)": 2, "performance (performancereq)": 3, "elective": 15, "seminar": 3},
    "Philosophy": {"logic": 3, "theoretical": 3, "moral": 3, "social": 3, "premodern": 3, "modern": 3,
                   "elective": 12},
    "Physics (Arts)": {"core": 23, "elective": 12},
    # advanced and elective follow the Fundamental Physics concentration, topical the Applied Physics one
    "Physics (Science)": {"core": 36, "advanced": 24, "elective": 3, "topical": 12},
    "Psychology": {"prereq": 6, "cognitive (fundamentals)": 3, "neuroscience (fundamentals)": 3,
                   "developmental (fundamentals)": 3, "clinical (fundamentals)": 3, "methods": 7, "rmtopics": 3,
                   "elective": 12, "advanced": 3},
    "Religious Studies": {"core": 9, "concentration": 9, "upper": 9, "elective": 12},
    "Slavic": {"prereq": 4, "core": 6, "literature": 3, "studies": 9, "folklore": 3, "elective": 12},
    "Sociology": {"intro": 3, "core": 11, "elective": 18, "advanced": 6},
    # elective is the major's thirty credits above SPAN 2020
    "Spanish": {"prereq": 3, "core": 6, "spain (survey)": 3, "latinamerica (survey)": 3, "language": 3,
                "linguistics": 3, "advanced": 12, "elective": 30},
    # concentration follows Probability and Statistics, elective/general/computing the General Option
    "Math": {"prereq": 4, "diffeq (core)": 3, "linalg (core)": 3, "realanalysis (core)": 3,
             "abstractalgebra (core)": 3, "concentration": 9, "elective": 6, "general": 9, "finance": 6,
             "computing": 3},
    "Statistics": {"calc2 (prereq)": 4, "introstats (prereq)": 3, "programming (prereq)": 3, "required (prereq)": 6,
                   "core": 28, "capstone": 3, "analysis (restricted)": 9, "computational (restricted)": 6},
    # the 3-year format
    "Commerce": {"prereq": 6, "secondyear (core)": 15, "thirdyear (core)": 15, "law (core)": 3, "elective": 12},
    "Health Sci Mgmt": {"core": 25, "capstone": 6, "elective": 12, "humanities": 15},
    "Interdisciplinary Studies": {"seminar": 6, "inquiry": 6, "concentration": 18, "elective": 24, "capstone": 6},
    "Data Science": {"dsfoundation (prereq)": 3, "programming (prereq)": 3, "core": 37, "math": 3, "elective": 9,
                     "collaborative": 9},
    "Elementary Ed": {"core": 18, "major": 10, "clinicalexp": 28, "cultural": 3},
    "Early Childhood Ed": {"core": 18, "major": 10, "clinicalexp": 28, "cultural": 3},
    "ESL Ed": {"core": 19, "major": 9, "corequisite": 3, "clinicalexp": 28, "cultural": 3},
    "Special Ed": {"core": 18, "major": 10, "clinicalexp": 28, "cultural": 3},
    "Kinesiology": {"science": 19, "core": 18, "applied": 6, "elective": 12},
    "Secondary Ed": {"core": 22, "practicum": 4, "concentration": 6, "clinicalexp": 24, "cultural": 3},
    "Speech Disorders": {"core": 21, "populations": 12, "communication": 12},
    # YSI Practice can be met without credit (paid or volunteer hours)
    "Youth & Social Innovation": {"core": 24, "elective": 12, "practice": 0},
    "Public Policy": {"prereq": 9, "civic": 9, "leadership": 9, "economic": 6, "capstone": 3, "topics": 15},
    "Aerospace Eng": {"math": 10, "core": 49, "design": 6, "technical": 3},
    "Mechanical Eng": {"math": 10, "core": 43, "design": 6, "technical": 9},
    # technical covers the engineering elective and the technical elective
    "Chemical Eng": {"math": 7, "chemistry": 13, "core": 36, "design": 3, "elective": 6, "technical": 6},
    # core follows the Structural Engineering and CEM tracks (the other two require more)
    "Civil Eng": {"math": 10, "mathsci": 6, "core": 35, "design": 6, "elective": 6, "track": 6, "technical": 6},
    "Materials Sci & Eng": {"math": 7, "core": 24, "design": 6, "elective": 15, "mathsci": 3, "engineering": 6,
                            "technical": 6},
    "Systems Eng": {"math": 13, "core": 31, "design": 7, "elective": 9},
    "Nursing": {"prereq": 19, "core": 58, "capstone": 9, "rntobsn": 27},
    # Majors with their own initialize_*_major.py scripts
    "Engineering General Requirements": {"foundations": 7, "calculus": 11, "chemistry": 4, "physics": 4,
                                         "programming": 3, "sts": 9, "mathsci": 3, "hss": 9},
    "Biomedical Eng": {"math": 7, "core": 32, "elective": 9, "engineering": 6, "technical": 3, "capstone": 6},
    "Computer Eng": {"math": 7, "ece": 20.5, "cs": 18, "elective": 15, "design": 4.5},
    # prereq is intro programming plus CS 2100, as copied from CS (Arts)
    "CS (Engineering)": {"prereq": 7, "core": 27, "elective": 15, "capstone": 3, "apma": 9},
    "Electrical Eng": {"math": 7, "mathelective": 3, "ece": 23, "elective": 19.5, "design": 4.5, "technical": 6},
    "Arts & Sciences General Requirements": {"aip": 3, "cmp": 3, "csw": 3, "hp": 3, "ls": 3, "ss": 3, "ses": 3,
                                             "writing1": 3, "writing2": 3},
}


def credit_list(credits):
    """Neo4j lists must hold one type: whole numbers stay ints unless a fractional credit forces floats."""
    return [int(c) for c in credits] if all(c == int(c) for c in credits) else [float(c) for c in credits]


def field_credits(major_name, fields):
    """Credits for each of `fields`, in order; raises if CREDITS doesn't cover them all."""
    credits = CREDITS.get(major_name, {})
    missing = [f for f in fields if f not in credits]
    if missing:
        raise KeyError(f"major_credits.py has no credits for {major_name}: {', '.join(missing)}")
    return credit_list([credits[f] for f in fields])
