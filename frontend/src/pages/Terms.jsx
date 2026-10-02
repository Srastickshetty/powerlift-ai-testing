import React from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-bg text-ink px-4 py-12 md:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="border-b border-line pb-6 flex items-center justify-between">
          <Link to="/" className="num text-2xl font-bold tracking-wide">
            POWERLIFT<span className="text-accent">AI</span>
          </Link>
          <Link to="/">
            <Button variant="secondary" size="md">Back to Home</Button>
          </Link>
        </header>

        <main className="space-y-6">
          <h1 className="num text-4xl font-bold">Terms of Service</h1>
          <p className="text-sm text-muted">Last updated: October 2026</p>

          <section className="space-y-3">
            <h2 className="num text-2xl font-semibold">1. Training Guidance & Liability Disclaimer</h2>
            <p className="text-muted leading-relaxed">
              PowerLift AI provides automated algorithmic weight training recommendations and tools. Resistance training carries inherent risks of physical injury. All programs are guidance, not medical prescriptions. Always consult a physician prior to heavy physical exertion.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="num text-2xl font-semibold">2. Account Responsibility</h2>
            <p className="text-muted leading-relaxed">
              You are responsible for maintaining the confidentiality of your login credentials. Accurate logging of fatigue and joint pain helps the system prevent dangerous load increases.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="num text-2xl font-semibold">3. Subscriptions & Beta Test Mode</h2>
            <p className="text-muted leading-relaxed">
              During the initial evaluation phases, advanced AI features may be available under test mode without live billing charges.
            </p>
          </section>
        </main>

        <footer className="border-t border-line pt-6 text-sm text-muted">
          <p>© PowerLift AI. Training guidance only — not medical advice.</p>
        </footer>
      </div>
    </div>
  );
}
