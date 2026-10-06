import React from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

export default function Privacy() {
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
          <h1 className="num text-4xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-muted">Last updated: October 2026</p>

          <section className="space-y-3">
            <h2 className="num text-2xl font-semibold">1. Your Data Stays Yours</h2>
            <p className="text-muted leading-relaxed">
              PowerLift AI collects workout logs, exercise performance metrics (weight, reps, RPE), and optional physical check-in data solely for the purpose of calculating your training autoregulation, progression, and coach reviews.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="num text-2xl font-semibold">2. Coach Access Control</h2>
            <p className="text-muted leading-relaxed">
              If you link with a verified coach, they receive read and review access to your workout logs, check-ins, and media. You may terminate a coach relationship at any time from your profile settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="num text-2xl font-semibold">3. Storage & Security</h2>
            <p className="text-muted leading-relaxed">
              Your credentials and sensitive profile information are authenticated securely. We do not sell or monetize personal athlete data.
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
