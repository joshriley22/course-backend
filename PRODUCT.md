# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Enrolled University of Virginia students planning which courses to take, particularly around registration time. They are checking prerequisites, seeing what a major/field's course sequence looks like, and figuring out what they're eligible to take next.

## Product Purpose

A course-planning tool for UVA students: it visualizes a major/field's courses and prerequisite structure as an interactive graph, tracks which courses a student has already taken, and (in progress) recommends which courses they're eligible to take next based on courses completed. It also lets students read/leave course reviews.

## Positioning

Unlike a static degree-audit list or the school's own course catalog, this surfaces the prerequisite structure as an explorable graph (courses as nodes, prerequisite/co-requisite relationships as edges, per major/field) and pairs it with an eligibility/recommendation engine that tells a student what they can take next given what they've already completed — rather than making them manually cross-reference prerequisite chains.

## Operating Context

- Built on the University of Virginia's course catalog/SIS data (scraped via `backend/db_setup/scrape_hoolist_manager.py`, `scrape_program_manager.py`, `sis_api_manager.py`).
- Core browsing unit is major → field → course; courses have prerequisite and co-requisite edges to other courses.
- `Explore` page: graph visualization of a major/field's courses (React Flow, force-directed collision layout), with a detail panel per course (credits, fields satisfied, prerequisites, follow-on courses, session history, reviews).
- `Home` page: intended to be where the eligibility/recommendation feature (what a student can take next, given courses taken) surfaces in the frontend — not yet built out; currently a placeholder that only logs the result to console.
- Students track "courses taken" client-side (`CoursesTakenList` singleton) to drive eligibility checks.
- Login/signup exists against a users API but is early/rough (e.g. `Login.tsx` currently calls an undefined `setLoggedIn`).
- Course reviews (rating + text, tied to a course and username) exist on the backend; the "Create Review" action in the course detail panel is not yet wired up.

## Capabilities and Constraints

- Confirmed core mechanism to preserve: the graph-based prerequisite exploration (Explore page) and the eligibility/recommendation engine (intended for the Home page) are the two features that must stay central to the product.
- The recommendation/eligibility algorithm itself is still primarily a backend concern (`get_eligible_courses`-style logic) and is not yet reflected in Home page UI — that UI is open design territory.
- Mobile: the graph visualization may be intentionally minimized or de-emphasized on small/mobile viewports rather than forced to work identically to desktop — open design decision, not a requirement to make the graph fully mobile-equivalent.
- Single-institution scope (UVA) for now; not built as a generic multi-school platform.
- Login, signup, and review-creation flows are functionally incomplete and should be treated as in-progress rather than settled UX to preserve as-is.

## Brand Commitments

UVA's orange and blue are the confirmed identity-color anchor (currently specified for the Explore page's visual direction — see its surface brief). Any future visual work should treat these two hues, not a generic accent color, as the starting palette rather than inventing an unrelated one.

## Evidence on Hand

- Real UVA course/major/field data via the scrapers listed above (no fabricated course data should be introduced).
- No existing user testimonials, case studies, or usage metrics — none should be invented.

## Product Principles

- The prerequisite graph is the product's signature interaction — treat it as the thing worth polishing most, not a secondary feature.
- Reduce manual cross-referencing: whenever possible, show a student directly what they can/can't take next rather than making them infer it from a list of prerequisites.
- Respect that this is real registration-time data for real students — accuracy and clarity beat decorative complexity.
- Mobile can reasonably trade the full graph experience for something simpler; it doesn't need to be a shrunk clone of desktop.

## Accessibility & Inclusion

No product-specific accessibility requirement has been established yet.
