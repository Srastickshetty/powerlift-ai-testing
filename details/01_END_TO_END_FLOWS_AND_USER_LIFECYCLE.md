# TITAN-AI // 01. END-TO-END FLOWS & USER LIFECYCLE

This document provides a granular walkthrough of how athletes enter, navigate, train, evolve, and compete within TITAN-AI. It details the complete state transitions, behavioral constraints, and lifecycle workflows across both primary disciplines.

---

## 1. The Dual-World Paradigm: Strict Discipline Isolation

TITAN-AI is not a generic gym tracker. It is bifurcated into two mutually exclusive, hyper-specialized training domains:

```
                         ┌─────────────────────────┐
                         │      LANDING PAGE       │
                         │   Discipline Gateway    │
                         └────────────┬────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
   ┌───────────────────────────┐             ┌───────────────────────────┐
   │    POWERLIFTING WORLD     │             │    BODYBUILDING WORLD     │
   │  Maximum Force Production │             │  Hypertrophy Architecture │
   ├───────────────────────────┤             ├───────────────────────────┤
   │ • SBD 1RM Specialization  │             │ • Volume Landmarks (MEV)  │
   │ • RPE 8-9 Heavy Singles   │             │ • PPL / Arnold Splits     │
   │ • Bar Velocity Loss Track │             │ • Muscle Protein Pacing   │
   │ • 9-for-9 Attempt Select  │             │ • Caloric Deficit/Recomp  │
   │ • 2-Hr Rehydration Cuts   │             │ • Desi High-Protein Diet  │
   └───────────────────────────┘             └───────────────────────────┘
```

### Why the Strict Separation Exists
- **Physiological Incompatibility**: Powerlifting optimizes neurological recruitment, rate of force development (RFD), and motor efficiency across 3 static lifts (Squat, Bench Press, Deadlift). Bodybuilding optimizes mechanical tension, cellular swelling, and volume per muscle group across varying fiber angles.
- **Periodization Conflict**: In Powerlifting, volume is strictly managed to prevent CNS burnout while lifting >85% 1RM. In Bodybuilding, volume is intentionally driven to the threshold of Maximum Recoverable Volume (MRV). Mixing the metrics causes algorithmic pollution in the auto-regulation engines.

---

## 2. The "No Mid-Way Switching" Rule & Safety Reset

### The Behavioral Constraint
Once an athlete selects either **Powerlifting** or **Bodybuilding**, they enter that respective realm. They **cannot** simply flip a toggle switch mid-workout or mid-week to jump between worlds.

### The Mechanism
1. The active world is permanently stored in `localStorage.getItem('active_world_discipline')` (`'powerlifting'` or `'fitness'`).
2. If an athlete desires to change disciplines, they must navigate to **Settings / Profile** or use the explicit **"Exit Realm"** button on the top status bar.
3. Attempting to switch triggers a **Destructive Warning Modal**:
   ```
   ⚠️ CRITICAL DISCIPLINE SWITCH WARNING
   "Switching between Powerlifting and Bodybuilding will archive your 
   active mesocycle and reset your periodization curves. 
   Your historical PRs will be preserved, but your current week's 
   target weights, attempt profiles, and volume progressions will be 
   re-synthesized from scratch. Are you sure you want to proceed?"
   [CANCEL]  [CONFIRM DISCIPLINE RESET]
   ```
4. If confirmed:
   - Current active mesocycle state is archived with a `status: 'completed_discipline_switch'` tag.
   - `localStorage.setItem('active_world_discipline', newWorld)` is updated.
   - The user is redirected to the customized **Profile Setup / Re-Assessment flow** to establish new baseline metrics for the chosen discipline.

---

## 3. Onboarding & Athlete Assessment Flow

When a new athlete registers or resets their profile, they pass through a 4-stage adaptive assessment in `ProfileSetup.jsx`:

### Stage 1: Discipline & Identity
- Athlete Name, Training Age (`< 1 year`, `1-2 years`, `3-5 years`, `5+ years`).
- Primary Goal (`Maximum Strength` vs `Hypertrophy & Aesthetics`).
- Gym Facility Type (`Commercial Gym`, `Powerlifting Club`, `Local Iron/Desi Akhada`, `Home Gym`).

