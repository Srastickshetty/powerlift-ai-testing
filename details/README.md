# TITAN-AI (Powerlift-AI) // SYSTEM KNOWLEDGE ARCHIVE

Welcome to the central technical documentation suite for **TITAN-AI (Powerlift-AI)**. This archive provides an exhaustive, production-grade breakdown of the platform's user flows, micro-engine algorithms, system architecture, failure modes, runbooks, architectural decision records (ADRs), database contracts, and biomechanical formulas.

---

## 📚 Archive Directory Structure

This documentation suite is organized into 6 core technical manuals:

| Document | Title | Core Focus |
| :--- | :--- | :--- |
| **[01_END_TO_END_FLOWS_AND_USER_LIFECYCLE.md](file:///e:/powerlift-ai%20-%20Copy/details/01_END_TO_END_FLOWS_AND_USER_LIFECYCLE.md)** | **End-to-End Flows & User Lifecycle** | Dual-World gateway, strict world isolation, onboarding, daily gym session flow, weekly evolution adaptation, nutrition models, and meet prep lifecycle. |
| **[02_SYSTEM_ARCHITECTURE_AND_ENGINES.md](file:///e:/powerlift-ai%20-%20Copy/details/02_SYSTEM_ARCHITECTURE_AND_ENGINES.md)** | **System Architecture & Micro-Engines** | System diagrams, React 18 + Vite PWA frontend, Node.js Express backend, Computer Vision pipeline, `weeklyEvolutionEngine`, Social Scout, and offline sync. |
| **[03_FAILURE_MODES_AND_RUNBOOKS.md](file:///e:/powerlift-ai%20-%20Copy/details/03_FAILURE_MODES_AND_RUNBOOKS.md)** | **Failure Modes & Production Runbooks** | *"What if this breaks? What to do?"* Full failure matrix: camera/MediaPipe failures, server crashes, database loss, AI rate limits, PWA cache bugs, and port collisions. |
| **[04_ARCHITECTURAL_DECISION_RECORDS_ADR.md](file:///e:/powerlift-ai%20-%20Copy/details/04_ARCHITECTURAL_DECISION_RECORDS_ADR.md)** | **Architectural Decision Records (ADRs)** | *"Why did I use this? Why not that?"* 12 in-depth ADRs explaining Vite vs Next, Vanilla CSS vs Tailwind, Client MediaPipe vs Cloud, Dual-World isolation, MongoDB vs Postgres, etc. |
| **[05_DATABASE_SCHEMAS_AND_API_CONTRACTS.md](file:///e:/powerlift-ai%20-%20Copy/details/05_DATABASE_SCHEMAS_AND_API_CONTRACTS.md)** | **Database Models & API Contracts** | MongoDB schemas, LocalStorage contracts, IndexedDB offline schemas, and complete REST API specifications with request/response payloads. |
| **[06_SAFETY_RULES_AND_ALGORITHMIC_FORMULAS.md](file:///e:/powerlift-ai%20-%20Copy/details/06_SAFETY_RULES_AND_ALGORITHMIC_FORMULAS.md)** | **Safety Rules & Algorithmic Formulas** | Exact mathematical formulas: 1RM equations, RPE-RIR tables, Prilepin's volume tables, bar path moment arm math, hypertrophy landmarks (MEV/MAV), and attempt selection. |

---

## ⚡ Quick Operational Cheat Sheet

### Server & Port Topology
- **Frontend PWA Server**: `http://127.0.0.1:5173` (Vite Dev Server)
- **Backend Node.js API**: `http://localhost:5001` (Express REST Server)
- **Database**: MongoDB (Local or Atlas) + Firebase Admin

### Essential Terminal Commands
```powershell
# 1. Start Backend Server (runs on Port 5001)
cd "e:\powerlift-ai - Copy\backend"
node server.js

# 2. Start Frontend Dev Server (runs on Port 5173)
cd "e:\powerlift-ai - Copy\frontend"
npm run dev -- --host 127.0.0.1 --port 5173

# 3. Quick System Diagnostic Check
cd "e:\powerlift-ai - Copy"
.\simple-check.bat

# 4. Verify Backend Health
curl http://localhost:5001/api/status
```

---

## 🏛️ High-Level System Topology

```mermaid
graph TD
    User([Athlete on Mobile / Desktop PWA]) -->|Touch / Gesture / Camera| Shell[TitanAppShell & ModernTitanSidebar]
    
    subgraph Frontend [Vite + React 18 PWA]
        Shell --> WorldRouter{Discipline Gateway}
        WorldRouter -->|Powerlifting| PL[Powerlifting World: SBD, 1RM, Meet War Room]
        WorldRouter -->|Bodybuilding| BB[Bodybuilding World: Hypertrophy, PPL, Desi Nutrition]
        
        PL --> CV[Client-Side MediaPipe Computer Vision]
        PL --> OfflineEngine[OfflineSyncManager & IndexedDB]
        BB --> OfflineEngine
    end

    subgraph Backend [Node.js + Express API - Port 5001]
        OfflineEngine -->|Sync Logs| LogRoutes[/api/logs]
        Shell --> CoachRoutes[/api/coach]
        Shell --> ProgramRoutes[/api/programs]
        Shell --> AIRoutes[/api/ai]
        Shell --> AgentRoutes[/api/agents]
        
        CoachRoutes --> Evolution[weeklyEvolutionEngine.js]
        ProgramRoutes --> Brain[aiProgramBrain.js]
        AgentRoutes --> Scout[instagramScout.js]
        AgentRoutes --> Council[recoveryCouncil.js]
    end

    subgraph Persistence [Data Layer]
        LogRoutes --> Mongo[(MongoDB)]
        ProgramRoutes --> Mongo
        User --> Firebase[(Firebase Auth)]
    end
```

---

*For detailed explanations of every subsystem, proceed to [01_END_TO_END_FLOWS_AND_USER_LIFECYCLE.md](file:///e:/powerlift-ai%20-%20Copy/details/01_END_TO_END_FLOWS_AND_USER_LIFECYCLE.md).*
