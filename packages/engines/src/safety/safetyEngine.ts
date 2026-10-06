/**
 * @powerlift/engines/safety/safetyEngine
 * Hard constraint safety engine implementing all 9 rules from docs/01_COACHING_SPEC.md §9.
 * Pure deterministic validation. Zero bypass via API or AI prompts.
 */

export interface PainEvaluation {
  allowed: boolean;
  painScore: number;
  hasNeurologicalSymptoms: boolean;
  actionRequired: 'PROCEED' | 'AUTO_REDUCE_OR_SWAP' | 'MEDICAL_REFERRAL_REQUIRED';
  guidance: string;
}

export interface LoadJumpEvaluation {
  allowed: boolean;
  currentLoadKg: number;
  proposedLoadKg: number;
  clampedLoadKg: number;
  percentageJump: number;
  maxAllowedPercent: number;
  rationale: string;
}

export interface VolumeJumpEvaluation {
  allowed: boolean;
  currentWeeklySets: number;
  proposedWeeklySets: number;
  clampedWeeklySets: number;
  setDelta: number;
  maxAllowedDelta: number;
  rationale: string;
}

export interface YouthGuardEvaluation {
  isYouthSafeMode: boolean;
  allowed: boolean;
  blockedFeatures: string[];
  reasons: string[];
}

export interface NutritionSafetyEvaluation {
  allowed: boolean;
  bmr: number;
  proposedCalories: number;
  minimumSafeCalories: number;
  proteinGrams: number;
  minimumSafeProteinGrams: number;
  violations: string[];
}

export interface TextSafetyEvaluation {
  safe: boolean;
  category?: 'PED_MEDICAL' | 'CRISIS_MENTAL_HEALTH' | 'DEHYDRATION_CUT';
  message: string;
}

/**
 * Rule 1: Pain threshold guard
 * Pain >= 7 or neurological symptoms stops prescription & requires referral.
 */
export function validatePainThreshold(
  painScore: number,
  symptoms: string[] = []
): PainEvaluation {
  const neurologicalKeywords = ['numbness', 'shooting', 'tingling', 'pins and needles', 'radiating', 'electric'];
  const hasNeurological = symptoms.some((s) =>
    neurologicalKeywords.some((k) => s.toLowerCase().includes(k))
  );

  if (painScore >= 7 || hasNeurological) {
    return {
      allowed: false,
      painScore,
      hasNeurologicalSymptoms: hasNeurological,
      actionRequired: 'MEDICAL_REFERRAL_REQUIRED',
      guidance: `Safety Rule §9 Violation: Pain score ${painScore}/10 or neurological symptoms detected. Prescriptions are halted. Consult a licensed physical therapist or medical physician before resuming loading.`
    };
  }

  if (painScore >= 4) {
    return {
      allowed: true,
      painScore,
      hasNeurologicalSymptoms: false,
      actionRequired: 'AUTO_REDUCE_OR_SWAP',
      guidance: `Moderate joint strain reported (${painScore}/10). Autoregulation recommends a 30-50% load drop or joint-friendly exercise substitution.`
    };
  }

  return {
    allowed: true,
    painScore,
    hasNeurologicalSymptoms: false,
    actionRequired: 'PROCEED',
    guidance: 'Joint health within acceptable training tolerance.'
  };
}

/**
 * Rule 2: Load jump guard
 * Main lifts may not increase >5% per session (novices <=10% only when RPE <= 6).
 */
export function validateLoadJump(
  currentLoadKg: number,
  proposedLoadKg: number,
  trainingAgeYears: number,
  previousRpe?: number
): LoadJumpEvaluation {
  if (proposedLoadKg <= currentLoadKg) {
    return {
      allowed: true,
      currentLoadKg,
      proposedLoadKg,
      clampedLoadKg: proposedLoadKg,
      percentageJump: 0,
      maxAllowedPercent: 5,
      rationale: 'Load reduction or maintenance is within safety limits.'
    };
  }

  const isNovice = trainingAgeYears < 1.0;
  const isVeryFastBar = typeof previousRpe === 'number' && previousRpe <= 6;
  const maxAllowedPercent = isNovice && isVeryFastBar ? 10.0 : 5.0;

  const actualJumpPercent = Math.round((((proposedLoadKg - currentLoadKg) / currentLoadKg) * 100) * 10) / 10;
  const maxAllowedLoad = Math.round((currentLoadKg * (1 + maxAllowedPercent / 100)) / 2.5) * 2.5;

  if (actualJumpPercent > maxAllowedPercent) {
    return {
      allowed: false,
      currentLoadKg,
      proposedLoadKg,
      clampedLoadKg: maxAllowedLoad,
      percentageJump: actualJumpPercent,
      maxAllowedPercent,
      rationale: `Safety Rule §9: Load increase capped at +${maxAllowedPercent}% per session (proposed +${actualJumpPercent}% from ${currentLoadKg}kg to ${proposedLoadKg}kg clamped to ${maxAllowedLoad}kg).`
    };
  }

  return {
    allowed: true,
    currentLoadKg,
    proposedLoadKg,
    clampedLoadKg: proposedLoadKg,
    percentageJump: actualJumpPercent,
    maxAllowedPercent,
    rationale: `Progression within safe ${maxAllowedPercent}% overload threshold.`
  };
}

/**
 * Rule 3: Volume jump guard
 * Weekly sets per muscle group may rise <= 2 to 3 sets/week.
 */
