"""Field-by-field course requirements for every undergraduate major, read off each program's page in the Undergraduate
Record (records.ureg.virginia.edu, catoid=72; poid noted per major). Used by initialize_majors.py.

Courses use the parse_courses format: "ANTH 1010 2120 / LING 2430", with "PSYC 2300-3110" for ranges. Rules capture
"<subject> courses at the <level> level or higher" requirements. Where a page defers to a departmental "approved list"
it doesn't print, the department's own mnemonic(s) stand in for that list.

Not here: CS (Arts) (hand-curated in the database), the Engineering majors with their own scripts
(initialize_*_major.py), and school-wide general education (the "... General Requirements" Majors).
Concentrations, tracks and Distinguished Majors Programs are omitted unless the major is defined by them.
"""
from backend.db_setup.initialize_majors import Field as F, Major, Rule as R

ARCH_SCHOOL = "ARCH ARH PLAN PLAC LAR"
BATTEN = "LPPA LPPL LPPP LPPS"
EDUCATION = "EDHS EDIS EDLF EDNC KINE"
ENGINEERING = "APMA BME CE CHE CS ECE ENGR MAE MSE SYS"
ENGLISH_LIT = "ENGL ENAM ENCR ENEC ENGN ENLS ENLT ENMC ENMD ENNC ENRN ENSP"
POLITICS = "PLAD PLAP PLCP PLIR PLPT"
SCIENCE = "ASTR BIOL CHEM EVSC PHYS"
HISTORY = "HIST HIAF HIEA HIEU HILA HIME HISA HIUS"
RELIGION = "RELA RELB RELC RELG RELH RELI RELJ RELS"
MESALC_LANGUAGES = "ARAB HEBR PERS HIND URDU SANS"
# The MAE department's Math-Science/Technical Electives list is only on its website; upper-level MAE and
# 2000+ APMA courses stand in for it
MAE_TECHNICAL = [R("MAE", min="3000"), R("APMA", min="2000")]
# School of Education and Human Development Cultural Literacy competency
CULTURAL_LITERACY = "EDHS 4310 / EDIS 3017 3060 / EDLF 3240 3460 3610 4610"


def politics_fields(track):
    """Government and Foreign Affairs share the Politics department's distribution, elective and related-course
    requirements and differ in their track subjects."""
    return [
        F("american", rules=[R("PLAP")], include_required=True),
        F("comparative", rules=[R("PLCP")], include_required=True),
        F("international", rules=[R("PLIR")], include_required=True),
        F("theory", rules=[R("PLPT")], include_required=True),
        F("track", rules=[R(track)], include_required=True),
        F("upper", rules=[R(POLITICS, min="3000")], include_required=True),
        F("elective", rules=[R(POLITICS)], include_required=True),
        # "closely related disciplines, such as history, philosophy, the social sciences"
        F("related", rules=[R(f"{HISTORY} PHIL ECON SOC ANTH PSYC {BATTEN}")]),
    ]


