import React from "react";
import { Link } from "react-router-dom";
import { Award, Menu, X } from "lucide-react";

export default function LandingHeader({ track, setTrack, open, setOpen, onApplyCoach, nav }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md pt-safe">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="num text-2xl font-bold tracking-tight">
            POWERLIFT<span className="text-accent">AI</span>
          </Link>
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-accent/15 border border-accent/30 text-accent">
            {track === "pl" ? "SBD Engine" : "Hypertrophy OS"}
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted" aria-label="Main Navigation">
          {nav.map(([h, l]) => (
            <a key={h} href={h} className="hover:text-ink transition min-h-[44px] flex items-center">{l}</a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onApplyCoach}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-accent/40 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-bold transition min-h-[44px]"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Apply as Coach</span>
          </button>

          <Link to="/login" className="hidden sm:inline-flex items-center px-3.5 py-2 text-xs font-semibold text-muted hover:text-ink transition min-h-[44px]">
            Log in
          </Link>

          <Link
            to={`/register?track=${track}`}
            className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-xs font-bold text-accent-ink hover:brightness-110 active:scale-95 transition min-h-[44px]"
          >
            Start Free
          </Link>

          <button
            type="button"
            className="grid h-11 w-11 place-items-center md:hidden text-ink rounded-lg hover:bg-raised"
            onClick={() => setOpen(!open)}
            aria-label="Toggle Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line px-4 py-4 bg-surface md:hidden space-y-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 pb-2 border-b border-line">
            <span className="text-xs text-muted">Track:</span>
            <button
              type="button"
              onClick={() => setTrack("pl")}
              className={`px-3 py-1 rounded text-xs font-bold ${track === "pl" ? "bg-accent text-accent-ink" : "bg-raised text-muted"}`}
            >
              Powerlifting
            </button>
            <button
              type="button"
              onClick={() => setTrack("bb")}
              className={`px-3 py-1 rounded text-xs font-bold ${track === "bb" ? "bg-accent text-accent-ink" : "bg-raised text-muted"}`}
            >
              Bodybuilding
            </button>
          </div>
          {nav.map(([h, l]) => (
            <a key={h} href={h} onClick={() => setOpen(false)} className="block py-2 text-sm text-muted hover:text-ink font-medium">
              {l}
            </a>
          ))}
          <div className="pt-2 border-t border-line flex flex-col gap-2">
            <button
              type="button"
              onClick={() => { setOpen(false); onApplyCoach(); }}
              className="w-full text-center py-2.5 rounded-lg border border-accent/40 bg-accent/10 text-accent font-bold text-xs"
            >
              Apply as Coach
            </button>
            <Link to="/login" onClick={() => setOpen(false)} className="w-full text-center py-2.5 rounded-lg border border-line text-xs font-semibold text-muted">
              Athlete / Coach Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
