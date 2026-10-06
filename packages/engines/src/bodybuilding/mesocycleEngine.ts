/**
 * @powerlift/engines/bodybuilding/mesocycleEngine
 * Builds 4 to 6-week hypertrophy mesocycles with systematic RIR ramping and deload week.
 * Pure deterministic calculations.
 */

export interface MesoWeekConfig {
  weekNumber: number;
  totalWeeks: number;
  phaseName: string;
  targetRir: number;
  setModifier: number;      // e.g. 0, +1, +2
  loadModifier: number;     // e.g. 1.0, 1.025, 0.85
  isDeload: boolean;
  focusRationale: string;
}

export function generateMesocycleSchedule(totalWeeks = 5): MesoWeekConfig[] {
  const weeks: MesoWeekConfig[] = [];

  for (let w = 1; w <= totalWeeks; w++) {
    if (w === totalWeeks) {
      // Deload week
      weeks.push({
        weekNumber: w,
        totalWeeks,
        phaseName: 'Active Resensitization Deload',
        targetRir: 4,
        setModifier: -1,
        loadModifier: 0.85,
        isDeload: true,
        focusRationale: 'Reduce volume by ~40% and stay 4 RIR to clear systemic fatigue and restore anabolic sensitivity.'
      });
    } else if (w === 1) {
      weeks.push({
        weekNumber: 1,
        totalWeeks,
        phaseName: 'MEV Base / Movement Acclimation',
        targetRir: 3,
        setModifier: 0,
        loadModifier: 1.0,
        isDeload: false,
        focusRationale: 'Establish pristine mind-muscle connection and baseline pump at 3 RIR.'
      });
    } else if (w === totalWeeks - 1) {
      weeks.push({
        weekNumber: w,
        totalWeeks,
        phaseName: 'Peak Hypertrophy Overload (Near MRV)',
        targetRir: 1,
        setModifier: 2,
        loadModifier: 1.05,
        isDeload: false,
        focusRationale: 'Maximum adaptive stimulus at 1 RIR with final volume bump prior to scheduled deload.'
      });
    } else {
      weeks.push({
        weekNumber: w,
        totalWeeks,
        phaseName: `Progressive Overload Wave ${w - 1}`,
        targetRir: 2,
        setModifier: 1,
        loadModifier: 1.025,
        isDeload: false,
        focusRationale: 'Progressive tension overload at 2 RIR with +1 set per target muscle.'
      });
    }
  }

  return weeks;
}
