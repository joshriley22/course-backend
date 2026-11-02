---
version: 1
slug: "frontend-src-pages-explore-tsx"
primary_target: "frontend/src/pages/Explore.tsx"
related_targets: ["frontend/src/components/NodeDetails.tsx"]
---

## Job and audience

Enrolled UVA student exploring a major/field's prerequisite structure — checking what a course requires and what it unlocks, per PRODUCT.md.

## Outcome and proof

Primary action: understand a course's place in the prerequisite graph quickly. Current pain point named by the user: the page (especially the node details panel) feels flat/boring and needs real visual character, not just functional correctness.

## Selected direction

- Confirmed color direction for the whole Explore page: light UI — white and grays still present as neutral ground — accented with UVA orange and UVA blue, each used in a range of shades/tints rather than one flat pair. This is a page-wide treatment (canvas, headers/filters, node details), not limited to one component.
- NodeDetails moves from the current slide-in side panel to a centered popup/modal (the same popup pattern used for "show more details" on the Home page), with the rest of the page dimmed/blurred behind it.
- Inside that popup, add a small, self-contained ReactFlow mini-graph, distinct from the main Explore canvas: it re-centers on the selected course, renders that course in UVA orange, and shows exactly its immediate prerequisites and the courses it's an immediate prerequisite for in UVA blue — a focused one-hop view, not the full transitive chain.

## Scope and boundaries

`frontend/src/pages/Explore.tsx` and `frontend/src/components/NodeDetails.tsx`. Re-themes the existing graph interaction (React Flow + collision layout) into the new palette; does not change its underlying pan/zoom/collision behavior. Does not change what data is fetched or how eligibility/prerequisites are computed.

## States and ranges

- Mini-graph inside the popup always shows exactly one hop in each direction from the centered node: its direct prerequisites and direct dependents, never the full transitive chain.
- A course with no prerequisites, or nothing depending on it, should still render sensibly (centered node alone, or populated on only one side).

## Interaction and layout

- Clicking a node opens NodeDetails as a centered modal over a dimmed/blurred backdrop, replacing the current right-side slide-in panel.
- The mini-graph is a separate ReactFlow instance scoped to the popup, independent of the outer canvas's pan/zoom/collision state.
- Centered node: UVA orange. Its immediate prerequisite nodes and immediate "unlocks" nodes: UVA blue. Edges, labels, and surrounding chrome stay on the page's light gray/white base.

## Constraints and open decisions

- Exact hues/shades for "UVA orange" and "UVA blue" and their tints are not pinned yet — that's for the visual-design pass — but using those two specific hues (not a generic accent color) as the palette anchor is a confirmed constraint.
- Whether the header/filter bar and sidebar chrome also pick up the orange/blue palette, or stay neutral around a colorful canvas, is open.
- Popup sizing, corner treatment, and entrance animation beyond "centered, dims/blurs the background" are open.

## Direction contract

THESIS: The graph itself carries meaning through color — orange marks "you are here," blue marks "connected to it" — refusing the generic gray-boxes-and-lines node-graph template this page shipped with.
OWN-WORLD: Light neutral canvas (white/near-white, warm grays) with UVA Jefferson Blue (#232D4B) as the structural/wayfinding color and UVA Cavalier Orange (#E57200) as the "active/focus" color, each expressed in a graduated range of tints and shades rather than one flat swatch; prerequisite edges read blue, co-requisite edges read dashed orange.
STORY: The student scans the canvas and reads relationship type from color/line style alone; opening a course centers it in orange inside a small one-hop map with its direct neighbors in blue, replacing a paragraph of prerequisite text with something they can read in a glance.
FIRST VIEWPORT: Three stacked navigation tiers graduating from deep blue (major) to white/blue (field) to orange-tinted (course code, when present) sit above a light dotted canvas of white node cards and color-coded edges, with visible zoom controls.
FORM: Not rolled — this is a targeted redesign of an existing, fully-specified surface (composition inherited from the current Explore page; only NodeDetails' container changes from side panel to centered popup), so no concept-seed tournament applies.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
