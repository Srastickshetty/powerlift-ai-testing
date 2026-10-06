/**
 * @powerlift/engines/periodization/deloadEngine
 * Autoregulated deload assessment & prescription engine.
 * Pure deterministic calculation.
 */

export interface DeloadAssessmentInput {
  currentWeeklyVolumeSets: number;
  averageSessionRpe: number;
  consecutiveAccumulationWeeks: number;
  fatigueScore1To10: number;
  jointPain0To10: number;
  performanceDropPercentage?: number;
}

export interface DeloadPrescription {
  isDeloadRecommended: boolean;
  severity: 'none' | 'moderate' | 'high';
  volumeReductionPct: number;
  intensityReductionPct: number;
  maxRpeCap: number;
  targetWeeklyVolumeSets: number;
  rationale: string;
}

export function assessDeloadNeed(input: DeloadAssessmentInput): DeloadPrescription {
  const {
    currentWeeklyVolumeSets,
    averageSessionRpe,
    consecutiveAccumulationWeeks,
    fatigueScore1To10,
    jointPain0To10,
    performanceDropPercentage = 0
  } = input;

  let triggers = 0;
  const reasons: string[] = [];

  if (consecutiveAccumulationWeeks >= 4) {
    triggers += 1;
    reasons.push(`${consecutiveAccumulationWeeks} consecutive accumulation weeks completed`);
  }

  if (fatigueScore1To10 >= 8) {
    triggers += 2;
    reasons.push(`Systemic fatigue rating high (${fatigueScore1To10}/10)`);
  } else if (fatigueScore1To10 >= 6.5) {
    triggers += 1;
  }

  if (jointPain0To10 >= 5) {
    triggers += 2;
    reasons.push(`Elevated joint pain (${jointPain0To10}/10)`);
  }

  if (averageSessionRpe >= 8.8) {
    triggers += 1;
    reasons.push(`High average session exertion (RPE ${averageSessionRpe.toFixed(1)})`);
  }

  if (performanceDropPercentage >= 5) {
    triggers += 2;
    reasons.push(`Unplanned velocity/load loss (${performanceDropPercentage.toFixed(1)}%)`);
  }

  if (triggers >= 3) {
    // High Severity Deload
    return {
      isDeloadRecommended: true,
      severity: 'high',
      volumeReductionPct: 50,
      intensityReductionPct: 15,
      maxRpeCap: 7.0,
      targetWeeklyVolumeSets: Math.max(6, Math.round(currentWeeklyVolumeSets * 0.5)),
      rationale: `Full deload required: ${reasons.join('; ')}.`
    };
  }

  if (triggers >= 2) {
    // Moderate Deload
    return {
      isDeloadRecommended: true,
      severity: 'moderate',
      volumeReductionPct: 35,
      intensityReductionPct: 10,
      maxRpeCap: 7.5,
      targetWeeklyVolumeSets: Math.max(8, Math.round(currentWeeklyVolumeSets * 0.65)),
      rationale: `Proactive deload recommended: ${reasons.join('; ')}.`
    };
  }

  return {
    isDeloadRecommended: false,
    severity: 'none',
    volumeReductionPct: 0,
    intensityReductionPct: 0,
    maxRpeCap: 9.5,
    targetWeeklyVolumeSets: currentWeeklyVolumeSets,
    rationale: 'Readiness indicators optimal. Continue scheduled progressive overload block.'
  };
}
