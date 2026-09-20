# TITAN-AI // 05. DATABASE SCHEMAS & API CONTRACTS

This document defines the formal data models, database schemas, local client storage contracts, and REST API interface specifications for TITAN-AI.

---

## 1. MongoDB Collections & Document Schemas

### A. User Profile Collection (`users`)
Stores athlete identity, discipline pathway, biometric baselines, and historical training maxes.

```javascript
{
  _id: ObjectId("..."),
  uid: String, // Firebase Auth UID or "athlete_demo"
  email: String,
  displayName: String,
  pathway: String, // "powerlifting" | "fitness"
  goal: String, // "strength" | "hypertrophy"
  age: Number,
  heightCm: Number,
  bodyweight: Number,
  targetBodyweight: Number,
  fitnessLevel: String, // "beginner" | "intermediate" | "advanced"
  trainingAgeYears: Number,
  gymType: String, // "commercial" | "powerlifting" | "local_iron" | "home"
  
  // Powerlifting Training Maxes (kg)
  training_max: {
    squat: Number,
    bench: Number,
    deadlift: Number
  },
  
  // Nutrition & Desi Diet Configuration
  nutritionProfile: {
    dietType: String, // "pure_veg" | "eggetarian" | "non_veg"
    proteinTargetGrams: Number,
    dailyBudgetINR: Number,
    preferredStaples: [String] // ["soya", "paneer", "sattu", "eggs", ...]
  },
  
  // UI & Experience Settings
  settings: {
    appMode: String, // "interactive" | "simple_blueprint"
    customGeminiKey: String, // Optional BYOK key
    hapticFeedback: Boolean,
    units: String // "kg" | "lbs"
  },
  
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

### B. Workout Session Log Collection (`workout_logs`)
Captures granular telemetry from every completed or in-progress gym session.

```javascript
{
  _id: ObjectId("..."),
  userId: String,
  sessionId: String, // e.g. "session_1726839200"
  date: ISODate("..."),
  discipline: String, // "powerlifting" | "fitness"
  weekNumber: Number,
  dayNumber: Number,
  sessionName: String, // e.g. "SBD Day 1 - Heavy Squat & Bench"
  
  exercises: [
    {
      exerciseId: String,
      name: String, // "Competition Barbell Squat"
      category: String, // "compound_main" | "accessory"
      sets: [
        {
          setNumber: Number,
          isWarmup: Boolean,
          loadKg: Number,
          repsTarget: Number,
          repsAchieved: Number,
          rpeTarget: Number,
          rpeReported: Number,
          meanVelocityMs: Number, // Measured via CV or accelerometer
          velocityLossPct: Number, // Percentage loss across set
          barPathDeviationMm: Number, // Horizontal displacement
          depthAchieved: Boolean, // Squat hip crease below knee
          completedAt: ISODate("...")
        }
      ],
      notes: String
    }
  ],
  
  totalTonnageKg: Number,
  avgSessionRpe: Number,
  cnsFatigueScore: Number, // 0-100 calculated by recoveryCouncil
  athleteNotes: String,
  isSyncedFromOffline: Boolean,
  createdAt: ISODate("...")
}
```

---

### C. Active Training Program Collection (`programs`)
Stores the athlete's multi-week mesocycle and daily prescription templates.

```javascript
{
  _id: ObjectId("..."),
  userId: String,
  status: String, // "active" | "completed" | "completed_discipline_switch"
  discipline: String, // "powerlifting" | "fitness"
  programName: String, // "TITAN 8-Week Peaking Mesocycle"
  blueprintId: String, // "peaking_intermediate_v2"
  totalWeeks: Number,
  currentWeek: Number,
  
  weeks: [
    {
      weekNumber: Number,
      focus: String, // "Accumulation" | "Transmutation" | "Realization/Peaking" | "Deload"
      days: [
        {
          dayNumber: Number,
          name: String, // "Day 1: Competition Squat + Volume Bench"
          exercises: [
            {
              name: String,
              loadKg: Number,
              sets: Number,
              reps: Number,
              targetRpe: Number,
              cue: String
            }
          ]
        }
      ]
    }
  ],
  
  lastEvolvedAt: ISODate("..."),
  evolutionHistory: [
    {
      evolvedFromWeek: Number,
      overloadAppliedKg: Number,
      volumeAdjustmentPct: Number,
      coachRationale: String,
      timestamp: ISODate("...")
    }
  ]
}
```

---

### D. Community & Sanctioned Meets Collection (`competitions`)
Stores upcoming sanctioned meets and crowdsourced local competitions.

```javascript
{
  _id: ObjectId("..."),
  meetName: String, // "National Powerlifting Championships 2026"
  federation: String, // "IPF" | "Powerlifting India" | "USAPL" | "WRPF"
  date: ISODate("..."),
  location: {
    city: String,
    state: String,
    venue: String,
    coordinates: [Number, Number] // [longitude, latitude]
  },
  divisions: [String], // ["Open", "Junior", "Sub-Junior", "Masters"]
  weighInTime: String, // "07:00 AM"
  registrationDeadline: ISODate("..."),
  registrationFeeINR: Number,
  source: String, // "scraped_instagram" | "community_verified" | "official_calendar"
  verifiedByAdmin: Boolean
}
```

---

## 2. Client LocalStorage State Contracts

The frontend persists key offline states in the browser's `localStorage`:

| Key | Type | Description |
| :--- | :--- | :--- |
| `active_world_discipline` | String | `'powerlifting'` or `'fitness'`. Enforces the strict realm boundary. |
| `titan_offline_sync_queue` | Array[Object] | FIFO queue holding pending workout logs completed offline in the gym basement. |
| `titan_last_sync_timestamp` | ISO String | Timestamp of the last successful batch log flush to backend. |
| `titan_pwa_install_dismissed` | Number (ms) | Timestamp when the user closed the install banner; suppresses prompt for 7 days. |
| `gemini_custom_api_key` | String | Personal API key provided under BYOK architecture. |
| `titan_active_session_cache` | Object | Live in-progress workout state to prevent loss if the browser tab reloads. |

---

## 3. REST API Interface Specifications

Base URL: `http://localhost:5001/api` (or Production Render URL)

