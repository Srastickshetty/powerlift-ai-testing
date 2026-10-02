import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, BarChart3, Dumbbell, Flame, MessageCircle, Salad, Trophy, WifiOff, Menu, X } from "lucide-react";

/** Drop-in replacement for src/pages/Landing.jsx. Routes assumed: /register, /login. Adjust if different. */
const TRACKS = {
  pl: { name: "Powerlifting", head: "Add kilos to your total.", sub: "e1RM-based programming, peaking blocks and meet attempts that adapt to every set you log.",
        lift: "Squat", target: "140 × 5 @ 7.5", w: 140, r: 5 },
  bb: { name: "Bodybuilding", head: "Build the physique, muscle by muscle.", sub: "Weekly volume per muscle, mesocycles, progress photos and nutrition that adjusts to your trend.",
        lift: "Incline DB Press", target: "32 × 10 · 2 RIR", w: 32, r: 10 },
};
const STEPS = [["Tell us about you", "Track, experience, equipment, injuries, goals."], ["Get your program", "Built for your schedule and recovery, with the reason behind every choice."],
  ["Log every set", "Two taps per set, works offline, rest timer and plate maths built in."], ["It adapts", "Next week changes from what you actually lifted. Your coach sees it too."]];
const FEATURES = [[Dumbbell, "Fast set logging", "Big steppers, RPE/RIR chips, 'as prescribed' in one tap."], [Activity, "Autoregulation", "Loads and volume adjust to your performance and readiness."],
  [BarChart3, "Progress that makes sense", "e1RM, volume, adherence and bodyweight trends with PR markers."], [Trophy, "Meet & contest tools", "Attempt planner, warm-up timing, prep phases."],
  [Salad, "Nutrition that fits you", "Targets from your trend; Indian food and budget aware."], [MessageCircle, "Real coach, optional", "Check-ins, video form review and program edits."]];
const FAQ = [["Is it for beginners?", "Yes. Beginner programs are simple and conservative; advanced options unlock as you progress."], ["Do I need a full gym?", "No. Tell us your equipment and we build around it."],
  ["Is the AI safe?", "Every program passes fixed safety rules (load jumps, volume caps, pain handling) before you see it. It is training guidance, not medical advice."],
  ["Can I switch between tracks?", "Yes. Your history carries over; you get a fresh program for the new track."], ["Is my data private?", "Your data is yours. You choose what a coach can see, and you can export or delete it."], ["Can I cancel anytime?", "Yes."]];
const PLANS = [["Free", "Core logging, a starter program, basic analytics.", false], ["Pro", "Full AI programming, autoregulation, advanced analytics.", true], ["Coaching", "A verified coach plus everything in Pro.", false]];

