# U6 — Polish & QA
1. Visual QA at 360×800, 412×915, 768×1024, 1280×800, 1920×1080, plus landscape phone; fix overflow, clipped text, tap targets < 44 px.
2. Add axe accessibility test in CI; fix all serious/critical.
3. Performance: route-level lazy loading, image/video lazy, bundle < 200 KB gz per route, Lighthouse mobile ≥ 90.
4. States audit: every screen has skeleton / empty / error / offline; toast + undo patterns consistent.
5. Light theme check (`data-theme="light"`), reduced-motion check, 200% zoom check.
6. Delete dead UI (old dashboards, duplicate pages, unused keyframes) after a parity checklist; list what was removed.
7. Playwright screenshots of key screens at 3 widths as visual-regression baseline.
## Checklist
- [ ] Zero horizontal scroll across all screens/widths
- [ ] Lighthouse mobile perf ≥ 90, a11y ≥ 95, PWA pass
- [ ] Old dashboards removed; no raw hex colors left (lint)
