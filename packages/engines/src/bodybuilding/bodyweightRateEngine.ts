/**
 * @powerlift/engines/bodybuilding/bodyweightRateEngine
 * 7-day rolling average bodyweight analysis and weekly rate-of-change evaluation.
 * Pure deterministic calculations.
 */

export type BodyCompositionGoal = 'cut' | 'lean_bulk' | 'recomp' | 'contest_prep' | 'hypertrophy';

export interface BodyweightRateEvaluation {
  current7DayAvgKg: number;
  previous7DayAvgKg: number;
  weeklyDeltaKg: number;
  weeklyDeltaPercent: number; // e.g. -0.7% of bodyweight
  evaluationStatus: 'ON_TRACK' | 'TOO_FAST' | 'TOO_SLOW' | 'REVERSAL';
  recommendation: string;
}

export function calculateRollingAverage(weights: number[]): number {
  if (!weights || weights.length === 0) return 0;
  const valid = weights.filter((w) => typeof w === 'number' && w > 0);
  if (valid.length === 0) return 0;
  const sum = valid.reduce((a, b) => a + b, 0);
  return Math.round((sum / valid.length) * 100) / 100;
}

export function evaluateBodyweightRate(
  recent7DaysWeights: number[],
  previous7DaysWeights: number[],
  goal: BodyCompositionGoal
): BodyweightRateEvaluation {
  const currentAvg = calculateRollingAverage(recent7DaysWeights);
  const prevAvg = calculateRollingAverage(previous7DaysWeights);

  if (currentAvg <= 0 || prevAvg <= 0) {
    return {
      current7DayAvgKg: currentAvg,
      previous7DayAvgKg: prevAvg,
      weeklyDeltaKg: 0,
      weeklyDeltaPercent: 0,
      evaluationStatus: 'ON_TRACK',
      recommendation: 'Insufficient data points for 7-day trend. Continue daily morning weigh-ins.'
    };
  }

  const weeklyDeltaKg = Math.round((currentAvg - prevAvg) * 100) / 100;
  const weeklyDeltaPercent = Math.round(((weeklyDeltaKg / prevAvg) * 100) * 100) / 100;

  if (goal === 'cut' || goal === 'contest_prep') {
    // Target loss rate: -0.5% to -1.0% of BW per week
    if (weeklyDeltaPercent < -1.0) {
      return {
        current7DayAvgKg: currentAvg,
        previous7DayAvgKg: prevAvg,
        weeklyDeltaKg,
        weeklyDeltaPercent,
        evaluationStatus: 'TOO_FAST',
        recommendation: `Weight dropping too rapidly (${weeklyDeltaPercent}% vs target max -1.0%). Risk of lean tissue catabolism. Increase daily intake by +150-200 kcal.`
      };
    }
    if (weeklyDeltaPercent > -0.2) {
      return {
        current7DayAvgKg: currentAvg,
        previous7DayAvgKg: prevAvg,
        weeklyDeltaKg,
        weeklyDeltaPercent,
        evaluationStatus: 'TOO_SLOW',
        recommendation: `Weight stall detected (${weeklyDeltaPercent}% loss). Decrease daily intake by -100-150 kcal or increase daily steps.`
      };
    }
    return {
      current7DayAvgKg: currentAvg,
      previous7DayAvgKg: prevAvg,
      weeklyDeltaKg,
      weeklyDeltaPercent,
      evaluationStatus: 'ON_TRACK',
      recommendation: `Pristine rate of fat loss (${weeklyDeltaPercent}% per week). Preserve current macronutrient targets.`
    };
  }

  if (goal === 'lean_bulk' || goal === 'hypertrophy') {
    // Target gain rate: +0.25% to +0.5% of BW per week
    if (weeklyDeltaPercent > 0.6) {
      return {
        current7DayAvgKg: currentAvg,
        previous7DayAvgKg: prevAvg,
        weeklyDeltaKg,
        weeklyDeltaPercent,
        evaluationStatus: 'TOO_FAST',
        recommendation: `Weight rising too rapidly (${weeklyDeltaPercent}% vs target max +0.5%). Excessive adiposity accumulation. Reduce surplus by -150 kcal.`
      };
    }
    if (weeklyDeltaPercent < 0.1) {
      return {
        current7DayAvgKg: currentAvg,
        previous7DayAvgKg: prevAvg,
        weeklyDeltaKg,
        weeklyDeltaPercent,
        evaluationStatus: 'TOO_SLOW',
        recommendation: `Weight gain plateaued (${weeklyDeltaPercent}%). Bump daily intake by +150 kcal to ensure adequate energy for muscular hypertrophy.`
      };
    }
    return {
      current7DayAvgKg: currentAvg,
      previous7DayAvgKg: prevAvg,
      weeklyDeltaKg,
      weeklyDeltaPercent,
      evaluationStatus: 'ON_TRACK',
      recommendation: `Optimal lean mass accretion rate (${weeklyDeltaPercent}% per week). Maintain current calorie surplus.`
    };
  }

  // Recomp
  const absDelta = Math.abs(weeklyDeltaPercent);
  if (absDelta > 0.4) {
    return {
      current7DayAvgKg: currentAvg,
      previous7DayAvgKg: prevAvg,
      weeklyDeltaKg,
      weeklyDeltaPercent,
      evaluationStatus: 'TOO_FAST',
      recommendation: 'Bodyweight shifting outside recomp equilibrium range. Adjust intake slightly toward maintenance.'
    };
  }
  return {
    current7DayAvgKg: currentAvg,
    previous7DayAvgKg: prevAvg,
    weeklyDeltaKg,
    weeklyDeltaPercent,
    evaluationStatus: 'ON_TRACK',
    recommendation: 'Stable bodyweight equilibrium. Continue progressive overload and high protein intake.'
  };
}