export function validateVolumeJump(
  currentWeeklySets: number,
  proposedWeeklySets: number
): VolumeJumpEvaluation {
  const maxAllowedDelta = 3;
  const delta = proposedWeeklySets - currentWeeklySets;

  if (delta > maxAllowedDelta) {
    const clampedWeeklySets = currentWeeklySets + maxAllowedDelta;
    return {
      allowed: false,
      currentWeeklySets,
      proposedWeeklySets,
      clampedWeeklySets,
      setDelta: delta,
      maxAllowedDelta,
      rationale: `Safety Rule §9: Weekly volume increases capped at +${maxAllowedDelta} sets/week per muscle (proposed +${delta} sets clamped to ${clampedWeeklySets}).`
    };
  }

  return {
    allowed: true,
    currentWeeklySets,
    proposedWeeklySets,
    clampedWeeklySets: proposedWeeklySets,
    setDelta: delta,
    maxAllowedDelta,
    rationale: 'Volume increase within safe weekly adaptive limits.'
  };
}

/**
 * Rule 4: Deload trigger evaluation
 * 2 consecutive sessions of RPE drift + readiness drop trigger deload.
 */
export function evaluateDeloadTrigger(
  consecutiveDriftSessions: number,
  consecutiveLowReadinessSessions: number
): { shouldDeload: boolean; rationale: string } {
  if (consecutiveDriftSessions >= 2 && consecutiveLowReadinessSessions >= 2) {
    return {
      shouldDeload: true,
      rationale: 'Safety Rule §9: Persistent RPE drift and depressed readiness across 2 consecutive sessions indicates accumulated systemic fatigue. Scheduled deload initiated.'
    };
  }

  return {
    shouldDeload: false,
    rationale: 'Recovery markers within acceptable operational tolerance.'
  };
}

/**
 * Rule 5: Under-18 Youth Safeguards
 */
export function validateYouthSafeguards(
  age: number,
  requestedGoal?: string,
  hasGuardianConsent = false
): YouthGuardEvaluation {
  const isYouth = age < 18;
  if (!isYouth) {
    return {
      isYouthSafeMode: false,
      allowed: true,
      blockedFeatures: [],
      reasons: []
    };
  }

  const blocked: string[] = [];
  const reasons: string[] = [];

  if (requestedGoal === 'contest_prep') {
    blocked.push('contest_prep');
    reasons.push('Under-18 athletes are strictly blocked from contest prep / peak-week dehydration.');
  }

  if (!hasGuardianConsent) {
    blocked.push('coach_marketplace');
    reasons.push('Human coach marketplace requires verified parental/guardian consent for minors.');
  }

  return {
    isYouthSafeMode: true,
    allowed: blocked.length === 0,
    blockedFeatures: blocked,
    reasons
  };
}

/**
 * Rule 6 & 7: Disordered-eating & extreme deficit guard
 * Deficit cannot drop below BMR * 0.8; protein >= 1.2 g/kg.
 */
export function validateNutritionDeficit(
  bmr: number,
  proposedCalories: number,
  bodyweightKg: number,
  proposedProteinGrams: number
): NutritionSafetyEvaluation {
  const minimumSafeCalories = Math.round(bmr * 0.80);
  const minimumSafeProteinGrams = Math.round(bodyweightKg * 1.2);
  const violations: string[] = [];

  if (proposedCalories < minimumSafeCalories) {
    violations.push(
      `Extreme caloric deficit blocked: ${proposedCalories} kcal is below the critical threshold of 80% BMR (${minimumSafeCalories} kcal).`
    );
  }

  if (proposedProteinGrams < minimumSafeProteinGrams) {
    violations.push(
      `Inadequate protein intake: ${proposedProteinGrams}g is below the sports safety minimum of 1.2 g/kg (${minimumSafeProteinGrams}g).`
    );
  }

  return {
    allowed: violations.length === 0,
    bmr,
    proposedCalories,
    minimumSafeCalories,
    proteinGrams: proposedProteinGrams,
    minimumSafeProteinGrams,
    violations
  };
}

/**
 * Rule 8 & 9: PED, medical, and crisis detection
 */
export function evaluateTextSafety(text: string): TextSafetyEvaluation {
  const lower = text.toLowerCase();

  // Crisis detection
  const crisisKeywords = ['suicide', 'kill myself', 'end my life', 'self-harm', 'hopeless', 'want to die'];
  if (crisisKeywords.some((k) => lower.includes(k))) {
    return {
      safe: false,
      category: 'CRISIS_MENTAL_HEALTH',
      message: 'If you are experiencing overwhelming distress or thoughts of self-harm, please reach out for immediate compassionate support. Contact the 988 Suicide & Crisis Lifeline (call/text 988) or emergency services in your region. We care about you.'
    };
  }

  // PED / Anabolic steroid keywords
  const pedKeywords = ['anavar', 'trenbolone', 'deca durabolin', 'sarms', 'rad-140', 'mk-677', 'clenbuterol', 'dianabol', 'winstrol', 'testosterone cycle', 'steroid dose'];
  if (pedKeywords.some((k) => lower.includes(k))) {
    return {
      safe: false,
      category: 'PED_MEDICAL',
      message: 'Safety Rule §9: PowerLift AI does not provide performance-enhancing drug (PED) regimens, steroid cycles, or medical advice. We strictly endorse clean, tested athletic performance.'
    };
  }

  // Dehydration water cut detection
  const dehydrationKeywords = ['water cut', 'water load', 'sauna suit', 'diuretic', 'dry sauna cut'];
  if (dehydrationKeywords.some((k) => lower.includes(k))) {
    return {
      safe: false,
      category: 'DEHYDRATION_CUT',
      message: 'Safety Rule §9: AI dehydration cutting and water manipulation protocols are locked due to cardiovascular and renal health risks. Consult an accredited sports dietitian or coach.'
    };
  }

  return {
    safe: true,
    message: 'Content validated against safety standards.'
  };
}
