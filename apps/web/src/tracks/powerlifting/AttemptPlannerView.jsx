import React, { useState, useMemo } from 'react';
import { Target, Shield, Flame, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { generateAttemptPlan, evaluateNextAttempt } from '@powerlift/engines';
import Button from '../../ui/Button';

export default function AttemptPlannerView({ defaultSquat = 200, defaultBench = 135, defaultDeadlift = 240 }) {
  const [activeLift, setActiveLift] = useState('squat');
  const [strategy, setStrategy] = useState('balanced');
  const [targets, setTargets] = useState({
    squat: defaultSquat,
    bench: defaultBench,
    deadlift: defaultDeadlift
  });

  // Live platform decision state
  const [lastLoad, setLastLoad] = useState(180);
  const [lastRpe, setLastRpe] = useState(8.0);
  const [isGoodLift, setIsGoodLift] = useState(true);
  const [missReason, setMissReason] = useState('strength');

  const currentGoalKg = targets[activeLift];
  const attemptPlan = useMemo(() => {
    return generateAttemptPlan(currentGoalKg, strategy);
  }, [currentGoalKg, strategy]);

  const liveEvaluation = useMemo(() => {
    return evaluateNextAttempt({
      lastAttemptKg: Number(lastLoad) || 0,
      lastAttemptRpe: Number(lastRpe) || 8,
      isGoodLift,
      missReason,
      targetThirdMaxKg: currentGoalKg
    });
  }, [lastLoad, lastRpe, isGoodLift, missReason, currentGoalKg]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h2 className="text-xl font-bold text-ink flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            <span>Platform Attempt Planner</span>
          </h2>
          <span className="text-xs text-muted block mt-0.5">
            9-for-9 strategic attempt selection &amp; tactical platform decision engine
          </span>
        </div>

        {/* Lift Selector */}
        <div className="flex rounded-lg border border-line bg-surface p-1 text-xs font-semibold">
          {['squat', 'bench', 'deadlift'].map((lift) => (
            <button
              key={lift}
              type="button"
              onClick={() => {
                setActiveLift(lift);
                setLastLoad(Math.round(targets[lift] * 0.91 / 2.5) * 2.5);
              }}
              className={`px-3 py-1.5 rounded uppercase transition ${
                activeLift === lift ? 'bg-accent text-bg font-bold' : 'text-muted hover:text-ink'
              }`}
            >
              {lift}
            </button>
          ))}
        </div>
      </div>

      {/* Target & Strategy Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-line bg-surface p-4 space-y-2">
          <label htmlFor="goal-input" className="text-xs font-mono uppercase text-muted block">
            Target 3rd Attempt Goal (kg)
          </label>
          <input
            id="goal-input"
            type="number"
            inputMode="decimal"
            value={targets[activeLift]}
            onChange={(e) => setTargets({ ...targets, [activeLift]: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-lg font-bold text-ink focus:border-accent focus:outline-none"
          />
        </div>

        <div className="rounded-xl border border-line bg-surface p-4 space-y-2">
          <label className="text-xs font-mono uppercase text-muted block">Tactical Strategy</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'conservative', label: '9/9 Banker' },
              { id: 'balanced', label: 'Balanced' },
              { id: 'aggressive', label: 'Medal Hunt' }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStrategy(st.id)}
                className={`py-2 px-1 text-xs rounded-lg border font-semibold transition text-center ${
                  strategy === st.id
                    ? 'border-accent bg-accent/10 text-accent font-bold'
                    : 'border-line bg-bg text-muted hover:text-ink'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Attempt Cards: 1st, 2nd, 3rd */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-line bg-surface p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-muted font-mono">
            <span>ATTEMPT 1 (OPENER)</span>
            <span className="text-ok font-bold">~91%</span>
          </div>
          <div className="num text-3xl font-black text-ink">{attemptPlan.attempt1OpenerKg} <span className="text-sm font-normal text-muted">kg</span></div>
          <p className="text-xs text-muted leading-relaxed">
            Certain 3-white-light opener. Calibrated for platform confidence.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-muted font-mono">
            <span>ATTEMPT 2 (BUILDER)</span>
            <span className="text-accent font-bold">~96%</span>
          </div>
          <div className="num text-3xl font-black text-accent">{attemptPlan.attempt2Kg} <span className="text-sm font-normal text-muted">kg</span></div>
          <p className="text-xs text-muted leading-relaxed">
            Secures platform total and establishes position on scoreboard.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-muted font-mono">
            <span>ATTEMPT 3 (MAX/PR)</span>
            <span className="text-warn font-bold">~100%</span>
          </div>
          <div className="num text-3xl font-black text-ink">{attemptPlan.attempt3Kg} <span className="text-sm font-normal text-muted">kg</span></div>
          <p className="text-xs text-muted leading-relaxed">
            All-out personal record attempt or tactical podium battle call.
          </p>
        </div>
      </div>

      {/* Live Warmup-Room Decision Engine */}
      <div className="rounded-xl border border-line bg-surface p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent" />
          <h3 className="font-bold text-ink text-base">Live Platform Decision Simulator</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-muted block mb-1">Attempt Load (kg)</label>
            <input
              type="number"
              value={lastLoad}
              onChange={(e) => setLastLoad(parseFloat(e.target.value) || 0)}
              className="w-full rounded border border-line bg-bg px-2.5 py-1.5 text-ink font-bold"
            />
          </div>
          <div>
            <label className="text-muted block mb-1">Observed RPE</label>
            <input
              type="number"
              step="0.5"
              value={lastRpe}
              onChange={(e) => setLastRpe(parseFloat(e.target.value) || 8)}
              className="w-full rounded border border-line bg-bg px-2.5 py-1.5 text-ink font-bold"
            />
          </div>
          <div>
            <label className="text-muted block mb-1">Platform Call</label>
            <button
              type="button"
              onClick={() => setIsGoodLift(!isGoodLift)}
              className={`w-full py-1.5 rounded font-bold transition text-xs border ${
                isGoodLift ? 'border-ok bg-ok/10 text-ok' : 'border-warn bg-warn/10 text-warn'
              }`}
            >
              {isGoodLift ? '3 White Lights' : 'Red Light (Miss)'}
            </button>
          </div>
          <div>
            <label className="text-muted block mb-1">Miss Cause</label>
            <select
              value={missReason}
              disabled={isGoodLift}
              onChange={(e) => setMissReason(e.target.value)}
              className="w-full rounded border border-line bg-bg px-2 py-1.5 text-ink disabled:opacity-40"
            >
              <option value="strength">Strength / Grinder</option>
              <option value="depth">Depth Call</option>
              <option value="technical">Technical Command</option>
            </select>
          </div>
        </div>

        <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 flex items-start gap-3">
          <ArrowRight className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-mono text-muted uppercase text-[10px] block">Recommended Next Call</span>
            <p className="text-sm font-bold text-ink">
              Next Attempt: <span className="text-accent">{liveEvaluation.nextAttemptKg} kg</span>
            </p>
            <p className="text-muted leading-relaxed">{liveEvaluation.rationale}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
