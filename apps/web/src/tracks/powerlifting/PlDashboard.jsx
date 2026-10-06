import React, { useState } from 'react';
import { Trophy, Target, Shield, Flame, Activity, ChevronRight, BarChart2 } from 'lucide-react';
import Stat from '../../ui/Stat';
import Button from '../../ui/Button';
import AttemptPlannerView from './AttemptPlannerView';
import MeetDayMode from './MeetDayMode';
import PlPointsView from './PlPointsView';
import { useAuth } from '../../auth/authContext';

export default function PlDashboard({ profile: propProfile, user: propUser }) {
  const auth = useAuth();
  const profile = propProfile || auth?.profile;
  const user = propUser || auth?.user;
  const [activeSubTab, setActiveSubTab] = useState('overview');

  const squatMax = profile?.squat || profile?.training_max?.squat || 185;
  const benchMax = profile?.bench || profile?.training_max?.bench || 125;
  const deadliftMax = profile?.deadlift || profile?.training_max?.deadlift || 225;
  const totalMax = squatMax + benchMax + deadliftMax;

  return (
    <div className="space-y-6">
      {/* Track Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-accent/10 border border-accent/20 px-2 py-0.5 text-[10px] font-mono font-bold text-accent uppercase">
              Track: Powerlifting
            </span>
            <span className="text-xs text-muted">IPF / USAPL Ruleset</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink mt-1">Powerlifting War Room</h1>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-surface p-1 text-xs">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'attempts', label: 'Attempt Planner' },
            { id: 'meet', label: 'Meet Day' },
            { id: 'points', label: 'DOTS / Points' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                activeSubTab === tab.id
                  ? 'bg-accent text-bg font-bold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subtab Views */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* SBD Big Lifts Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat
              label="Squat 1RM"
              value={squatMax}
              unit="kg"
              change="+5 kg this block"
              changeType="ok"
            />
            <Stat
              label="Bench Press 1RM"
              value={benchMax}
              unit="kg"
              change="+2.5 kg this block"
              changeType="ok"
            />
            <Stat
              label="Deadlift 1RM"
              value={deadliftMax}
              unit="kg"
              change="+7.5 kg this block"
              changeType="ok"
            />
            <Stat
              label="Competition Total"
              value={totalMax}
              unit="kg"
              change="Qualifying Total"
            />
          </div>

          {/* Quick Access Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveSubTab('attempts')}
              className="rounded-xl border border-line bg-surface p-5 cursor-pointer hover:border-accent/40 transition space-y-2"
            >
              <div className="h-9 w-9 rounded-lg bg-raised border border-line grid place-items-center text-accent">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-ink">9-for-9 Attempt Planner</h3>
              <p className="text-xs text-muted leading-relaxed">
                Opener, builder, and PR third attempt selection with automatic plate rounding.
              </p>
            </div>

            <div
              onClick={() => setActiveSubTab('meet')}
              className="rounded-xl border border-line bg-surface p-5 cursor-pointer hover:border-accent/40 transition space-y-2"
            >
              <div className="h-9 w-9 rounded-lg bg-raised border border-line grid place-items-center text-ok">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-ink">Meet Day Mode</h3>
              <p className="text-xs text-muted leading-relaxed">
                Live flight attempt tracking, white lights tally, and platform referee commands.
              </p>
            </div>

            <div
              onClick={() => setActiveSubTab('points')}
              className="rounded-xl border border-line bg-surface p-5 cursor-pointer hover:border-accent/40 transition space-y-2"
            >
              <div className="h-9 w-9 rounded-lg bg-raised border border-line grid place-items-center text-accent">
                <BarChart2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-ink">DOTS &amp; IPF GL Scoring</h3>
              <p className="text-xs text-muted leading-relaxed">
                Calculate relative coefficient scores and verify national classification status.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'attempts' && (
        <AttemptPlannerView
          defaultSquat={squatMax}
          defaultBench={benchMax}
          defaultDeadlift={deadliftMax}
        />
      )}

      {activeSubTab === 'meet' && (
        <MeetDayMode
          bodyweight={profile?.bodyweight || 83}
          gender={profile?.sex || 'male'}
        />
      )}

      {activeSubTab === 'points' && (
        <PlPointsView
          defaultBw={profile?.bodyweight || 83}
          defaultTotal={totalMax}
          defaultGender={profile?.sex || 'male'}
        />
      )}
    </div>
  );
}