MAJORS = [
    # 11850
    Major("Arch History", "Architectural History", [
        F("core", "ARH 1010 1020 4591 4999 / ARTH 4591"),
        F("elective", rules=[R("ARH")]),
        F("preservation", "ARH 3604 3611 3616"),
    ]),
    # 11848
    Major("Architecture", "Architecture", [
        F("core", "ARCH 1010 2010 2710 2020 2114 2715 3010 3020 3120 3240 3260 4010 4100 4020 4995"),
        F("physics", rules=[R("PHYS")]),
    ]),
    # 11851
    Major("Urban Planning", "Urban and Environmental Planning", [
        F("core", "ECON 2010 2020 / PLAN 2110 2020 3020 3030 3050 3060 / PLAC 4010"),
        F("application", rules=[R("PLAC")]),
        F("politics", "PLAN 3070", rules=[R(POLITICS)]),
        F("professional", rules=[R(f"{ARCH_SCHOOL} {BATTEN} COMM ACCT {EDUCATION} DS {ENGINEERING} NURS", min="3000")]),
        F("elective", rules=[R("PLAN")]),
    ]),
    # 11677
    Major("African American and African Studies", "African American and African Studies", [
        F("prereq", "AAS 1010 1020"),
        F("elective", rules=[R("AAS")]),
        F("upper", rules=[R("AAS", min="3000")]),
        F("seminar", rules=[R("AAS", min="4000", exclude="AAS 4070 4080")]),
    ]),
    # 11681
    Major("Anthropology", "Anthropology", [
        F("gateway", "ANTH 1010 2120 2160 2400 2415 2450 2800 2820"),
        F("foundation", "ANTH 3010 3020"),
        F("capstone", "ANTH 4591"),
        # "one course at the 2000-level or above in each of these areas", from the department's area course lists
        F("distribution", subfields={
            "sociocultural": "ANTH 2120 2250 2260 2270 2280 2285 2405 2415 2500 2557 2560 2575 2590 2620 2625 3100 3129"
                             " 3152 3170 3220 3240 3260 3300 3325 3340 3360 3370 3550 3680 4590",
            "archaeology": "ANTH 2450 2589 2800 2810 2820 3589 3810 3840 3880 4840",
            "linguistic": "ANTH 2400 2410 2430 2440 2450 2470 2541 3450 3470 3480 3490 3541",
        }),
        # "in addition to the Foundation and Capstone courses"; they may overlap with the Distributional Electives
        F("upper", rules=[R("ANTH", min="3000", exclude="ANTH 3010 3020 4591")], include_required=True),
    ]),
    # 11788
    Major("Applied Stats", "Applied Statistics", [
        F("prereq", subfields={
            "calc2": "MATH 1220 1320 / APMA 1110",
            "introstats": "STAT 1100 1120 2020 2120 / APMA 3110 3120",
            "programming": "STAT 1601 1602 / CS 1110 1111 1112 1113",
        }),
        F("core", "STAT 3110 3130 4160 3080 3120 3220 / MATH 3100 3350 3351"),
        F("capstone", "STAT 4996"),
        F("restricted", subfields={
            "analysis": "STAT 3130 3480 4120 4130 4160 4170 4220 4630 4800 / ECON 3720 4720 / SYS 4021",
            "computational": "STAT 3250 3280 / ASTR 4140 / COMM 3220 / CS 4444 4740 4750",
        }),
    ]),
    # 11724: area studies courses are LAST (and Portuguese, which can count at any level)
    Major("Latin Am. Studies", "Latin American Studies", [
        F("language", "SPAN 2020 / PORT 2120 2050"),
        F("seminar", "LAST 2050"),
        F("elective", rules=[R("LAST PORT")]),
    ]),
    # 11716
    Major("Art History", "History of Art", [
        F("prereq", "ARTH 2000"),
        F("premodern", "ARTH 1153 2052 2053 2054 2055 2056 2151 2153 2252 2271 2525 2961 3051 3062 3151 3153 3254 3255 3525"),
        F("modern", "ARTH 2281 2282 2352 2354 2371 2372 2451 2470 2471 2491 2745 2753 2769 2961 3254 3525 3545 3785"),
        F("global", "ARTH 1861 2052 2053 2054 2055 2056 2745 2861 2862 2882 2891 2892 2961 3051 3062 3651 3785 3861 3863"),
        F("upper", rules=[R("ARTH", min="3000")], include_required=True),
        F("capstone", rules=[R("ARTH", min="4000")], include_required=True),
        F("elective", rules=[R("ARTH", min="2000"), R("ARH", min="2000"), R("ARAD")], include_required=True),
    ]),
    # 11750
    Major("Studio Art", "Studio Art", [
        F("concentration", "ARTS 2220 2222 3220 3222 4220 4222 2370 2372 3370 3372 4370 4372 2710 2712 3710 3712 4710 4712"
                           " 2110 2112 3110 3112 4112 2670 2672 3670 3672 4670 4672 2810 2812 3810 3812 4810 4812"),
        F("elective", rules=[R("ARTS", min="2000", exclude="ARTS 4450 4452 4900")], include_required=True),
        F("upper", rules=[R("ARTS", min="3000", exclude="ARTS 4450 4452 4900")], include_required=True),
        F("arthistory", "ARTH 2451 2470 2471 2472 2751 3545 3951"),
        F("departmental", rules=[R("ARTH", min="2000"), R("ARTS", min="3000", exclude="ARTS 4450 4452 4900")],
          include_required=True),
    ]),
    # 11842
    Major("Astronomy (Arts)", "Astronomy (Arts)", [
        F("core", "ASTR 1210 1220 1270 2110 2120 3130"),
        F("elective", rules=[R("ASTR", min="3000")]),
        F("math", "MATH 1310 1320 2310"),
        F("physics", "PHYS 1420 2410 1425 2415 1655 / CS 1110 1111 1112"),
    ]),
    # 11686
    Major("Astronomy (Science)", "Astronomy (Science)", [
        F("core", "ASTR 2110 2120 3130 4998"),
        F("elective", rules=[R("ASTR", min="3000")]),
        F("math", "MATH 1310 1320 2310 3250 4220"),
        F("physics", "PHYS 1420 1425 1429 1655 2410 2415 2419 2620 2720 3210 3310 3340 3420 3430 3650"),
    ]),
    # 11794
    Major("Behavioral Neuro", "Behavioral Neuroscience", [
        F("prereq", "PSYC 2005 2200 3200 / BIOL 2100 3050 / STAT 1601 1602 / APMA 1090 / MATH 1190 1210 1310"),
        F("core", "PSYC 3006 3160 3200 3235 3260"),
        F("research", "PSYC 3210 4260 4420 4215"),
        F("topics", "PSYC 3100 3240 4100 4200"),
        F("foundation", "PSYC 1010 2150 2410 2600 2700"),
        # "at the level of the following courses or higher"
        F("science", rules=[R("ASTR", min="2110"), R("BIOL", min="2200"), R("CHEM", min="1410"), R("CS", min="1110"),
                            R("EVSC", min="1010"), R("MATH", min="2310"), R("PHYS", min="1425"),
                            R("STAT", min="1100")]),
        F("elective", "PSYC 3210 3260 3559 4155 4215 4250 4260 4290 4420 / NESC 4245"),
    ]),
    # 11688
    Major("Biology (Arts)", "Biology (Arts)", [
        F("prereq", "BIOL 2100 2200"),
        F("core", "BIOL 3000 3010 3020"),
        F("elective", "BIOL 3030 3040 3050 3090 3180 3240 3250 3270 3450 / CHEM 4410 4440"
                      " / EVSC 3060 3200 3201 4110 4122 4140 4230 4240 4250 4260 4270 4290 4991",
          rules=[R("BIOL", min="3000", exclude="BIOL 3910 3920")]),
        F("lab", rules=[R("BIOL", min="3000", name=r"\blab", exclude="BIOL 3910 3920")], include_required=True),
        F("chemistry", "CHEM 1410 1411 1420 1421 1810 1811"),
        F("physics", "PHYS 2010 2020 2030 2040"),
        F("quantitative", "STAT 2020 2120 1601 1602 3020 3220 / MATH 1190 1191 1192 1210 1310"),
    ]),
    # 11843
    Major("Biology (Science)", "Biology (Science)", [
        F("prereq", "BIOL 2100 2200"),
        F("core", "BIOL 3000 3010 3020 3030 3040 3050 / CHEM 4440 / EVSC 3200"),
        F("elective", "CHEM 4410 4440 / EVSC 3060 3200 3201 4110 4122 4140 4230 4240 4250 4260 4270 4290 4991",
          rules=[R("BIOL", min="3000", exclude="BIOL 3910 3920")]),
        F("advanced", rules=[R("BIOL", min="4000", exclude="BIOL 4810 4820 4840 4900-4940")]),
        F("lab", rules=[R("BIOL", min="3000", name=r"\blab", exclude="BIOL 3910 3920")], include_required=True),
        F("research", "BIOL 4910 4920 4930 4940"),
        F("capstone", "BIOL 4840 4810 4820"),
        F("chemistry", "CHEM 1410 1411 1420 1421 1810 1811 2410 2311 2420 2321 2411 1821"),
        F("physics", "PHYS 2010 2030 2020 2040"),
        F("quantitative", "STAT 2020 2120 1601 1602 3020 3220 / MATH 1190 1191 1192 1210 1310 1220 1320"),
    ]),
    # 11844
    Major("Chemistry (Arts)", "Chemistry (Arts)", [
        F("core", "CHEM 1410 1411 1420 1421 1810 1811 1820 1821 2410 2411 2420 2421 2810 2811 2820 3410 3420 3811 3821"),
        F("elective", rules=[R("CHEM", min="4000", exclude="CHEM 4951 4961")]),
        F("math", "MATH 1210 1220 1310 1320"),
        F("physics", "PHYS 1425 2415 1429 2419 2010 2020 2030 2040"),
    ]),
    # 11691: the base B.S.; its specializations are omitted
    Major("Chemistry (Science)", "Chemistry (Science)", [
        F("core", "CHEM 1410 1411 1420 1421 1810 1811 1820 1821 2410 2411 2420 2421 2810 2811 2820 3410 3420 3811 3821"
                  " 4320 4410 4420 4440 4090"),
        F("lab", "CHEM 3721 3121 4431 3951"),
        F("research", "CHEM 3951 3961 4951 4961"),
        F("math", "MATH 1210 1220 1310 1320 2310 3250 / APMA 2130"),
        F("physics", "PHYS 1425 2415 1429 2419 2010 2020 2030 2040 2630 2640"),
    ]),
    # 11847: the Greek, Latin, and Greek & Latin concentrations together
    Major("Classics", "Classics", [
        F("greek", rules=[R("GREE")]),
        F("latin", rules=[R("LATI")]),
        F("civilization", "CLAS 2010 2020 / HIEU 2031 2041"),
        F("related", rules=[R("CLAS")]),
    ]),
    # 11704
    Major("Drama", "Drama", [
        F("discovery", "DRAM 2010 2050 2060"),
        F("learningareas", subfields={
            "interpretation": "DRAM 2620 3050 3080 3710 3820",
            "critical": "DANC 3400 / DRAM 3070 3090 4020",
            "creating": "DANC 2300 3640 / DRAM 2020 3420 3440",
            "crafting": "DRAM 2110 2210 2310 3030 3210 3652 3825",
        }),
        F("focused", rules=[R("DRAM DANC", min="2000")], include_required=True),
    ]),
    # 11854: concentrations omitted
    Major("Economics", "Economics", [
        F("prereq", subfields={
            "calculus": "MATH 1190 1210 1310 / APMA 1090",
            "intermicro": "ECON 3010 3110",
            "statistics": "STAT 2120 3120 / APMA 3110 3120",
        }),
        F("core", "ECON 2010 2020 3010 3110 3720 4720 3020"),
        F("elective", rules=[R("ECON", min="2000")]),
        F("advanced", rules=[R("ECON", min="4000")]),
    ]),
    # 11709: concentrations omitted
    Major("English", "English", [
        F("prereq", rules=[R("ENGL", min="2000", max="2999")]),
        F("core", "ENGL 3001 3002"),
        F("premodern", rules=[R("ENMD ENRN", min="3000")]),
        F("period1700", rules=[R("ENEC ENNC", min="3000")]),
        F("seminar", rules=[R(ENGLISH_LIT, min="4000")]),
        F("elective", rules=[R(f"{ENGLISH_LIT} ENCW ENWR", min="3000")], include_required=True),
    ]),
    # 11862
    Major("Env Sci (Arts)", "Environmental Sciences (Arts)", [
        F("core", "EVSC 2800 3200 3300 3600 4002"),
        F("elective", rules=[R("EVSC", min="3000")]),
        F("science", "MATH 1190 1210 1310 / CHEM 1410 1420 / BIOL 2100 2200 / PHYS 2010 1425 2020 2410"),
    ]),
    # 11859
    Major("Env Sci (Science)", "Environmental Sciences (Science)", [
        F("core", "EVSC 2800 3200 3300 3600 2801 3201 3301 3601 4002"),
        F("elective", rules=[R("EVSC", min="3000")]),
        F("science", "BIOL 2100 2200 / CHEM 1410 1411 1420 1421 / PHYS 1425 1429 2410 2419"
                     " / MATH 1310 1220 1320 2310 / STAT 2020 2120"),
    ]),
    # 11878
    Major("Foreign Affairs", "Foreign Affairs", politics_fields(track="PLCP PLIR")),
    # 11712: the pre-/post-1800 distribution isn't marked on courses
    Major("French", "French", [
        F("core", "FREN 3031"),
        F("elective", rules=[R("FREN", min="3020")]),
        F("advanced", rules=[R("FREN", min="4000")], include_required=True),
    ]),
    # 11713
    Major("German", "German", [
        F("prereq", "GERM 2020"),
        F("core", "GERM 3000 4600"),
        F("elective", rules=[R("GERM", min="3000"), R("GETR YITR", min="3000")]),
    ]),
    # 11877: the PLAP and PLPT tracks together
    Major("Government", "Government", politics_fields(track="PLAP PLPT")),
    # 11715: the pre-/post-1700 distribution isn't marked on courses; thematic concentrations omitted
    Major("History", "History", [
        F("workshop", " / ".join(f"{code} 3501" for code in HISTORY.split())),
        F("seminar", " / ".join(f"{code} 4501 4502 4511 4512" for code in HISTORY.split())),
        F("elective", rules=[R(HISTORY)]),
    ]),
    # 11680
    Major("American Studies", "American Studies", [
        F("intro", "AMST 2001"),
        F("elective", rules=[R("AMST")]),
        F("upper", rules=[R("AMST", min="3000")], include_required=True),
        F("seminar", rules=[R("AMST", min="4000")], include_required=True),
    ]),
    # 11682
    Major("Archaeology", "Archaeology", [
        F("core", "ARTH 2055 / ANTH 2800 3810"),
        F("supporting", "ANTH 2415 2589 2810 2820 2830 3220 3360 3480 3589 3840 3875 3880 4840 / ARAD 3100 / ARH 3604"
                        " / ARTH 1861 2052 2053 2054 2056 2151 2861 3051 3062 4591 / HIEU 2031 2041"),
        F("topics", "ANTH 1010 3240 / EVSC 1010 1080 2800 3020 3200"),
        # "related areas as classics, religious studies, chemistry, and environmental sciences"
        F("related", rules=[R(f"CLAS {RELIGION} CHEM EVSC")]),
    ]),
    # 11889
    Major("Chinese", "Chinese Language & Literature", [
        F("core", "EAST 1010 / CHTR 3010 3020 / CHIN 4830 4840"),
        F("language", rules=[R("CHIN CHTR", min="3000")]),
        F("capstone", "CHTR 4991"),
    ]),
    # 11694: 5000-level courses on the approved lists are omitted
    Major("Cognitive Science", "Cognitive Science", [
        F("math", "MATH 1220 1310 / APMA 1090"),
        # "at least one Cognitive Science approved course in each of the five core areas"
        F("coreareas", subfields={
            "psychology": "BME 3636 / EDHS 4300 / EDLF 3701 / PSYC 2005 2150 2300 2500 3006 3100 3160 3240 3310 3490"
                          " 3500 4100 4110 4155 4215 4250 4260 4280 4290 4310 4410 4420 4435 4500 4606 4640 4660 4755",
            # "Most CS courses are acceptable for the COGS major EXCEPT CS 1010, CS 1020, and CS 1501"
            "computing": F("", "BME 3636 / DS 1002 / PHYS 1655 / PSYC 4215", rules=[R("CS", exclude="CS 1010 1020 1501")]),
            "linguistics": "ANTH 2400 2410 2415 2541 3450 3480 3490 3541 4420 / ASL 3450 / CLAS 3300"
                           " / EDHS 4030 4300 4310 / FREN 3030 / LING 2430 3400 4650 / LNGS 2240 3250 / PSYC 4110"
                           " / SPAN 3000 3200 4200 4202 4203 4210 4530",
            "neuroscience": "BIOL 3050 3250 4011 4013 4030 4045 4080 4190 4270 4280 4310 4320 4330 / BME 3636"
                            " / NESC 3450 4030 4046 4047 4245 4265 / PSYC 2200 3100 3160 3200 3210 3235 3240 3260 3500"
                            " 4100 4155 4200 4215 4250 4260 4280 4350 4420 4500 4640 4755",
            "philosophy": "ANTH 2589 / PHIL 1510 2350 2420 2500 2640 2652 2820 3010 3320 3330 3400 3520 3620",
        }),
        F("elective", "ANTH 2120 / KINE 3660"),
    ]),
    # 11705: humanities/social science courses "with East Asian content" stand in as the department's own courses
    Major("East Asian Studies", "East Asian Studies", [
        F("intro", "EAST 1010"),
        F("language", rules=[R("CHIN JAPN KOR TBTN", min="3000")]),
        F("history", rules=[R("HIEA")]),
        F("capstone", "EAST 4991"),
        F("elective", rules=[R("EAST EALC CHTR JPTR KRTR")]),
    ]),
    # 11711
    Major("Environmental Thought & Practice", "Environmental Thought & Practice", [
        F("core", "ETP 2030 4010 / PLAP 2030 / RELG 2210 / ANTH 2160 / ECON 2010 / GSVS 2150"
                  " / EVSC 1010 1450 2220 2200 1080"),
        F("elective", subfields={
            "values": "ANTH 2589 2590 3100 3240 3340 3880 / ARTH 3863 / ENCW 4550 / ENGL 2508 2559 3438 3560 4560"
                      " / ENSP 3559 / ENWR 3665 / GSVS 4559 / HIAF 3112 / HILA 4511 / HIST 2210 3112 4501 / ITTR 4010"
                      " / MDST 3584 4210 / MESA 3110 / MUSI 3400 / PHIL 2500 / PHYS 1090 / SPAN 4500",
            "policy": "ECON 3430 4430 / EVSC 3020 4070 / PLAD 2500 / PLAP 3160 / PLCP 4500 / PLIR 3500 / SOC 2630 3559",
            "science": F("", "BIOL 3020 3180 3450 4130 4510 4559 / CHEM 3559 / EVSC 2800 / PSYC 4500",
                         rules=[R("EVSC", min="3000")]),
        }),
    ]),
    # 11714
    Major("German Studies", "German Studies", [
        F("prereq", "GERM 2020"),
        F("core", "GERM 3000"),
        F("language", rules=[R("GERM", min="3000")]),
        F("advanced", "GERM 4600", rules=[R("GERM", min="4000")], include_required=True),
        F("studies", "GETR 3330 3372 3505 / HIEU 3390 3462 3692 / HIST 2014 / PHIL 3180 / RELJ 3170",
          rules=[R("GETR")]),
    ]),
    # 11717
    Major("Human Biology", "Human Biology", [
        F("prereq", subfields={
            "biology": "BIOL 2100 2200",
            "chemistry": "CHEM 1410 1411 1420 1421 1810 1811 1820 1821",
            "calcstats": "MATH 1210 1310 / STAT 1100 2020 2120 / SOC 3130",
        }),
        F("core", "RELG 2650 / PHS 3050 / BIOL 3000 3010"),
        F("science", rules=[R("BIOL", min="3000", exclude="BIOL 4900 4910 4920")]),
        F("publichealth", "PHS 3130 4050"),
        F("capstone", "HBIO 4810 4820 4998 4999"),
        F("humanities", "RELG 3860 / ECON 4160", rules=[R("PHS", min="3000")]),
    ]),
    # 11770: one field per concentration (students are admitted to a single concentration)
    Major("Global Studies", "Global Studies", [
        F("prereq", "GSGS 2000"),
        F("commerce", "GCCS 3010 3100 4991 / ECON 2010 2020 3010 / GSGS 3100 3112 3330 4200"
                      " / ANTH 2120 2160 2250 2280 2285 2400 2590 2620 3010 3220 3275 3290 3295 3325 3332 3344 3590"
                      " 3679 4591 / SOC 2056 2320 2442 2680 2900 3056 3120 3400 3410 3480 3710 4055 4140 4180 4510"
                      " 4540 4730 / ARAD 4070 / COMM 2010 2020 / CS 1010 1110 1112 / ENWR 2520 / MATH 1140"
                      " / MDST 3108 / PSYC 2005 / STAT 1100 1120 1601 1602 2120 3220"),
        # "All courses must be at or above the 3000 level. Generally, courses under the following mnemonics will count"
        F("development", "GDS 3010 3100 4991 / GSGS 4200 / ECON 2010 2020 / MATH 1210 / STAT 1601 1602 2120"
                         " / PSYC 1010 2005 2600 / ARAD 3550 / ARCH 3500 / ARH 3608 / ARTH 3863 / CE 3050 4040"
                         " / COMM 4821 4822 / CS 3501 3710 / ENWR 3500 3740 / GSMS 3010 / ITTR 4010 / LAR 3500"
                         " / LPPP 3250 3500 4210 / LPPS 3050 3295 4730 4735 / MUSI 3570"
                         " / PLAN 3011 3050 3060 3500 3810 3811 3813 3840 3860 / PLAP 3160 / PLCP 3012 4500 4652 4810"
                         " / PLIR 3310 / SYS 3054",
          rules=[R(f"AAS AMST ARTS ANTH ECON ENGL EVSC GDS GSGS GSVS GSSJ GCCS PHS {HISTORY} MDST MESA {RELIGION}"
                   " SOC STS WGS STAT LAST", min="3000")]),
        F("sustainability", "GSVS 2150 2210 3310 4991 / RELG 2210 / GSGS 3111 3330 / ECON 2010 3430 / EVSC 3020"
                            " / PLAN 2111 / STAT 2020 2120"
                            " / ANTH 2160 2285 2590 3100 3280 3290 3340 3590 / ARCH 2114 3500 / ARH 3608"
                            " / ARTH 3591 3863 / BIOL 3020 3180 3450 4130 / CE 2001 2100 3050 3100 3120 3220 4040 4210"
                            " / ENGL 2508 3540 3560 3570 / EVSC 2220 3200 4050 4066 4100 4122 4140 4250 4380 4490"
                            " 4640 4650 4991 / GDS 3113 3114 / GSGS 2400 2610 3117 3118 3250 3350 3530 3550 4100 4150"
                            " 4200 4410 4510 4520 / GSSJ 3579 / GSVS 2050 3020 3110 3150 3160 3210 4020 4100 4810"
                            " / HIST 2152 / ITTR 4010 / MDST 4210 / MESA 3110 / MUSI 3400 3570 / PHS 3620 3825 4050"
                            " / PLAN 3011 3040 3050 3060 3122 3500 3810 3811 3813 3815 3840 3860 / RELH 3105"
                            " / SOC 2442 3460 3470 3490 3820 4140 4540 / AAS 3310 3810 3853 / AMST 3280 3326"
                            " / LAR 3500 / PHIL 2500 2652 / PLAD 2500 / PLAP 3160 / PLCP 3012 3130 4500 4652"
                            " / PLIR 3310 / PLPT 3500 / RELC 3155 / RELG 3416 / COMM 4821 4822 / LPPP 3500 4210"
                            " / LPPS 3295 / SYS 4501 / ECON 4430 4620"),
        F("mesa", "GSMS 3010 4991", rules=[R("GSGS GDS GSVS GSSJ PHS"), R("ARAB HEBR PERS HIND URDU", min="3010"),
                                           R("MESA MEST SAST ARTR HETR PETR SATR")]),
        F("publichealth", "GSGS 4200 / ECON 2010 2020 / PSYC 2005 / STAT 2020"
                          " / PHS 3825 4050 3095 3102 3104 3130 3620 4991", rules=[R("PHS")]),
        F("security", "GSSJ 3010 4991 / ANTH 1050 2250 2625 / ENGL 3610 / GSGS 2400 3030 3100 3112 3117 4100 4150 4200"
                      " / PHIL 1730 2060 3010 3640 / SLTR 3300 / SOC 2230 3056 3410 3480 3820 3860 4055 4520 4720 4750"
                      " 4870 / HIST 2002 2011 2213 3281 3452 / HIUS 2052 3172 3456 / HIAF 2002 / HILA 2002 3051"
                      " / HIME 2002 3571 / STAT 1601 1602 3250 / PLIR 1010 2030 3010 3060 3310 3400 3760 4150 4320"
                      " 4430 4440 4450 / AMST 3630 3790 / EDHS 3055 / EDLF 3492 3610 / GETR 3390 3462 3470"
                      " / HIEA 2031 2101 3162 3172 / HIEU 2162 3312 3692 3752 / HISA 2003 3003"
                      " / LPPS 3040 3240 3295 3340 / MDST 3402 / MESA 3381 / MEST 3490 / PETR 3125"
                      " / PLCP 3410 3630 4140 / PPL 2010 / PSYC 2600 / RELG 2300 2495 3950 / RELJ 2024 / RUTR 3340"
                      " / WGS 3125 3897"),
    ]),
    # 11891
    Major("Japanese", "Japanese Language & Literature", [
        F("core", "EAST 1010 / JPTR 3010 3020 / JAPN 4710"),
        F("language", rules=[R("JAPN JPTR", min="3000")]),
        F("capstone", "JPTR 4991"),
    ]),
    # 11722: advisor-approved electives stand in as the program's own courses
    Major("Jewish Studies", "Jewish Studies", [
        F("distributionreq", subfields={
            "history": "ANTH 3470 / HIEU 2101 2102 3390 3462 3505 3692 / GETR 3390 3462 3505"
                       " / HIME 2001 2002 2010 4501 / HIST 2014 3501 / MEST 3490 4991 / PLCP 3410 / RELJ 2040",
            "belief": "RELC 1220 2050 / RELG 1010 / RELJ 1210 2030 2040 3052 3170 3310 3350",
            "culture": "ENGL 3560 4900 / GETR 3372 3470 3505 / HEBR 3010 3020 / HIEU 3505 / HIME 1501 3501"
                       " / MEST 3240 / HIST 3501 / RELJ 3885",
        }),
        F("elective", rules=[R("JWST RELJ HEBR HETR")]),
        F("capstone", rules=[R("JWST RELJ HEBR HETR", min="4000")], include_required=True),
    ]),
    # 11727
    Major("Linguistics", "Linguistics", [
        F("core", "LNGS 3250"),
        F("historical", "LNGS 3260 / ANTH 3480"),
        F("structure", "SPAN 3200 / LING 3400"),
        F("theoretical", "ANTH 3490 4420"),
        F("elective", rules=[R("LING LNGS")]),
    ]),
    # 11732: 5000-level courses on the approved list are omitted
    Major("Medieval Studies", "Medieval Studies", [
        F("core", "MSP 3501"),
        F("elective", "ANTH 3880 / ARTH 1051 1503 1507 2151 2153 2861 2961 3151 3591 3863 4591 / LATI 3090"
                      " / ENGL 1500 3010 3161 3162 3275 3510 3515 4510 / JPTR 3100 3210 3400 / FREN 4110 4123 4585"
                      " / FRTR 3814 / GETR 3464 / HIEU 2061 2071 2101 3101 3111 3121 3141 4511 / HIME 2001 3192 3501"
                      " / HIST 4501 / MESA 3270 / MEST 3492 / PETR 3131 / PHIL 2110 / PLPT 3010"
                      " / RELC 2050 3006 3181 3675 / RELG 2495 2820 / RELI 2024 2070 2080 3355 / RELJ 3355"
                      " / ITTR 2260 / SPAN 3400 4200", rules=[R("MSP")]),
    ]),
    # 11897
    Major("Middle Eastern Lang & Lit", "Middle Eastern Languages and Literatures", [
        F("prereq", " / ".join(f"{code} 1060 2010 2020 2060" for code in MESALC_LANGUAGES.split()) + " / HEBR 2410 2420"),
        F("language", "ARAB 2250", rules=[R(MESALC_LANGUAGES, min="2021")]),
        F("advanced", "ARAB 3672", rules=[R(MESALC_LANGUAGES, min="3000")], include_required=True),
        F("related", rules=[R("MESA MEST ARTR PETR HETR SATR")]),
    ]),
    # 11900
    Major("Middle Eastern Studies", "Middle Eastern Studies", [
        F("prereq", " / ".join(f"{code} 1060 2010 2020 2060" for code in MESALC_LANGUAGES.split()) + " / HEBR 2410 2420"),
        F("language", rules=[R(MESALC_LANGUAGES, min="3000")]),
        F("capstone", "MEST 4991"),
        F("literature", rules=[R("ARTR PETR HETR")]),
        F("history", rules=[R("HIME")]),
        F("regional", rules=[R("MEST MESA")]),
    ]),
    # 11737: 5000-level electives omitted
    Major("Neuroscience", "Neuroscience", [
        F("sciencefoundation", subfields={
            "biology": "BIOL 2100",
            "chemistry": "CHEM 1410 1411 1420 1421 1810 1811 2820",
            "calculus": "MATH 1210 1310",
            "statistics": "STAT 1601 1602 2020 2120 / PSYC 2005",
            "physics": "PHYS 1420 1425 1429 2010 2020 2030 2040 2410 2415 2419",
        }),
        F("core", "BIOL 3000 3010 3050 / PSYC 3160 3200"),
        F("lab", "NESC 4030 4047 3960"),
        F("elective", subfields={
            "cellular": "BIOL 3260 4011 4045 4190 4280 4310 4330 4660 / NESC 4046 4245 4265 / PSYC 3235 4260",
            "behavioral": "PSYC 3100 3240 3420 3440 4100 4155 4200 4215 4250 4280 4290 4310 4420 4755",
            "related": "BIOL 3030 3040 3090 3240 4014 4017 4040 4070 4250 4260 4320 4770"
                       " / CHEM 4410 4411 4420 4421 4440",
        }),
    ]),
    # 11741: the three self-defined area studies can come from any department, so they aren't linked
    Major("Political & Social Thought", "Political & Social Thought", [
        F("seminar", "PST 4850 4870 4980 4989"),
        F("foundation", "ANTH 3010 / HIEU 3802 3812 / PHIL 3640 3645 3710 3720 / PLIR 3310"
                        " / PLPT 3010 3020 3030 4060 4200 / RELG 3650 / SOC 3020 / WGS 3100"),
        F("thesis", "PST 4998 4999"),
    ]),
    # 11742
    Major("Political Philosophy, Policy, & Law", "Political Philosophy, Policy, & Law", [
        F("corequisite", "ECON 2010 / PLPT 3010 3020 3030 / HIUS 3752 3753 / PLAP 3810 / COMM 3410"),
        F("core", "PPL 2010 4010"),
        F("interdisciplinary", subfields={
            "theoretical": "ECON 4010 4080 / HIEU 3812 / PHIL 2060 / PLPT 1010 3050 4070 / SOC 4055",
            "policy": "COMM 3410 3420 / ECON 4080 4160 4200 4210 4310 / HIEU 3091 3471 / HIUS 3031 3752 3753"
                      " / PLAN 3060 / PLAP 3190 3810 3820 / RELJ 3310 / WGS 4810",
        }),
    ]),
    # 11902
    Major("South Asian Lang & Lit", "South Asian Languages and Literatures", [
        F("prereq", " / ".join(f"{code} 1060 2010 2020 2060" for code in MESALC_LANGUAGES.split()) + " / HEBR 2410 2420"),
        F("language", "ARAB 2250", rules=[R(MESALC_LANGUAGES, min="2021"), R("TBTN")]),
        F("advanced", "ARAB 3672", rules=[R(MESALC_LANGUAGES, min="3000")], include_required=True),
        F("related", rules=[R("MESA SAST SATR HISA")]),
    ]),
    # 11901
    Major("South Asian Studies", "South Asian Studies", [
        F("prereq", " / ".join(f"{code} 1060 2010 2020 2060" for code in MESALC_LANGUAGES.split()) + " / HEBR 2410 2420"),
        F("language", rules=[R(MESALC_LANGUAGES, min="3000")]),
        F("capstone", "SAST 4991"),
        F("literature", rules=[R("SATR")]),
        F("history", rules=[R("HISA")]),
        F("regional", rules=[R("SAST MESA")]),
    ]),
    # 11749: the non-western requirement isn't marked on courses
    Major("Women, Gender, and Sexuality", "Women, Gender, and Sexuality", [
        F("core", "WGS 2100 3150 3500"),
        F("theory", "WGS 3100 4800 4820"),
        F("seminar", rules=[R("WGS", min="4000")], include_required=True),
        F("elective", rules=[R("WGS", min="2000")]),
    ]),
    # 11836
    Major("Italian", "Italian", [
        F("prereq", "ITAL 2020"),
        F("language", "ITAL 3010 3020 3040 3050"),
        F("literature", rules=[R("ITAL", min="3000"), R("ITTR", min="2000")]),
        F("context", "ARTH 2054 2252 2281 2525 3254 3255 3525 / CLAS 2020 / DRAM 3050 / HIEU 2041 3041 3215 4501"
                     " / MUSI 3010 3020 / PLCP 3110 / PLIR 2500 3610"),
    ]),
    # 11731: concentrations omitted; 5000-level courses on the approved lists are omitted
    Major("Media Studies", "Media Studies", [
        F("core", "MDST 2000 3050 3510 4510"),
        F("practice", "AMST 2500 / ARCH 2710 / ARTS 2110 2112 2220 2222 2312 2370 2372 2670 2672 / COMM 4370 4371 4372"
                      " / DRAM 2620 3652 3710 3820 3825 4110 4730 4750 / ENWR 2700 3640"
                      " / MDST 2305 2508 2690 2700 2710 2870 3230 3508 3665 / MUSI 2350 3374 3390 4543 4545"),
        F("diversity", "AMST 3630 3740 3790 4500 / ASL 3400 / EDHS 3100 / ENGL 3922 3924 4560 / ITTR 3685"
                       " / MDST 3105 3111 3338 3407 3409 3490 3505 3510 3584 3600 3662 3665 3742 3760 3903 3944 4510"
                       " 4670 / MESA 3380 / POTR 4260 / SAST 3300 / WGS 3210"),
        F("elective", rules=[R("MDST", min="2000")], include_required=True),
    ]),
    # 11735: the Performance Concentration is omitted
    Major("Music", "Music", [
        F("intro", "MUSI 2090 3050 3380 3390"),
        F("core", subfields={
            "theory": "MUSI 3120 3310 3320 3321 3330",
            "critical": "MUSI 3010 3020 3030 3040 3120 3510 4065 4508 4523 4525 4526",
            "cct": "MUSI 3371 3374 3376 3380 3390 3400",
        }),
        F("performancereq", subfields={
            "musicianship": "MUSI 3332 3334 4533",
            "performance": F("", "MUSI 2302 2307 2308 2309 2340 2500 2600 4750", rules=[R("MUBD MUEN MUPF")]),
        }),
        F("elective", rules=[R("MUSI")]),
        F("seminar", rules=[R("MUSI", min="4000")], include_required=True),
    ]),
    # 11739
    Major("Philosophy", "Philosophy", [
        F("logic", "PHIL 1410 2420 3400 4410"),
        F("theoretical", "PHIL 3310 3320 3330 3350 3630"),
        F("moral", "PHIL 3710 3720 3730 3740"),
        F("social", "PHIL 3640 3645 3660 3800 3810 3830 3850"),
        F("premodern", "PHIL 3110 3120 3140"),
        F("modern", "PHIL 3150 3160 3170 3180 3185"),
        F("elective", rules=[R("PHIL", min="2000")]),
    ]),
    # 11871
    Major("Physics (Arts)", "Physics (Arts)", [
        F("core", "MATH 2310 3250 / APMA 2120 2130 / PHYS 1420 1425 1429 2410 2415 2419 2620 2720"),
        F("elective", rules=[R("PHYS", min="3000")]),
    ]),
    # 11740: the Fundamental and Applied Physics concentrations together; Astronomy-Physics is its own major
    Major("Physics (Science)", "Physics (Science)", [
        F("core", "MATH 2310 3250 4220 / APMA 2120 2130 3140"
                  " / PHYS 1420 1425 1429 1655 2410 2415 2419 2620 2720 3140 3340 3630"),
        F("advanced", "PHYS 3170 3180 3210 3310 3420 3430 3650 3660 3995"),
        F("elective", rules=[R("PHYS", min="3000")]),
        # Applied Physics topical electives, "from the departments of Astronomy, Biology, Chemistry, ..."
        F("topical", rules=[R("ASTR BIOL CHEM EVSC MATH PHYS STAT BME CHE CE CS ECE MSE MAE", min="2000")]),
    ]),
    # 11744: 5000-level research methods courses omitted
    Major("Psychology", "Psychology", [
        F("prereq", "PSYC 2005 3310 / STAT 1601"),
        # "At least one course from each of these four pillars"
        F("fundamentals", subfields={
            "cognitive": "PSYC 2150 3160",
            "neuroscience": "PSYC 2200 3200 / BIOL 3050",
            "developmental": "PSYC 2700",
            "clinical": "PSYC 2410 2600",
        }),
        F("methods", "PSYC 2005 3006"),
        F("rmtopics", "PSYC 3210 3310 3415 3439 3990 3991 4215 4260 4410 4420 4500 4559 4606",
          rules=[R("PSYC", min="3000", name=r"^RM\b|research methods")]),
        F("elective", rules=[R("PSYC", min="2000", exclude="PSYC 3990 3991",
                               exclude_name=r"directed readings|internship|distinguished major")]),
        F("advanced", rules=[R("PSYC", min="4000", exclude_name=r"directed readings|internship|distinguished major")],
          include_required=True),
    ]),
    # 11837: one field for all nine concentration lists
    Major("Religious Studies", "Religious Studies", [
        F("core", "RELG 1000 1010 1040 3730 4500"),
        F("concentration", "RELB 2054 2067 2100 2135 2165 2200 2252 2450 2715 2900 3150 3495 3655"
                           " / RELC 1210 1220 2000 2050 2215 2245 2360 2401 2770 2850 3006 3030 3040 3043 3077 3115"
                           " 3155 3181 3215 3222 3240 3245 3280 3292 3447 3465 3620 3625 3675 3685"
                           " / RELG 2150 2160 2210 2255 2266 2285 2300 2380 2495 2630 2650 2660 2713 2820 3001 3200"
                           " 3255 3405 3416 3630 3713 3950 3960 4810 4910 / RELH 2090 3105 3140 3426 3440 3725 3745"
                           " / RELI 2024 2070 2080 2085 3110 3120 3200 3355 3670 3900"
                           " / RELJ 1210 2024 2030 2031 2040 3052 3095 3170 3292 3350 3355 3390 3708 3885"
                           " / RELA 2400 2748 2750 2800 2850 3073 3351 3730 3890 3900 4085 / SATR 3350 / HIME 2001"
                           " / MESA 3120 3345 / PHIL 2660 / ENGL 4590 / SOC 4520"),
        F("upper", rules=[R(RELIGION, min="3000", exclude="RELG 4500")], include_required=True),
        F("elective", rules=[R(RELIGION)]),
    ]),
    # 11746: the Russian Language & Literature and Russian & East European Studies concentrations together
    Major("Slavic", "Slavic Languages and Literatures", [
        F("prereq", "RUSS 2020"),
        F("core", "RUSS 3010 3020"),
        F("literature", "RUTR 3350 3360"),
        F("studies", "RUTR 2460 / PLCP 3210 / HIEU 2162"),
        F("folklore", rules=[R("SLFK")]),
        F("elective", rules=[R("RUSS RUTR SLAV SLTR POL BULG CZ SRBC UKR")]),
    ]),
    # 11747: concentrations omitted
    Major("Sociology", "Sociology", [
        F("intro", "SOC 1010 1220 2010"),
        F("core", "SOC 3020 3120 3130"),
        F("elective", rules=[R("SOC", min="2000", exclude="SOC 4980 4981")]),
        F("advanced", rules=[R("SOC", min="4000", exclude="SOC 4980 4981")], include_required=True),
    ]),
    # 11748: the three concentrations together
    Major("Spanish", "Spanish", [
        F("prereq", "SPAN 2020"),
        F("core", "SPAN 3010 3300"),
        F("survey", subfields={
            "spain": "SPAN 3400 3410",
            "latinamerica": "SPAN 3420 3430",
        }),
        F("language", "SPAN 3000 3020 3030 3031 3032 3040 3050 3200 4040 4050 4200 4202 4203 4210 4530"),
        F("linguistics", "SPAN 3000 3200 4200 4202 4203 4210 4530"),
        F("advanced", rules=[R("SPAN", min="4000")], include_required=True),
        # "thirty credits completed above SPAN 2020"
        F("elective", rules=[R("SPAN", min="2021")]),
    ]),
    # 11827: the general option and three concentrations together
    Major("Math", "Mathematics", [
        F("prereq", "MATH 2310 2315 / APMA 2120"),
        # standard and advanced core, with their APMA substitutes
        F("core", subfields={
            "diffeq": "MATH 3250 4250 3315 / APMA 2130",
            "linalg": "MATH 3351 3315 4651 / APMA 3080",
            "realanalysis": "MATH 3310 4310",
            "abstractalgebra": "MATH 3354 4652",
        }),
        F("concentration", "MATH 3340 3100 4110 4140 / STAT 3120 / APMA 3100 3120 3140 3340"),
        # "numbered 3000+, with the following exceptions: 3350, independent study, seminars, review courses"
        F("elective", rules=[R("MATH", min="3000", exclude="MATH 3350",
                               exclude_name=r"seminar|proofs in|problems in|independent|thesis")]),
        F("general", "CS 3100 3120 / ECON 4010 4720 / PHIL 4410 / STAT 3120 4120 4130 4170 / SYS 3021 3060"),
        F("finance", "ECON 2010 2020 3030 3110"),
        F("computing", "CS 1110 1111 1112 1113 2100 3140 / DS 1002 / PHYS 1655"),
    ]),
    # 11785: 5000-level electives omitted
    Major("Statistics", "Statistics", [
        F("prereq", subfields={
            "calc2": "MATH 1320 / APMA 2120",
            "introstats": "STAT 1100 1120 2020 2120 / APMA 3110 3120",
            "programming": "STAT 1601 1602 / CS 1110 1111 1112 1113",
            "required": "MATH 3100 / STAT 3220",
        }),
        F("core", "STAT 3080 3120 3130 3220 4120 4160 / MATH 3310 3100 3350 3351"),
        F("capstone", "STAT 4996"),
        F("restricted", subfields={
            "analysis": "STAT 3480 4130 4160 4170 4220 4630 4800",
            "computational": "STAT 3250 3280 / ASTR 4140 / COMM 3220 / CS 4444 4740 4750",
        }),
    ]),
    # 11703: the 3-year format, plus the 2-year format's third-year core for its final classes
    Major("Commerce", "Commerce", [
        F("prereq", "COMM 1800 / ECON 2010 2020"),
        # the Commerce Core Curriculum; COMM 1800, its Foundations of Commerce requirement, is a prerequisite
        F("core", subfields={
            "secondyear": "COMM 2001 2002 2003 2004 2005 2006",
            "thirdyear": "COMM 3001 3002 3003 3004 3005 3006 3007 3010 3020 3030 3040 3050",
            "law": "COMM 3410",
        }),
        # concentrations and Commerce electives are drawn from 3000- and 4000-level COMM courses
        F("elective", rules=[R("COMM", min="3000")]),
    ]),
    # 11765: upper-division humanities/social sciences are "typically taken from B.I.S. Program online course offerings"
    Major("Health Sci Mgmt", "Health Sciences Management", [
        F("core", "PSHM 3050 3080 3805 4020 4050 4300 4650 4700 4750"),
        F("capstone", "PSHM 4900 4950"),
        F("elective", "ACCT 3010 / ISBU 3410 3422 3710 3773 3810 3887 3888 4670 4680 / ISIN 4520"
                      " / ISSS 3015 3045 3270 3411 3416 3422 3773 3870 3887 3888 4131 4431 4432 4450 4670"
                      " / IT 3220 3600 / PSHM 3050 3330 4052 4200 4400 4600 4800 4801 / PSYC 2559"),
        F("humanities", rules=[R("ISHU ISSS", min="3000")]),
    ]),
    # 11687: all thirteen concentrations' required/elective lists together; the advising-maintained lists
    # (Art & Society, History & Politics, Writing, Liberal Arts) stand in as upper-division B.I.S. courses
    Major("Interdisciplinary Studies", "Interdisciplinary Studies", [
        F("seminar", rules=[R("ISLS")]),
        F("inquiry", rules=[R("ISIN")]),
        F("concentration", "EDIS 3013 3040 3045 3060 4340 4350 / ISBU 3410 3451 3610 3710 3840"
                           " / ISSS 3045 3149 3410 3411 3416 3422 3760 4131 4430 4431 4432 4670"
                           " / IT 3000 3100 3110 3120 3130 3140 3210 3220 3230 3240 3350 3400 3405 3410 3600 4400"
                           " / PSHM 3010 3050 3080 3330 3805 4020 4050 4052 4200 4300 4400 4600 4650 4700 4750"
                           " / SEC 3010 3020 3030 3040 4010 4020 4030"),
        F("elective", rules=[R("ISHU ISSS ISBU", min="3000")]),
        F("capstone", rules=[R("ISCP", research=True)]),
    ]),
    # 11828: 5000-level concentration courses omitted
    Major("Data Science", "Data Science", [
        F("prereq", subfields={
            "dsfoundation": "DS 1001",
            "programming": "DS 1002 / CS 1110 1111 1112 1113 / PHYS 1655",
        }),
        F("core", "DS 2022 2023 2024 2026 2126 3021 3022 3023 3026 4021 4022 4024"),
        F("math", "MATH 1190 1210 1310 1220 1320 2310 2315 / APMA 1090 1110 2120"),
        # "at least 3 elective upper-level data science courses"; DS 4993/4995 may count
        F("elective", "DS 4121 4125 4126 4220 4221 4023 4329 4422 4423", rules=[R("DS", min="3000", research=True)]),
        # Collaborative concentrations; Mathematics and Economics allow any course at the 3000 level or higher
        F("collaborative", "EDLF 2080 3700 3701 4110 / BIOL 2100 3050 3250 4270"
                           " / PSYC 3100 3160 3200 3240 3420 3440 4100 4250 4260 4310 4420 4500 / NESC 3450"
                           " / CGBM 2110 2710 / COMM 3110 3559 / EVSC 2800 2801 3200 3201 3300 3301 3600 3601 3020 4010"
                           " 4035 4080 4170 4290 4340 4370 4390 4559 4630 4640 4660 4840 4890 / ASTR 2110 2120 4140"
                           " / KINE 2000 2200 3410 3600 3620 3660 4600 / MATH 3350 3351 / ECON 3010 3110"
                           " / PHS 3050 3102 3104 3620 / LPPP 2200 3230 4200 / LPPL 3210 4660",
          rules=[R("MATH ECON", min="3000")]),
    ]),
    # 11778
    Major("Elementary Ed", "Elementary Education", [
        F("core", "EDIS 2800 3011 3015 3020 3221 / EDLF 3150 / PSYC 2700"),
        F("major", "EDIS 4310 4320 4330 4345"),
        F("clinicalexp", "EDIS 3881 4851 4861 4871 4881"),
        F("cultural", CULTURAL_LITERACY),
    ]),
    # 11780
    Major("Early Childhood Ed", "Early Childhood Education", [
        F("core", "EDIS 2800 3011 3015 3020 3221 3040 / EDLF 3150 / PSYC 2700"),
        F("major", "EDIS 4310 4320 4330 4345"),
        F("clinicalexp", "EDIS 3881 3889 4869 4871 4881 4350"),
        F("cultural", CULTURAL_LITERACY),
    ]),
    # 11907
    Major("ESL Ed", "English as a Second Language Education", [
        F("core", "EDIS 2800 3016 3020 3030 4070 4820 / EDLF 3150 3170 3180"),
        F("major", "EDIS 4270 4428 4470"),
        F("corequisite", "LING 3400"),
        F("clinicalexp", "EDIS 3888 3882 4858 4878 4868 4888"),
        F("cultural", CULTURAL_LITERACY),
    ]),
    # 11779
    Major("Special Ed", "Special Education", [
        F("core", "EDIS 2800 3011 3015 3020 3221 / EDLF 3150 / PSYC 2700"),
        F("major", "EDIS 4060 4140 4141 4230"),
        F("clinicalexp", "EDIS 3887 3881 4040 4867 4877 4887"),
        F("cultural", CULTURAL_LITERACY),
    ]),
    # 11723: 5000/6000-level electives omitted
    Major("Kinesiology", "Kinesiology", [
        F("science", "BIOL 2100 2200 3410 3420 / MATH 1190 1191 1192 1210 1220 1310 1320 2310"),
        F("core", "KINE 2000 3410 3430 3600 3620 3660"),
        F("applied", "KINE 2410 2420 2850 3211 3601 3615 3616 3617 3630 4000 4430 4601 4801 4802"),
        F("elective", "EDLF 3420 / KINE 2200 3210 3400 3420 3450 3640 3700 4400 4600"),
    ]),
    # 11906: all seven concentrations together
    Major("Secondary Ed", "Secondary Education", [
        F("core", "EDIS 2800 3016 3020 3030 4070 4820 4830 / EDLF 3170"),
        F("practicum", "EDIS 3882"),
        F("concentration", "EDIS 4050 4051 4400 4401 4450 4451 4600 4601"),
        F("clinicalexp", "EDIS 4852 4854 4855 4856 4862 4864 4865 4866 4872 4874 4875 4876 4882 4884 4885 4886"),
        F("cultural", CULTURAL_LITERACY),
    ]),
    # 11696
    Major("Speech Disorders", "Speech Communication Disorders", [
        F("core", "EDHS 2450 4020 4030 4040 4050 4150 4230"),
        F("populations", "EDHS 2460 3110 4010 4210 / EDIS 3013 3020 4100 4110 4120 / NUIP 2250 / PSYC 3100"),
        F("communication", "EDHS 3220 4300 4310 4993 / EDIS 4040 / EDLF 3150 3160 3180 3220 / PSYC 2700 3160 3490 4110"
                           " / NUIP 2240 / LING 3400"),
    ]),
    # 11766: 5000-level electives omitted
    Major("Youth & Social Innovation", "Youth and Social Innovation", [
        F("core", "EDHS 1120 2840 4400 / EDLF 3000 3150 3170 3200 4080 4000 / PSYC 2700 3480"),
        F("elective", "EDLF 2050 3010 3150 3160 3170 3220 3240 3450 3460 3470 3490 3491 3492 3610 3620 3700 3701 4082"
                      " 4110 4605 4606 4610 / EDHS 2895 3055 3110 3120 3130 3850 / EDIS 2020 2600 3452 / ARCH 2070"),
        F("practice", "EDHS 2889 2891 2900 3895 4995 / EDLF 4995 / EDIS 4995 / EDNC 3986"),
    ]),
    # 11768
    Major("Public Policy", "Public Policy and Leadership", [
        F("prereq", "ECON 2010 / LPPP 2200 / LPPL 2600 / PSYC 2600"),
        F("civic", "LPPP 3230 3620 4200"),
        F("leadership", "LPPL 3210 4660 4680"),
        F("economic", "LPPA 3640 3650"),
        F("capstone", "LPPP 4991"),
        # special topics: "Courses at the 3000-5000 level", at least three with the Batten mnemonic
        F("topics", rules=[R(BATTEN, min="3000")]),
    ]),
    # 11676: SEAS general requirements are in the Engineering Major
    Major("Aerospace Eng", "Aerospace Engineering", [
        F("math", "APMA 2130 3140 3110"),
        F("core", "MAE 2030 2040 2300 2100 2310 2320 2330 3215 3230 3310 3610 3420 3010 3220 3730 3820 3720 4120"),
        F("design", "MAE 4790 4800"),
        F("technical", rules=MAE_TECHNICAL),
    ]),
    # 11730
    Major("Mechanical Eng", "Mechanical Engineering", [
        F("math", "APMA 2130 3140 3110"),
        F("core", "MAE 2020 2040 2300 2100 2310 2320 2330 3210 3230 3310 3710 3140 3420 3620 3840 4710"),
        F("design", "MAE 4610 4620 4630 4640 4670 4680 4790 4800"),
        F("technical", rules=MAE_TECHNICAL),
    ]),
    # 11690: the engineering elective list is kept by the department
    Major("Chemical Eng", "Chemical Engineering", [
        F("math", "APMA 2130 3110"),
        F("chemistry", "CHEM 1420 1421 2410 2411 2420 1810 1811 1820 1821 2810 2820 4090 4320 4440 4410"),
        F("core", "CHE 2215 2202 2216 3316 3321 3610 3318 3322 3398 4474 4475 4491"),
        F("design", "CHE 4476"),
        F("elective", "CHE 3347 4442 4445 4448 4449 4450 4452 4456 4561 4562"),
        # "Any 2000 to 5999 course in: APMA, MATH, CHEM, PHYS (except PHYS 2010, 2020), BIOL, ..."; special topics
        # need individual approval
        F("technical", "EVSC 2050 2800 3200 3600 3860 4280 4640 4660 4090",
          rules=[R("APMA MATH CHEM PHYS BIOL CHE ENGR CE CS ECE MSE MAE SYS", min="2000",
                   exclude="PHYS 2010 2020 / ECE 2066 / MSE 2010", exclude_name=r"special (topics|projects)|new course")]),
    ]),
    # 11692: the four tracks together
    Major("Civil Eng", "Civil Engineering", [
        F("math", "APMA 2130 3080 3110"),
        # Science I and Math/Science II: the listed courses or "any APMA course 2000 or higher"
        F("mathsci", "BIOL 2100 2200 / CE 2001 / MSE 2090 / EVSC 2800 3200 3300 3600 / CHEM 1420 / PHYS 2415 / ECE 2200",
          rules=[R("APMA", min="2000")]),
        F("core", "CE 2300 2010 2100 2110 2310 3210 3212 3300 3710 3712 3220 3222 3330 3400 2030 3050 3100 4600 4610"),
        F("design", "CE 4990 4982"),
        F("elective", rules=[R("CE", min="3000")]),
        # EWR, CEM and SE track electives, and the EWR Science II list
        F("track", "CE 3010 3030 3120 3400 4015 4025 4040 4100 4110 4160 4210 4320 4330 4500"
                   " / BIOL 3090 3120 / ENGR 2500 / EVSC 2900 3860 4066 4090 4110 4140 4250 4270 4290 4850 4870"),
        # Technical electives I/II: "all technical courses 2000-level and higher" (SEAS except STS, plus these)
        F("technical", "CHEM 1420", rules=[R(f"{ENGINEERING} BIOL CHEM MATH PHYS EVSC PLAN PLAC LAR ARCH DS COMM",
                                             min="2000", exclude="ENGR 2595")]),
    ]),
    # 11728
    Major("Materials Sci & Eng", "Materials Science and Engineering", [
        F("math", "APMA 2130 3110"),
        F("core", "MSE 2090 2101 3050 3060 3070 3101 3670 4320"),
        F("design", "MSE 4610 4620"),
        F("elective", "MSE 2200 2300 3080 3610 4030 4055 4200 4210 4220 4270 4592 4960"),
        F("mathsci", "CHEM 3410 3610", rules=[R("APMA", min="3000")]),
        # "any 2000-level or higher engineering course" except APMA, STS, ENGR
        F("engineering", rules=[R("BME CE CHE CS ECE MAE MSE SYS", min="2000", exclude="MSE 2500")]),
        # "Any 2000 or higher math, science or engineering courses"; no STS or ENGR
        F("technical", rules=[R(f"APMA BME CE CHE CS ECE MAE MSE SYS {SCIENCE} MATH", min="2000",
                                exclude="PHYS 2010 2020 2030 2040 / MSE 2500")]),
    ]),
    # 11751: the engineering elective list is on the department website
    Major("Systems Eng", "Systems Engineering", [
        F("math", "APMA 2130 3100 3080 3120"),
        F("core", "SYS 2001 2201 2202 3021 3023 3034 3055 3060 3062 4021 / CS 2100"),
        F("design", "SYS 4053 4054"),
        # "chosen from any non-required SYS courses"
        F("elective", rules=[R("SYS")]),
    ]),
    # 11738: the first-year, transfer and accelerated BSN curricula share these courses; RN to BSN has its own
    Major("Nursing", "Nursing", [
        F("prereq", "NUIP 2060 2070 2080 2240 / CHEM 1500 / NUCO 2220"),
        F("core", "NUCO 2130 2210 2330 2440 3110 3310 3610 4110 4210 4310 4056"
                  " / NUIP 2311 2420 2430 3311 3420 3430 4311"),
        F("capstone", "NUCO 4710 4720 4730"),
        F("rntobsn", "NUIP 4200 4300 4420 4610 / NUCO 4056 4420 4435 4440 4450"),
    ]),
]