### 1. Batch Sync Offline Logs
- **Endpoint**: `POST /api/logs/batch`
- **Purpose**: Flushes buffered gym basement logs into the database upon network reconnection.
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "logs": [
      {
        "id": "log_1726839210_a9f1",
        "userId": "athlete_demo",
        "exercise": "Competition Barbell Squat",
        "setNumber": 1,
        "loadKg": 180,
        "reps": 3,
        "rpe": 8.0,
        "velocity": 0.38,
        "completedAt": "2026-09-20T12:30:00.000Z"
      }
    ]
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "syncedCount": 1,
    "timestamp": "2026-09-20T12:30:05.000Z"
  }
  ```

---

### 2. Autonomous Weekly Evolution
- **Endpoint**: `POST /api/coach/evolve-week`
- **Purpose**: Triggers `weeklyEvolutionEngine.js` to compute next week's progressive overload or deload.
- **Request Body**:
  ```json
  {
    "athleteId": "athlete_demo",
    "currentWeekNumber": 2,
    "weeklyCheckIn": {
      "avgRpe": 7.3,
      "tonnageAchievedPct": 95,
      "missedReps": 0,
      "fatigueScore": 35,
      "scaleWeightShiftKg": -0.2,
      "jointTweaks": ["mild_shoulder_impingement"],
      "lifterNotes": "Squats felt light, bar flew on top sets."
    }
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "statusBadge": "PROGRESSIVE OVERLOAD (+2.5kg - +5kg)",
    "overloadAppliedKg": 2.5,
    "volumeMultiplier": 1.0,
    "coachDebrief": [
      "Bar velocity was exceptionally crisp on top sets (avg RPE ≤ 7.5). Initiating +2.5kg to +5kg progressive overload across compound lifts.",
      "Detected joint sensitivity in: mild_shoulder_impingement. Automatically swapping flat bench with 30° Incline Dumbbell Bench."
    ],
    "evolvedWeek": { /* Updated 7-day program schedule */ }
  }
  ```

---

### 3. Competition Attempt Forecaster
- **Endpoint**: `POST /api/coach/attempt-selection`
- **Purpose**: Calculates optimal 9-for-9 competition attempts based on training e1RM and velocity stability.
- **Request Body**:
  ```json
  {
    "projectedSquat1RM": 220,
    "projectedBench1RM": 150,
    "projectedDeadlift1RM": 260
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "squat": { "opener": 200, "second": 212.5, "third": 222.5 },
    "bench": { "opener": 137.5, "second": 145, "third": 152.5 },
    "deadlift": { "opener": 235, "second": 252.5, "third": 265 },
    "projectedTotal": 640,
    "estimatedDotsScore": 438.2
  }
  ```

---

### 4. System Diagnostic & Engine Health
- **Endpoint**: `GET /api/status`
- **Purpose**: Instant operational probe verifying backend uptime and database connection state.
- **Success Response (200 OK)**:
  ```json
  {
    "status": "ONLINE",
    "service": "POWERLIFT_AI_BACKEND",
    "port": 5001,
    "database": "CONNECTED",
    "uptimeSeconds": 24891,
    "timestamp": "2026-09-20T12:35:00.000Z"
  }
  ```
