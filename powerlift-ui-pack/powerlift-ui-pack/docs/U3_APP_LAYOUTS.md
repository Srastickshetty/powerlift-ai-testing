# U3 — App layouts (wireframes)
**Nav:** mobile bottom bar `Today · Program · Progress · Coach · Me` (hidden in workout mode). Desktop ≥lg: left rail, same 5. Coach shell: `Roster · Inbox · Programs · Library · Billing`.
## Today (mobile)
```
[Mon 2 Oct]               [readiness ●●○]
┌ Squat Day ──────────────────┐
│ 5 exercises · ~70 min       │
│ Top set 140×3 @RPE8         │
│ [      START SESSION      ] │
└─────────────────────────────┘
┌ This week: 2/4 sessions ────┐
┌ Why this week changed   ›  ─┐
[Today][Program][Progress][Coach][Me]
```
Desktop: 12-col — left today+week, right e1RM mini-chart, readiness, notes.
## Workout mode (full screen — most important)
```
← Squat (1/5)        00:42 rest  ⋯
Last 135×5 @7     Target 140×5 @7.5
 SET1 warm-up  60×5 ✓
 SET2 working [− 140 +] [− 5 +]  RPE 6 7 8 9 10  [✓]
 SET3 working  140×5  (tap ✓ = as prescribed)
 [swap] [plates] [note] [pain]
[        NEXT EXERCISE        ]
```
Current set expanded, others collapsed; ✓ logs as prescribed; steppers 56 px; sticky rest timer; haptic on log; plate diagram in bottom sheet; offline.
## Progress
Segmented (Lifts | Volume | Body | PRs); stat row (e1RM, volume, adherence) + one big chart + list. Desktop 2×2 chart grid.
## Program
Week strip → day cards → exercises; "Why" button; version history sheet.
## Coach roster (desktop-first)
Table: athlete · status light · last session · adherence · pain · check-in due · open. Filters left; cards < md. Detail tabs Overview/Logs/Program/Check-ins/Media/Notes + chat panel.
## Me
Profile, track, units, equipment, injuries, subscription, privacy, labs (flagged), logout.
