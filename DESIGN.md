---
name: UVA Course Explorer
description: A UVA-orange-and-blue graph interface for exploring course prerequisites and eligibility.
colors:
  orange-50: "#fef3e8"
  orange-100: "#fce0c2"
  orange-200: "#fac68f"
  orange-300: "#f6a355"
  orange-400: "#ef8628"
  orange-500: "#e57200"
  orange-600: "#c25f00"
  orange-700: "#9c4c00"
  orange-800: "#7a3c00"
  blue-50: "#eef1f7"
  blue-100: "#d7deea"
  blue-200: "#adbcd4"
  blue-300: "#7e93b7"
  blue-400: "#536d96"
  blue-500: "#3a5077"
  blue-600: "#2b3c5c"
  blue-700: "#232d4b"
  blue-800: "#171d33"
  blue-900: "#101524"
  gray-0: "#ffffff"
  gray-50: "#f8f8f9"
  gray-100: "#eef0f2"
  gray-200: "#e1e4e8"
  gray-300: "#c9cdd4"
  gray-400: "#9aa1ac"
  gray-500: "#717886"
  gray-600: "#565d6b"
  gray-700: "#3d4351"
  gray-800: "#262b36"
typography:
  body:
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.35
  title:
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  label:
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    fontSize: "12px"
    fontWeight: 800
    letterSpacing: "0.05em"
rounded:
  pill: "999px"
  lg: "20px"
  md: "14px"
  sm: "10px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "34px"
components:
  button-primary:
    backgroundColor: "{colors.blue-700}"
    textColor: "{colors.gray-0}"
    rounded: "{rounded.sm}"
    padding: "0 18px"
  button-primary-hover:
    backgroundColor: "{colors.blue-800}"
  button-secondary:
    backgroundColor: "{colors.gray-0}"
    textColor: "{colors.gray-600}"
    rounded: "{rounded.sm}"
    padding: "0 18px"
  button-secondary-hover:
    textColor: "{colors.orange-700}"
  course-node-card:
    backgroundColor: "{colors.gray-0}"
    textColor: "{colors.blue-800}"
    rounded: "{rounded.lg}"
    padding: "14px 16px"
  tag-pill:
    backgroundColor: "{colors.blue-50}"
    textColor: "{colors.blue-700}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

# Design System: UVA Course Explorer

## Overview

**Creative North Star: "The Wayfinding Graph"**

This is a light, institutional-but-legible system built for reading a prerequisite graph at a glance: a near-white canvas carries the weight, and two UVA hues do the semantic work of telling a student where they are and what's connected. Jefferson Blue is the structural, wayfinding color (chrome, edges, secondary emphasis); Cavalier Orange is reserved for "you are here" — the active course, the current focus, the thing demanding attention. Both hues are used as graduated 8-10 step ramps rather than flat swatches, so the same two colors can carry a card's border, a pill's fill, a heading's ink, and a button's hover state without ever feeling like a single flat brand stripe.

The system is proven end-to-end on the Explore page and its NodeDetails/CourseMiniGraph popup, and now on Home's weekly-schedule builder (WeeklySchedule, SelectedCoursesStrip, CourseSearchPanel, CourseListItem) — orange marking the student's own committed schedule on a calendar that holds only what they've chosen, blue reserved for the search panel's structural chrome (tags, ghost buttons), the same focus color carried from Explore's graph onto a grid; Sidebar picked up matching nav states. Login has not been visually rebuilt and should not be treated as evidence of a different world — it simply hasn't adopted this one yet.

**Key Characteristics:**
- Light neutral ground (white/near-white/warm gray) with color reserved for meaning, not decoration
- Two hues, each as a graduated tint/shade ramp, never used flat
- Pill-shaped tags and rounded-rectangle cards throughout; no sharp corners
- Soft, colored (not black) shadows tied to the nearby accent
- Orange = active/focus/"you are here"; Blue = structural/connected/"related to it"

## Colors

The palette is built from exactly two brand hues, each expressed as a graduated scale, over a warm-neutral grayscale ground.

