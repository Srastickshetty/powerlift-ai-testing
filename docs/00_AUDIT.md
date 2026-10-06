# 00 — Audit of current codebase (evidence-based)
Scope reviewed: ~42k lines JS/JSX/PY (excl. .venv, node_modules, dist). Stack: React/Vite PWA, Express 5, Firebase Auth+Firestore, Groq/Gemini, sklearn KMeans.
Severity: **C** critical (fix before anyone else uses it) · **H** high · **M** medium · **L** low.

## Security & legal
| ID | Sev | Finding | Evidence | Fix |
|---|---|---|---|---|
| S1 | C | **No server-side auth.** `verifyIdToken` appears nowhere in routes/controllers/services. Routes trust IDs in URL/body (`/api/logs/:athleteId`, `/api/coach/athletes/:coachId`, `/api/admin/*`). Anyone can read/write any athlete's data or act as coach/admin. | grep `verifyIdToken` in backend (excl. node_modules) = 0 hits | P0: auth middleware + RBAC + ownership checks |
| S2 | C | **Secrets in the project archive**: `backend/.env`, `frontend/.env`, `backend/firebaseServiceAccount.json` present. | file listing | Rotate Groq, Gemini, Firebase service account NOW; purge git history; add `.env.example` |
| S3 | C | **Copyrighted/pirated sources in the AI knowledge base**: PDFs from toaz.info / vdoc.pub (Henriques, Sheiko, Program Design Manual) feed `processed_knowledge.json` (2.1 MB). A commercial product built on this is a legal liability. | `backend/data/knowledge_base/`, `processed_knowledge.json` | P5: remove; rebuild from licensed/original/coach-contributed content |
| S4 | H | CORS accepts any origin containing `localhost` (`origin.includes('localhost')`) → `localhost.evil.com` passes. | server.js ~L76-90 | Exact-match allowlist |
| S5 | H | Paywall tier stored in `localStorage` (`titan_user_tier`); BYOK API keys in localStorage. Trivially bypassed / stealable. | TierContext.jsx | Entitlements server-side; no user keys in browser |
| S6 | M | No input validation, emoji `console.log` of IDs/PII everywhere, no structured logging/error tracking. | routes/logs.js | zod + pino + Sentry |
| S7 | M | No health-data/privacy policy, consent, data export/delete. Body weight, photos, injuries are sensitive. | — | P7 |

## Data layer
| D1 | C | **Two persistence systems mixed.** 41 backend files use `fs.read/writeFileSync` JSON (users, logs, programs, memories) while others use Firestore. Breaks on multi-instance/serverless, races, data loss on redeploy. | grep readFileSync/writeFileSync | Single DB (docs/02 ADR-1) |
| D2 | H | No schema. Logs store `weight/reps/rpe` only; no set type (warm-up/working/top/backoff), tempo, pain flag, bar speed, session RPE, video, planned-vs-actual link. A coach cannot judge adherence. | routes/logs.js | docs/02 data model |
| D3 | M | Stray runtime data committed (`users.json`, `athlete_memories.json`, `workoutLogs.json`). | backend/data | Remove from repo |

## AI / ML
| A1 | H | "Our own trained model" is not real yet: `ml_data/program_features.json` has **2 programs**; KMeans on 2 samples is meaningless. Clustering result drives template choice. | ml_data, ml/cluster_programs.py | docs/04: curated program DSL (≥150), retrieval+rules now, learn from outcomes later |
| A2 | H | LLM output is not constrained by deterministic safety rules (volume jumps, load jumps, injury flags). | aiProgramBrain.js (1054 lines) | Rules engine validates every AI proposal |
| A3 | M | Keyword "RAG" over raw PDF text; no embeddings, no eval set, no regression tests for program quality. | processed_knowledge.json | docs/04 eval harness |

## Product gaps (vs "best coaching platform")
| P1 | H | **Bodybuilding is a bolt-on**: pathway string `'fitness'`, one 1,556-line `FitnessCommandCenter.jsx` + `fitnessProgramService.js`. No volume landmarks per muscle, RIR progression, mesocycles, measurements/photos, prep phases. Track kept in `localStorage`. | frontend/dashboards, services | docs/01 §5, P3 |
| P2 | H | **Human coach is "coming soon"** (modal). Backend has request/approve/intervention routes but no: coach profiles/marketplace, subscriptions & billing, invitations, messaging, check-in review loop, form-check video review, coach↔athlete permissions, payouts. | HumanCoachComingSoonModal, coachRoutes.js | docs/02, P4 |
| P3 | M | Feature sprawl, shallow depth: Indian meet finder, Instagram scraper, tempo audio, vision biomechanics, 4 hubs. Core loop (plan → log → analyse → adjust → coach feedback) is not yet bullet-proof. | components/ (50+) | Freeze extras behind flags; perfect core |
| P4 | M | No exercise library with media, no substitutions, no equipment/home-gym profile, no injury/pain handling, no warm-up/plate/rest tooling integrated in the log flow beyond partial components. | accessoryLibrary.json = 5 items | docs/01 §6 |

## Frontend / code quality
| F1 | H | God component: `ClientDashboard.jsx` 2,920 lines, 46 `useState`. Duplicates: `ClientDashboardNew.jsx`, `App.jsx` ×2 (`src/` and `src/app/`), `AthleteDetail` ×2, `Login` ×2. 93 `localStorage` uses. | wc -l / grep | P6: split, delete dupes, state mgmt |
| F2 | M | Only 5 lazy-loaded chunks; no data-fetching layer (cache/retry/optimistic). | App.jsx | TanStack Query |
| F3 | M | JS only; no TypeScript, no tests (`backend test = echo Error`), no CI, no lint gate. | package.json | P1, P8 |
| F4 | L | Repo clutter: 12+ `*_REPORT.md`, `.bat/.ps1`, `test-*.js` at root, `.venv/` (40+ libs) inside project, `frontend/dist` committed. Self-reported "COMPLETE/INTEGRITY" reports are not evidence. | root | Move to `/legacy`, `.gitignore` |

## What is good (keep)
Offline sync manager, PWA shell, e1RM calculator, autoregulation/deload engines, weekly evolution concept, competition attempt engine, Indian nutrition context (real differentiator), rate limiting + helmet, Firebase Auth. Keep and re-home them under the new architecture.

## Top-10 order of attack
S1 → S2 → S3 → D1 → data model (D2) → clean athlete logging loop → track split (P1) → coach/payments (P2) → AI program engine + eval (A1–A3) → UI overhaul (F1) → tests/CI/launch.