### Stage 2: Biometrics & Strength Baseline
- Chronological Age, Height (cm), Current Bodyweight (kg), Target Bodyweight (kg).
- **Powerlifting Pathway**: Verified or estimated 1RM for Squat, Bench Press, and Deadlift. Competition federation affiliation (IPF / USAPL / Powerlifting India / WRPF).
- **Bodybuilding Pathway**: Training split preference (Push-Pull-Legs, Upper-Lower, Arnold Split, Full Body), priority weak-point muscle groups (Delts, Upper Chest, Hamstrings, etc.).

### Stage 3: Nutrition & Desi Budget Architecture
- Dietary classification (`Pure Vegetarian`, `Eggetarian`, `Non-Vegetarian`).
- Daily protein threshold willingness (`60-80g`, `100-120g`, `120-140g`, `160g+`).
- Daily nutritional budget in Indian Rupees (`₹100`, `₹150`, `₹250`, `₹350+`).
- Preferred protein staples (`Soya Chunks`, `Paneer`, `Curd`, `Sattu`, `Eggs`, `Chicken Breast`).

### Stage 4: App Experience Mode & Baselines
- Interface density: **Interactive HUD** (Full AI telemetry, real-time CV) vs **Simple Blueprint** (minimalist spreadsheet-style view).
- Optional baseline physique photo upload (stored locally with zero cloud leakage).

---

## 4. Daily Training Lifecycle: Step-by-Step

Every daily workout in TITAN-AI follows a rigorous, 4-phase execution loop:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ 1. PRE-SESSION  │ ──> │ 2. LIVE WORKOUT │ ──> │ 3. GYM BASEMENT │ ──> │ 4. POST-SESSION │
│ READINESS CHECK │     │   EXECUTION     │     │  OFFLINE SYNC   │     │  AI DEBRIEF     │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Phase 1: Pre-Session Readiness Check
- Athlete opens the app; `recoveryCouncil.js` queries sleep duration, subjective soreness (1-10), and resting pulse/HRV.
- If readiness is **Green (Score > 75)**: Normal planned working weights load.
- If readiness is **Amber (Score 50-74)**: Warmup volume is increased; top set target load is held steady.
- If readiness is **Red (Score < 50)**: Autoregulation kicks in: top set converted to technique single, working sets trimmed by 15-20%.

### Phase 2: Live Workout Execution
- **Exercise Carousel**: Displays the day's prescribed exercises in sequence (e.g., Competition Squat -> Paused Bench -> Romanian Deadlift -> Pendlay Row).
- **Plate Calculator Modal**: Calculates exact Olympic color-coded plate combinations (25kg red, 20kg blue, 15kg yellow, 10kg green, 5kg white, 2.5kg black, 1.25kg chrome).
- **Real-Time CV Barbell Tracker**:
  - Athlete positions phone horizontally facing the barbell.
  - MediaPipe Pose tracks barbell coordinates and hip/knee joints at 30+ FPS directly in the browser via WebGL.
  - Automatically measures:
    1. **Concentric Bar Velocity** (m/s).
    2. **Velocity Loss Percentage** across reps (flags set termination at >20% loss).
    3. **Squat Depth** (confirms hip crease is strictly below top of knee joint).
    4. **Bar Path Horizontal Deviation** (detects power leakage).
- **Rest Interval Clock**: Built-in audio/haptic timer triggers automatically upon set completion (3-5 minutes for compound singles, 90-120 seconds for accessories).

### Phase 3: Gym Basement Offline Synchronization
- Concrete basement gyms frequently have **zero cellular reception**.
- Every completed set, RPE entry, and metric is instantly stored in the browser's `titan_offline_sync_queue` in `localStorage` / `IndexedDB`.
- An amber **"OFFLINE // LOGS QUEUED"** indicator displays in the header.
- As soon as the athlete walks out of the gym or connects to Wi-Fi, `offlineSyncManager.js` detects `window.addEventListener('online')` and flushes all queued sets via `POST /api/logs/batch` in one atomic transaction.

### Phase 4: Post-Session AI Debrief
- Summarizes total training tonnage (e.g., `14,250 kg lifted`).
- Compares athlete-reported RPE against bar velocity via `rpeLiarDetector.js`. (e.g., *"You logged RPE 8, but mean concentric velocity was 0.38 m/s, indicating an actual RPE 7. You have more in reserve."*).
- Formulates micro-recovery recommendations (water intake, post-workout protein window).

---

## 5. Weekly Evolution & Periodization Lifecycle

TITAN-AI does not keep athletes on static, unchanging PDF templates. Training evolves every 7 days via `weeklyEvolutionEngine.js`.

