import React, { useState } from 'react';
import { Layers, Utensils, Scale, Flame, Activity, Sparkles, ChevronRight } from 'lucide-react';
import Stat from '../../ui/Stat';
import VolumeRadarView from './VolumeRadarView';
import IndianNutritionView from './IndianNutritionView';
import BodyweightTrendView from './BodyweightTrendView';
import { useAuth } from '../../auth/authContext';

export default function BbDashboard({ profile: propProfile, user: propUser }) {
  const auth = useAuth();
  const profile = propProfile || auth?.profile;
  const user = propUser || auth?.user;
  const [activeSubTab, setActiveSubTab] = useState('overview');

  const division = profile?.division || 'Men\'s Physique';
  const goal = profile?.goal || 'Hypertrophy';
  const targetWeight = profile?.targetBodyweight || 75;

  return (
    <div className="space-y-6">
      {/* Track Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-accent/10 border border-accent/20 px-2 py-0.5 text-[10px] font-mono font-bold text-accent uppercase">
              Track: Bodybuilding
            </span>
            <span className="text-xs text-muted">Hypertrophy &amp; Aesthetics Realm</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink mt-1">Physique Command Center</h1>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-surface p-1 text-xs">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'radar', label: 'Volume Radar' },
            { id: 'nutrition', label: 'Desi Nutrition' },
            { id: 'weight', label: 'Bodyweight Rate' }
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
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat
              label="Competitive Division"
              value={division}
              unit=""
              change="Target Stage"
            />
            <Stat
              label="Primary Goal"
              value={goal.toUpperCase()}
              unit=""
              change="Mesocycle 2"
              changeType="ok"
            />
            <Stat
              label="Target Scale Weight"
              value={targetWeight}
              unit="kg"
              change="Lean Mass Target"
            />
            <Stat
              label="Weekly Sets"
              value="116"
              unit="sets"
              change="Optimal MAV Range"
              changeType="ok"
            />
          </div>

          {/* Quick Access Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveSubTab('radar')}
              className="rounded-xl border border-line bg-surface p-5 cursor-pointer hover:border-accent/40 transition space-y-2"
            >
              <div className="h-9 w-9 rounded-lg bg-raised border border-line grid place-items-center text-accent">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-ink">Volume Radar (MV/MEV/MAV/MRV)</h3>
              <p className="text-xs text-muted leading-relaxed">
                Visual analysis of weekly hard sets per muscle group against scientific landmarks.
              </p>
            </div>

            <div
              onClick={() => setActiveSubTab('nutrition')}
              className="rounded-xl border border-line bg-surface p-5 cursor-pointer hover:border-accent/40 transition space-y-2"
            >
              <div className="h-9 w-9 rounded-lg bg-raised border border-line grid place-items-center text-ok">
                <Utensils className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-ink">Desi Nutrition &amp; Budget Engine</h3>
              <p className="text-xs text-muted leading-relaxed">
                Indian protein staples (soya, paneer, sattu, eggs, curd) calibrated to your INR budget.
              </p>
            </div>

            <div
              onClick={() => setActiveSubTab('weight')}
              className="rounded-xl border border-line bg-surface p-5 cursor-pointer hover:border-accent/40 transition space-y-2"
            >
              <div className="h-9 w-9 rounded-lg bg-raised border border-line grid place-items-center text-accent">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-ink">7-Day Bodyweight Rate</h3>
              <p className="text-xs text-muted leading-relaxed">
                Filtered rolling averages to distinguish genuine fat loss from daily hydration noise.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'radar' && <VolumeRadarView />}
      {activeSubTab === 'nutrition' && <IndianNutritionView defaultBw={profile?.bodyweight || 75} />}
      {activeSubTab === 'weight' && <BodyweightTrendView defaultGoal="cut" />}
    </div>
  );
}