# Either/or choices ("Select one of the following", "X OR Y", alternative sequences) per major and field, written as
# MAJOR_REL "or" edges. Groups are "|"-separated; parallel sequences (CHEM 1410/1411/1420 vs 1810/1811/1820) pair up
# course by course. Pick-N elective pools aren't either/or and aren't listed.
CHEM_SEQUENCE = "CHEM 1410 1810 | CHEM 1411 1811 | CHEM 1420 1820 | CHEM 1421 1821"
CHEM_ORGANIC = "CHEM 2410 2810 | CHEM 2411 2811 | CHEM 2420 2820"
PHYS_SEQUENCE = "PHYS 1425 2010 | PHYS 2415 2020 | PHYS 1429 2030 | PHYS 2419 2040"
INTRO_PROGRAMMING = "CS 1110 1111 1112 1113"
CHOICES = {
    "Arch History": {"core": "ARH 4591 / ARTH 4591"},
    "Architecture": {"core": "ARCH 4020 4995"},
    "Anthropology": {"gateway": "ANTH 1010 2120 2160 2400 2415 2450 2800 2820", "foundation": "ANTH 3010 3020"},
    "Applied Stats": {
        "calc2 (prereq)": "MATH 1220 1320 / APMA 1110",
        "introstats (prereq)": "STAT 1100 1120 2020 2120 / APMA 3110 3120",
        "programming (prereq)": f"STAT 1601 1602 / {INTRO_PROGRAMMING}",
        "core": "STAT 3110 / MATH 3100 | MATH 3351 3350 | STAT 3130 4160",
    },
    "Astronomy (Arts)": {
        "core": "ASTR 1210 2110 | ASTR 1220 1270 2120",
        "physics": "PHYS 1420 1425 | PHYS 2410 2415 | PHYS 1655 / CS 1110 1111 1112",
    },
    "Astronomy (Science)": {"physics": "PHYS 1420 1425 | PHYS 2410 2415"},
    "Behavioral Neuro": {
        "prereq": "STAT 1601 1602 | PSYC 2200 3200 / BIOL 3050 | APMA 1090 / MATH 1190 1210 1310",
        "research": "PSYC 3210 4260 4420 4215",
        "foundation": "PSYC 1010 2150 2410 2600 2700",
    },
    "Biology (Arts)": {
        "elective": "BIOL 3030 / CHEM 4440",
        "chemistry": "CHEM 1410 1810 | CHEM 1411 1811",
        "quantitative": "STAT 2020 2120 | MATH 1190 1210 1310 / STAT 1601 1602 3020 3220",
    },
    "Biology (Science)": {
        "core": "BIOL 3030 / CHEM 4440 | BIOL 3040 3050 / EVSC 3200",
        "capstone": "BIOL 4840 4810 4820",
        "chemistry": "CHEM 1410 1810 | CHEM 1411 1811",
        "quantitative": "STAT 2020 2120 | MATH 1190 1210 1310 | MATH 1220 1320 / STAT 1601 1602 3020 3220",
    },
    "Chemistry (Arts)": {"core": f"{CHEM_SEQUENCE} | {CHEM_ORGANIC}", "math": "MATH 1210 1310 | MATH 1220 1320",
                         "physics": PHYS_SEQUENCE},
    "Chemistry (Science)": {
        "core": f"{CHEM_SEQUENCE} | {CHEM_ORGANIC}",
        "lab": "CHEM 3721 3121 4431 3951",
        "math": "MATH 1210 1310 | MATH 1220 1320 | MATH 2310 3250 / APMA 2130",
        "physics": PHYS_SEQUENCE,
    },
    "Classics": {"civilization": "CLAS 2010 2020 | HIEU 2031 2041"},
    "Drama": {
        "interpretation (learningareas)": "DRAM 2620 3050 3080 3710 3820",
        "critical (learningareas)": "DANC 3400 / DRAM 3070 3090 4020",
        "creating (learningareas)": "DANC 2300 3640 / DRAM 2020 3420 3440",
        "crafting (learningareas)": "DRAM 2110 2210 2310 3030 3210 3652 3825",
    },
    "Economics": {
        "calculus (prereq)": "MATH 1190 1210 1310 / APMA 1090",
        "intermicro (prereq)": "ECON 3010 3110",
        "statistics (prereq)": "STAT 2120 3120 / APMA 3110 3120",
        "core": "ECON 3010 3110 | ECON 3720 4720",
    },
    "Env Sci (Arts)": {"science": "MATH 1190 1210 1310 | PHYS 2010 1425 | PHYS 2020 2410"},
    "Env Sci (Science)": {"science": "MATH 1220 1320"},
    "Cognitive Science": {"math": "MATH 1220 1310 / APMA 1090"},
    "Environmental Thought & Practice": {"core": "ETP 2030 / PLAP 2030 | GSVS 2150 / EVSC 1010 | EVSC 2200 1080"},
    "Human Biology": {"chemistry (prereq)": CHEM_SEQUENCE,
                      "calcstats (prereq)": "MATH 1210 1310 / STAT 1100 2020 2120 / SOC 3130"},
    "Global Studies": {"commerce": "ECON 3010 / GSGS 3330",
                       "sustainability": "GSVS 2210 / RELG 2210 | GSGS 3330 / ECON 3430"},
    "Jewish Studies": {
        "history (distributionreq)": "HIEU 3390 / GETR 3390 | HIEU 3462 / GETR 3462 | HIEU 3505 / GETR 3505",
        "culture (distributionreq)": "HIEU 3505 / GETR 3505 | HIME 1501 3501 / MEST 3240",
    },
    "Linguistics": {"historical": "LNGS 3260 / ANTH 3480", "structure": "SPAN 3200 / LING 3400",
                    "theoretical": "ANTH 3490 4420"},
    "Neuroscience": {
        "core": "BIOL 3050 / PSYC 3200",
        "lab": "NESC 4030 4047 3960",
        "chemistry (sciencefoundation)": "CHEM 1410 1810 | CHEM 1420 2820 | CHEM 1411 1811",
        "calculus (sciencefoundation)": "MATH 1210 1310",
        "statistics (sciencefoundation)": "STAT 1601 1602 2020 2120 / PSYC 2005",
        "physics (sciencefoundation)": "PHYS 1420 1425 2010 | PHYS 1429 2030 | PHYS 2020 2410 2415 | PHYS 2040 2419",
    },
    "Political Philosophy, Policy, & Law": {"corequisite": "PLPT 3010 3020 3030 | HIUS 3752 3753 / PLAP 3810 / COMM 3410"},
    "Women, Gender, and Sexuality": {"theory": "WGS 3100 4800 4820"},
    "Music": {
        "intro": "MUSI 2090 3050 3380 3390",
        "theory (core)": "MUSI 3310 3120 3320 3321 3330",
        "critical (core)": "MUSI 3010 3020 3030 3040 3120 3510 4065 4508 4523 4525 4526",
        "cct (core)": "MUSI 3371 3374 3376 3380 3390 3400",
        "musicianship (performancereq)": "MUSI 3332 3334 4533",
    },
    "Philosophy": {
        "logic": "PHIL 1410 2420 3400 4410",
        "theoretical": "PHIL 3310 3320 3330 3350 3630",
        "moral": "PHIL 3710 3720 3730 3740",
        "social": "PHIL 3640 3645 3660 3800 3810 3830 3850",
        "premodern": "PHIL 3110 3120 3140",
        "modern": "PHIL 3150 3160 3170 3180 3185",
    },
    "Physics (Arts)": {"core": "MATH 2310 / APMA 2120 | MATH 3250 / APMA 2130 | PHYS 1420 1425 | PHYS 2410 2415"},
    "Physics (Science)": {
        "core": "MATH 2310 / APMA 2120 | MATH 3250 / APMA 2130 | MATH 4220 / APMA 3140 | PHYS 1420 1425"
                " | PHYS 2410 2415 | PHYS 1655 3630",
        "advanced": "PHYS 3170 3180",
    },
    "Psychology": {
        "prereq": "STAT 1601 / PSYC 3310",
        "cognitive (fundamentals)": "PSYC 2150 3160",
        "neuroscience (fundamentals)": "PSYC 2200 3200 / BIOL 3050",
        "clinical (fundamentals)": "PSYC 2410 2600",
    },
    "Religious Studies": {"core": "RELG 1000 1010"},
    "Slavic": {"literature": "RUTR 3350 3360"},
    "Sociology": {"intro": "SOC 1010 1220 2010"},
    "Spanish": {"spain (survey)": "SPAN 3400 3410", "latinamerica (survey)": "SPAN 3420 3430"},
    "Statistics": {
        "calc2 (prereq)": "MATH 1320 / APMA 2120",
        "introstats (prereq)": "STAT 1100 1120 2020 2120 / APMA 3110 3120",
        "programming (prereq)": f"STAT 1601 1602 / {INTRO_PROGRAMMING}",
        "core": "MATH 3350 3351",
    },
    "Math": {
        "prereq": "MATH 2310 2315 / APMA 2120",
        "diffeq (core)": "MATH 3250 4250 3315 / APMA 2130",
        "linalg (core)": "MATH 3351 4651 3315 / APMA 3080",
        "realanalysis (core)": "MATH 3310 4310",
        "abstractalgebra (core)": "MATH 3354 4652",
    },
    "Health Sci Mgmt": {"elective": "ISBU 3422 / ISSS 3422 | ISBU 3773 / ISSS 3773 | ISBU 3887 / ISSS 3887"
                                    " | ISBU 3888 / ISSS 3888 | ISBU 4670 / ISSS 4670"},
    "Data Science": {
        "programming (prereq)": f"DS 1002 / {INTRO_PROGRAMMING} / PHYS 1655",
        "math": "MATH 1190 1210 1310",
        "collaborative": "BIOL 3050 / PSYC 3200 | MATH 3350 3351 | ECON 3010 3110",
    },
    "Elementary Ed": {"core": "EDLF 3150 / PSYC 2700", "cultural": CULTURAL_LITERACY},
    "Early Childhood Ed": {"core": "EDIS 3040 / EDLF 3150 / PSYC 2700", "cultural": CULTURAL_LITERACY},
    "ESL Ed": {"core": "EDLF 3150 3170 3180", "clinicalexp": "EDIS 3882 3888", "cultural": CULTURAL_LITERACY},
    "Special Ed": {"core": "EDLF 3150 / PSYC 2700", "clinicalexp": "EDIS 3881 3887", "cultural": CULTURAL_LITERACY},
    "Secondary Ed": {"cultural": CULTURAL_LITERACY},
    "Speech Disorders": {"communication": "EDLF 3150 / PSYC 2700 | EDLF 3180 / NUIP 2240"},
    "Youth & Social Innovation": {"core": "EDLF 3150 3170 / PSYC 2700 3480"},
    "Public Policy": {"prereq": "LPPL 2600 / PSYC 2600"},
    "Civil Eng": {"core": "CE 4600 4610"},
    "Systems Eng": {"core": "SYS 2201 / CS 2100"},
}

for _major in MAJORS:
    for _field in _major.fields:
        _field.choices = CHOICES.get(_major.name, {}).get(_field.key, _field.choices)
_unknown = [(name, key) for name, fields in CHOICES.items() for key in fields
            if not any(m.name == name and key in [f.key for f in m.fields] for m in MAJORS)]
assert not _unknown, f"CHOICES names fields that don't exist: {_unknown}"
