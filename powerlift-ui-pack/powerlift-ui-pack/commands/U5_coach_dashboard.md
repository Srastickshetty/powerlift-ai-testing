# U5 — Coach dashboard (desktop-first, mobile-usable). Read: docs-ui/U3_APP_LAYOUTS.md (Coach roster)
1. Roster table: athlete, status light, last session, adherence %, pain flag, check-in due, track badge; filters (needs attention, meet < 8 wks, check-in due); search; sort. < md → cards.
2. Athlete detail: tabs Overview / Logs / Program / Check-ins / Media / Notes; right-side chat panel (≥ xl) or bottom sheet (mobile).
3. Program editor: week/day grid, drag to reorder (keyboard accessible alternative), version diff, approve → active.
4. Check-in review queue with quick reply templates; video review with timestamp comments.
5. Replace `CoachDashboard.jsx` / `AthleteDetail.jsx` duplicates; keep API calls, rebuild layout with `ui/*`.
## Checklist
- [ ] 20+ athletes scan in < 5 s; no horizontal scroll at 360
- [ ] Every action reachable by keyboard; sticky table header on desktop
