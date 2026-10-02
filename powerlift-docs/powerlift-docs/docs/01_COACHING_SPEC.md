# 01 — Coaching Spec (international powerlifting + bodybuilding coach voice)
Goal: software that behaves like a good coach in a gym: gives today's plan, watches every set, adjusts, explains why, and flags risk.

## 1. Onboarding (decides everything)
Step 1 **Track**: Powerlifting | Bodybuilding (full-screen choice; changing later = new profile with data carried over, with confirmation).
Common: name, age (block <18 from coach marketplace/prep/weight-cut features; show youth-safe mode), sex, bodyweight, height, units, training age, days/week + session length, equipment (commercial/home/garage; barbell, rack, bench, plates in kg/lb, specialty bars, belt/sleeves/straps), injuries/pain areas (free-text + body map), schedule constraints.
**Powerlifting extra:** current/target 1RM or recent best sets (weight×reps×RPE) for S/B/D, federation & equipment class (raw/equipped; IPF, PFI, other), weight class, meet date (optional), weak points (select sticking points), preferred styles (sumo/conv, high-bar/low-bar, bench arch/leg drive), RPE familiarity.
**Bodybuilding extra:** goal (hypertrophy / recomp / cut / lean bulk / contest prep), division (men's physique, classic, open, bikini…) if competing, show date, measurements (chest, waist, hips, arm, thigh, calf), photos baseline, lagging muscles, preferred split, cardio/steps baseline, diet pattern (veg/non-veg/Jain etc.), foods allowed.
Output: a **Coach Brief** the athlete confirms; generates Week 1.

## 2. The daily gym loop (core, must be flawless)
Today screen → warm-up (auto ladder) → set cards → rest timer → next set suggestion → finish → session RPE/notes/pain → summary (PRs, volume vs plan, what changes next week).
Rules:
- Each set shows prescription (weight/%/RPE/RIR/reps/tempo), last time's result ("ghost"), and a one-tap "as prescribed".
- Log: actual weight, reps, RPE or RIR, set type (warm-up/top/back-off/working/drop/AMRAP/myo), tempo/pause flag, pain flag (0–10 + area), notes, optional video.
- Autoregulation live: if top set RPE > target+1 → suggest back-off drop 3–8%; if RPE ≤ target−2 → suggest +2.5/+5 kg next set or next session.
- Plate calculator for the athlete's plate set; rest timer auto-starts, length by lift type/intensity.
- Swap exercise (equipment/pain) with equivalent from library; log marks "substitution".
- Missed session logic: shift, compress, or drop lowest-priority work; never "catch-up double".
- Offline-first; sync later; conflicts resolved server-side by set id.

## 3. Powerlifting engine
**Models** (selectable/auto): linear, DUP, block (accum→intens→realization), RPE-autoregulated (e1RM-based), percentage templates (5/3/1-style, Sheiko-style high-frequency, GZCL-style tiers), beginner novice progression.
**Auto-selection** by training age, recovery, frequency, meet date, weak points.
**Metrics:** e1RM (RPE-table + Epley/Brzycki, show confidence), intensity distribution, weekly sets/tonnage/INOL per lift & variation, fatigue index (RPE drift at fixed load), readiness (sleep, stress, soreness, bodyweight trend), ARI-style trend.
**Variations & weak points:** map sticking point → variation list (pause, tempo, deficit, pin, board, close-grip, etc.).
**Accessories:** by weak muscle group & joint tolerance; volume capped.
**Peaking & meet:** 8–12 wk peak block, taper (volume ↓ ~40–60%, intensity maintained), deload placement, **attempt planner** (opener ≈ a heavy-but-certain triple-ish, ~90–93% of target; 2nd ≈ 96–98%; 3rd = goal or adjusted live), weigh-in/water-cut safety (see §9), commands/rules per federation, equipment checks, warm-up timing room, DOTS / IPF GL / Wilks scoring, qualifying totals.
**Meet-day mode:** attempt tracker, warm-up schedule counted back from flight time, handler notes, instant "adjust next attempt" with rationale.

## 4. Bodybuilding engine (separate domain)
**Structure:** mesocycles 4–8 wk + deload; splits (PPL, UL, bro, Arnold, full-body, PHUL/PHAT-style) chosen by days/week/recovery/lagging parts.
**Volume model:** per-muscle weekly hard sets with landmarks MV/MEV/MAV/MRV (personalised, start conservative, move by response). Show a **volume radar** (planned vs done per muscle).
**Progression:** double progression (rep range → add load), RIR targets (e.g., 3→2→1→0 across meso), autoreg by joint pain & pump/soreness/performance feedback per muscle.
**Exercise selection:** by muscle, stretch-position emphasis, stability, SFR, equipment, injury; rotation every 1–2 mesos; keep progressing movements.
**Intensity techniques** (drop sets, rest-pause, myo-reps, lengthened partials) gated to intermediates+ and capped.
**Body composition:** daily weight → 7-day moving avg, weekly rate-of-change vs goal, tape measurements, progress photos (private, coach-only), adherence score.
**Nutrition:** TDEE estimate → calories/protein/fat/carb targets; weekly auto-adjust from weight trend; Indian food DB with portions/budget (keep existing engine); meal templates; steps/cardio prescription.
**Contest prep (if selected):** phases (offseason → prep → peak → rebound), conservative loss rate, refeeds/diet breaks, posing log, peak-week template **only with a human coach attached** and age ≥18 (see §9).

## 5. Shared pillars
Exercise library (≥300 exercises, video/GIF, cues, muscles, equipment, substitutions, powerlifting-variation tags) · Programs (DSL, versioned) · Logs · Analytics · Check-ins (weekly: bodyweight, sleep, stress, soreness, pain, adherence, notes, photos) · Notifications (session reminders, check-in due, coach feedback) · PR system (rep PRs, e1RM PRs, volume PRs) · Streaks (non-toxic) · Export (CSV, PDF program).

## 6. Human coach layer (paid)
**Athlete:** browse coaches (track, price, languages, specialties, rating), request → coach accepts → subscribe (dummy payment) → coach gets athlete dashboard.
**Coach dashboard:** roster with traffic-light status (adherence, fatigue, pain, missed sessions, check-in overdue); athlete detail (logs, e1RM trend, volume, bodyweight, photos, videos); program editor (edit AI draft, approve before release, versioning, templates, bulk-assign); check-in review queue with reply; form-check video annotations (timestamp comments); chat/threads per athlete; alerts (auto: 2 missed sessions, pain ≥6, RPE drift, weight-rate out of range); notes (private); billing view; calendar; competition prep tab.
**Modes:** Coach-led (coach approves everything) vs Co-pilot (AI proposes, coach reviews within 24h) vs Self-guided (no coach).
**Dummy payments now** behind `PaymentProvider` interface (docs/02) → swap to Razorpay/Stripe later without touching features.

## 7. Analytics a coach actually uses
e1RM trend per lift with PR markers · weekly volume by lift/muscle vs target · intensity zones · RPE vs load scatter · bodyweight trend & rate · adherence % (planned vs done sets) · readiness trend · pain log heatmap · coach-notes timeline · "what changed & why" per program version.

## 8. Explainability
Every AI change shows: what changed, which data triggered it, which rule/evidence, expected effect. Athlete can accept/reject; coach can override; all stored as program versions with diffs.

## 9. Safety (hard rules — implement in code)
- Never prescribe through reported pain ≥7/10 or sharp/neurological symptoms; show "see a qualified professional" and auto-reduce/swap.
- Load jump guard: next-session main-lift increase ≤ 5% (≤10% only for novices after RPE ≤ 6); weekly sets per muscle may rise ≤ 2–3 sets/week; deload trigger when RPE drift + readiness drop persist 2 sessions.
- Under-18: no prep/peak-week/weight-cut/aggressive deficits; conservative volume; no coach marketplace without guardian consent flag.
- Weight cut: cap acute loss targets, no dehydration protocols suggested by AI; direct to coach/medical.
- Disordered-eating guard: block extreme deficits (<~BMR×0.8 or <~1.2 g/kg protein flags aside), rapid-loss goals; prompt support resources.
- No medical/PED advice. Disclaimers once at onboarding + contextual.
- Crisis/mental-health phrases in chat → supportive message + resources, not coaching.
- All rule violations logged and visible to coach/admin.
