# U4 — Today / Progress / Program / Me. Read: docs-ui/U3_APP_LAYOUTS.md
Build each as small components (< 300 lines) with skeleton, empty, error states.
- **Today**: date + readiness quick-check, today's session card (Start), week progress, "why this changed" card. Desktop: 12-col with e1RM mini chart + notes.
- **Progress**: segmented Lifts | Volume | Body | PRs; stat row + one big chart (annotate PRs, deloads) via a shared ChartCard (Recharts). Cards < md, 2×2 grid ≥ lg.
- **Program**: week strip, day cards, exercise list, "Why" panel, version history sheet.
- **Me**: profile, track, units, equipment, injuries, subscription, privacy, labs, logout.
- Replace hard-coded hex / inline `style={{}}` with tokens as you touch files (lint rule: no raw hex).
## Checklist
- [ ] All four screens pass docs-ui/U4_RESPONSIVE_RULES checklist at 360/768/1280
- [ ] Charts readable on mobile; tooltips on tap
