# AGENTS_UI.md — UI rules (append to AGENTS.md)
1. **Mobile-first.** Build at 360 px, then scale up at `md` 768 and `lg` 1024/1280. Never ship a screen that scrolls sideways.
2. **Tokens only.** Colors/spacing/radius come from `tokens.css` via Tailwind theme names (`bg-surface`, `text-muted`, `text-accent`). No raw hex, no inline `style={{}}` for color/spacing.
3. **One component per job, < 300 lines.** Reuse `src/ui/*`. Don't create a new button/card/modal style.
4. **Touch targets ≥ 44 px** (≥ 56 px in workout mode). Inputs ≥ 16 px font (stops iOS zoom). Numeric fields use `inputMode="decimal|numeric"`.
5. **Do not disable zoom.** Never use `maximum-scale` / `user-scalable=no`.
6. **Every screen has loading (skeleton), empty, error, offline states.**
7. **Navigation**: bottom tab bar < `lg`, left rail ≥ `lg`. Max 5 primary destinations. No search-in-sidebar mega menus for athletes.
8. **Safe areas**: use `pb-safe`/`pt-safe` utilities on fixed bars.
9. **Motion** ≤ 200 ms, respects `prefers-reduced-motion`. No decorative animation in workout mode.
10. **Copy**: direct coach tone, no "TITAN OS" jargon, no hype, no fake stats/testimonials.
11. Before finishing a task: check 360×800, 768×1024, 1280×800 and report any screen that fails.
