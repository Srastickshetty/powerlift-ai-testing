# U2 — Landing page spec (implementation: code/Landing.jsx)
Goal: in 5 seconds a visitor knows "a coach in your pocket for powerlifting or bodybuilding, with real coaches available" → click **Start free**.
1. **Nav** (sticky, blur): logo · How it works · Tracks · Coaches · Pricing · [Log in] [Start free]. Mobile: logo + Start free + menu.
2. **Hero**: "Train like you have a coach standing next to you." Sub + CTAs. **Track switch (Powerlifting | Bodybuilding)** changes accent, copy, phone preview. CSS-built phone mockup of workout mode (no images → fast LCP).
3. **Trust strip**: Free to start · Works offline in the gym · Your data stays yours (no fake logos).
4. **Two tracks** cards (PL: e1RM, peaking, attempts, DOTS · BB: volume per muscle, mesocycles, photos, nutrition).
5. **How it works** (4 steps). 6. **Feature grid** (6). 7. **Coach section** + "I'm a coach". 8. **Pricing** Free/Pro/Coaching (placeholder prices; TEST MODE note). 9. **FAQ** (6). 10. **Final CTA + footer**.
Rules: no invented stats/testimonials (use `TODO_REAL_PROOF`), alt text, Lighthouse ≥ 90, LCP < 2.5 s, respect reduced motion.
