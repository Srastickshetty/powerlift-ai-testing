# U1 — Design System (source of truth: code/tokens.css + code/tailwind.config.js)
**Mood:** serious gym, not a toy. Dark-first, high contrast, big numbers, one accent per track.
- Accent: Powerlifting `#E5484D` (red), Bodybuilding `#19C3B1` (teal). Set `data-track="pl|bb"` on `<html>`; accent switches everywhere.
- Surfaces: bg `#0B0D10`, surface `#12161B`, raised `#1A2027`, line `#232B34`. Text `#E8EDF2`, muted `#8A97A6`.
- Type: **Barlow Condensed** (numbers, headings, uppercase labels) + **Inter** (body). Tabular numerals for weights/reps.
- Scale 12/14/16/20/24/32/48/64 · spacing 4-pt · radius 8/12/20 · elevation via surface tone + 1px line.
- Breakpoints: base 360 · sm 640 · md 768 · lg 1024 · xl 1280.
## Layout rules
- Container: `max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8`. Reading/forms max 720 px; dashboards 12-col at `lg`.
- Mobile: one column, full-width cards, sticky primary CTA above bottom nav. Tablet: 2 columns. Desktop: left rail + content + optional right panel ≥ `xl`.
- Tables become stacked cards < `md`. Charts 180 px mobile / 280 px desktop.
## Components (src/ui/, build in this order)
Button (md=44, lg=56) · IconButton · Card · Stat · Chip/SegmentedControl · Stepper (long-press repeat) · Input/Select (16 px) · Sheet (bottom on mobile, side on desktop) · Modal · Tabs · Badge · Toast · Skeleton · EmptyState · ProgressRing · Timer · PlateDiagram · RPEScale · ChartCard.
## Do / Don't
Do: one primary action per screen; big numbers; details in sheets. Don't: cards inside cards inside cards; >2 font sizes per card; pure white on pure black; animate numbers while typing.
