# U3 — Workout mode (most important screen). Read: docs-ui/U3_APP_LAYOUTS.md (Workout mode)
Build `/workout/:id` as a full-screen route using `ui/SetRow`, `Stepper`, plus:
1. Header: back, exercise name + progress (1/5), sticky rest timer (auto-start on log; length by lift/intensity).
2. Prefill each set from the prescription; ghost "Last: 135×5 @7"; "✓ Log set" with haptic (`navigator.vibrate`) and undo toast.
3. Only the current set is expanded; completed sets collapse; add/remove set; set-type chip (warm-up/working/top/back-off/drop); pain flag sheet (0–10 + area).
4. Bottom sheets: plate calculator (reuse existing logic), swap exercise, notes, warm-up ladder.
5. Finish sheet: session RPE, notes → summary screen (PRs, volume vs plan, "what changes next week").
6. Keep screen awake (`navigator.wakeLock`), offline-first via existing sync queue, autosave on every set.
7. Powerlifting accent vs bodybuilding accent come from tokens; BB shows RIR instead of RPE and muscle label.
## Checklist
- [ ] ≤ 2 taps to log an as-prescribed set; UI reacts < 100 ms
- [ ] Usable one-handed at 360×640; no zoom on input focus; keyboard doesn't cover active set
- [ ] Airplane-mode full session syncs without duplicates
