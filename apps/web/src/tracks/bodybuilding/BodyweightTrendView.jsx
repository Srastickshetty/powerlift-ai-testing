import React, { useState, useMemo } from 'react';
import { Scale, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { evaluateBodyweightRate, calculateRollingAverage } from '@powerlift/engines';
import Stat from '../../ui/Stat';

export default function BodyweightTrendView({ defaultGoal = 'cut' }) {
  const [goal, setGoal] = useState(defaultGoal);
  const [recentWeights, setRecentWeights] = useState([74.8, 74.6, 74.5, 74.4, 74.3, 74.2, 74.1]);
  const [prevWeights] = useState([75.2, 75.1, 75.0, 74.9, 74.8, 74.9, 74.8]);
  const [newWeightInput, setNewWeightInput] = useState('');

  const evaluation = useMemo(() => {
    return evaluateBodyweightRate(recentWeights, prevWeights, goal);
  }, [recentWeights, prevWeights, goal]);

  const handleAddWeight = (e) => {
    e.preventDefault();
    const val = parseFloat(newWeightInput);
    if (!val || val <= 30 || val >= 300) return;
    setRecentWeights((prev) => [...prev.slice(1), val]);
    setNewWeightInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h2 className="text-xl font-bold text-ink flex items-center gap-2">
            <Scale className="h-5 w-5 text-accent" />
            <span>Body Composition &amp; Rate of Change</span>
          </h2>
          <span className="text-xs text-muted block mt-0.5">
            7-day rolling average filter to eliminate fluid fluctuations and water weight noise
          </span>
        </div>

        {/* Goal Selector */}
        <div className="flex rounded-lg border border-line bg-surface p-1 text-xs">
          {[
            { id: 'cut', label: 'Fat Loss (Cut)' },
            { id: 'lean_bulk', label: 'Lean Bulk' },
            { id: 'recomp', label: 'Body Recomp' }
          ].map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGoal(g.id)}
              className={`px-3 py-1.5 rounded font-semibold transition ${
                goal === g.id ? 'bg-accent text-bg font-bold' : 'text-muted hover:text-ink'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat
          label="Current 7-Day Avg"
          value={evaluation.current7DayAvgKg}
          unit="kg"
          change="True Baseline"
        />
        <Stat
          label="Previous 7-Day Avg"
          value={evaluation.previous7DayAvgKg}
          unit="kg"
          change="Week Prior"
        />
        <Stat
          label="Weekly Change"
          value={`${evaluation.weeklyDeltaKg > 0 ? '+' : ''}${evaluation.weeklyDeltaKg}`}
          unit="kg"
          change={`${evaluation.weeklyDeltaPercent}%`}
          changeType={evaluation.evaluationStatus === 'ON_TRACK' ? 'ok' : 'warn'}
        />
        <Stat
          label="Pacing Status"
          value={evaluation.evaluationStatus}
          unit=""
          change="Coach Evaluation"
          changeType={evaluation.evaluationStatus === 'ON_TRACK' ? 'ok' : 'warn'}
        />
      </div>

      {/* Coach Action Card */}
      <div className="rounded-xl border border-line bg-surface p-5 space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
          Rate of Change Directive
        </span>
        <p className="text-sm font-semibold text-ink leading-relaxed">
          {evaluation.recommendation}
        </p>
      </div>

      {/* Morning Weigh-in Logger */}
      <div className="rounded-xl border border-line bg-surface p-4">
        <form onSubmit={handleAddWeight} className="flex items-center gap-3">
          <div className="flex-1">
            <label htmlFor="morning-weight" className="text-xs text-muted block mb-1">
              Log Morning Fasted Weight (kg)
            </label>
            <input
              id="morning-weight"
              type="number"
              step="0.1"
              inputMode="decimal"
              placeholder="e.g. 74.2"
              value={newWeightInput}
              onChange={(e) => setNewWeightInput(e.target.value)}
              className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink font-bold focus:border-accent focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="mt-5 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-bg hover:opacity-90 transition"
          >
            Log Weigh-In
          </button>
        </form>
      </div>
    </div>
  );
}