function Phone({ t }) {
  return (
    <div className="mx-auto w-[260px] rounded-[2rem] border border-line bg-surface p-3 shadow-2xl sm:w-[290px]" aria-hidden>
      <div className="rounded-[1.5rem] bg-bg p-4">
        <div className="flex justify-between text-xs text-muted"><span>{t.lift}</span><span>Rest 1:12</span></div>
        <div className="mt-1 text-xs text-muted">Target {t.target}</div>
        <div className="my-4 flex items-center justify-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md border border-line bg-raised text-xl">−</span>
          <span className="num text-5xl font-semibold">{t.w}</span>
          <span className="grid h-11 w-11 place-items-center rounded-md border border-line bg-raised text-xl">+</span>
        </div>
        <div className="flex justify-center gap-1.5">{[6, 7, 8, 9, 10].map((r) => <span key={r} className={`num grid h-9 w-9 place-items-center rounded-md border ${r === 8 ? "border-accent bg-accent text-accent-ink" : "border-line bg-raised"}`}>{r}</span>)}</div>
        <div className="mt-4 rounded-md bg-accent py-3 text-center font-bold text-accent-ink">✓ Log set</div>
        <div className="mt-3 space-y-1.5 text-xs text-muted"><div className="flex justify-between"><span>Set 1</span><span className="num text-ink">{t.w - 20} × {t.r}</span></div><div className="flex justify-between"><span>Set 2</span><span className="num text-ink">{t.w - 10} × {t.r}</span></div></div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [track, setTrack] = useState("pl");
  const [open, setOpen] = useState(false);
  const t = TRACKS[track];
  useEffect(() => { document.documentElement.dataset.track = track; return () => { delete document.documentElement.dataset.track; }; }, [track]);
  const nav = [["#how", "How it works"], ["#tracks", "Tracks"], ["#coaches", "Coaches"], ["#pricing", "Pricing"]];
  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur pt-safe">
        <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 md:px-6 lg:px-8">
          <Link to="/" className="num text-2xl font-bold tracking-wide">POWERLIFT<span className="text-accent">AI</span></Link>
          <nav className="hidden gap-6 text-sm text-muted md:flex" aria-label="Sections">{nav.map(([h, l]) => <a key={h} href={h} className="hover:text-ink">{l}</a>)}</nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden h-11 items-center px-3 text-sm text-muted hover:text-ink sm:flex">Log in</Link>
            <Link to="/register" className="inline-flex h-11 items-center rounded-md bg-accent px-4 text-sm font-semibold text-accent-ink">Start free</Link>
            <button className="grid h-11 w-11 place-items-center md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
          </div>
        </div>
        {open && <div className="border-t border-line px-4 py-2 md:hidden">{[...nav, ["/login", "Log in"]].map(([h, l]) => <a key={h} href={h} onClick={() => setOpen(false)} className="block py-3 text-muted">{l}</a>)}</div>}
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-screen-xl items-center gap-10 px-4 py-12 md:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          <div>
            <div role="tablist" aria-label="Choose your track" className="mb-6 inline-flex rounded-md border border-line bg-surface p-1">
              {Object.entries(TRACKS).map(([k, v]) => (
                <button key={k} role="tab" aria-selected={track === k} onClick={() => setTrack(k)}
                  className={`h-10 rounded px-4 text-sm font-semibold transition ${track === k ? "bg-accent text-accent-ink" : "text-muted"}`}>{v.name}</button>))}
            </div>
            <h1 className="num text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">Train like you have a coach <span className="text-accent">standing next to you.</span></h1>
            <p className="mt-5 max-w-xl text-lg text-muted"><strong className="text-ink">{t.head}</strong> {t.sub} Add a real coach whenever you want one.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="inline-flex h-14 items-center justify-center rounded-md bg-accent px-8 text-base font-bold text-accent-ink">Start free</Link>
              <a href="#how" className="inline-flex h-14 items-center justify-center rounded-md border border-line px-8 text-base font-semibold hover:bg-raised">See how it works</a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <li className="flex items-center gap-2"><Flame className="h-4 w-4 text-accent" />Free to start</li>
              <li className="flex items-center gap-2"><WifiOff className="h-4 w-4 text-accent" />Works offline in the gym</li>
              <li className="flex items-center gap-2"><Activity className="h-4 w-4 text-accent" />Your data stays yours</li>
            </ul>
          </div>
          <Phone t={t} />
        </section>

        {/* Tracks */}
        <section id="tracks" className="border-y border-line bg-surface py-16">
          <div className="mx-auto max-w-screen-xl px-4 md:px-6 lg:px-8">
            <h2 className="num text-4xl font-bold">Two sports. Two completely different systems.</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <article className="rounded-lg border border-line bg-bg p-6"><h3 className="num text-2xl font-semibold text-[#E5484D]">Powerlifting</h3>
                <ul className="mt-3 space-y-2 text-muted"><li>• e1RM from your RPE sets</li><li>• Linear, DUP, block and peaking models</li><li>• Weak-point variations</li><li>• Meet attempt planner, warm-up timing, DOTS / IPF GL</li></ul></article>
              <article className="rounded-lg border border-line bg-bg p-6"><h3 className="num text-2xl font-semibold text-[#19C3B1]">Bodybuilding</h3>
                <ul className="mt-3 space-y-2 text-muted"><li>• Weekly sets per muscle vs your target</li><li>• Mesocycles with RIR progression and deloads</li><li>• Measurements and progress photos</li><li>• Calories and protein that adjust to your trend</li></ul></article>
            </div>
          </div>
        </section>

        {/* How */}
        <section id="how" className="mx-auto max-w-screen-xl px-4 py-16 md:px-6 lg:px-8">
          <h2 className="num text-4xl font-bold">How it works</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([h, p], i) => <li key={h} className="rounded-lg border border-line bg-surface p-5"><div className="num text-4xl text-accent">{i + 1}</div><h3 className="mt-2 font-semibold">{h}</h3><p className="mt-1 text-sm text-muted">{p}</p></li>)}
          </ol>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-screen-xl px-4 pb-16 md:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(([Icon, h, p]) => <div key={h} className="rounded-lg border border-line bg-surface p-5"><Icon className="h-6 w-6 text-accent" aria-hidden /><h3 className="mt-3 font-semibold">{h}</h3><p className="mt-1 text-sm text-muted">{p}</p></div>)}
          </div>
        </section>

        {/* Coaches */}
        <section id="coaches" className="border-y border-line bg-surface py-16">
          <div className="mx-auto grid max-w-screen-xl gap-8 px-4 md:px-6 lg:grid-cols-2 lg:px-8">
            <div><h2 className="num text-4xl font-bold">Want a human in your corner?</h2>
              <p className="mt-3 text-muted">Hire a verified coach. They see your logs, review your check-ins and form videos, and edit your program — the AI does the grunt work, they make the calls.</p>
              <div className="mt-6 flex flex-wrap gap-3"><Link to="/register" className="inline-flex h-12 items-center rounded-md bg-accent px-6 font-semibold text-accent-ink">Find a coach</Link>
                <Link to="/register?role=coach" className="inline-flex h-12 items-center rounded-md border border-line px-6 font-semibold hover:bg-raised">I'm a coach</Link></div></div>
            <ul className="grid gap-3 text-sm sm:grid-cols-2">{["Weekly check-ins with replies", "Timestamped video feedback", "Program edits with version history", "Alerts when you miss sessions or report pain"].map((x) => <li key={x} className="rounded-md border border-line bg-bg p-4">{x}</li>)}</ul>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-screen-xl px-4 py-16 md:px-6 lg:px-8">
          <h2 className="num text-4xl font-bold">Pricing</h2>
          <p className="mt-2 text-sm text-muted">Test mode — no real charges yet. Prices to be announced. {/* TODO_REAL_PRICES */}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PLANS.map(([n, d, hot]) => <div key={n} className={`rounded-lg border p-6 ${hot ? "border-accent bg-surface" : "border-line bg-surface"}`}>
              <h3 className="num text-2xl font-semibold">{n}</h3><p className="mt-2 text-sm text-muted">{d}</p>
              <Link to="/register" className={`mt-6 inline-flex h-11 w-full items-center justify-center rounded-md font-semibold ${hot ? "bg-accent text-accent-ink" : "border border-line hover:bg-raised"}`}>Get started</Link></div>)}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 pb-16 md:px-6">
          <h2 className="num text-4xl font-bold">Questions</h2>
          <div className="mt-6 divide-y divide-line rounded-lg border border-line bg-surface">
            {FAQ.map(([q, a]) => <details key={q} className="group p-4"><summary className="flex min-h-[44px] cursor-pointer items-center justify-between font-medium">{q}<span className="text-muted group-open:rotate-45 transition">+</span></summary><p className="pb-2 text-sm text-muted">{a}</p></details>)}
          </div>
        </section>

        <section className="px-4 pb-20 text-center"><h2 className="num text-4xl font-bold sm:text-5xl">Your next session starts here.</h2>
          <Link to="/register" className="mt-6 inline-flex h-14 items-center rounded-md bg-accent px-10 text-base font-bold text-accent-ink">Start free</Link></section>
      </main>

      <footer className="border-t border-line py-8 pb-safe text-center text-sm text-muted">
        <div className="flex justify-center gap-6"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><a href="mailto:hello@example.com">Contact</a></div>
        <p className="mt-3">© PowerLift AI. Training guidance only — not medical advice.</p>
      </footer>
    </div>
  );
}
