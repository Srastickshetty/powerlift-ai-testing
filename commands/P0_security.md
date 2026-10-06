# P0 — Security & cleanup
Read: AGENTS.md, docs/00_AUDIT.md (S1–S7, F4). Do not add features.
## Tasks
1. Backend `middleware/auth.js`: verify Firebase ID token (`admin.auth().verifyIdToken(token, true)`) from `Authorization: Bearer`; 401 on failure; attach `req.user`. Apply to EVERY `/api/*` router except `/api/status` health and public coach list.
2. Role/ownership helpers: `requireRole('coach'|'admin')`, `requireSelfOrCoachOf(athleteId)` (coach must have approved link). Replace trust in `:athleteId/:coachId` URL params and body `userId` with `req.user.uid` checks across all routes (logs, programs, progress, coach, admin, competitions, wellness, ai-conversations, india, post-competition, titan-os, agents).
3. Admin routes: allow only users with admin claim/role in DB; never based on client-sent field.
4. CORS: exact allowlist from `ALLOWED_ORIGINS` env; remove `includes('localhost')`; allow localhost only when `NODE_ENV!=='production'`.
5. Frontend `api.js`: attach fresh ID token to every request; handle 401 (sign-out) / 403.
6. Remove tier & API keys from `localStorage`; keep a TODO stub `GET /me/entitlements`; BYOK feature disabled.
7. Secrets: delete `backend/firebaseServiceAccount.json`, `backend/.env`, `frontend/.env*` from repo/history (`git filter-repo`), create `.env.example` files (names only), env validation at boot. **Print a checklist telling the human to rotate Groq, Gemini and Firebase service-account keys.**
8. Knowledge base: delete `backend/data/knowledge_base/*.pdf`, `processed_knowledge.json`, and code reading them; AI chat falls back to a stub until P5. Add note to docs/DECISIONS.md.
9. Move root clutter (`*_REPORT.md`, `*.bat`, `*.ps1`, `test-*.js`, `verification-report.json`, `titan-demo.html`, `.venv`, `frontend/dist`) to `/legacy` or `.gitignore`. Remove committed runtime data files in `backend/data` (users, logs, memories).
10. Add helmet CSP tuned for the PWA, `express.json` limit 200kb default (upload routes separate), per-route rate limits.
## Tests
Supertest: unauthenticated → 401 on all routes (auto-enumerate router stack); athlete A cannot read B (403); coach without link 403; admin route as athlete 403; CORS evil-localhost rejected.
## Acceptance checklist
- [ ] `grep -rn "verifyIdToken" backend --include=*.js` shows middleware used globally
- [ ] Route-enumeration test proves no unauthenticated data route
- [ ] No secrets or PDFs in tree; `.env.example` present
- [ ] Human rotation checklist printed
- [ ] App still logs in and loads dashboard