### Primary
- **UVA Cavalier Orange** (`--orange-500`, #e57200): the "active/focus" color. Used for the centered node in the mini-graph, hover states on course cards and edges, co-requisite edges (dashed), rating pills, the sidebar brand mark, and the code-tier navigation bar. Its lighter tints (`--orange-50`/`--orange-100`) are used as pill/badge backgrounds; darker shades (`--orange-600`/`--orange-700`) are used as text-on-tint for those same pills.

### Secondary
- **UVA Jefferson Blue** (`--blue-700`, #232d4b): the structural/wayfinding color. Used for prerequisite edges (solid), primary buttons, the major-tier navigation bar (darkest shades, `--blue-700`/`--blue-800`), body text ink (`--blue-800`/`--blue-900`), card outlines, and neighbor nodes in the mini-graph. Its full 50-900 range spans near-white tints for pill backgrounds through near-black shades for headline text and the deepest chrome.

### Neutral
- **Gray-0 / White** (#ffffff): card and modal surfaces, primary button text.
- **Gray-50 / Cool Fog** (#f8f8f9): page background, canvas gradient start, mini-graph background.
- **Gray-100/200 / Hairline** (#eef0f2 / #e1e4e8): dividers, control borders, secondary-button borders.
- **Gray-500/600 / Muted Ink** (#717886 / #565d6b): secondary/meta text, section eyebrows, close-button icon.
- **Gray-700/800 / Body Ink** (#3d4351 / #262b36): fact-list body text.

### Named Rules
**The Two-Hue Ramp Rule.** Every color in the system traces back to UVA orange, UVA blue, or a neutral gray step — no third accent hue is introduced. Each of the two brand hues is always used as a ramp (multiple tints/shades within one surface), never as a single flat swatch standing alone.

**The Orange-Is-Focus Rule.** Orange marks the single thing the user is currently looking at or acting on (centered node, hover, active nav link, rating). It never marks a merely-related or structural element — that's blue's job.

## Typography

**Body Font:** Inter (with system-ui, -apple-system, sans-serif fallback)

**Character:** A single, well-hinted grotesk (Inter, weights 400-800 loaded from Google Fonts) carries every role from dense fact-list body copy to bold modal headings — legibility and numeric tabularity (`font-variant-numeric: tabular-nums`) over typographic drama, appropriate to a data-dense registration tool.

### Hierarchy
- **Title** (800, 26px, line-height 1.2, letter-spacing -0.01em): NodeDetails modal course title; the largest text in the system.
- **Headline** (700, 16-18px): navigation tier labels (major/field tier headers).
- **Title-small** (700, 15px): course card title text.
- **Body** (500, 13-15px): course card body, fact-list values, button labels.
- **Label** (700-800, 11-13px, letter-spacing 0.03-0.08em, uppercase on section eyebrows only): rating pills, tag pills, course-code badges, fact-list `dt` labels, section headings inside NodeDetails.

### Named Rules
**The One-Family Rule.** Inter is the only typeface in the system across every weight and role; no serif or display face is introduced for headings.

## Layout

The app shell is a fixed-height, non-scrolling viewport (`html, body, #root { height: 100%; overflow: hidden }`) split into a fixed-width sidebar (`flex: 0.125`, min-width 168px, collapsing to 128px under 640px) and a flexible main content area. Inside Explore, the graph canvas fills the remaining space beneath three stacked navigation bars of decreasing height (64px major / 46px field / 40px code tier), each a full-width horizontal bar, not a boxed card. Component internal spacing runs on an 8-step rhythm observed in the code: 8px/10px/12px/14px/16px/18px/20px/24px, tightening to 3-4px for tightly-packed pill/badge padding and opening to 34px for the NodeDetails modal's outer padding. The NodeDetails modal is capped at `min(94vw, 640px)` wide and 86vh tall, always centered over the page rather than anchored to a corner.

## Elevation & Depth

The system is mostly flat at rest, with shadows appearing only under the two things meant to feel "lifted": floating cards and the modal. Shadows are consistently colored — tinted toward the nearby ink or accent rather than pure black — reinforcing which hue "owns" the elevated element.

### Shadow Vocabulary
- **Ambient card** (`box-shadow: 0 1px 2px rgba(23, 29, 51, 0.06)`): resting state of course node cards and mini-graph node pills; barely-there separation from the canvas.
- **Orange hover glow** (`box-shadow: 0 10px 24px rgba(229, 114, 0, 0.14)`): course-card hover state — the lift is tinted orange, tying the elevation to the focus color.
- **Orange focus glow, strong** (`box-shadow: 0 8px 18px rgba(229, 114, 0, 0.32)`): the mini-graph's centered node, a stronger version of the same tint.
- **Controls shadow** (`box-shadow: 0 6px 20px rgba(23, 29, 51, 0.12)`): React Flow zoom controls, blue-black tinted.
- **Modal shadow** (`box-shadow: 0 30px 80px rgba(16, 21, 36, 0.35)`): the NodeDetails panel, the deepest and only truly "floating over everything" shadow in the system, paired with a blurred/dimmed backdrop (`rgba(16,21,36,0.55)` + `blur(6px)`).

### Named Rules
**The Tinted-Shadow Rule.** No shadow in the system is pure black; every shadow value carries either the blue-ink tint (`rgba(23,29,51,...)` / `rgba(16,21,36,...)`) or the orange-focus tint (`rgba(229,114,0,...)`), matching the element it lifts.

## Shapes

Corners are uniformly rounded and generous; no sharp rectangles appear anywhere in the sampled UI. Badges, pills, buttons within course cards, and rating chips use full pill radius (999px). Cards, the modal, and the mini-graph container use a large soft radius (14-20px). Smaller interactive controls (buttons, the details button) use a mid radius (10px). Borders are thin (1-1.5px), low-contrast, and drawn in a tint of whichever hue the element belongs to (`--blue-100` outlines on cards, `--gray-200` on neutral dividers) rather than pure black or gray-900.

## Components

### Buttons
- **Shape:** rounded rectangle, 10px radius.
- **Primary:** solid Jefferson Blue (`--blue-700`) background, white text, used for the modal's primary action.
- **Hover:** deepens one shade to `--blue-800`.
- **Secondary/Ghost:** white background, `--gray-200` border, `--gray-600` text; hover shifts border and text to orange (`--orange-300` / `--orange-700`) rather than deepening blue — secondary actions get the "focus" hue on interaction, primary actions stay in blue's own ramp.

### Chips / Pills
- **Style:** full pill radius, small-caps-weight bold text (700-800), background is a light tint of the owning hue with text in a matching dark shade of the same hue (e.g. `--orange-50`/`--orange-600` for rating; `--blue-50`/`--blue-700` for tags).
- **Use:** course ratings, course-code badges, field/tag labels, mini-graph neighbor nodes.

### Cards / Containers
- **Corner Style:** 18-20px radius on primary cards (course node, NodeDetails panel); 14px on secondary containers (session card, mini-graph frame).
- **Background:** white (`--gray-0`) on gray-50/gray-100 gradient ground.
- **Shadow Strategy:** see Elevation & Depth; ambient at rest, orange-tinted lift on hover for interactive cards.
- **Border:** thin 1-1.5px outline in a light tint of blue (`--blue-100`), turning orange (`--orange-300`) on hover for the course node card specifically — the only element whose border itself changes hue on interaction.
- **Internal Padding:** 14px vertical / 16px horizontal on course cards; 34px on the NodeDetails modal.

### Navigation
- **Style:** three stacked horizontal bars, each full-width, no rounded corners, graduating in color depth from top to bottom: major tier is darkest (`--blue-700` to `--blue-800` gradient, white text, 64px tall), field tier is white with blue text (46px), code tier is orange-tinted (`--orange-50` background, `--orange-700` text, 40px). Each tier's back/forward arrow button is a circular ghost button that inverts to a solid fill of the current tier's ink color on hover.
- **Sidebar:** white background, brand mark is a small solid-orange rounded-square tile; nav links are quiet gray text at rest, blue-tinted on hover, and orange-tinted-and-bolded when active — orange again marking "the one you're on."

### Graph Canvas (signature component)
The Explore canvas and its NodeDetails mini-graph are the system's defining pattern. The main canvas sits on a subtle gray-50-to-gray-100 vertical gradient with light dotted background; React Flow's zoom controls are re-skinned into a small white rounded card with blue-tinted icons that highlight orange on hover. Edges are color-coded by relationship, not just decoration: prerequisite edges render as solid blue Bezier curves (`--blue-300`, 1.75px), co-requisite edges render as dashed orange straight lines (`--orange-400`, 1.75px, `5 4` dash), with labels in the matching hue on a white background chip. Opening a course replaces the old side-panel with a centered, dimmed-and-blurred modal (NodeDetails) containing a self-contained one-hop mini-graph: the selected course is a solid-orange pill node, its immediate prerequisites and dependents are blue-tinted pill nodes — the same orange/blue focus-vs-connected grammar reapplied at a smaller scale.

## Do's and Don'ts

### Do:
- **Do** treat orange as the single "you are here / active" marker and blue as the "structurally connected" marker; never swap their roles.
- **Do** use full graduated ramps (50-800/900) for both brand hues rather than one flat swatch per hue.
- **Do** tint every shadow toward blue-ink or orange-focus rgba values instead of pure black.
- **Do** keep corners rounded system-wide: pill (999px) for badges/chips, 14-20px for cards and modals, 10px for buttons.
- **Do** reserve the deep-blue-to-white-to-orange gradient (major/field/code) navigation pattern for hierarchical drill-down breadcrumbs like Explore's tier bar.

### Don't:
- **Don't** introduce a third accent hue; every color must trace back to the orange ramp, the blue ramp, or the gray neutral scale.
- **Don't** use sharp/unrounded corners on cards, buttons, or badges — no element in the shipped system uses a 0px radius.
- **Don't** assume Home or Login already carry this system — as of this build they are unstyled/placeholder and are not evidence of an alternate direction; they are pending adoption, not an exception to it.
