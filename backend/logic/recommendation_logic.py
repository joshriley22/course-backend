from itertools import product

from backend.services.course_service import CourseService
from backend.services.major_service import MajorService

course_service = CourseService()
major_service = MajorService()

CANDIDATE_POOL = 80      # courses pulled from the graph before scoring
MAX_CANDIDATES = 25      # best-scored courses the scheduler searches over
MAX_OPTIONS = 6          # session combinations kept per course
FIELD_DECAY = 0.6        # each further course from one (major, field) is worth this much of the last
SEARCH_BUDGET = 200_000  # search nodes expanded before settling for the best found

# Course score weights; every term is normalized to [0, 1] first
RATING_WEIGHT = 3.0
PROFESSOR_WEIGHT = 2.0
UNLOCKS_WEIGHT = 1.5
RELEVANCE_WEIGHT = 4.0
REVIEWS_WEIGHT = 0.5
NEUTRAL_RATING = 0.5     # stands in for an unrated course or professor
MAX_UNLOCKS = 5
MAX_REVIEWS = 10

# Session time-preference bonuses, averaged over an option's sessions
LATE_START_BONUS = 0.3   # starts at or after 10:00
EARLY_END_BONUS = 0.3    # ends by 17:00
LUNCH_FREE_BONUS = 0.2   # doesn't touch 12:00-14:00

DAY_CODES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
MINUTES_PER_DAY = 24 * 60


def parse_credits(raw):
    """Credits as a number; a range like '1 - 4' counts as its low end. None if zero or unparseable."""
    if raw is None:
        return None
    try:
        value = float(str(raw).split('-')[0].strip())
    except ValueError:
        return None
    return value if value > 0 else None


def parse_minutes(raw):
    """'14.30.00.000000' (or '14:30') -> minutes after midnight."""
    if not raw:
        return None
    parts = str(raw).replace(':', '.').split('.')
    try:
        return int(parts[0]) * 60 + (int(parts[1]) if len(parts) > 1 else 0)
    except ValueError:
        return None


def session_mask(session):
    """The minutes of the week a session occupies, one bit per minute. 0 if it has no usable meeting time."""
    start, end = parse_minutes(session.get('start_time')), parse_minutes(session.get('end_time'))
    days = session.get('days') or ''
    if start is None or end is None or end <= start:
        return 0
    mask = 0
    for i in range(0, len(days), 2):
        chunk = days[i:i + 2]
        if chunk in DAY_CODES:
            mask |= ((1 << (end - start)) - 1) << (DAY_CODES.index(chunk) * MINUTES_PER_DAY + start)
    return mask


def time_bonus(sessions):
    total = 0.0
    for session in sessions:
        start, end = parse_minutes(session['start_time']), parse_minutes(session['end_time'])
        if start >= 10 * 60:
            total += LATE_START_BONUS
        if end <= 17 * 60:
            total += EARLY_END_BONUS
        if not (start < 14 * 60 and end > 12 * 60):
            total += LUNCH_FREE_BONUS
    return total / len(sessions) if sessions else 0.0


def build_options(sessions):
    """Every valid pick of one lecture plus one lab (when the course has labs), best time bonus first."""
    usable = [s for s in sessions if session_mask(s)]
    lectures = [s for s in usable if not s.get('is_lab')]
    labs = [s for s in usable if s.get('is_lab')]
    combos = [list(pair) for pair in product(lectures, labs)] if lectures and labs else [[s] for s in lectures or labs]

    options, seen = [], set()
    for combo in combos:
        masks = [session_mask(s) for s in combo]
        if len(masks) == 2 and masks[0] & masks[1]:
            continue
        mask = masks[0] | (masks[1] if len(masks) == 2 else 0)
        if mask in seen:
            continue
        seen.add(mask)
        options.append({'sessions': combo, 'mask': mask, 'bonus': time_bonus(combo)})

    options.sort(key=lambda o: o['bonus'], reverse=True)
    return options[:MAX_OPTIONS]


def field_shares(major_fields, progress):
    """Each (major, field)'s share of the credits the user still needs for that major.

    major_fields: {major: {'fields': [...], 'credits': [...]}}, progress: {(major, field): credits done}
    """
    shares = {}
    for major, info in major_fields.items():
        fields, credits = info.get('fields') or [], info.get('credits') or []
        if not fields:
            continue
        if len(credits) != len(fields):
            for field in fields:
                shares[(major, field)] = 1 / len(fields)
            continue
        remaining = {f: max(0.0, float(c) - progress.get((major, f), 0.0)) for f, c in zip(fields, credits)}
        total = sum(remaining.values())
        for field, left in remaining.items():
            shares[(major, field)] = left / total if total > 0 else 0.0
    return shares


def rank_candidates(rows, shares):
    """Scores each candidate course and expands its sessions into schedulable options, best score first."""
    relevance = {}
    for row in rows:
        keys = {(f['major'], f['field']) for f in row.get('fields') or []}
        relevance[(row['code'], row['number'])] = min(1.0, sum(shares.get(k, 0.0) for k in keys))
    top_relevance = max(relevance.values(), default=0.0) or 1.0

    candidates = []
    for row in rows:
        credits = parse_credits(row.get('credits'))
        options = build_options(row.get('sessions') or [])
        if credits is None or not options:
            continue

        rating = row['rating'] / 5 if row.get('review_count') and row.get('rating') else NEUTRAL_RATING
        professor = row['avg_professor_rating'] / 5 if row.get('avg_professor_rating') else NEUTRAL_RATING
        unlocks = min(row.get('next_count') or 0, MAX_UNLOCKS) / MAX_UNLOCKS
        reviews = min(row.get('review_count') or 0, MAX_REVIEWS) / MAX_REVIEWS
        score = (RATING_WEIGHT * rating
                 + PROFESSOR_WEIGHT * professor
                 + UNLOCKS_WEIGHT * unlocks
                 + RELEVANCE_WEIGHT * relevance[(row['code'], row['number'])] / top_relevance
                 + REVIEWS_WEIGHT * reviews)

        # The field this course counts toward most, used to spread picks across fields
        fields = [(f['major'], f['field']) for f in row.get('fields') or []]
        field = max(fields, key=lambda k: shares.get(k, 0.0)) if fields else None

        candidates.append({'row': row, 'credits': credits, 'score': score, 'field': field, 'options': options})

    candidates.sort(key=lambda c: c['score'], reverse=True)
    return candidates


