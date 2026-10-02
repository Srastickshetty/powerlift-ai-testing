# U0 — UI foundation (≈1 hr). Read: AGENTS_UI.md, docs-ui/U1_DESIGN_SYSTEM.md
1. Copy `code/tokens.css` → `frontend/src/styles/tokens.css`; import it first in `main.jsx` (before tailwind.css).
2. Replace `frontend/tailwind.config.js` with `code/tailwind.config.js`. Keep any old keyframes/animations still referenced (grep `animate-`), under `theme.extend`.
3. `frontend/index.html`: add the Google Fonts links (see top of tokens.css); change viewport to `width=device-width, initial-scale=1, viewport-fit=cover` (REMOVE `maximum-scale` and `user-scalable=no`); add `<meta name="theme-color" content="#0B0D10">`.
4. Copy `code/ui/*` → `frontend/src/ui/`. Add a `/ui-lab` route rendering Button, Stepper, SetRow in all states at 360 and 1280 px.
5. Remove `react-router-dom` from the ROOT package.json (frontend owns it).
6. Set `document.documentElement.dataset.track` from the user's profile (`'pl'` or `'bb'`) in the auth/profile provider.
## Checklist
- [ ] App builds; existing screens still render (colors may look different — fine)
- [ ] /ui-lab shows components correctly at 360 and 1280
- [ ] Pinch-zoom works on phone; Barlow Condensed + Inter load
