/**
 * @powerlift/engines/attempts/competitionAttemptEngine
 * Championship platform attempt selection & tactical autoregulation engine.
 * Pure deterministic calculation.
 */

export type Strategy = 'conservative' | 'balanced' | 'aggressive';

export interface AttemptPlan {
  attempt1OpenerKg: number;
  attempt2Kg: number;
  attempt3Kg: number;
  strategy: Strategy;
  ratios: {
    openerRatio: number;
    secondRatio: number;
    thirdRatio: number;
  };
}

export function generateAttemptPlan(targetGoalKg: number, strategy: Strategy = 'balanced'): AttemptPlan {
  let openerRatio = 0.91;
  let secondRatio = 0.96;
  let thirdRatio = 1.00;

  if (strategy === 'conservative') {
    // 9/9 Meet Builder: Bank a safe total first
    openerRatio = 0.89;
    secondRatio = 0.94;
    thirdRatio = 0.985;
  } else if (strategy === 'aggressive') {
    // High-risk medal hunt / PR shot
    openerRatio = 0.925;
    secondRatio = 0.975;
    thirdRatio = 1.025;
  }

  const roundToPlate = (val: number) => Math.round(val / 2.5) * 2.5;

  const attempt1 = roundToPlate(targetGoalKg * openerRatio);
  let attempt2 = roundToPlate(targetGoalKg * secondRatio);
  let attempt3 = roundToPlate(targetGoalKg * thirdRatio);

  // Guarantee strictly increasing attempts with minimum 2.5kg gap
  if (attempt2 <= attempt1) attempt2 = attempt1 + 2.5;
  if (attempt3 <= attempt2) attempt3 = attempt2 + 2.5;

  return {
    attempt1OpenerKg: attempt1,
    attempt2Kg: attempt2,
    attempt3Kg: attempt3,
    strategy,
    ratios: { openerRatio, secondRatio, thirdRatio }
  };
}

export interface NextAttemptFeedback {
  lastAttemptKg: number;
  lastAttemptRpe: number;
  isGoodLift: boolean;
  missReason?: 'strength' | 'technical' | 'depth' | 'grip' | 'balance';
  targetThirdMaxKg: number;
}

export function evaluateNextAttempt(feedback: NextAttemptFeedback): { nextAttemptKg: number; rationale: string } {
  const { lastAttemptKg, lastAttemptRpe, isGoodLift, missReason, targetThirdMaxKg } = feedback;
  const roundToPlate = (val: number) => Math.round(val / 2.5) * 2.5;

  if (!isGoodLift) {
    if (missReason === 'depth' || missReason === 'technical') {
      return {
        nextAttemptKg: lastAttemptKg,
        rationale: 'Missed due to technical call / depth command. Repeat the exact weight and nail platform commands.'
      };
    }
    // Missed on strength
    return {
      nextAttemptKg: lastAttemptKg,
      rationale: 'Strength ceiling reached on attempt. Do not increase weight; repeat or pass to preserve energy for next discipline.'
    };
  }

  // Good lift evaluation
  if (lastAttemptRpe <= 7.5) {
    // Very fast lift -> aggressive jump
    const next = roundToPlate(lastAttemptKg + (targetThirdMaxKg - lastAttemptKg) * 0.7);
    return {
      nextAttemptKg: Math.max(lastAttemptKg + 2.5, next),
      rationale: `Sub-8 RPE speed detected. Confident jump to ${next} kg.`
    };
  }

  if (lastAttemptRpe >= 9.5) {
    // Grinder -> minimal safe jump
    return {
      nextAttemptKg: lastAttemptKg + 2.5,
      rationale: `High platform exertion (RPE ${lastAttemptRpe}). Limit increase to conservative 2.5 kg to secure total.`
    };
  }

  // Standard jump
  const standardJump = roundToPlate(lastAttemptKg + (targetThirdMaxKg - lastAttemptKg) * 0.5);
  return {
    nextAttemptKg: Math.max(lastAttemptKg + 2.5, standardJump),
    rationale: `Clean attempt execution. Progressing on schedule to ${standardJump} kg.`
  };
}
