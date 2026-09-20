# TITAN-AI // 03. FAILURE MODES & PRODUCTION RUNBOOKS

> *"What if this breaks? What if that breaks? What do I do?"*

This document is the authoritative operations manual and diagnostic guide for TITAN-AI. It classifies every potential failure mode across hardware, network, software, AI, and database layers, providing both **Automatic Self-Healing Behaviors** and **Manual Recovery Runbooks**.

---

## 1. Master Failure Matrix

| Failure Mode | Root Cause | Immediate Symptom | Automatic Self-Healing Fallback | Developer / Coach Runbook |
| :--- | :--- | :--- | :--- | :--- |
| **Camera / CV Crash** | WebGL context loss, denied camera permissions, or low lighting | Black camera canvas, zero joint tracking | Automatically unmounts video feed; switches to high-contrast manual RPE numpad | Grant browser camera permission; ensure HTTPS; clean lens |
| **Backend API Down** | Port conflict, unhandled crash, or Node process killed | `net::ERR_CONNECTION_REFUSED` | Frontend enters offline mode; queues all sets in `localStorage`/`IndexedDB` | Run `node server.js` on port 5001; inspect `tasks.log` |
| **MongoDB Disconnect** | Atlas IP whitelist block, DNS failure, local service down | `MongooseServerSelectionError` (500) | Controllers fall back to cached local blueprints and mock data | Start MongoDB daemon; verify `.env` `MONGODB_URI` connection string |
| **AI Quota Exhaustion** | Gemini free-tier rate limit (429) or invalid API key | AI Coach dialog displays network error | Deterministic mathematical engines take over 100% of program calculations | Switch to athlete's personal BYOK key in Settings |
| **Offline Sync Race** | Athlete logged sets on mobile offline while desktop was open | Potential duplicate or overwritten sets | Client assigns UUID to each set; additive set merging prevents overwriting | Trigger manual flush via `useOfflineSync().flushQueue()` |
| **PWA Stale Cache** | Old Service Worker serving outdated JavaScript chunks | `ChunkLoadError` or white screen on reload | Workbox triggers `skipWaiting` on new service worker detection | Hard refresh (`Ctrl + F5`); unregister stale service worker |
| **Port Collision** | Ghost Node.js process locking Port 5001 | `listen EADDRINUSE :::5001` | Server crashes on launch | Kill orphaned PID using PowerShell `Stop-Process` |
| **Accidental World Reset**| User accidentally clicks discipline switch | Active mesocycle archived | Destructive confirmation modal prevents accidental clicks; cycle saved in archive | Restore previous program document from MongoDB archive |

---

## 2. Failure Scenario 1: Computer Vision & MediaPipe Pose Breakdown

### The Problem
During a heavy squat or bench session, the athlete mounts their phone. The camera feed either freezes, displays a black rectangle, or MediaPipe fails to detect skeletal landmarks.

### Root Causes
1. **Camera Permission Denied**: Mobile Safari or Chrome blocked camera access.
2. **Missing Secure Context (HTTP instead of HTTPS)**: Modern browsers disable WebRTC / `getUserMedia` on non-localhost unencrypted HTTP connections.
3. **WebGL Context Loss**: The mobile GPU ran out of texture memory or crashed under thermal throttling.
4. **Severe Gym Lighting Issues**: Backlighting or pitch-black gym basements prevent high-contrast landmark segmentation.

### Automatic Self-Healing
- If MediaPipe fails to load within 4.0 seconds, the UI gracefully falls back:
  - The camera viewport closes with a gentle notification: *"CAMERA OPTICAL TRACKING UNAVAILABLE // SWITCHING TO MANUAL RPE HUD"*.
  - The workout logging interface remains 100% functional.
  - The athlete is never blocked from logging their set weight and reps.

