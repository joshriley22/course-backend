import unittest

from backend.logic import recommendation_logic as rl


def session(days, start, end, is_lab=False):
    return {'days': days, 'start_time': start, 'end_time': end, 'is_lab': is_lab}


def row(code, number, credits, sessions, rating=0.0, review_count=0, fields=None, next_count=0):
    return {
        'code': code, 'number': number, 'name': f'{code} {number}', 'credits': credits,
        'rating': rating, 'review_count': review_count, 'avg_professor_rating': None,
        'next_count': next_count, 'fields': fields or [], 'sessions': sessions,
    }


def solve(rows, shares=None, min_credits=13, max_credits=18, **kwargs):
    candidates = rl.rank_candidates(rows, shares or {})
    picks, credits = rl.solve_schedule(candidates, min_credits, max_credits, **kwargs)
    return {(c['row']['code'], c['row']['number']) for c, _ in picks}, credits


class ParsingTests(unittest.TestCase):

    def test_parse_credits(self):
        self.assertEqual(rl.parse_credits('3'), 3)
        self.assertEqual(rl.parse_credits('1 - 4'), 1)
        self.assertEqual(rl.parse_credits('4.5'), 4.5)
        self.assertIsNone(rl.parse_credits('0'))
        self.assertIsNone(rl.parse_credits('TBA'))
        self.assertIsNone(rl.parse_credits(None))

    def test_session_masks_overlap_only_on_shared_minutes(self):
        a = rl.session_mask(session('MoWe', '09.00.00.000000', '09.50.00.000000'))
        b = rl.session_mask(session('MoWe', '09.50.00.000000', '10.40.00.000000'))
        c = rl.session_mask(session('We', '09.30.00.000000', '10.00.00.000000'))
        d = rl.session_mask(session('TuTh', '09.00.00.000000', '09.50.00.000000'))
        self.assertFalse(a & b)
        self.assertTrue(a & c)
        self.assertFalse(a & d)
        self.assertEqual(rl.session_mask(session('', '09.00', '10.00')), 0)

    def test_lab_courses_need_one_lecture_and_one_lab(self):
        options = rl.build_options([
            session('MoWe', '10.00', '11.15'),
            session('Fr', '10.00', '10.50', is_lab=True),
            session('Mo', '10.30', '11.00', is_lab=True),  # collides with the lecture
        ])
        self.assertEqual(len(options), 1)
        self.assertEqual(len(options[0]['sessions']), 2)


class FieldShareTests(unittest.TestCase):

    def test_shares_follow_remaining_credits(self):
        shares = rl.field_shares({'CS': {'fields': ['core', 'elective'], 'credits': [20, 10]}}, {('CS', 'core'): 20})
        self.assertEqual(shares[('CS', 'core')], 0.0)
        self.assertEqual(shares[('CS', 'elective')], 1.0)

    def test_missing_credits_split_evenly(self):
        shares = rl.field_shares({'Gen': {'fields': ['a', 'b'], 'credits': []}}, {})
        self.assertEqual(shares[('Gen', 'a')], 0.5)


class SolveScheduleTests(unittest.TestCase):

    def test_fills_to_credit_range_without_conflicts(self):
        times = ['08.00', '09.00', '10.00', '11.00', '13.00', '14.00', '15.00']
        rows = [row('A', str(i), '3', [session('MoWe', t, t.replace('.00', '.50'))]) for i, t in enumerate(times)]
        picked, credits = solve(rows)
        self.assertEqual(credits, 18)
        self.assertEqual(len(picked), 6)

    def test_never_double_books(self):
        rows = [row('A', str(i), '4', [session('TuTh', '10.00', '11.15')], rating=5 - i, review_count=1)
                for i in range(5)]
        picked, credits = solve(rows)
        self.assertEqual(picked, {('A', '0')})
        self.assertEqual(credits, 4)

    def test_picks_the_session_that_avoids_a_conflict(self):
        rows = [
            row('A', '1', '4', [session('MoWe', '10.00', '11.15')], rating=5, review_count=3),
            row('B', '1', '4', [session('MoWe', '10.00', '11.15'), session('TuTh', '10.00', '11.15')]),
            row('C', '1', '4', [session('Fr', '10.00', '12.00')]),
            row('D', '1', '3', [session('MoWe', '13.00', '13.50')]),
        ]
        picked, credits = solve(rows)
        self.assertEqual(picked, {('A', '1'), ('B', '1'), ('C', '1'), ('D', '1')})
        self.assertEqual(credits, 15)

    def test_respects_max_credits_over_greedy_choice(self):
        # Two 9-credit picks fit 18 exactly; the single best 10-credit course would block that
        rows = [
            row('BIG', '1', '10', [session('Mo', '08.00', '09.00')], rating=5, review_count=10),
            row('A', '1', '9', [session('Tu', '08.00', '09.00')], rating=4, review_count=10),
            row('B', '1', '9', [session('We', '08.00', '09.00')], rating=4, review_count=10),
        ]
        picked, credits = solve(rows)
        self.assertEqual(picked, {('A', '1'), ('B', '1')})
        self.assertEqual(credits, 18)

    def test_spreads_picks_across_fields(self):
        # CORE courses each score a bit higher, but repeats from one field decay
        shares = {('CS', 'core'): 0.5, ('CS', 'elective'): 0.5}
        rows = [row('CORE', str(i), '3', [session('Mo', f'{8 + i:02d}.00', f'{8 + i:02d}.50')],
                    rating=5, review_count=1, fields=[{'major': 'CS', 'field': 'core'}]) for i in range(4)]
        rows += [row('ELEC', str(i), '3', [session('Tu', f'{8 + i:02d}.00', f'{8 + i:02d}.50')],
                     rating=4, review_count=1, fields=[{'major': 'CS', 'field': 'elective'}]) for i in range(4)]
        picked, _ = solve(rows, shares, min_credits=12, max_credits=12)
        self.assertEqual(sum(1 for code, _ in picked if code == 'CORE'), 2)
        self.assertEqual(sum(1 for code, _ in picked if code == 'ELEC'), 2)

    def test_reaching_minimum_beats_field_spread(self):
        # Every course shares one field; decay must not stop the schedule short of the minimum
        rows = [row('A', str(i), '3', [session('Mo', f'{8 + i:02d}.00', f'{8 + i:02d}.50')],
                    fields=[{'major': 'CS', 'field': 'core'}]) for i in range(6)]
        _, credits = solve(rows, {('CS', 'core'): 1.0})
        self.assertGreaterEqual(credits, 13)

    def test_returns_best_under_minimum_when_infeasible(self):
        rows = [row('A', str(i), '3', [session('MoWeFr', '10.00', '10.50')]) for i in range(3)]
        rows.append(row('B', '1', '3', [session('TuTh', '10.00', '11.15')]))
        picked, credits = solve(rows)
        self.assertEqual(credits, 6)
        self.assertEqual(len(picked), 2)

    def test_fills_around_existing_schedule(self):
        base_mask = rl.session_mask(session('MoWe', '10.00', '11.15'))
        rows = [
            row('A', '1', '3', [session('MoWe', '10.30', '11.45')], rating=5, review_count=10),
            row('B', '1', '3', [session('TuTh', '10.30', '11.45')]),
        ]
        picked, credits = solve(rows, base_credits=12, base_mask=base_mask)
        self.assertEqual(picked, {('B', '1')})
        self.assertEqual(credits, 15)


if __name__ == '__main__':
    unittest.main()
