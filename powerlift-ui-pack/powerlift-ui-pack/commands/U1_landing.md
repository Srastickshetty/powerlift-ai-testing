# U1 — Landing page. Read: docs-ui/U2_LANDING_SPEC.md
1. Back up old `src/pages/Landing.jsx` to `/legacy`. Replace with `code/Landing.jsx`.
2. Verify route names (`/login`, `/register`, `/privacy`, `/terms`) exist; create simple Privacy/Terms placeholder pages if missing. If the user is already logged in, redirect `/` → `/today` (athlete) or `/roster` (coach).
3. Keep the track switch; make Register accept `?role=coach` and `?track=pl|bb` (preselect track).
4. Replace placeholder copy only with TRUE statements. Leave `TODO_REAL_PROOF` / `TODO_REAL_PRICES` markers until real data exists. Update footer email.
5. Add `<title>`, meta description, OG tags, favicon, `lang="en"`.
## Checklist
- [ ] Looks right at 360, 768, 1280; no horizontal scroll; hamburger menu works
- [ ] Track switch changes accent + copy + phone preview
- [ ] Lighthouse mobile: perf ≥ 90, a11y ≥ 95, SEO ≥ 90; LCP < 2.5 s
