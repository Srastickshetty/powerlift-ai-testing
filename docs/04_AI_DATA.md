# 04 — AI & Data Pipeline (ML lead voice)

## Honest starting point
Today's "trained model" = KMeans on 2 programs + keyword search over 3 copyrighted PDFs. That cannot generalise. Real, defensible plan: **curated structured program corpus → rules+retrieval generator → learn from real outcomes**. Your long-term moat is *your own logged outcome data*, not scraped text.

## Phase A — Program corpus (legal-first)
Sources, in order of preference:
1. **Original/licensed:** programs authored by you + hired/partner coaches; coach-contributed with a signed contribution licence (creator agreement, revenue share optional).
2. **Publicly shared programs** where the licence/ToS/robots.txt permits automated access; store *structured facts only* (frequency, lifts, sets×reps, %/RPE, progression rule, duration, level) + source URL + licence note — **not** copied prose/PDFs/spreadsheets.
3. **Never:** pirated PDF sites, paywalled content, logged-in scraping, anything whose ToS forbids it. Remove `toaz.info`/`vdoc.pub` PDFs and `processed_knowledge.json` from the product.
Target: ≥150 programs per track (PL, BB), tagged by level, days/wk, goal, meet-prep yes/no.

## Program DSL (JSON, versioned, validated by zod)
```json
{ "meta":{"track":"powerlifting","level":"intermediate","days":4,"weeks":12,"goal":"meet_peak","source":"...","licence":"..."},
  "progression":{"type":"dup|linear|block|rpe_auto|double_prog","params":{}},
  "weeks":[{"w":1,"phase":"accumulation","days":[{"d":1,"slots":[
     {"slot":"main","exercise_ref":"squat","scheme":{"sets":4,"reps":5,"load":{"type":"pct_e1rm","v":0.75},"rpe":7}},
     {"slot":"variation","pattern":"squat_pause","scheme":{"sets":3,"reps":4,"rpe":7}},
     {"slot":"accessory","target":"quads","sets":3,"rep_range":[8,12],"rir":2}]}]}]}
```
BB schemes use `rep_range`, `rir`, `muscle`, `tempo`, `technique` instead of %.

## Phase B — Generator v1 (ships first, deterministic + explainable)
1. **Athlete vector:** level, days, recovery proxies, equipment, injuries, goals, weak points/lagging muscles, meet/show date, current e1RMs/volumes.
2. **Retrieve** top-k programs by constraint filter + cosine similarity over vector (embeddings only for text fields; numeric features scaled).
3. **Adapt** with engines: set loads from e1RM, set volumes from landmarks, swap exercises for equipment/injury, place deloads, build meet taper.
4. **Validate** with `engines/safety` (hard rules, docs/01 §9). Reject/repair, record `validator_result`.
5. **Explain** with LLM (Groq/Gemini) from a fixed JSON → text template; LLM cannot change numbers. Cache by input hash.
6. Save as `program_version(DRAFT)` with `rationale` + `diff`.

## Phase C — Learn from outcomes (when data exists)
Gate: ≥300 athletes with ≥8 weeks logs (or earlier with coach-labelled data).
- Targets: adherence %, e1RM/strength-index delta, hypertrophy proxy (volume-load + measurements), injury/pain flags, dropout.
- Models: gradient boosting (LightGBM) to **rank candidate programs/progression params** per athlete; contextual bandit for small safe tweaks (volume ±, intensity ±) with guardrails; survival model for dropout risk (coach alerts).
- Keep LLM for language + coach-assist (summarise week, draft check-in reply). Fine-tuning an LLM only if it beats the baseline in eval — not a goal by itself.
- Consent: users opt in to anonymised training use; export/delete honoured.

## Evaluation harness (must exist before claiming "AI coach")
- **Golden set:** 60 athlete personas (novice→elite, both tracks, injuries, home gym, meet in 10 wks…) with coach-written expected properties (frequency, main-lift volume range, no banned exercises, taper present).
- **Property tests:** safety validator passes 100%; no load jump >limits; equipment respected; days match; deload present; attempts ordered.
- **Human review:** 2 coaches rate 30 outputs per release (1–5: safety, specificity, plausibility). Block release if mean <4.0 or any safety fail.
- **Regression:** snapshot tests for engines; CI fails on drift.
- **Online:** track accept/reject of AI changes, coach override rate, adherence.

## Chat assistant ("Coach Deva")
Retrieval over *your own* licensed knowledge base (articles you wrote/licensed, exercise cues, FAQ) with embeddings (pgvector). Tools it may call: get_today, explain_change, log_note, swap_exercise (via API with user's auth). Crisis/medical triggers handled by fixed responses. Per-user daily quotas; log to `ai_events`.

## Data hygiene
PII stripped from prompts; model/provider keys server-side only; prompt/version registry; cost dashboard; fallback chain Groq → Gemini → cached/deterministic output.
