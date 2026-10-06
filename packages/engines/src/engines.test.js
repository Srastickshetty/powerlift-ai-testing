/**
 * @powerlift/engines/test
 * Unit test suite verifying calculation engines against sports-science golden numbers.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');

// Import compiled engines
const {
  calculateE1RM,
  calculateEffectiveReps,
  calculateTargetLoad,
  assessDeloadNeed,
  autoregulateNextSet,
  generateAttemptPlan,
  evaluateNextAttempt,
  evolveWeeklyMesocycle,
  evaluatePersonalRecord,
  // Powerlifting
  calculateDots,
  calculateIpfGl,
  calculateWilks,
  calculateAllPoints,
  calculateSetInol,
  calculateSessionVolumeMetrics,
  getVariationsForWeakPoint,
  generateDupPrescription,
  getBlockPhase,
  calculatePeakingTaperSchedule,
  // Bodybuilding
  evaluateMuscleVolume,
  evaluateVolumeRadar,
  evaluateDoubleProgression,
  generateMesocycleSchedule,
  evaluateIntensityTechniqueGating,
  calculateRollingAverage,
  evaluateBodyweightRate,
  calculateBmr,
  calculateTdee,
  calculateMacroTargets,
  generateIndianDietPlan,
  // Safety
  validatePainThreshold,
  validateLoadJump,
  validateVolumeJump,
  evaluateDeloadTrigger,
  validateYouthSafeguards,
  validateNutritionDeficit,
  evaluateTextSafety
} = require('../dist/index');

describe('@powerlift/engines Test Suite', () => {

  describe('1. e1RM Calculator & Golden Numbers', () => {
    it('100kg x 1 @ RPE 10 yields exactly 100kg', () => {
      const res = calculateE1RM({ loadKg: 100, reps: 1, rpe: 10, formula: 'brzycki' });
      assert.strictEqual(res.e1rmKg, 100);
      assert.strictEqual(res.effectiveReps, 1);
    });

    it('100kg x 5 reps @ RPE 10 matches Brzycki golden number (~112.5kg)', () => {
      const res = calculateE1RM({ loadKg: 100, reps: 5, rpe: 10, formula: 'brzycki' });
      assert.ok(Math.abs(res.e1rmKg - 112.5) < 0.2, `Expected ~112.5kg, got ${res.e1rmKg}`);
    });

    it('140kg x 3 reps @ RPE 8 calculates 5 effective reps and ~157.5kg e1RM', () => {
      const res = calculateE1RM({ loadKg: 140, reps: 3, rpe: 8, formula: 'brzycki' });
      assert.strictEqual(res.effectiveReps, 5);
      assert.ok(Math.abs(res.e1rmKg - 157.5) < 0.2, `Expected ~157.5kg, got ${res.e1rmKg}`);
    });

    it('Epley formula produces expected values (100 * (1 + 0.0333 * 5) = 116.7kg)', () => {
      const res = calculateE1RM({ loadKg: 100, reps: 5, rpe: 10, formula: 'epley' });
      assert.ok(Math.abs(res.e1rmKg - 116.7) < 0.2);
    });

    it('Safely handles 0 or negative inputs', () => {
      assert.strictEqual(calculateE1RM({ loadKg: 0, reps: 5 }).e1rmKg, 0);
      assert.strictEqual(calculateE1RM({ loadKg: 100, reps: 0 }).e1rmKg, 0);
    });

    it('calculateTargetLoad rounds to nearest 2.5kg plate', () => {
      const load = calculateTargetLoad(200, 5, 8); // 200 * (1.0278 - 0.0278 * 7) = 166.6kg -> 167.5kg
      assert.strictEqual(load % 2.5, 0);
      assert.ok(load >= 165 && load <= 170);
    });

    it('Lombardi and Wathan formulas calculate expected values', () => {
      const lombardi = calculateE1RM({ loadKg: 100, reps: 5, formula: 'lombardi' });
      assert.ok(lombardi.e1rmKg > 105 && lombardi.e1rmKg < 120);

      const wathan = calculateE1RM({ loadKg: 100, reps: 5, formula: 'wathan' });
      assert.ok(wathan.e1rmKg > 105 && wathan.e1rmKg < 120);

      const eff = calculateEffectiveReps(6, 8);
      assert.strictEqual(eff, 8);
    });
  });

  describe('2. Deload Assessment Engine', () => {
    it('Triggers high-severity deload when systemic fatigue and joint pain are critical', () => {
      const result = assessDeloadNeed({
        currentWeeklyVolumeSets: 20,
        averageSessionRpe: 9.0,
        consecutiveAccumulationWeeks: 4,
        fatigueScore1To10: 9,
        jointPain0To10: 6,
        performanceDropPercentage: 6
      });

      assert.strictEqual(result.isDeloadRecommended, true);
      assert.strictEqual(result.severity, 'high');
      assert.strictEqual(result.volumeReductionPct, 50);
      assert.strictEqual(result.targetWeeklyVolumeSets, 10);
      assert.strictEqual(result.maxRpeCap, 7.0);
    });

    it('Triggers moderate deload on elevated fatigue and high RPE', () => {
      const result = assessDeloadNeed({
        currentWeeklyVolumeSets: 18,
        averageSessionRpe: 8.9,
        consecutiveAccumulationWeeks: 3,
        fatigueScore1To10: 7,
        jointPain0To10: 3
      });

      assert.strictEqual(result.isDeloadRecommended, true);
      assert.strictEqual(result.severity, 'moderate');
      assert.ok(result.volumeReductionPct >= 30);
    });

    it('Recommends continued progression when recovery markers are healthy', () => {
      const result = assessDeloadNeed({
        currentWeeklyVolumeSets: 16,
        averageSessionRpe: 7.8,
        consecutiveAccumulationWeeks: 2,
        fatigueScore1To10: 4,
        jointPain0To10: 1
      });

      assert.strictEqual(result.isDeloadRecommended, false);
      assert.strictEqual(result.severity, 'none');
      assert.strictEqual(result.volumeReductionPct, 0);
    });
  });

  describe('3. Intra-Session Autoregulation Engine', () => {
    it('Detects overshoot and prescribes weight drop to preserve velocity', () => {
      const result = autoregulateNextSet({
        targetLoadKg: 150,
        targetReps: 5,
        targetRpe: 8,
        actualReps: 5,
        actualRpe: 9.5
      });

      assert.strictEqual(result.status, 'overshot');
      assert.strictEqual(result.rpeDeviation, 1.5);
      assert.ok(result.nextLoadKg < 150);
      assert.strictEqual(result.nextLoadKg % 2.5, 0);
    });

    it('Triggers fatigue advice on significant overshoot', () => {
      const result = autoregulateNextSet({
        targetLoadKg: 160,
        targetReps: 5,
        targetRpe: 7.5,
        actualReps: 3,
        actualRpe: 10
      });

      assert.strictEqual(result.status, 'overshot');
      assert.ok(result.actionAdvice.toLowerCase().includes('fatigue'));
    });

    it('Detects high bar speed (undershoot) and increases load', () => {
      const result = autoregulateNextSet({
        targetLoadKg: 150,
        targetReps: 5,
        targetRpe: 8,
        actualReps: 5,
        actualRpe: 6.5
      });

      assert.strictEqual(result.status, 'undershot');
      assert.ok(result.nextLoadKg > 150);
      assert.strictEqual(result.nextLoadKg % 2.5, 0);
    });

    it('Maintains load when on target (within 0.5 RPE)', () => {
      const result = autoregulateNextSet({
        targetLoadKg: 150,
        targetReps: 5,
        targetRpe: 8,
        actualReps: 5,
        actualRpe: 8.2
      });

      assert.strictEqual(result.status, 'on_target');
      assert.strictEqual(result.nextLoadKg, 150);
    });
  });

  describe('4. Competition Attempt Engine', () => {
    it('Generates strictly ascending 2.5kg plate increments for 200kg target', () => {
      const plan = generateAttemptPlan(200, 'balanced');
      assert.ok(plan.attempt1OpenerKg < plan.attempt2Kg);
      assert.ok(plan.attempt2Kg < plan.attempt3Kg);
      assert.strictEqual(plan.attempt1OpenerKg % 2.5, 0);
      assert.strictEqual(plan.attempt2Kg % 2.5, 0);
      assert.strictEqual(plan.attempt3Kg % 2.5, 0);
      assert.strictEqual(plan.attempt3Kg, 200);
    });

    it('Aggressive strategy sets higher 3rd attempt PR', () => {
      const plan = generateAttemptPlan(200, 'aggressive');
      assert.ok(plan.attempt3Kg >= 205);
    });

    it('Conservative strategy sets bankable 3rd attempt', () => {
      const plan = generateAttemptPlan(200, 'conservative');
      assert.ok(plan.attempt3Kg <= 200);
    });

    it('Evaluates next attempt after fast opener (RPE <= 7.5)', () => {
      const evalResult = evaluateNextAttempt({
        lastAttemptKg: 180,
        lastAttemptRpe: 7.0,
        isGoodLift: true,
        targetThirdMaxKg: 200
      });

      assert.ok(evalResult.nextAttemptKg > 185);
      assert.strictEqual(evalResult.nextAttemptKg % 2.5, 0);
    });

    it('Evaluates heavy opener (RPE >= 9.0) by moderating next jump', () => {
      const evalResult = evaluateNextAttempt({
        lastAttemptKg: 180,
        lastAttemptRpe: 9.5,
        isGoodLift: true,
        targetThirdMaxKg: 200
      });

      assert.ok(evalResult.nextAttemptKg <= 187.5);
    });

    it('Repeats weight when missed on technical/depth call', () => {
      const evalResult = evaluateNextAttempt({
        lastAttemptKg: 190,
        lastAttemptRpe: 9.0,
        isGoodLift: false,
        missReason: 'depth',
        targetThirdMaxKg: 200
      });

      assert.strictEqual(evalResult.nextAttemptKg, 190);
      assert.ok(evalResult.rationale.includes('depth'));
    });

    it('Reduces or holds attempt when missed on strength/velocity breakdown', () => {
      const evalResult = evaluateNextAttempt({
        lastAttemptKg: 195,
        lastAttemptRpe: 10,
        isGoodLift: false,
        missReason: 'strength',
        targetThirdMaxKg: 200
      });

      assert.ok(evalResult.nextAttemptKg <= 195);
      assert.ok(evalResult.rationale.toLowerCase().includes('strength'));
    });
  });

  describe('5. Weekly Mesocycle Evolution Engine', () => {
    const baselineMaxes = { squat: 180, bench: 120, deadlift: 220 };

    it('Progresses to next week with progressive overload on good check-in', () => {
      const decision = evolveWeeklyMesocycle({
        currentWeekNumber: 2,
        currentWeeklySets: 16,
        trainingMaxes: baselineMaxes,
        checkIn: {
          fatigueScore1To10: 4,
          sorenessScore1To10: 3,
          jointPain0To10: 1,
          sessionsCompleted: 4,
          sessionsTargeted: 4,
          averageSessionRpe: 7.8
        }
      });

      assert.strictEqual(decision.nextWeekNumber, 3);
      assert.strictEqual(decision.phase, 'accumulation');
      assert.ok(decision.updatedTrainingMaxes.squat > baselineMaxes.squat);
      assert.ok(decision.updatedTrainingMaxes.bench > baselineMaxes.bench);
      assert.ok(decision.updatedTrainingMaxes.deadlift > baselineMaxes.deadlift);
    });

    it('Triggers unscheduled deload when systemic fatigue or soreness is acute', () => {
      const decision = evolveWeeklyMesocycle({
        currentWeekNumber: 2,
        currentWeeklySets: 18,
        trainingMaxes: baselineMaxes,
        checkIn: {
          fatigueScore1To10: 9,
          sorenessScore1To10: 9,
          jointPain0To10: 6,
          sessionsCompleted: 4,
          sessionsTargeted: 4,
          averageSessionRpe: 9.2
        }
      });

      assert.strictEqual(decision.phase, 'deload');
      assert.ok(decision.volumeAdjustmentPct < 0);
      assert.ok(decision.rationale.toLowerCase().includes('deload'));
    });

    it('Triggers scheduled deload on week 4', () => {
      const decision = evolveWeeklyMesocycle({
        currentWeekNumber: 4,
        currentWeeklySets: 18,
        trainingMaxes: baselineMaxes,
        checkIn: {
          fatigueScore1To10: 6,
          sorenessScore1To10: 5,
          jointPain0To10: 2,
          sessionsCompleted: 4,
          sessionsTargeted: 4,
          averageSessionRpe: 8.2
        }
      });

      assert.strictEqual(decision.nextWeekNumber, 5);
      assert.strictEqual(decision.phase, 'deload');
      assert.strictEqual(decision.volumeAdjustmentPct, -35);
    });

    it('Repeats current week when adherence falls below 75%', () => {
      const decision = evolveWeeklyMesocycle({
        currentWeekNumber: 3,
        currentWeeklySets: 16,
        trainingMaxes: baselineMaxes,
        checkIn: {
          fatigueScore1To10: 4,
          sorenessScore1To10: 3,
          jointPain0To10: 0,
          sessionsCompleted: 2,
          sessionsTargeted: 4, // 50% adherence
          averageSessionRpe: 7.5
        }
      });

      assert.strictEqual(decision.nextWeekNumber, 3);
      assert.ok(decision.rationale.includes('50%'));
    });
  });

  describe('6. Powerlifting Points Calculator (DOTS, IPF GL, Wilks)', () => {
    it('calculates valid DOTS points for 83kg male with 650kg total (~430-440 pts)', () => {
      const dots = calculateDots(83, 650, 'male');
      assert.ok(dots > 425 && dots < 445, `Expected 425-445, got ${dots}`);
    });

    it('calculates valid IPF GL points for 63kg female with 420kg total', () => {
      const gl = calculateIpfGl(63, 420, 'female');
      assert.ok(gl > 80 && gl < 105, `Expected 80-105, got ${gl}`);
    });

    it('calculates classic Wilks score for male lifter', () => {
      const wilks = calculateWilks(93, 700, 'male');
      assert.ok(wilks > 400 && wilks < 460, `Expected 400-460, got ${wilks}`);
    });

    it('calculateAllPoints returns all three metrics with zero for non-positive inputs', () => {
      const pts = calculateAllPoints(0, 500, 'male');
      assert.strictEqual(pts.dots, 0);
      assert.strictEqual(pts.ipfGl, 0);
      assert.strictEqual(pts.wilks, 0);
    });
  });

  describe('7. Powerlifting Volume, INOL & Fatigue Index', () => {
    it('calculates correct single set INOL for 5 reps at 80% 1RM (5 / 20 = 0.25)', () => {
      const inol = calculateSetInol(5, 160, 200); // 160/200 = 80%
      assert.strictEqual(inol.setInol, 0.25);
      assert.strictEqual(inol.intensityPercent, 80);
    });

    it('calculates session volume metrics and flags optimal vs excessive INOL', () => {
      const optimalSets = [
        { loadKg: 140, reps: 5, oneRepMaxKg: 175, rpe: 7.5 },
        { loadKg: 140, reps: 5, oneRepMaxKg: 175, rpe: 8.0 },
        { loadKg: 140, reps: 5, oneRepMaxKg: 175, rpe: 8.5 }
      ];
      const metrics = calculateSessionVolumeMetrics(optimalSets);
      assert.strictEqual(metrics.totalTonnageKg, 2100);
      assert.strictEqual(metrics.totalReps, 15);
      assert.strictEqual(metrics.inolRating, 'optimal');
      assert.strictEqual(metrics.rpeDrift, 1.0); // 8.5 - 7.5 = 1.0
    });
  });

  describe('8. Weak Point to Variation Mapper', () => {
    it('maps squat sticking point in the hole to Pause Squats and Pin Squats', () => {
      const vars = getVariationsForWeakPoint('squat', 'hole');
      assert.ok(vars.length >= 2);
      assert.ok(vars.some((v) => v.variationName.includes('Pause Squats')));
    });

    it('maps bench sticking point off chest to Spoto Press and Long Pause Bench', () => {
      const vars = getVariationsForWeakPoint('bench', 'chest');
      assert.ok(vars.some((v) => v.variationName.includes('Spoto Press')));
    });

    it('maps deadlift sticking point off floor to Deficit Deadlifts', () => {
      const vars = getVariationsForWeakPoint('deadlift', 'off_floor');
      assert.ok(vars.some((v) => v.variationName.includes('Deficit')));
    });
  });

  describe('9. Powerlifting Periodization & Peaking Taper', () => {
    it('generates DUP daily prescriptions with hypertrophy, strength, and speed days', () => {
      const dup = generateDupPrescription(200, 1);
      assert.strictEqual(dup.length, 3);
      assert.strictEqual(dup[0].focus, 'Hypertrophy / Volume');
      assert.strictEqual(dup[1].focus, 'Heavy Strength / Neural Drive');
    });

    it('calculates peaking taper volume reduction schedule as meet approaches', () => {
      const week4 = calculatePeakingTaperSchedule(4);
      assert.strictEqual(week4.volumeReductionPercent, 15);

      const meetWeek = calculatePeakingTaperSchedule(1);
      assert.strictEqual(meetWeek.volumeReductionPercent, 60);
      assert.strictEqual(meetWeek.recommendedRestDaysBeforeMeet, 3);
    });

    it('getBlockPhase cycles accumulation, intensification, realization, deload', () => {
      assert.strictEqual(getBlockPhase(1).phase, 'ACCUMULATION');
      assert.strictEqual(getBlockPhase(2).phase, 'INTENSIFICATION');
      assert.strictEqual(getBlockPhase(3).phase, 'REALIZATION');
      assert.strictEqual(getBlockPhase(4).phase, 'DELOAD');
    });
  });

  describe('10. Bodybuilding Hypertrophy Volume Landmarks & Radar', () => {
    it('evaluates muscle volume against MV/MEV/MAV/MRV landmarks', () => {
      const below = evaluateMuscleVolume('chest', 4);
      assert.strictEqual(below.status, 'below_mev');

      const sweetSpot = evaluateMuscleVolume('chest', 16);
      assert.strictEqual(sweetSpot.status, 'optimal_mav');

      const exceeded = evaluateMuscleVolume('chest', 26);
      assert.strictEqual(exceeded.status, 'exceeded_mrv');
    });

    it('evaluates full volume radar across all 10 major muscle groups', () => {
      const radar = evaluateVolumeRadar({ chest: 14, back: 16, quads: 12 });
      assert.strictEqual(radar.length, 10);
    });
  });

  describe('11. Bodybuilding Double Progression & Mesocycles', () => {
    it('triggers load increase when all sets reach top of rep range', () => {
      const res = evaluateDoubleProgression(8, 12, 30, [
        { loadKg: 30, reps: 12, rir: 1 },
        { loadKg: 30, reps: 12, rir: 1 },
        { loadKg: 30, reps: 12, rir: 1 }
      ]);
      assert.strictEqual(res.action, 'INCREASE_LOAD');
      assert.strictEqual(res.nextLoadKg, 32.5);
    });

    it('maintains load when athlete is still climbing rep range', () => {
      const res = evaluateDoubleProgression(8, 12, 30, [
        { loadKg: 30, reps: 12, rir: 1 },
        { loadKg: 30, reps: 10, rir: 1 },
        { loadKg: 30, reps: 9, rir: 0 }
      ]);
      assert.strictEqual(res.action, 'MAINTAIN_LOAD_ADD_REPS');
      assert.strictEqual(res.nextLoadKg, 30);
    });

    it('generates 5-week hypertrophy mesocycle with ramping RIR and final deload', () => {
      const meso = generateMesocycleSchedule(5);
      assert.strictEqual(meso.length, 5);
      assert.strictEqual(meso[0].targetRir, 3);
      assert.strictEqual(meso[4].isDeload, true);
      assert.strictEqual(meso[4].targetRir, 4);
    });
  });

  describe('12. Bodybuilding Intensity Techniques Gating', () => {
    it('gates intensity techniques for novices (<1.5 years training age)', () => {
      const decision = evaluateIntensityTechniqueGating('drop_set', 0.8, false);
      assert.strictEqual(decision.allowed, false);
      assert.strictEqual(decision.maxSetsPerWeek, 0);
    });

    it('allows 1 set/week on machines for intermediate lifters', () => {
      const decision = evaluateIntensityTechniqueGating('myo_reps', 2.0, false);
      assert.strictEqual(decision.allowed, true);
      assert.strictEqual(decision.maxSetsPerWeek, 1);
    });

    it('locks intensity techniques during deload week and on heavy axial compounds', () => {
      assert.strictEqual(evaluateIntensityTechniqueGating('drop_set', 5.0, true).allowed, false);
      assert.strictEqual(evaluateIntensityTechniqueGating('drop_set', 5.0, false, true).allowed, false);
    });
  });

  describe('13. Bodyweight Rate, TDEE & Indian Nutrition Plan', () => {
    it('calculates 7-day rolling average correctly', () => {
      const avg = calculateRollingAverage([75, 75.2, 74.8, 75.1, 74.9, 75.0, 75.0]);
      assert.strictEqual(avg, 75.0);
    });

    it('flags cut loss rate exceeding 1.0% BW as TOO_FAST', () => {
      const evalRate = evaluateBodyweightRate(
        [72, 72, 72, 72, 72, 72, 72],
        [75, 75, 75, 75, 75, 75, 75],
        'cut'
      );
      assert.strictEqual(evalRate.evaluationStatus, 'TOO_FAST');
    });

    it('calculates BMR, TDEE, and macro targets', () => {
      const macros = calculateMacroTargets({
        age: 25,
        sex: 'male',
        bodyweightKg: 80,
        heightCm: 180,
        activityLevel: 'moderate',
        goal: 'hypertrophy'
      });
      assert.ok(macros.bmr > 1700 && macros.bmr < 1900);
      assert.ok(macros.targetCalories > macros.tdee);
      assert.strictEqual(macros.proteinGrams, 160); // 80 * 2.0
    });

    it('generates authentic vegetarian Indian high-protein meal plan within budget', () => {
      const plan = generateIndianDietPlan({ bodyweightKg: 75, dietType: 'vegetarian' });
      assert.strictEqual(plan.dietType, 'vegetarian');
      assert.ok(plan.meals.length >= 4);
      assert.ok(plan.estimatedDailyCostINR <= 160);
      assert.ok(plan.staplesHighlighted.includes('Soya Chunks'));
    });
  });

  describe('14. Safety Engine (§9 Hard Constraints)', () => {
    it('Rule 1: Pain >= 7 or neurological symptoms halts prescription with referral', () => {
      const highPain = validatePainThreshold(8, []);
      assert.strictEqual(highPain.allowed, false);
      assert.strictEqual(highPain.actionRequired, 'MEDICAL_REFERRAL_REQUIRED');

      const neuroPain = validatePainThreshold(4, ['tingling', 'numbness in fingers']);
      assert.strictEqual(neuroPain.allowed, false);
      assert.strictEqual(neuroPain.actionRequired, 'MEDICAL_REFERRAL_REQUIRED');
    });

    it('Rule 2: Load jumps strictly clamped to <= 5% (<= 10% novice on RPE <= 6)', () => {
      // 100kg -> 115kg attempt for intermediate (15% jump) -> clamped to 105kg
      const evalJump = validateLoadJump(100, 115, 2.5);
      assert.strictEqual(evalJump.allowed, false);
      assert.strictEqual(evalJump.clampedLoadKg, 105);

      // Safe 5% jump
      const safeJump = validateLoadJump(100, 105, 2.5);
      assert.strictEqual(safeJump.allowed, true);
    });

    it('Rule 3: Volume jumps clamped to <= 3 sets/week per muscle', () => {
      const volumeEval = validateVolumeJump(12, 18); // +6 sets
      assert.strictEqual(volumeEval.allowed, false);
      assert.strictEqual(volumeEval.clampedWeeklySets, 15); // 12 + 3
    });

    it('Rule 4: Deload triggered on 2 consecutive sessions of RPE drift + readiness drop', () => {
      const trigger = evaluateDeloadTrigger(2, 2);
      assert.strictEqual(trigger.shouldDeload, true);

      const noTrigger = evaluateDeloadTrigger(1, 2);
      assert.strictEqual(noTrigger.shouldDeload, false);
    });

    it('Rule 5: Under-18 youth guard blocks contest prep and unconsented marketplace', () => {
      const youth = validateYouthSafeguards(16, 'contest_prep', false);
      assert.strictEqual(youth.isYouthSafeMode, true);
      assert.strictEqual(youth.allowed, false);
      assert.ok(youth.blockedFeatures.includes('contest_prep'));
      assert.ok(youth.blockedFeatures.includes('coach_marketplace'));
    });

    it('Rule 6 & 7: Caloric deficits below 80% BMR and low protein are rejected', () => {
      const evalNutrition = validateNutritionDeficit(1800, 1200, 75, 60);
      assert.strictEqual(evalNutrition.allowed, false);
      assert.ok(evalNutrition.violations.length >= 2);
    });

    it('Rule 8 & 9: PED regimens, dehydration cuts, and crisis phrases are caught', () => {
      const ped = evaluateTextSafety('What trenbolone and anavar dosage should I run?');
      assert.strictEqual(ped.safe, false);
      assert.strictEqual(ped.category, 'PED_MEDICAL');

      const dehydration = evaluateTextSafety('How do I run a water cut with a sauna suit?');
      assert.strictEqual(dehydration.safe, false);
      assert.strictEqual(dehydration.category, 'DEHYDRATION_CUT');

      const crisis = evaluateTextSafety('I feel completely hopeless and want to kill myself');
      assert.strictEqual(crisis.safe, false);
      assert.strictEqual(crisis.category, 'CRISIS_MENTAL_HEALTH');
      assert.ok(crisis.message.includes('988'));
    });
  });

  describe('15. PR Detection & Domain Branch Coverage', () => {
    it('detects e1RM, Rep, and Absolute Load PRs correctly', () => {
      // Benchmark history: best load 140kg, best 5-rep 130kg
      const history = [
        { weightKg: 140, reps: 1, rpe: 10 },
        { weightKg: 130, reps: 5, rpe: 10 }
      ];

      // New set: 142.5kg x 3 (e1rm ~ 156kg) -> e1rm PR + load PR
      const pr1 = evaluatePersonalRecord({ weightKg: 142.5, reps: 3, rpe: 8.5 }, history);
      assert.strictEqual(pr1.isPr, true);
      assert.strictEqual(pr1.isE1rmPr, true);
      assert.strictEqual(pr1.isWeightPr, true);

      // Normal working set: 120kg x 5 -> no PR
      const pr2 = evaluatePersonalRecord({ weightKg: 120, reps: 5, rpe: 8 }, history);
      assert.strictEqual(pr2.isPr, false);
    });

    it('generates eggetarian and non-vegetarian Indian meal plans', () => {
      const eggPlan = generateIndianDietPlan({ bodyweightKg: 80, dietType: 'eggetarian', proteinMultiplier: 2.2 });
      assert.strictEqual(eggPlan.dietType, 'eggetarian');
      assert.ok(eggPlan.meals.length >= 4);

      const nonVegPlan = generateIndianDietPlan({ bodyweightKg: 80, dietType: 'non_vegetarian' });
      assert.strictEqual(nonVegPlan.dietType, 'non_vegetarian');
      assert.ok(nonVegPlan.staplesHighlighted.includes('Chicken Breast'));
    });

    it('evaluates peaking taper for 6, 3, and 2 weeks out', () => {
      const farOut = calculatePeakingTaperSchedule(6);
      assert.strictEqual(farOut.volumeReductionPercent, 0);

      const threeOut = calculatePeakingTaperSchedule(3);
      assert.strictEqual(threeOut.volumeReductionPercent, 25);

      const twoOut = calculatePeakingTaperSchedule(2);
      assert.strictEqual(twoOut.volumeReductionPercent, 40);
      assert.strictEqual(twoOut.isOpenerCheckWeek, true);
    });

    it('evaluates bodyweight rates for lean bulk and recomp', () => {
      // Bulk too fast (>0.6%)
      const fastBulk = evaluateBodyweightRate([81, 81, 81, 81, 81, 81, 81], [80, 80, 80, 80, 80, 80, 80], 'lean_bulk');
      assert.strictEqual(fastBulk.evaluationStatus, 'TOO_FAST');

      // Bulk too slow (<0.1%)
      const slowBulk = evaluateBodyweightRate([80, 80, 80, 80, 80, 80, 80], [80, 80, 80, 80, 80, 80, 80], 'lean_bulk');
      assert.strictEqual(slowBulk.evaluationStatus, 'TOO_SLOW');

      // Bulk on track
      const goodBulk = evaluateBodyweightRate([80.3, 80.3, 80.3, 80.3, 80.3, 80.3, 80.3], [80, 80, 80, 80, 80, 80, 80], 'lean_bulk');
      assert.strictEqual(goodBulk.evaluationStatus, 'ON_TRACK');

      // Recomp on track
      const recomp = evaluateBodyweightRate([80.1, 80.1, 80.1, 80.1, 80.1, 80.1, 80.1], [80, 80, 80, 80, 80, 80, 80], 'recomp');
      assert.strictEqual(recomp.evaluationStatus, 'ON_TRACK');
    });

    it('evaluates safety branch cases: moderate pain, adult guard, and text clean', () => {
      const modPain = validatePainThreshold(5);
      assert.strictEqual(modPain.allowed, true);
      assert.strictEqual(modPain.actionRequired, 'AUTO_REDUCE_OR_SWAP');

      const lowPain = validatePainThreshold(2);
      assert.strictEqual(lowPain.actionRequired, 'PROCEED');

      const adultGuard = validateYouthSafeguards(24, 'contest_prep', true);
      assert.strictEqual(adultGuard.isYouthSafeMode, false);
      assert.strictEqual(adultGuard.allowed, true);

      const cleanText = evaluateTextSafety('Just finished a great 5x5 squat session!');
      assert.strictEqual(cleanText.safe, true);

      const loadDec = validateLoadJump(140, 130, 3.0);
      assert.strictEqual(loadDec.allowed, true);
    });

    it('evaluates double progression load reduction on failed first set', () => {
      const failed = evaluateDoubleProgression(8, 12, 100, [{ loadKg: 100, reps: 5, rir: 0 }]);
      assert.strictEqual(failed.action, 'REDUCE_LOAD');
      assert.ok(failed.nextLoadKg < 100);
    });
  });

});

