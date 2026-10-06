import React, { useState } from "react";
import Button from "../ui/Button";
import Stepper from "../ui/Stepper";
import SetRow from "../ui/SetRow";
import UiStatesShowcase from "../components/ui-lab/UiStatesShowcase";

export default function UiLab() {
  const [track, setTrack] = useState("pl");
  const [theme, setTheme] = useState("dark");
  const [stepperVal, setStepperVal] = useState(100);
  const [repsVal, setRepsVal] = useState(5);

  const [activeSet, setActiveSet] = useState({
    type: "Working",
    weight: 140,
    reps: 5,
    rpe: 8,
    target: "140 × 5 @ 7.5",
    done: false
  });

  const [completedSet] = useState({
    type: "Warm-up",
    weight: 100,
    reps: 5,
    rpe: 6,
    target: "100 × 5",
    done: true
  });

  const [upcomingSet] = useState({
    type: "Back-off",
    weight: 125,
    reps: 6,
    rpe: null,
    target: "125 × 6 @ 7",
    done: false
  });

  const handleTrackChange = (t) => {
    setTrack(t);
    document.documentElement.dataset.track = t;
  };

  const handleThemeChange = (thm) => {
    setTheme(thm);
    document.documentElement.dataset.theme = thm;
  };

  return (
    <div className="min-h-screen bg-bg text-ink p-4 md:p-8 font-sans">
      <div className="max-w-screen-xl mx-auto space-y-8">
        {/* Header & Controls */}
        <header className="border-b border-line pb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="num text-3xl font-bold tracking-tight">
              POWERLIFT<span className="text-accent">AI</span> UI LAB
            </h1>
            <p className="text-sm text-muted">Visual test suite for design tokens and component primitives.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border border-line bg-raised p-1 text-xs">
              <button
                type="button"
                onClick={() => handleTrackChange("pl")}
                className={`px-3 py-1.5 rounded font-semibold transition ${track === "pl" ? "bg-accent text-accent-ink" : "text-muted hover:text-ink"}`}
              >
                PL (Red)
              </button>
              <button
                type="button"
                onClick={() => handleTrackChange("bb")}
                className={`px-3 py-1.5 rounded font-semibold transition ${track === "bb" ? "bg-accent text-accent-ink" : "text-muted hover:text-ink"}`}
              >
                BB (Teal)
              </button>
            </div>

            <div className="flex items-center rounded-md border border-line bg-raised p-1 text-xs">
              <button
                type="button"
                onClick={() => handleThemeChange("dark")}
                className={`px-3 py-1.5 rounded font-semibold transition ${theme === "dark" ? "bg-line text-ink" : "text-muted hover:text-ink"}`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange("light")}
                className={`px-3 py-1.5 rounded font-semibold transition ${theme === "light" ? "bg-white text-black shadow-sm" : "text-muted hover:text-ink"}`}
              >
                Light
              </button>
            </div>
          </div>
        </header>

        {/* Dual Viewports: 360px Mobile Frame vs Responsive Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Mobile Preview Frame (360px) */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="text-xs uppercase font-bold text-muted mb-2 tracking-wider">Mobile Viewport (360px)</div>
            <div className="w-[360px] max-w-full rounded-2xl border border-line bg-surface p-4 shadow-xl space-y-6">
              <div>
                <h2 className="text-xs uppercase tracking-wider text-muted mb-2">Buttons (44px & 56px)</h2>
                <div className="flex flex-col gap-2">
                  <Button variant="primary" size="md">Primary Button</Button>
                  <Button variant="secondary" size="md">Secondary Button</Button>
                  <Button variant="primary" size="lg">Large Gym CTA (56px)</Button>
                </div>
              </div>

              <div>
                <h2 className="text-xs uppercase tracking-wider text-muted mb-2">Stepper (Long-press)</h2>
                <div className="bg-bg p-3 rounded-lg border border-line flex justify-center">
                  <Stepper label="Barbell Weight" unit="kg" value={stepperVal} step={2.5} onChange={setStepperVal} />
                </div>
              </div>

              <div>
                <h2 className="text-xs uppercase tracking-wider text-muted mb-2">SetRow States</h2>
                <div className="space-y-3">
                  <SetRow idx={0} set={completedSet} active={false} />
                  <SetRow
                    idx={1}
                    set={activeSet}
                    active={true}
                    onChange={(patch) => setActiveSet(prev => ({ ...prev, ...patch }))}
                    onDone={() => setActiveSet(prev => ({ ...prev, done: true }))}
                  />
                  <SetRow idx={2} set={upcomingSet} active={false} />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Full-width Gallery */}
          <div className="lg:col-span-8 space-y-8">
            <div className="text-xs uppercase font-bold text-muted mb-2 tracking-wider">Component Primitives Showcase (Desktop)</div>

            {/* Buttons Matrix */}
            <section className="rounded-xl border border-line bg-surface p-6 space-y-4">
              <h2 className="num text-xl font-bold">1. Button Matrix</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <span className="text-xs text-muted block">Primary</span>
                  <Button variant="primary" size="md" className="w-full">Confirm Set</Button>
                  <Button variant="primary" size="lg" className="w-full">Start Session</Button>
                </div>
                <div className="space-y-2">
                  <span className="text-xs text-muted block">Secondary</span>
                  <Button variant="secondary" size="md" className="w-full">Plate Math</Button>
                  <Button variant="secondary" size="lg" className="w-full">Change Exercise</Button>
                </div>
                <div className="space-y-2">
                  <span className="text-xs text-muted block">Ghost</span>
                  <Button variant="ghost" size="md" className="w-full">Skip Set</Button>
                  <Button variant="ghost" size="lg" className="w-full">Cancel</Button>
                </div>
                <div className="space-y-2">
                  <span className="text-xs text-muted block">Danger & Disabled</span>
                  <Button variant="danger" size="md" className="w-full">Abort</Button>
                  <Button variant="primary" size="md" disabled className="w-full">Disabled</Button>
                </div>
              </div>
            </section>

            {/* Steppers Matrix */}
            <section className="rounded-xl border border-line bg-surface p-6 space-y-4">
              <h2 className="num text-xl font-bold">2. Gym Steppers</h2>
              <div className="flex flex-wrap items-center justify-around gap-6 bg-bg p-6 rounded-lg border border-line">
                <Stepper label="Squat Load" unit="kg" value={stepperVal} step={2.5} onChange={setStepperVal} />
                <Stepper label="Prescribed Reps" value={repsVal} step={1} inputMode="numeric" onChange={setRepsVal} />
              </div>
            </section>

            {/* SetRow Interactive Preview */}
            <section className="rounded-xl border border-line bg-surface p-6 space-y-4">
              <h2 className="num text-xl font-bold">3. Workout Set Logging (Active vs Inactive)</h2>
              <div className="space-y-3">
                <SetRow idx={0} set={completedSet} active={false} />
                <SetRow
                  idx={1}
                  set={activeSet}
                  active={true}
                  onChange={(patch) => setActiveSet(prev => ({ ...prev, ...patch }))}
                  onDone={() => alert("Set logged successfully with haptic feedback!")}
                />
                <SetRow idx={2} set={upcomingSet} active={false} />
              </div>
            </section>

            {/* UI States Suite (10 Production States) */}
            <section className="rounded-xl border border-line bg-surface p-6 space-y-4">
              <div>
                <h2 className="num text-xl font-bold">4. Complete UI States Matrix</h2>
                <p className="text-xs text-muted">
                  Interactive state test suite: Empty, Loading, Error, Offline, Slow Network, No Search Results, Permission Denied, Session Expired, Form Validation, and Success State.
                </p>
              </div>
              <UiStatesShowcase />
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
