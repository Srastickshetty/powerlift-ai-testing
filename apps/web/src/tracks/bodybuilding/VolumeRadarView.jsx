import React, { useState, useMemo } from 'react';
import { Layers, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { evaluateVolumeRadar, VOLUME_LANDMARKS } from '@powerlift/engines';

export default function VolumeRadarView() {
  const [actualSets, setActualSets] = useState({
    chest: 16,
    back: 18,
    quads: 14,
    hamstrings: 10,
    side_delts: 18,
    rear_delts: 12,
    triceps: 10,
    biceps: 12,
    calves: 8,
    abs: 6
  });

  const radarEvaluations = useMemo(() => {
    return evaluateVolumeRadar(actualSets);
  }, [actualSets]);

  const updateSets = (muscle, delta) => {
    setActualSets((prev) => ({
      ...prev,
      [muscle]: Math.max(0, (prev[muscle] || 0) + delta)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <h2 className="text-xl font-bold text-ink flex items-center gap-2">
            <Layers className="h-5 w-5 text-accent" />
            <span>Hypertrophy Volume Radar</span>
          </h2>
          <span className="text-xs text-muted block mt-0.5">
            Weekly hard sets tracked against Israetel &amp; Schoenfeld landmarks (MV, MEV, MAV, MRV)
          </span>
        </div>
      </div>

      {/* Muscle Volume Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {radarEvaluations.map((evalItem) => {
          const { muscle, completedSets, landmarks, status } = evalItem;
          const pctOfMrv = Math.min(100, Math.round((completedSets / landmarks.mrv) * 100));

          let badgeColor = 'bg-accent/10 border-accent/30 text-accent';
          let barColor = 'bg-accent';

          if (status === 'below_mev') {
            badgeColor = 'bg-muted/10 border-line text-muted';
            barColor = 'bg-muted';
          } else if (status === 'optimal_mav') {
            badgeColor = 'bg-ok/10 border-ok/30 text-ok';
            barColor = 'bg-ok';
          } else if (status === 'near_mrv') {
            badgeColor = 'bg-warn/10 border-warn/30 text-warn';
            barColor = 'bg-warn';
          } else if (status === 'exceeded_mrv') {
            badgeColor = 'bg-warn/20 border-warn text-warn';
            barColor = 'bg-warn';
          }

          return (
            <div key={muscle} className="rounded-xl border border-line bg-surface p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold uppercase tracking-wider text-ink">
                    {muscle.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-muted block">
                    MEV: {landmarks.mev} · MAV: {landmarks.mavMin}–{landmarks.mavMax} · MRV: {landmarks.mrv}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded border border-line bg-bg">
                    <button
                      type="button"
                      onClick={() => updateSets(muscle, -1)}
                      className="px-2 py-1 text-xs text-muted hover:text-ink font-bold"
                    >
                      -
                    </button>
                    <span className="num px-2 text-xs font-bold text-ink">{completedSets}</span>
                    <button
                      type="button"
                      onClick={() => updateSets(muscle, 1)}
                      className="px-2 py-1 text-xs text-muted hover:text-ink font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${badgeColor}`}>
                    {status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-bg border border-line overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${barColor}`}
                  style={{ width: `${pctOfMrv}%` }}
                />
              </div>

              <p className="text-xs text-muted leading-relaxed">
                {evalItem.statusMessage}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
