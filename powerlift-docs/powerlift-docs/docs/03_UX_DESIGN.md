# 03 — UX & Design System (UI/UX developer + design lead)
Principle: **it should feel like a gym, not a dashboard.** Big, fast, one-handed, sweaty-thumb friendly. Information density only where coaches need it.

## Personas
Athlete-in-gym (phone, 1 hand, loud, 60–90 s between sets) · Athlete-at-home (planning, charts, nutrition) · Coach (laptop+phone, scanning 20–60 athletes quickly) · Admin.

## Information architecture
Athlete tabs (mobile bottom nav): **Today · Program · Progress · Coach · Me** (+ Nutrition inside Today/Progress for bodybuilding; Meet inside Program for powerlifting).
Coach: **Roster · Inbox · Programs · Library · Billing · Settings**.
Track skin: same system, two accents (Powerlifting = steel + signal red; Bodybuilding = graphite + electric teal). Track is chosen on first screen and shapes copy, charts, and defaults.

## Key flows & screens
1. **Welcome → Track choice** (two huge cards) → onboarding stepper (≤7 steps, progress bar, save/resume) → Coach Brief → Week 1 preview.
2. **Today**: header (date, readiness quick-check 3 sliders), session card list; primary CTA "Start session". Empty/rest-day states with recovery tips.
3. **Workout mode** (full-screen, no nav): exercise header + cues/video peek; set rows with big steppers (weight ±, reps ±), RPE/RIR chips, set-type chip, pain flag, "✓ As prescribed" one-tap; sticky rest timer; plate-loader diagram; swap exercise sheet; finish sheet (session RPE, notes, photo/video). Haptics + optional audio cues. Screen-awake lock. Works offline.
4. **Session summary**: PRs, volume vs plan, e1RM change, "next week will change because…" explainer.
5. **Program**: calendar/week view, version history with diffs, "why" panel, accept/reject AI proposals.
6. **Progress**: e1RM/volume/bodyweight/adherence charts with coach-style annotations; PR wall; body photos compare (bodybuilding).
7. **Coach tab (athlete)**: find coach (filters, profile, price, reviews) → request → dummy checkout → thread + check-ins + video feedback.
8. **Coach roster**: table + cards, traffic-light, filters (needs attention, meet <8w, check-in due), bulk actions; athlete detail with tabs (Overview, Logs, Program, Check-ins, Media, Notes).
9. **Meet mode** (powerlifting): attempt planner, warm-up countdown, live attempt tracker.
10. **Billing**: plan, invoice list, cancel; clearly marked **TEST MODE** while dummy.

## Design tokens (implement as CSS vars + Tailwind theme)
- Type: Inter (UI) + a condensed display face (e.g., Barlow Condensed) for numbers/headers. Scale 12/14/16/20/24/32/48. Numerals tabular.
- Color (dark default, light supported): bg #0B0D10, surface #12161B, raised #1A2027, line #232B34, text #E8EDF2, muted #8A97A6; **PL accent** #E5484D, **BB accent** #19C3B1; success #3DD68C, warn #F5A524, danger #F2555A, info #4C9AFF. Contrast ≥ 4.5:1.
- Spacing 4-pt grid; radius 8/12/20; touch target ≥ 48 px (workout mode ≥ 56 px); elevation by surface tone not shadow.
- Motion 120–200 ms ease-out; respect reduced-motion; no decorative animation in workout mode.
- Components (build once in `ui/`): Button, IconButton, Stepper, Chip, SegmentedControl, Card, Sheet, Modal, Tabs, Table, Badge, Toast, Skeleton, EmptyState, Chart wrappers (Recharts), Timer, PlateDiagram, BodyMap, RPEScale, VideoPlayer(+annotations).

## UX rules
- Max 2 taps to log a set. Never lose entered data (autosave every set; undo toast).
- Defaults smart (prefill from prescription/last set); numeric keypad inputs; no free-text where chips work.
- Explain every AI suggestion in one line + "details".
- Loading = skeletons; errors = actionable text + retry; offline banner + queued count.
- Accessibility: WCAG 2.2 AA, screen-reader labels, focus order, color never sole signal, 200% zoom OK.
- Content: coach tone — direct, calm, specific. No hype, no shaming, no emoji overload.
- Remove: duplicate dashboards, "TITAN OS" jargon in athlete-facing UI, hub sprawl. Replace with the IA above; extras live under Me → Labs behind flags.

## Landing/marketing page
Hero: "Your coach, in your pocket — or a real one on your team." Two-track split, how it works (plan → log → adapt → coach), proof (sample charts), pricing (Free / Pro / Coaching), FAQ, privacy. Lighthouse ≥ 90.

## Design deliverables the agent must produce
`apps/web/src/ui/` kit + Storybook (or `/ui-lab` route) · tokens file · screen specs for 10 flows above · empty/error/loading states · responsive breakpoints (360, 768, 1280).
