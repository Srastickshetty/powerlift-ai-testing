import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Flame, WifiOff, Dumbbell, Award, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../auth/authContext";
import { TRACKS, STEPS, FEATURES, FAQ, PLANS } from "./landing/landingData";
import PhonePreview from "./landing/PhonePreview";
import LandingHeader from "./landing/LandingHeader";
import TrackComparison from "./landing/TrackComparison";
import CoachApplicationModal from "../components/coach/CoachApplicationModal";

export default function Landing() {
  const { user, profile } = useAuth();
  const [track, setTrack] = useState("pl");
  const [open, setOpen] = useState(false);
  const [coachModalOpen, setCoachModalOpen] = useState(false);
  const t = TRACKS[track];

  useEffect(() => {
    document.documentElement.dataset.track = track;
    return () => {
      const fallback = profile?.track === "bb" || profile?.track === "bodybuilding" || profile?.track === "BODYBUILDING" ? "bb" : "pl";
      document.documentElement.dataset.track = fallback;
    };
  }, [track, profile]);

  if (user && profile !== undefined) {
    if (profile?.role === "admin" || profile?.email?.toLowerCase().includes("admin")) {
      return <Navigate to="/admin" replace />;
    }
    if (profile?.role === "coach" || profile?.email?.toLowerCase().includes("coach")) {
      return <Navigate to="/roster" replace />;
    }
    return <Navigate to="/today" replace />;
  }

  const nav = [
    ["#tracks", "Disciplines"],
    ["#how", "How it works"],
    ["#coaches", "Coaches"],
    ["#pricing", "Pricing"]
  ];

  return (
    <div className="min-h-dvh bg-bg text-ink font-sans selection:bg-accent selection:text-accent-ink">
      <LandingHeader
        track={track}
        setTrack={setTrack}
        open={open}
        setOpen={setOpen}
        onApplyCoach={() => setCoachModalOpen(true)}
        nav={nav}
      />

      <main>
        {/* Hero Section */}
        <section className="mx-auto grid max-w-screen-xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
          <div>
            <div className="mb-6 inline-flex p-1 rounded-xl border border-line bg-surface shadow-inner">
              {Object.entries(TRACKS).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTrack(k)}
                  className={`h-11 px-5 rounded-lg text-xs font-bold transition flex items-center gap-2 min-h-[44px] ${
                    track === k ? "bg-accent text-accent-ink shadow-md" : "text-muted hover:text-ink"
                  }`}
                >
                  {k === "pl" ? <Dumbbell className="w-3.5 h-3.5" /> : <Flame className="w-3.5 h-3.5" />}
                  <span>{v.name} Track</span>
                </button>
              ))}
            </div>

            <h1 className="num text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-ink">
              Elite programming, live autoregulation, <span className="text-accent">built for results.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base sm:text-lg text-muted leading-relaxed">
              <strong className="text-ink font-semibold">{t.head}</strong> {t.sub} Train with AI precision or connect seamlessly with human coaches.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to={`/register?track=${track}`}
                className="inline-flex h-12 sm:h-14 items-center justify-center rounded-xl bg-accent px-8 text-sm sm:text-base font-bold text-accent-ink hover:brightness-110 active:scale-98 transition shadow-lg shadow-accent/20"
              >
                Start Free Mesocycle <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <button
                type="button"
                onClick={() => setCoachModalOpen(true)}
                className="inline-flex h-12 sm:h-14 items-center justify-center rounded-xl border border-line bg-surface px-6 text-sm sm:text-base font-semibold hover:bg-raised transition"
              >
                <Award className="w-4 h-4 mr-2 text-accent" /> Coach Onboarding
              </button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm text-muted">
              <li className="flex items-center gap-1.5"><Flame className="h-4 w-4 text-accent" />Zero trial credit card required</li>
              <li className="flex items-center gap-1.5"><WifiOff className="h-4 w-4 text-accent" />Basement gym offline sync</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-accent" />Strict athlete data isolation</li>
            </ul>
          </div>
          <PhonePreview t={t} />
        </section>

        {/* Dual Track Comparison */}
        <TrackComparison />

        {/* How It Works */}
        <section id="how" className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="num text-3xl sm:text-4xl font-bold text-ink">How it works</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([h, p], i) => (
              <li key={h} className="rounded-xl border border-line bg-surface p-5 space-y-2">
                <div className="num text-3xl font-bold text-accent">0{i + 1}</div>
                <h3 className="font-bold text-ink text-sm sm:text-base">{h}</h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">{p}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Feature Cards Grid */}
        <section className="mx-auto max-w-screen-xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(([Icon, h, p]) => (
              <div key={h} className="rounded-xl border border-line bg-surface p-5 space-y-2 hover:border-line-focus transition">
                <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                <h3 className="font-bold text-ink text-sm sm:text-base">{h}</h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Coaches Section */}
        <section id="coaches" className="border-y border-line bg-surface py-16">
          <div className="mx-auto grid max-w-screen-xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8 items-center">
            <div className="space-y-4">
              <span className="font-mono text-xs uppercase tracking-wider text-accent font-bold">Vetted Coaching Network</span>
              <h2 className="num text-3xl sm:text-4xl font-bold text-ink">Are you an elite coach? Or need one in your corner?</h2>
              <p className="text-sm text-muted leading-relaxed">
                Coaches on PowerLift AI get an AI copilot handling volume accounting, plate maths, and check-in collation. Applications are strictly vetted and approved by our Superadmin.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCoachModalOpen(true)}
                  className="inline-flex h-12 items-center rounded-xl bg-accent px-6 font-bold text-xs sm:text-sm text-accent-ink hover:brightness-110 active:scale-95 transition min-h-[44px]"
                >
                  <Award className="w-4 h-4 mr-2" /> Apply as Coach
                </button>
                <Link
                  to={`/register?track=${track}`}
                  className="inline-flex h-12 items-center rounded-xl border border-line bg-raised px-6 font-semibold text-xs sm:text-sm hover:border-line-focus transition min-h-[44px]"
                >
                  Join as Athlete
                </Link>
              </div>
            </div>

            <ul className="grid gap-3 text-xs sm:text-sm sm:grid-cols-2">
              {[
                "Strict Superadmin credentials vetting",
                "Video review with timestamped form feedback",
                "Program authoring with version audit diffs",
                "Automatic injury & adherence alerts"
              ].map((x) => (
                <li key={x} className="rounded-xl border border-line bg-bg p-4 text-muted flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="num text-3xl sm:text-4xl font-bold text-ink">Transparent Pricing</h2>
          <p className="mt-1 text-xs sm:text-sm text-muted">Test mode enabled — no credit card charges required.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PLANS.map(([n, d, hot]) => (
              <div key={n} className={`rounded-xl border p-6 flex flex-col justify-between ${hot ? "border-accent bg-surface shadow-md" : "border-line bg-surface"}`}>
                <div className="space-y-2">
                  <h3 className="num text-2xl font-bold text-ink">{n}</h3>
                  <p className="text-xs sm:text-sm text-muted">{d}</p>
                </div>
                <Link
                  to={`/register?track=${track}`}
                  className={`mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg font-bold text-xs sm:text-sm transition min-h-[44px] ${
                    hot ? "bg-accent text-accent-ink hover:brightness-110" : "border border-line hover:bg-raised"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
          <h2 className="num text-3xl font-bold text-ink text-center mb-6">Frequently Answered</h2>
          <div className="divide-y divide-line rounded-xl border border-line bg-surface">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group p-4">
                <summary className="flex min-h-[44px] cursor-pointer items-center justify-between font-medium text-xs sm:text-sm text-ink select-none">
                  <span>{q}</span>
                  <span className="text-muted group-open:rotate-45 transition text-lg font-mono">+</span>
                </summary>
                <p className="pb-2 text-xs sm:text-sm text-muted mt-2 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line py-8 pb-safe text-center text-xs text-muted">
        <div className="flex justify-center gap-6">
          <Link to="/privacy" className="hover:text-ink transition">Privacy</Link>
          <Link to="/terms" className="hover:text-ink transition">Terms</Link>
          <button type="button" onClick={() => setCoachModalOpen(true)} className="hover:text-ink transition">
            Coach Portal
          </button>
        </div>
        <p className="mt-3">© PowerLift AI. Pure athletic programming — no corporate fluff.</p>
      </footer>

      {/* Coach Application Modal */}
      <CoachApplicationModal isOpen={coachModalOpen} onClose={() => setCoachModalOpen(false)} />
    </div>
  );
}