# U0 — What is wrong with the current UI (from the code)
| # | Problem | Evidence | Impact |
|---|---|---|---|
| 1 | **Viewport blocks zoom** | `index.html`: `maximum-scale=1.0, user-scalable=no` | Accessibility fail; Lighthouse penalty |
| 2 | **Desktop-admin navigation for athletes**: sidebar with search box + collapsible groups (ModernTitanSidebar, 390 lines) | components/layout | Wrong mental model; slow in gym; confusing for new users |
| 3 | **Barely responsive** screens: CoachDashboard has 1 `md:` + 1 `lg:` class; TitanDashboard 1/1; ClientDashboard 17/8 across 2,920 lines | grep counts | Breaks on phones/tablets, wastes desktop space |
| 4 | **Giant screens, hub sprawl**: ClientDashboard (2,920), Training/Fitness hubs (1,100–1,550), duplicate dashboards | wc -l | Inconsistent layouts, impossible to polish |
| 5 | **No design tokens**: hard-coded hex + inline `style={{}}` in dashboards; many custom keyframes in Tailwind/CSS | tailwind.config.js, tailwind.css | Inconsistent look; can't theme PL vs BB |
| 6 | **Landing = login-aware header + centred hero**; no product proof, no two-track story, no pricing, no coach story, no app preview | pages/Landing.jsx | Doesn't convert or explain "what is this?" |
| 7 | **Jargon** ("TITAN OS", "Command Center", "War Room", "Brain Training") in athlete UI | component names | Feels like a game dashboard, not a coach |
| 8 | **Workout logging isn't the hero**; it's one tab in a huge dashboard | ClientDashboard/TrainingHub | Core loop not 2-tap fast |
| 9 | **No consistent skeleton/empty/error/offline states** | scattered | Feels unfinished |
| 10 | **Router mismatch**: root package lists react-router-dom 7, frontend uses 6 | package.json files | Dependency confusion; remove the root dep |

## Target experience in one line
Open app → **Today** (what to lift) → **Start** → full-screen workout mode with big steppers → summary → **Progress**. Everything else supports that loop.