```
                    ┌───────────────────────────────┐
                    │     WEEKLY CHECK-IN PROMPT    │
                    │   Avg RPE • Misses • Fatigue  │
                    └───────────────┬───────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ CRISP VELOCITY &    │  │ NOMINAL EXECUTION   │  │ HIGH FATIGUE /      │
│ LOW FATIGUE         │  │ RPE ~8.0, 0 Misses  │  │ MISSED REPS         │
│ (RPE <= 7.5)        │  │                     │  │ (RPE >= 9.2 or Miss)│
├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤
│ • +2.5kg - +5.0kg   │  │ • +1.25kg - +2.5kg  │  │ • 0kg Overload      │
│   Progressive Load  │  │   Steady Overload   │  │ • -10% Set Volume   │
│ • Volume Maintained │  │ • Volume Maintained │  │ • Supercompensation │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │    JOINT PREHAB DETECTION     │
                    │ Shoulder/Elbow/Knee Tweak?    │
                    │ -> Substitute Barbell with    │
                    │    Joint-Friendly Variations  │
                    └───────────────────────────────┘
```

### The 4 Pillars of Evolution
1. **Load Overload Logic**:
   - `avgRpe <= 7.5` and `fatigueScore < 45`: +2.5kg on upper body, +5kg on squat/deadlift.
   - `avgRpe 7.6 - 9.1`: +1.25kg to +2.5kg standard progressive micro-load.
   - `avgRpe >= 9.2` or `missedReps > 0`: 0kg increase; -10% volume reduction to dissipate fatigue.
2. **Joint Tweak Auto-Substitutions**:
   - Shoulder impingement detected: Barbell flat bench automatically swaps to Incline Dumbbell Bench (30° neutral grip).
   - Elbow tendonitis detected: Straight-bar skull crushers automatically swap to Cable Straight-Bar Tricep Pushdowns.
3. **Weight Shift Nutrition Sync**:
   - Scale dropped > 0.6kg: Adds +150 kcal recommendation to prevent lean tissue loss.
   - Scale gained > 0.6kg: Cuts 100 kcal of fats to prevent excessive adipose gain.
4. **Authoritative Coach Debrief**: A synthesized summary explaining the exact mathematical adjustments made for the upcoming week.

---

## 6. Nutrition & Diet Architecture: Two Distinct Realms

| Feature | Powerlifting World | Bodybuilding World |
| :--- | :--- | :--- |
| **Primary Metric** | Exact Weight-Class Proximity (kg) | Caloric Deficit / Surplus & Body Fat % |
| **Timing Strategy** | Peak fueling pre-workout & 2-Hour weigh-in rehydration | Leucine-paced feedings (every 3.5 - 4 hours) |
| **Sodium & Fluid** | Water manipulation & sodium loading for weigh-in | Consistent sodium for intramuscular vascularity |
| **Protein Target** | 1.6 - 2.0g per kg bodyweight | 2.2 - 2.6g per kg lean mass |
| **Desi Indian Groceries** | High-energy carb focus (Rice, Roti, Sattu, Paneer) | High-protein/calorie ratio (Soya 52% protein, Egg Whites, Tofu) |

---

## 7. Competition & Meet Prep Lifecycle

For powerlifters, the season culminates on the competitive platform:

### 1. Social-Scout Meet Finder (`instagramScout.js` + Community Sync)
- Scrapes verified meet announcements, entry deadlines, and federation flyers across Instagram and Google (#USAPL, #IPF, #PowerliftingIndia).
- Allows lifters to submit community-verified meets with instant syncing to all athletes in the region.
- Calculates national record distance (e.g., *"Your Squat is 12.5kg away from the Junior National Record"*).

### 2. 9-for-9 Competition Attempt Selection (`competitionAttemptEngine.js`)
- **1st Attempt (Opener)**: 90% - 92% of projected max. Must be a weight the athlete can perform for a smooth triple even on their worst day.
- **2nd Attempt**: 96% - 98% of projected max. Secures podium placement or sets a competition PR.
- **3rd Attempt**: 100% - 103% of projected max. The ultimate maximal effort attempt for victory or all-time personal best.

### 3. Meet Day Logistics War Room
- Real-time flight tracking and warmup progression timer.
- **60-Second Table Submission Clock**: Audible timer counting down the IPF rule-mandated 60 seconds to submit the next attempt to the score table.
