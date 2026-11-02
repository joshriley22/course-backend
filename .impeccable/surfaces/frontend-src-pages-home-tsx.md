---
version: 1
slug: "frontend-src-pages-home-tsx"
primary_target: "frontend/src/pages/Home.tsx"
related_targets: []
---

## Job and audience

Enrolled UVA student planning their course schedule, most likely near registration; they land here needing to see what's recommended and assemble a semester schedule.

## Outcome and proof

Primary action: assemble courses into a visual schedule by pulling from a searchable, recommended-first course list, capped at 20 credits. This is where the eligibility/recommendation engine (see PRODUCT.md) surfaces in the UI.

## Selected direction

Inherits DESIGN.md's established "Wayfinding Graph" world wholesale (extension of an established world, not a new visual-identity exercise): orange marks the student's own committed schedule; the calendar only ever shows the student's own committed sessions, never a recommended preview.

## Scope and boundaries

`frontend/src/pages/Home.tsx` layout only. Reuses the existing Sidebar for cross-page nav, and reuses `NodeDetails` as the full-course-details/reviews popup rather than inventing a second modal chrome. The Explore page's graph-based interaction stays separate and is not folded into this page.

## States and ranges

- No courses selected: the calendar starts empty (user override of the original "show recommended as a preview" idea) with a message directing the student to the search panel; the weekly grid never renders anything but the student's own selections.
- Courses selected: the calendar renders the selected courses in orange ("focus/committed"); a horizontal-scrolling "Selected Courses" strip below it lists each one with credits, rating, time, and a remove action.
- A running credit total is enforced client-side against a 20-credit cap: the Selected Courses caption shows "X/20 credits", and any course card in the search panel whose credits would push the total over 20 shows a disabled "Exceeds Cap" button instead of "Add to Schedule" (existing selections stay addable/removable regardless).
- The course search/recommendation panel scrolls independently (vertical) and defaults to a "Search By Recommended" ordering (the backend's own rank); an "Other filters" popover filters by real session facts already returned by the API (avoids lunch, starts after 10am, ends before 5pm) rather than invented facets.
- Each course card in that panel shows partial detail inline (code, rating, next session) and two actions: Add/Remove (given the full available width) and "Reviews" (opens `NodeDetails` scrolled to the review composer). There is no separate "Details" button — clicking anywhere else on the card body opens the same `NodeDetails` popup at its default (non-scrolled) position.
- Loading: skeleton rows/blocks, not spinners. Empty search results: a message, never a blank scroll area. Fetch failure: inline error text with the page otherwise intact.

## Interaction and layout

- Sidebar (nav to other pages) fixed at left, full height — matches existing app chrome.
- Main content area splits into two stacked zones:
  - Top: a weekly grid (Mon-Fri x 8am-9pm) plotting only the selected courses' sessions, from the real `days`/`start_time`/`end_time` fields the eligibility API already returns. Always titled "Your Schedule".
  - Bottom: a horizontal-scrolling row of "Selected Courses" cards (given generous vertical room), each with credits, rating, time, and a remove control.
- Right-hand column: a vertically-scrolling "Course Search Panel" spanning the full height beside both zones above — search bar at top, then a "Search By Recommended" indicator alongside an "Other filters" popover, then a scrolling list of course cards. The Add-to-Schedule action gets the primary share of each card's action row now that Details is gone.
- Clicking a card body (outside its buttons), a selected-course strip card, or a calendar block all open `NodeDetails`, centered and dimming/blurring the page behind it — the same popup Explore already uses for this content. "Reviews" opens it pre-scrolled to the review composer.

## Constraints and open decisions

- What "recommended" ranks by, and the exact contents of "Other filters" beyond the session facts named above, remain open backend/product decisions; this build only surfaces what the API already provides.
- Full contents of the popup beyond "full course details" stay whatever `NodeDetails` already renders (prereq map, sessions, review composer) — not redesigned here.
- Course review posting stays unwired, as already noted in PRODUCT.md; not in scope.
- 20 credits is a fixed client-side constant (not user-configurable, not backend-enforced); revisit if the product wants per-student caps.

## Direction contract

THESIS: The calendar IS the schedule, not a summary card list next to one — courses drawn from the right rail land directly on a real weekly grid, refusing the generic "stack of class-time rows" this category defaults to.
OWN-WORLD: DESIGN.md's Wayfinding Graph system, inherited wholesale — warm-neutral canvas, two-hue graduated ramps, pill badges, 14-20px card radii, tinted shadows, Inter throughout; no third accent, no new component language. Orange is now the calendar's only block color, since the grid holds only the student's own plan.
STORY: A student lands to an empty week; adding a course from the search panel draws its orange blocks on the grid and drops it into the Selected Courses strip, ticking up a visible credit total capped at 20; removing does the reverse.
FIRST VIEWPORT: Sidebar left, full height. Main area: top weekly grid ("Your Schedule", Mon-Fri x 8am-9pm, orange session blocks) over a taller horizontal Selected Courses strip; right-hand vertically-scrolling Course Search Panel (search bar, Search-By-Recommended + Other Filters, course card list with a wide Add-to-Schedule action and a Reviews action) spans the full height beside both.
FORM: extension of an established world onto a new surface — no concept-seed roll; structure was already fixed by this brief, DESIGN.md's world is not renegotiated, no image generation available so the build is code-led by contract, not choice.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
