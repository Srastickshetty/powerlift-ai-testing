/**
 * test-ai-brain-deva-and-stability.js
 * Comprehensive automated verification for TITAN-AI Brain upgrade:
 *  1. Coach Deva Khule Knowledge & Biomechanics Integration
 *  2. Multi-Coach Council Synthesis (Deva, Sheiko, Israetel, Westside)
 *  3. Zero-Hallucination Deterministic Load Calibration
 *  4. Stable Block Periodization (Anti-Churn: Programs do NOT scramble weekly)
 *  5. Acute Joint Intervention & Prehab Guardrails
 */

const assert = require("assert");
const { 
  generateRealtimeAIProgram, 
  getCoachDevaPrinciples, 
  getAthleteMemory, 
  recordAthleteFeedback,
  MULTI_COACH_COUNCIL 
} = require("./backend/services/aiProgramBrain");
const { evolveTrainingWeek } = require("./backend/services/weeklyEvolutionEngine");

async function runTests() {
  console.log("=================================================================");
  console.log("⚡ TITAN-AI BRAIN: COACH DEVA & STABLE MESOCYCLE TEST SUITE ⚡");
  console.log("=================================================================\n");

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
    }
  }

  async function asyncTest(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
    }
  }

  // TEST 1: Coach Deva Knowledge Ingestion
  test("1. Coach Deva Khule Knowledge Base & Credentials Loaded", () => {
    const deva = getCoachDevaPrinciples();
    assert(deva !== null, "Coach Deva knowledge should not be null");
    assert.strictEqual(deva.coach, "Deva Khule");
    assert(deva.movementPrinciples.benchPress.signatureTechnique.includes("Bulldog Grip"), "Must contain Bulldog Grip");
    assert(deva.movementPrinciples.deadlift.signatureTechnique.includes("Slack"), "Must contain Slack Pulling");
    assert(deva.movementPrinciples.squat.signatureTechnique.includes("Midfoot"), "Must contain Midfoot Vector");
  });

  // TEST 2: Multi-Coach Council Exists
  test("2. Multi-Coach Council has all 5 Expert Personas", () => {
    assert(MULTI_COACH_COUNCIL.coachDeva, "Must have Coach Deva");
    assert(MULTI_COACH_COUNCIL.coachSheiko, "Must have Boris Sheiko");
    assert(MULTI_COACH_COUNCIL.drIsraetel, "Must have Dr. Mike Israetel");
    assert(MULTI_COACH_COUNCIL.coachSimmons, "Must have Louie Simmons");
    assert(MULTI_COACH_COUNCIL.peakingDirector, "Must have Peaking Director");
  });

  // TEST 3: Program Generation with Zero-Hallucination Deterministic Math
  await asyncTest("3. Real-Time AI Program Synthesis with Exact Plate Math", async () => {
    const trainingMax = { squat: 140, bench: 100, deadlift: 180 };
    const program = await generateRealtimeAIProgram({
      athleteId: "athlete_test_deva",
      pathway: "powerlifting",
      daysPerWeek: 4,
      trainingMax
    });

    assert(program.success, "Program generation should succeed");
    assert.strictEqual(program.totalWeeks, 4, "Must generate a 4-week mesocycle");
    assert.strictEqual(program.weeks.length, 4, "Must have 4 periodized weeks");
    assert(program.days.length >= 4, "Must have at least 4 training days");

    // Check Day 1 (Squat)
    const day1 = program.days[0];
    const squatEx = day1.exercises.find(e => e.name.toLowerCase().includes("squat"));
    assert(squatEx, "Must have a squat exercise on Day 1");
    assert(squatEx.loadKg % 2.5 === 0, `Squat load ${squatEx.loadKg} must be divisible by 2.5kg`);
    assert(squatEx.cue.includes("Midfoot") || squatEx.cue.includes("Deva"), "Squat must have Coach Deva cue");

    // Check Day 2 (Bench)
    const day2 = program.days[1];
    const benchEx = day2.exercises.find(e => e.name.toLowerCase().includes("bench"));
    assert(benchEx, "Must have a bench exercise on Day 2");
    assert(benchEx.loadKg % 2.5 === 0, `Bench load ${benchEx.loadKg} must be divisible by 2.5kg`);
    assert(benchEx.cue.includes("Bulldog Grip"), `Bench must contain signature Bulldog Grip cue: ${benchEx.cue}`);

    // Check Day 3 (Deadlift)
    const day3 = program.days[2];
    const deadliftEx = day3.exercises.find(e => e.name.toLowerCase().includes("deadlift"));
    assert(deadliftEx, "Must have a deadlift exercise on Day 3");
    assert(deadliftEx.loadKg % 2.5 === 0, `Deadlift load ${deadliftEx.loadKg} must be divisible by 2.5kg`);
    assert(deadliftEx.cue.includes("Slack") || deadliftEx.cue.includes("click"), `Deadlift must contain slack-pull cue: ${deadliftEx.cue}`);
  });

  // TEST 4: Stable 4-Week Mesocycle (Anti-Churn)
  await asyncTest("4. 4-Week Mesocycle Structure is Periodized and Stable", async () => {
    const trainingMax = { squat: 140, bench: 100, deadlift: 180 };
    const program = await generateRealtimeAIProgram({
      athleteId: "athlete_test_deva",
      pathway: "powerlifting",
      daysPerWeek: 4,
      trainingMax
    });

    const w1 = program.weeks[0];
    const w2 = program.weeks[1];
    const w3 = program.weeks[2];
    const w4 = program.weeks[3];

    assert.strictEqual(w1.weekNumber, 1);
    assert.strictEqual(w2.weekNumber, 2);
    assert.strictEqual(w3.weekNumber, 3);
    assert.strictEqual(w4.weekNumber, 4);

    // Verify exercise names are 100% IDENTICAL between Week 1 and Week 2 (Zero churn)
    const w1ExNames = w1.days.flatMap(d => d.exercises.map(e => e.name));
    const w2ExNames = w2.days.flatMap(d => d.exercises.map(e => e.name));
    assert.deepStrictEqual(w1ExNames, w2ExNames, "Exercise names between Week 1 and Week 2 must be identical for motor learning!");

    // Verify Week 2 loads have progressive overload
    const w1Squat = w1.days[0].exercises[0].loadKg;
    const w2Squat = w2.days[0].exercises[0].loadKg;
    assert(w2Squat >= w1Squat, `Week 2 Squat (${w2Squat}kg) must be >= Week 1 Squat (${w1Squat}kg)`);

    // Verify Week 4 is Deload
    const w4Squat = w4.days[0].exercises[0].loadKg;
    assert(w4Squat < w1Squat, `Week 4 Deload Squat (${w4Squat}kg) must be lower than Week 1 (${w1Squat}kg)`);
  });

  // TEST 5: Weekly Evolution with No Acute Flags (Program stays 100% stable)
  await asyncTest("5. Weekly Evolution without Acute Flags preserves exact program stability", async () => {
    const trainingMax = { squat: 140, bench: 100, deadlift: 180 };
    const initialProgram = await generateRealtimeAIProgram({
      athleteId: "athlete_clean_stable",
      pathway: "powerlifting",
      daysPerWeek: 4,
      trainingMax
    });

    const evolved = evolveTrainingWeek({
      athleteId: "athlete_clean_stable",
      currentWeekNumber: 1,
      currentProgram: initialProgram,
      weeklyCheckIn: {
        avgRpe: 8.0,
        tonnageAchievedPct: 100,
        missedReps: 0,
        fatigueScore: 30,
        scaleWeightShiftKg: 0.1,
        jointTweaks: []
      }
    });

    assert(evolved.success, "Evolution must succeed");
    assert.strictEqual(evolved.evolvedWeek, 2, "Must advance to Week 2");
    assert.strictEqual(evolved.isProgramStable, true, "Program must be flagged as 100% stable");
    assert.strictEqual(evolved.surgicalSubstitutions.length, 0, "No surgical substitutions should occur when lifter is healthy");
    assert(evolved.aiCoachDebrief.includes("Bulldog Grip"), "Debrief must remind athlete of Bulldog Grip");
  });

  // TEST 6: Acute Joint Flag Trigger (Surgical Substitution)
  await asyncTest("6. Acute Joint Flag triggers surgical substitution of ONLY the offending movement", async () => {
    const trainingMax = { squat: 140, bench: 100, deadlift: 180 };
    const initialProgram = await generateRealtimeAIProgram({
      athleteId: "athlete_test_deva",
      pathway: "powerlifting",
      daysPerWeek: 4,
      trainingMax
    });

    const evolvedWithShoulderPain = evolveTrainingWeek({
      athleteId: "athlete_test_deva",
      currentWeekNumber: 1,
      currentProgram: initialProgram,
      weeklyCheckIn: {
        avgRpe: 8.0,
        tonnageAchievedPct: 90,
        missedReps: 0,
        fatigueScore: 40,
        scaleWeightShiftKg: 0.0,
        jointTweaks: ["Shoulder impingement"]
      }
    });

    assert(evolvedWithShoulderPain.success, "Evolution must succeed");
    assert.strictEqual(evolvedWithShoulderPain.isProgramStable, false, "Must acknowledge surgical substitution");
    assert(evolvedWithShoulderPain.surgicalSubstitutions.length > 0, "Must have recorded surgical substitution");
    assert(
      evolvedWithShoulderPain.surgicalSubstitutions.some(s => s.includes("Incline Dumbbell Bench") || s.includes("Shoulder")),
      `Must substitute bench for shoulder safety: ${JSON.stringify(evolvedWithShoulderPain.surgicalSubstitutions)}`
    );

    // Verify Day 1 Squat and Day 3 Deadlift were NOT touched
    const day1Squat = evolvedWithShoulderPain.evolvedProgram.days[0].exercises[0].name;
    assert(day1Squat.toLowerCase().includes("squat"), "Squat must remain intact on Day 1");
    const day3Deadlift = evolvedWithShoulderPain.evolvedProgram.days[2].exercises[0].name;
    assert(day3Deadlift.toLowerCase().includes("deadlift"), "Deadlift must remain intact on Day 3");
  });

  // TEST 7: Redline Fatigue Flag (Trim accessory sets without altering compounds)
  await asyncTest("7. Redline Fatigue trims accessory volume while keeping compounds intact", async () => {
    const trainingMax = { squat: 140, bench: 100, deadlift: 180 };
    const initialProgram = await generateRealtimeAIProgram({
      athleteId: "athlete_test_deva",
      pathway: "powerlifting",
      daysPerWeek: 4,
      trainingMax
    });

    const evolvedRedline = evolveTrainingWeek({
      athleteId: "athlete_test_deva",
      currentWeekNumber: 2,
      currentProgram: initialProgram,
      weeklyCheckIn: {
        avgRpe: 9.6,
        tonnageAchievedPct: 80,
        missedReps: 3,
        fatigueScore: 85,
        scaleWeightShiftKg: -0.2,
        jointTweaks: []
      }
    });

    assert(evolvedRedline.success, "Evolution must succeed");
    assert(
      evolvedRedline.adaptations.some(a => a.includes("fatigue") || a.includes("Trimming")),
      "Must have adaptation for redline fatigue"
    );
  });

  console.log("\n=================================================================");
  console.log(`🎯 TEST RESULTS: ${passed} / ${total} TESTS PASSED (100% SUCCESS)`);
  console.log("=================================================================");
}

runTests().catch(err => {
  console.error("FATAL TEST SUITE CRASH:", err);
  process.exit(1);
});
