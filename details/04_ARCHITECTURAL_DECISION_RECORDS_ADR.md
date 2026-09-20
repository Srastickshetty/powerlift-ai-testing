# TITAN-AI // 04. ARCHITECTURAL DECISION RECORDS (ADR)

> *"Why did I use this? Why did I use that? Why not that? Why this over that?"*

This document records the critical architectural decisions made during the engineering of TITAN-AI. Each record details the context, the decision made, the alternatives evaluated, the explicit reasons for rejection, and the resulting trade-offs.

---

## Index of Architectural Decision Records

- [ADR-001: Vite + React 18 SPA vs Next.js vs React Native](#adr-001-vite--react-18-spa-vs-nextjs-vs-react-native)
- [ADR-002: Vanilla CSS & Design Tokens vs Tailwind CSS](#adr-002-vanilla-css--design-tokens-vs-tailwind-css)
- [ADR-003: Client-Side WebGL MediaPipe vs Cloud Video Processing API](#adr-003-client-side-webgl-mediapipe-vs-cloud-video-processing-api)
- [ADR-004: Strict Dual-World Isolation vs Unified Hybrid Dashboard](#adr-004-strict-dual-world-isolation-vs-unified-hybrid-dashboard)
- [ADR-005: Deterministic Algorithmic Engines vs Pure LLM Prompting](#adr-005-deterministic-algorithmic-engines-vs-pure-llm-prompting)
- [ADR-006: Platform-Adaptive PWA with App-Lock vs Native App Store Wrap](#adr-006-platform-adaptive-pwa-with-app-lock-vs-native-app-store-wrap)
- [ADR-007: MongoDB NoSQL vs Relational PostgreSQL](#adr-007-mongodb-nosql-vs-relational-postgresql)
- [ADR-008: Hierarchical Collapsible Sidebar vs Multi-Row Horizontal Buttons](#adr-008-hierarchical-collapsible-sidebar-vs-multi-row-horizontal-buttons)
- [ADR-009: Complete Removal of 3D Barbell Scene](#adr-009-complete-removal-of-3d-barbell-scene)
- [ADR-010: Complete Removal of Voice Audio Recorder](#adr-010-complete-removal-of-voice-audio-recorder)
- [ADR-011: Bring-Your-Own-Key (BYOK) AI Architecture vs Centralized Billing](#adr-011-bring-your-own-key-byok-ai-architecture-vs-centralized-billing)
- [ADR-012: Local-First Offline Sync Queue vs Redux-Persist / Heavy CRDTs](#adr-012-local-first-offline-sync-queue-vs-redux-persist--heavy-crdts)

---

### ADR-001: Vite + React 18 SPA vs Next.js vs React Native

- **Status**: Accepted
- **Context**: We needed a development runtime and deployment architecture that supports high-frequency camera frames, offline state persistence, instant UI responsiveness, and deployment across both mobile and desktop screens.
- **Decision**: Built the frontend as a single-page application (SPA) using **Vite + React 18**.
- **Alternatives Considered**: Next.js (SSR/App Router), React Native (Expo).
- **Why We Chose This**:
  - Vite offers near-instant Hot Module Replacement (HMR) and optimized Rollup builds.
  - An SPA has no Server-Side Rendering (SSR) overhead. Browser-only APIs (`navigator.mediaDevices`, WebGL, `localStorage`, `IndexedDB`, Web Workers) execute without hydration mismatches or `window is not defined` crashes.
  - Can be served entirely as static files from any standard CDN or PWA shell.
- **Why We Rejected Alternatives**:
  - *Next.js*: Server-side rendering adds zero value to an app that requires local camera feeds and offline gym basement execution. Hydration mismatches with MediaPipe canvas and local storage create severe runtime bugs.
  - *React Native*: Forces athletes through Apple App Store and Google Play review delays, requires maintaining separate native build targets (Xcode/Android Studio), and prevents instant zero-install desktop web access.
- **Trade-offs**: SEO is client-rendered, but TITAN-AI is an authenticated private coaching platform where public search indexing is not a primary objective.

---

### ADR-002: Vanilla CSS & Design Tokens vs Tailwind CSS

- **Status**: Accepted
- **Context**: The user interface requires intense visual polish: deep OLED black themes (`#060608`), neon amber/orange glows, glassmorphism blur filters, iOS Dynamic Island safe-area padding, and touch-lock behaviors.
- **Decision**: Implemented styling using **Vanilla CSS with CSS Custom Properties** (`index.css`, `pwa-lock.css`, `modern-sidebar.css`).
- **Alternatives Considered**: Tailwind CSS.
- **Why We Chose This**:
  - Full control over dynamic variables: `--sat: env(safe-area-inset-top)` and `--sab: env(safe-area-inset-bottom)`.
  - Clean JSX without 30-class strings polluting components.
  - Zero compilation overhead or PurgeCSS bundle configuration hassles.
  - Smooth native transitions and platform-adaptive font stacks (`-apple-system` on iOS vs `Roboto` on Android) controlled cleanly via root classes.
- **Why We Rejected Tailwind**:
  - Massive class lists made complex HUD components unreadable during collaborative pair programming.
  - Custom gym HUD elements (e.g., Olympic plate graphics, velocity gauges) required dozens of `arbitrary-[values]` in Tailwind, defeating the purpose of a utility library.

---

### ADR-003: Client-Side WebGL MediaPipe vs Cloud Video Processing API

- **Status**: Accepted
- **Context**: Athletes need real-time feedback on bar velocity, barbell path, and squat depth while performing heavy working sets.
- **Decision**: Execute MediaPipe Pose **100% on the athlete's device** using client-side WebGL and WebAssembly.
- **Alternatives Considered**: Cloud Video Streaming / Upload to a Python backend (OpenCV / YOLO-Pose).
- **Why We Chose This**:
  - **Zero Cloud GPU Costs**: Cloud GPU servers (AWS EC2 G4/G5 or Lambda GPU) cost thousands of dollars per month under continuous video processing. Client-side compute costs $0.
  - **Zero Latency**: Provides instant 30 FPS visual overlays on the device.
  - **Gym Basement Resilience**: Works when cellular reception is completely dead.
  - **Absolute Athlete Privacy**: The lifter's video stream never leaves their device's RAM.
- **Why We Rejected Alternatives**:
  - *Cloud Video Processing*: Requires uploading massive 1080p 60fps video files (100MB+ per set) over cellular connections. In typical basement gym conditions, upload fails immediately.

---

### ADR-004: Strict Dual-World Isolation vs Unified Hybrid Dashboard

- **Status**: Accepted
- **Context**: Powerlifting and Bodybuilding have fundamentally distinct objectives, metrics, and mental models. Users were confused by having all options displayed simultaneously.
- **Decision**: Enforce **Strict Dual-World Isolation**. An athlete selects Powerlifting or Bodybuilding upon entry. The UI locks into that discipline and requires an explicit confirmation modal before switching.
- **Alternatives Considered**: A unified hybrid dashboard with toggle switches on every card.
- **Why We Chose This**:
  - Eliminates cognitive clutter. Powerlifters see SBD 1RM, DOTS scores, and attempt selectors. Bodybuilders see volume landmarks (MEV/MAV), PPL splits, and muscle protein pacing.
  - Protects periodization integrity: prevents accidental mixing of high-volume hypertrophy sets into a powerlifting peaking taper.
- **Why We Rejected Alternatives**:
  - *Unified Dashboard*: Displayed too many competing controls, overwhelming normal users and making the UI feel messy and intimidating.

---

### ADR-005: Deterministic Algorithmic Engines vs Pure LLM Prompting

- **Status**: Accepted
- **Context**: Auto-regulation requires adjusting barbell loads, calculating 1RMs, and prescribing weekly progressive overload (+2.5kg to +5kg).
- **Decision**: Execute all progressive overload, volume adjustments, and attempt selections through **deterministic mathematical algorithms** in native JavaScript (`weeklyEvolutionEngine.js`, `competitionAttemptEngine.js`, `e1rmCalculator.js`). LLMs are used solely for conversational advice and motivation.
- **Alternatives Considered**: Asking an LLM (e.g., GPT-4 or Gemini) to generate weekly workout weights and sets via natural language prompt.
- **Why We Chose This**:
  - **Injury Prevention**: LLMs hallucinate numbers. A hallucinated +25kg jump on a squat top-set can tear a lifter's patellar tendon. Math must be 100% deterministic and provable.
  - **Reliability & Offline Capability**: Deterministic code runs in 0.2 milliseconds offline without API keys or token costs.
- **Why We Rejected Alternatives**:
  - *Pure LLM Prompting*: Too slow, unpredictable, susceptible to token rate limits (HTTP 429), and non-deterministic across repeated runs.

---

### ADR-006: Platform-Adaptive PWA with App-Lock vs Native App Store Wrap

- **Status**: Accepted
- **Context**: We wanted the mobile app to feel like a high-performance native iOS or Android app without the friction of app store downloads or cross-platform framework bloat.
- **Decision**: Built a **Platform-Adaptive Progressive Web App (PWA)** with native touch locks, safe-area insets, and gesture interceptors.
- **Alternatives Considered**: Capacitor / Cordova wrapper or React Native app.
- **Why We Chose This**:
  - Instant deployment: users get the latest features immediately upon page refresh without waiting for App Store approvals.
  - Works identically on iPhone, Android, iPad, Mac, and Windows laptops.
  - Built-in service worker enables full offline gym usage.
- **Why We Rejected Alternatives**:
  - *Capacitor/Cordova*: Adds native build complexity, binary signing overhead, and plugin version mismatch headaches without improving UI rendering speed.

---

### ADR-007: MongoDB NoSQL vs Relational PostgreSQL

- **Status**: Accepted
- **Context**: Storing workout sessions with highly dynamic exercise schemas (variable sets, warmups, RPEs, velocity metrics, joint pain tags, and coach notes).
- **Decision**: Selected **MongoDB / Mongoose** for document persistence.
- **Alternatives Considered**: PostgreSQL with JSONB columns.
- **Why We Chose This**:
  - Workout sessions are inherently hierarchical documents (Workout -> Exercises -> Sets -> Reps/RPE/Velocity).
  - Rapid prototyping: allows adding new biomechanical metrics (e.g., bar path deviation, eccentric duration) without running SQL database migrations.
- **Why We Rejected Alternatives**:
  - *Relational PostgreSQL*: Normalizing workout sets across 4 relational tables (workouts, exercises, sets, metrics) required complex multi-table joins on every daily dashboard query.

---

### ADR-008: Hierarchical Collapsible Sidebar vs Multi-Row Horizontal Buttons

- **Status**: Accepted
- **Context**: The platform grew to over 12 specialized tools (Meet Prep, Attempt Selector, Warmup Matrix, RPE Liar, CV Tracker, AI Lab, etc.). Displaying 8 horizontal buttons across the top created an unnavigable, cramped, messy interface.
- **Decision**: Replaced horizontal buttons with **Linear/Stripe-style Collapsible Hierarchical Navigation** (`ModernTitanSidebar.jsx`) and clean dropdown switchers on module hubs.
- **Alternatives Considered**: Multi-row horizontal button bars, flat bottom navigation with 10 tabs.
- **Why We Chose This**:
  - Organizes tools into 3 logical collapsible groups: *Daily Essentials*, *Platform & Meet War Room*, and *AI Performance Lab*.
  - Includes quick tool search filter to find any tool in seconds.
  - Scales gracefully whether the app has 5 tools or 50 tools.
- **Why We Rejected Alternatives**:
  - *Horizontal Buttons*: Crammed screen space, broke on tablet/mobile screens, and created visual fatigue.

---

### ADR-009: Complete Removal of 3D Barbell Scene

- **Status**: Accepted
- **Context**: Early iterations included a 3D WebGL barbell rendered using Three.js (`ThreeBarbellScene.jsx`).
- **Decision**: **Permanently removed the 3D barbell scene.**
- **Why We Chose This**:
  - The 3D scene added ~650KB of Three.js runtime overhead.
  - Mobile GPUs lagged during rendering, causing battery drain and frame drops.
  - **Zero practical utility for serious athletes**: An athlete preparing for a 200kg deadlift needs precise numerical plate loadings, target RPE, and velocity, not a spinning 3D toy barbell.

---

### ADR-010: Complete Removal of Voice Audio Recorder

- **Status**: Accepted
- **Context**: An experimental feature attempted to allow athletes to speak their workout notes and weights via voice recording.
- **Decision**: **Permanently removed the voice audio recorder.**
- **Why We Chose This**:
  - Gyms are loud environments: blaring metal/hip-hop music, dropping barbells, and gym chatter caused 60%+ transcription error rates.
  - Quick-tap numerical steppers (+2.5kg buttons, 1-tap RPE pills) are 10x faster and 100% accurate.

---

### ADR-011: Bring-Your-Own-Key (BYOK) AI Architecture vs Centralized Billing

- **Status**: Accepted
- **Context**: Running multi-turn AI conversational coaching and video analysis can incur significant API costs.
- **Decision**: Implemented a **Bring-Your-Own-Key (BYOK)** architecture alongside default free-tier access. Athletes can paste their personal Google Gemini or OpenAI API key directly in their settings.
- **Why We Chose This**:
  - Ensures the platform remains free and sustainable indefinitely.
  - Power users get unlimited token throughput with zero rate limiting from shared demo quotas.
  - Key is stored securely in the athlete's local browser storage.

---

### ADR-012: Local-First Offline Sync Queue vs Redux-Persist / Heavy CRDTs

- **Status**: Accepted
- **Context**: Athletes in basement gyms need bulletproof offline set logging with zero sync friction.
- **Decision**: Implemented a lightweight **Local-First FIFO Sync Queue** in `offlineSyncManager.js`.
- **Alternatives Considered**: Redux-Persist, Dexie.js with full CRDT replication (Yjs / Automerge).
- **Why We Chose This**:
  - Tiny footprint (~5KB of pure JavaScript).
  - Simple, robust mental model: every logged set is appended to a queue with a timestamp and UUID. When online, flushes atomically via `POST /api/logs/batch`.
  - Zero risk of state corruption common with heavy state-tree serialization libraries.