def solve_schedule(candidates, min_credits, max_credits, base_credits=0.0, base_mask=0):
    """Picks at most one session option per candidate, maximizing total score.

    A weighted interval scheduling DP, modified for courses that meet on several days: each course either
    is skipped or takes one option whose minute-of-week mask doesn't collide with the schedule so far.
    A course's score decays by FIELD_DECAY for every course already taken from its field, which spreads
    picks across fields. States are (course index, credits, occupied mask, per-field counts); a state
    reached again with no better score is dropped, and branches whose fractional-knapsack upper bound
    can't beat the best schedule are pruned. Schedules reaching min_credits always beat ones that don't.

    Returns (picks, credits) where picks is a list of (candidate, option).
    """
    n = len(candidates)
    best_value = [c['score'] + c['options'][0]['bonus'] for c in candidates]
    suffix_credits = [0.0] * (n + 1)
    for i in range(n - 1, -1, -1):
        suffix_credits[i] = suffix_credits[i + 1] + candidates[i]['credits']
    by_density = [sorted(range(i, n), key=lambda j: best_value[j] / candidates[j]['credits'], reverse=True)
                  for i in range(n + 1)]

    def upper_bound(i, capacity):
        total = 0.0
        for j in by_density[i]:
            if capacity <= 0:
                break
            take = min(1.0, capacity / candidates[j]['credits'])
            total += take * best_value[j]
            capacity -= take * candidates[j]['credits']
        return total

    best = {'key': (False, -1.0), 'picks': [], 'credits': base_credits}
    seen = {}
    expanded = 0

    def search(i, credits, mask, field_counts, score, picks):
        nonlocal expanded
        key = (credits >= min_credits, score)
        if key > best['key']:
            best.update(key=key, picks=list(picks), credits=credits)
        if i == n or expanded >= SEARCH_BUDGET:
            return
        expanded += 1

        state = (i, credits, mask, field_counts)
        if seen.get(state, -1.0) >= score:
            return
        seen[state] = score

        capacity = max_credits - credits
        can_reach_min = credits + min(capacity, suffix_credits[i]) >= min_credits
        if score + upper_bound(i, capacity) <= best['key'][1] and (best['key'][0] or not can_reach_min):
            return

        candidate = candidates[i]
        counts = dict(field_counts)
        field = candidate['field']
        if candidate['credits'] <= capacity:
            gain = candidate['score'] * FIELD_DECAY ** counts.get(field, 0)
            if field is not None:
                counts[field] = counts.get(field, 0) + 1
            next_counts = tuple(sorted(counts.items()))
            for option in candidate['options']:
                if option['mask'] & mask:
                    continue
                picks.append((candidate, option))
                search(i + 1, credits + candidate['credits'], mask | option['mask'], next_counts,
                       score + gain + option['bonus'], picks)
                picks.pop()

        search(i + 1, credits, mask, field_counts, score, picks)

    search(0, base_credits, base_mask, (), 0.0, [])
    return best['picks'], best['credits']


def format_credits(credits):
    return f"{credits:g}"


def get_recommendations(session, request):
    selected_keys = [c.code + str(c.number) for c in request.selected_courses]
    base_credits = sum(c.credits or 0 for c in request.selected_courses)
    base_mask = 0
    for course in request.selected_courses:
        for s in course.sessions:
            base_mask |= session_mask(s.model_dump())

    def response(courses, credits, warning=None):
        return {'courses': courses, 'total_credits': credits, 'warning': warning}

    if not request.major_list:
        return response([], base_credits, "Add a major on your Profile to get recommendations.")
    if base_credits >= request.max_credits:
        return response([], base_credits,
                        f"Your schedule already has {format_credits(base_credits)} credits, "
                        f"the most recommendations will fill to is {format_credits(request.max_credits)}.")

    rows = course_service.get_recommendation_candidates(
        session, request.course_taken_list, request.major_list, selected_keys, CANDIDATE_POOL)

    progress = {}
    for row in course_service.get_field_progress(session, request.course_taken_list, request.major_list):
        key = (row['major'], row['field'])
        progress[key] = progress.get(key, 0.0) + (parse_credits(row['credits']) or 0.0)
    major_fields = {major: major_service.get_fields(session, major) for major in request.major_list}

    candidates = rank_candidates(rows, field_shares(major_fields, progress))[:MAX_CANDIDATES]
    picks, credits = solve_schedule(candidates, request.min_credits, request.max_credits, base_credits, base_mask)

    courses = [{
        'code': c['row']['code'],
        'number': c['row']['number'],
        'name': c['row']['name'],
        'rating': c['row']['rating'],
        'credits': c['credits'],
        'review_count': c['row']['review_count'],
        'sessions': option['sessions'],
    } for c, option in picks]

    warning = None
    if credits < request.min_credits:
        warning = (f"Couldn't reach {format_credits(request.min_credits)} credits without time conflicts; "
                   f"this schedule has {format_credits(credits)}.")
    return response(courses, credits, warning)