### Recovery Runbook
```
1. Check Browser Permissions:
   - iOS Safari: Settings -> Safari -> Camera -> Set to "Ask" or "Allow".
   - Android Chrome: Tap Lock Icon in URL bar -> Site Settings -> Camera -> "Allow".

2. Verify Secure Context:
   - When accessing from mobile on LAN (e.g. 192.168.1.X), use an HTTPS tunnel:
     npx localtunnel --port 5173
   - Or test directly on localhost via USB debugging.

3. Position & Lighting:
   - Ensure the camera is positioned 2 to 3 meters away at hip height.
   - Avoid pointing the camera directly into a high-powered gym spotlight.
```

---

## 3. Failure Scenario 2: Backend Server Crash (`net::ERR_CONNECTION_REFUSED`)

### The Problem
Frontend shows red offline indicator; attempts to fetch `/api/programs` or `/api/logs` fail with connection refused.

### Root Causes
1. Node process exited due to an unhandled promise rejection.
2. Port 5001 is already bound by a dangling zombie process.
3. Developer started backend on port 5000 instead of 5001.

### Automatic Self-Healing
- **Zero Data Loss**: The frontend's `offlineSyncManager.js` immediately intercepts all network errors.
- Every set logged by the athlete is buffered into `titan_offline_sync_queue`.
- The UI updates optimistically with green checkmarks.

### Recovery Runbook
```powershell
# Step 1: Check if port 5001 is running
Test-NetConnection -ComputerName 127.0.0.1 -Port 5001

# Step 2: If port is locked by a zombie process, find the PID:
Get-NetTCPConnection -LocalPort 5001 | Select-Object OwningProcess

# Step 3: Kill the zombie process (replace <PID> with number):
Stop-Process -Id <PID> -Force

# Step 4: Restart the backend server cleanly:
cd "e:\powerlift-ai - Copy\backend"
node server.js
```
Verify the output reads:
```
[SYSTEM_READY]: Backend running on http://localhost:5001
```

---

## 4. Failure Scenario 3: MongoDB Disconnection

### The Problem
Backend throws `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017` or Atlas cloud connection times out.

### Root Causes
1. Local MongoDB Windows Service (`mongod`) is stopped.
2. Cloud MongoDB Atlas IP Whitelist does not include the current dynamic public IP address.
3. `.env` file contains an expired or malformed connection URI string.

### Automatic Self-Healing
- Controller handlers in `backend/controllers/` wrap DB calls in `try...catch` blocks.
- If the database is unreachable, controllers return fallback response structures (such as default blueprints and local program templates) rather than crashing the Node process.

### Recovery Runbook
```powershell
# For Local MongoDB:
# Check if Windows MongoDB Service is running:
Get-Service -Name MongoDB

# If stopped, start it:
Start-Service -Name MongoDB

# For MongoDB Atlas Cloud:
# 1. Log in to cloud.mongodb.com
# 2. Go to Network Access -> IP Access List
# 3. Add current IP address or set temporarily to 0.0.0.0/0 for debugging.
```

---

## 5. Failure Scenario 4: AI / LLM Rate Limits & Quota Exhaustion (HTTP 429)

### The Problem
The AI Coach fails to reply in chat or returns: *"AI Service quota exceeded. Please try again later."*

### Root Causes
- Google Gemini 2.0 Flash or OpenAI API free-tier rate limits (15 RPM) exceeded.
- Shared demo API key exhausted its monthly token quota.

### Automatic Self-Healing (Critical Architectural Safeguard)
- **TITAN-AI never relies on LLMs for core lifting mathematics!**
- Calculations for:
  - Next week's weights (`weeklyEvolutionEngine.js`)
  - 1RM estimations (`e1rmCalculator.js`)
  - Warmup plate calculations (`OlympicPlateLoader.jsx`)
  - Attempt selection (`competitionAttemptEngine.js`)
- All execute using **deterministic mathematical algorithms** in native JavaScript.
- If the LLM goes down, **100% of your training progression and workout logging continues unaffected**.

### Recovery Runbook
```
1. Bring-Your-Own-Key (BYOK):
   - Instruct the athlete to open Settings -> AI Performance Lab.
   - Enter their personal free Google Gemini API Key.
   - Key is stored strictly in the athlete's local browser storage.

2. Verify Environment Key:
   - Check backend/.env for GEMINI_API_KEY.
   - Verify key validity at https://aistudio.google.com/
```

---

## 6. Failure Scenario 5: Gym Basement Offline Sync Conflicts

### The Problem
An athlete logs sets 1, 2, and 3 in a basement gym with no cellular connection. Simultaneously, their coach or their desktop browser was open with stale data. When the phone reconnects to Wi-Fi, which data wins?

### Root Causes
- Distributed state divergence between disconnected client and central database.

### Resolution Architecture
1. **Client UUID Generation**: Every set logged offline is tagged with a client-generated UUID:
   ```javascript
   id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
   ```
2. **Additive Set Merging**: The backend `/api/logs/batch` endpoint treats incoming logs additively rather than overwriting the entire workout session document.
3. **Idempotent Insertion**: If the sync engine retries sending the same batch due to a spotty network reconnection, duplicate UUIDs are ignored via MongoDB `$addToSet` / unique index constraints.

---

## 7. Failure Scenario 6: PWA Stale Cache & ChunkLoadError

### The Problem
Following a new production build and deployment, an athlete opens the PWA on their phone and experiences a blank white screen or console error:
```
Failed to fetch dynamically imported module: /assets/index-D7b39a.js
```

### Root Causes
- The browser's Service Worker has cached `index.html` referencing old hash chunk filenames that no longer exist on the web server.

### Automatic Self-Healing
- `vite-plugin-pwa` registers with `registerType: 'autoUpdate'`.
- Workbox automatically calls `skipWaiting()` and claims clients as soon as a new `sw.js` is detected.

### Recovery Runbook
```javascript
// Emergency Browser Cache Flush (Executed from DevTools Console or via in-app "Reset Cache" button):
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}
caches.keys().then(names => {
  for (let name of names) {
    caches.delete(name);
  }
});
window.location.reload(true);
```

---

## 8. Failure Scenario 7: Windows Port Collisions (`EADDRINUSE`)

### The Problem
Launching the backend throws:
```
Error: listen EADDRINUSE: address already in use :::5001
```

### Recovery Script
Run the automated diagnostic check from the project root:
```powershell
cd "e:\powerlift-ai - Copy"
.\simple-check.bat
```
Or use the manual kill command:
```powershell
powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force"
```
Then relaunch:
```powershell
cd "e:\powerlift-ai - Copy\backend"
node server.js
```

---

## 9. Failure Scenario 8: Security Lockout & Anti-Brute-Force Throttle

### The Problem
An automated bot, brute-force script, or malfunctioning client loop triggers HTTP 429:
```json
{
  "error": "SECURITY_LOCKOUT",
  "message": "Security Notice: Rate threshold exceeded for sensitive endpoint. Try again in 15 minutes."
}
```

### Root Causes
1. **Brute-force attack**: Malicious script attempting credential stuffing on `/api/users/login`.
2. **Aggressive API scraper**: Bot trying to scrape meet data or athlete logs.
3. **Runaway client loop**: A buggy frontend component re-fetching an endpoint 50 times in a loop.

### Automatic Self-Healing
- The backend's `strictSecurityLimiter` automatically blocks the offending IP for **15 minutes**.
- Legitimate endpoints like gym set logging continue functioning on the general telemetry limiter (1200 requests / 15 minutes).
- Server RAM and CPU remain protected from denial-of-service degradation.

### Recovery Runbook
```
1. Wait out the 15-minute sliding window cool-down.
2. If immediate administrative unlock is required on local/staging:
   Restart the backend server (clears the in-memory rate limit store):
   powershell -Command "Stop-Process -Name node -Force"
   node server.js
3. For mobile users behind shared gym Wi-Fi Carrier-Grade NAT (CGNAT):
   Switch to mobile data (cellular 4G/5G) to instantly obtain a clean IP address.
```

