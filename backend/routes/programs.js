const express = require("express");
const router = express.Router();
const { db, admin } = require("../firebaseAdmin");
const { generateProgram } = require("../services/ruleBasedProgramGenerator");
const queryCache = require("../services/queryCache");
const { requireSelfOrCoachOf } = require("../middleware/auth");

/**
 * GET /api/programs/coach-deva-principles
 * Retrieve Coach Deva Khule's complete engineering biomechanics and nutrition knowledge
 */
router.get("/coach-deva-principles", (req, res) => {
  try {
    const { getCoachDevaPrinciples } = require("../services/aiProgramBrain");
    const principles = getCoachDevaPrinciples();
    res.json({ success: true, principles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/programs/multi-coach-council
 * Retrieve the Multi-Coach Council profiles and contributions
 */
router.get("/multi-coach-council", (req, res) => {
  try {
    const { MULTI_COACH_COUNCIL } = require("../services/aiProgramBrain");
    res.json({ success: true, council: MULTI_COACH_COUNCIL });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/programs/ai-memory/:athleteId
 * Retrieve the AI Brain's training memory vector for the lifter
 */
router.get("/ai-memory/:athleteId", requireSelfOrCoachOf("athleteId"), (req, res) => {
  try {
    const { athleteId } = req.params;
    const { getAthleteMemory } = require("../services/aiProgramBrain");
    const memory = getAthleteMemory(athleteId);
    res.json({ success: true, memory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET ACTIVE OR PENDING PROGRAM - FROM FIRESTORE OR FALLBACK
 */
router.get("/:athleteId", requireSelfOrCoachOf("athleteId"), async (req, res) => {
  try {
    const { athleteId } = req.params;

    // Check Cache First
    const cacheKey = `programs_${athleteId}`;
    const cached = queryCache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    if (db) {
      try {
        const snapshot = await db
          .collection("programs")
          .where("athlete_id", "==", athleteId)
          .where("status", "==", "active")
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const program = { id: doc.id, programId: doc.id, ...doc.data() };
          queryCache.set(cacheKey, program);
          return res.json(program);
        }

        // Fallback: any program for this athlete
        const anySnapshot = await db
          .collection("programs")
          .where("athlete_id", "==", athleteId)
          .limit(1)
          .get();

        if (!anySnapshot.empty) {
          const doc = anySnapshot.docs[0];
          const program = { id: doc.id, programId: doc.id, ...doc.data() };
          queryCache.set(cacheKey, program);
          return res.json(program);
        }
      } catch (firestoreErr) {
        console.warn(`Firestore query failed: ${firestoreErr.message}`);
      }
    }

    // Default fallback program template with complete 4-week mesocycle
    const fallbackProgram = {
      programId: "default_starter_program",
      athlete_id: athleteId,
      status: "active",
      name: "Standard SBD 4-Week Block",
      metadata: { type: "strength_phase", total_weeks: 4 },
      weeks: [
        {
          week: 1,
          phase: "Accumulation",
          focus: "Establish movement rhythm & bar speed baseline",
          loadModifier: 1.0,
          days: [
            {
              day: 1,
              main_lifts: [
                { lift: "Squat", sets: 4, reps: "5", load: 140, rpe: 8, id: "squat_w1d1" },
                { lift: "Bench", sets: 4, reps: "5", load: 100, rpe: 8, id: "bench_w1d1" }
              ],
              accessories: [
                { exercise: "Leg Press", sets: 3, reps: "8-10", id: "legpress_w1d1" }
              ]
            },
            {
              day: 2,
              main_lifts: [
                { lift: "Deadlift", sets: 3, reps: "4", load: 180, rpe: 8, id: "deadlift_w1d2" },
                { lift: "Squat", sets: 3, reps: "6", load: 120, rpe: 7, id: "squat_var_w1d2" }
              ],
              accessories: [
                { exercise: "Barbell Rows", sets: 3, reps: "8-10", id: "rows_w1d2" }
              ]
            },
            {
              day: 3,
              main_lifts: [
                { lift: "Bench", sets: 4, reps: "4", load: 105, rpe: 8, id: "bench_w1d3" },
                { lift: "Squat", sets: 3, reps: "5", load: 145, rpe: 8, id: "squat_w1d3" }
              ],
              accessories: [
                { exercise: "Overhead Press", sets: 3, reps: "8", id: "ohp_w1d3" }
              ]
            }
          ]
        },
        {
          week: 2,
          phase: "Progression",
          focus: "+2.5kg to +5kg progressive overload wave",
          loadModifier: 1.025,
          days: [
            {
              day: 1,
              main_lifts: [
                { lift: "Squat", sets: 4, reps: "5", load: 145, rpe: 8.5, id: "squat_w2d1" },
                { lift: "Bench", sets: 4, reps: "5", load: 102.5, rpe: 8.5, id: "bench_w2d1" }
              ],
              accessories: [
                { exercise: "Leg Press", sets: 3, reps: "8-10", id: "legpress_w2d1" }
              ]
            },
            {
              day: 2,
              main_lifts: [
                { lift: "Deadlift", sets: 3, reps: "4", load: 185, rpe: 8.5, id: "deadlift_w2d2" },
                { lift: "Squat", sets: 3, reps: "6", load: 125, rpe: 7.5, id: "squat_var_w2d2" }
              ],
              accessories: [
                { exercise: "Barbell Rows", sets: 3, reps: "8-10", id: "rows_w2d2" }
              ]
            },
            {
              day: 3,
              main_lifts: [
                { lift: "Bench", sets: 4, reps: "4", load: 107.5, rpe: 8.5, id: "bench_w2d3" },
                { lift: "Squat", sets: 3, reps: "5", load: 150, rpe: 8.5, id: "squat_w2d3" }
              ],
              accessories: [
                { exercise: "Overhead Press", sets: 3, reps: "8", id: "ohp_w2d3" }
              ]
            }
          ]
        },
        {
          week: 3,
          phase: "Peak",
          focus: "High intensity singles @ RPE 8.5-9 and neural rate of force",
          loadModifier: 1.05,
          days: [
            {
              day: 1,
              main_lifts: [
                { lift: "Squat", sets: 3, reps: "3", load: 150, rpe: 9, id: "squat_w3d1" },
                { lift: "Bench", sets: 3, reps: "3", load: 107.5, rpe: 9, id: "bench_w3d1" }
              ],
              accessories: [
                { exercise: "Leg Press", sets: 3, reps: "6-8", id: "legpress_w3d1" }
              ]
            },
            {
              day: 2,
              main_lifts: [
                { lift: "Deadlift", sets: 3, reps: "2", load: 195, rpe: 9, id: "deadlift_w3d2" },
                { lift: "Squat", sets: 3, reps: "4", load: 130, rpe: 8, id: "squat_var_w3d2" }
              ],
              accessories: [
                { exercise: "Barbell Rows", sets: 3, reps: "6-8", id: "rows_w3d2" }
              ]
            },
            {
              day: 3,
              main_lifts: [
                { lift: "Bench", sets: 3, reps: "3", load: 110, rpe: 9, id: "bench_w3d3" },
                { lift: "Squat", sets: 3, reps: "3", load: 155, rpe: 9, id: "squat_w3d3" }
              ],
              accessories: [
                { exercise: "Overhead Press", sets: 3, reps: "6", id: "ohp_w3d3" }
              ]
            }
          ]
        },
        {
          week: 4,
          phase: "Deload",
          focus: "Volume cut by 30%, CNS recovery and joint resensitization",
          loadModifier: 0.85,
          days: [
            {
              day: 1,
              main_lifts: [
                { lift: "Squat", sets: 2, reps: "4", load: 120, rpe: 6, id: "squat_w4d1" },
                { lift: "Bench", sets: 2, reps: "4", load: 85, rpe: 6, id: "bench_w4d1" }
              ],
              accessories: [
                { exercise: "Leg Press", sets: 2, reps: "8", id: "legpress_w4d1" }
              ]
            },
            {
              day: 2,
              main_lifts: [
                { lift: "Deadlift", sets: 2, reps: "3", load: 155, rpe: 6, id: "deadlift_w4d2" },
                { lift: "Squat", sets: 2, reps: "4", load: 105, rpe: 6, id: "squat_var_w4d2" }
              ],
              accessories: [
                { exercise: "Barbell Rows", sets: 2, reps: "8", id: "rows_w4d2" }
              ]
            },
            {
              day: 3,
              main_lifts: [
                { lift: "Bench", sets: 2, reps: "4", load: 90, rpe: 6, id: "bench_w4d3" },
                { lift: "Squat", sets: 2, reps: "4", load: 125, rpe: 6, id: "squat_w4d3" }
              ],
              accessories: [
                { exercise: "Overhead Press", sets: 2, reps: "8", id: "ohp_w4d3" }
              ]
            }
          ]
        }
      ],
      created_at: new Date().toISOString()
    };

    return res.json(fallbackProgram);
  } catch (err) {
    console.error("ERROR in GET program:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GENERATE FULL DETERMINISTIC PROGRAM FOR ATHLETE
 */
router.post("/generate/:athleteId", requireSelfOrCoachOf("athleteId"), async (req, res) => {
  try {
    const { athleteId } = req.params;
    let athleteData = req.body || {};

    if (db) {
      const athleteDoc = await db.collection("athletes").doc(athleteId).get();
      if (athleteDoc.exists) {
        athleteData = { ...athleteDoc.data(), ...athleteData };
      }
    }

    // Normalize athlete parameters with robust defaults
    const normalizedAthlete = {
      uid: athleteId,
      goal: athleteData.goal || "strength",
      days_available: Number(athleteData.days_available || athleteData.days_per_week || 4),
      experience_level: athleteData.experience_level || "intermediate",
      fatigue_rate: athleteData.fatigue_rate || 0.2,
      training_mode: athleteData.training_mode || "ai",
      training_max: {
        squat: Number(athleteData.training_max?.squat || athleteData.squat_max || 140),
        bench: Number(athleteData.training_max?.bench || athleteData.bench_max || 100),
        deadlift: Number(athleteData.training_max?.deadlift || athleteData.deadlift_max || 180)
      }
    };

    // Run deterministic generator
    const generated = generateProgram({ athlete: normalizedAthlete });

    const programToSave = {
      athlete_id: athleteId,
      name: `${normalizedAthlete.days_available}-Day Powerlifting Protocol`,
      version: 1,
      status: normalizedAthlete.training_mode === "coach" ? "pending_coach_review" : "active",
      weeks: generated.weeks,
      metadata: {
        ...generated.metadata,
        days_per_week: normalizedAthlete.days_available,
        experience_level: normalizedAthlete.experience_level,
        training_max: normalizedAthlete.training_max
      },
      created_at: admin ? admin.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
    };

    let programId = `prog_${athleteId}_${Date.now()}`;

    if (db) {
      // Archive existing active programs if training mode is AI
      if (normalizedAthlete.training_mode !== "coach") {
        const activeSnaps = await db.collection("programs")
          .where("athlete_id", "==", athleteId)
          .where("status", "==", "active")
          .get();
        for (const doc of activeSnaps.docs) {
          await doc.ref.update({ status: "archived" });
        }
      }

      const newRef = db.collection("programs").doc();
      await newRef.set(programToSave);
      programId = newRef.id;
    }

    queryCache.delete(`programs_${athleteId}`);

    res.json({
      success: true,
      programId,
      program: { id: programId, ...programToSave }
    });
  } catch (err) {
    console.error("ERROR in GENERATE program:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GENERATE 14-WEEK COMPETITION PEAKING PROTOCOL
 */
router.post("/generate/peaking/:athleteId", requireSelfOrCoachOf("athleteId"), async (req, res) => {
  try {
    const { athleteId } = req.params;
    const { meet_date, current_strength = {}, weeks_until_meet = 14 } = req.body;

    const sq = Number(current_strength.squat || 160);
    const bp = Number(current_strength.bench || 110);
    const dl = Number(current_strength.deadlift || 200);

    const weeks = [];
    for (let w = 1; w <= 14; w++) {
      let phase = "Accumulation";
      let avgIntensity = 72;
      let totalVol = 18000;
      let targetRpe = 7.5;
      let repScheme = "6";
      let squatPct = 0.72;
      let benchPct = 0.72;
      let dlPct = 0.72;

      if (w <= 4) {
        phase = "Accumulation";
        avgIntensity = 70 + w * 2;
        totalVol = 20000 - w * 500;
        targetRpe = 7.5 + (w * 0.2);
        repScheme = "6";
        squatPct = 0.70 + (w * 0.02);
        benchPct = 0.70 + (w * 0.02);
        dlPct = 0.70 + (w * 0.02);
      } else if (w <= 8) {
        phase = "Intensification";
        avgIntensity = 80 + (w - 4) * 2;
        totalVol = 16000 - (w - 4) * 800;
        targetRpe = 8.0 + ((w - 4) * 0.2);
        repScheme = "4";
        squatPct = 0.80 + ((w - 4) * 0.025);
        benchPct = 0.80 + ((w - 4) * 0.025);
        dlPct = 0.80 + ((w - 4) * 0.025);
      } else if (w <= 11) {
        phase = "Realization";
        avgIntensity = 88 + (w - 8) * 3;
        totalVol = 11000 - (w - 8) * 1200;
        targetRpe = 9.0;
        repScheme = "2";
        squatPct = 0.88 + ((w - 8) * 0.03);
        benchPct = 0.88 + ((w - 8) * 0.03);
        dlPct = 0.88 + ((w - 8) * 0.03);
      } else {
        phase = "Taper & Supercompensation";
        avgIntensity = 92 - (w - 11) * 5;
        totalVol = 6000 - (w - 11) * 1500;
        targetRpe = 7.0;
        repScheme = "1";
        squatPct = 0.85;
        benchPct = 0.85;
        dlPct = 0.85;
      }

      weeks.push({
        week: w,
        phase,
        total_volume: Math.round(totalVol),
        avg_intensity: Math.round(avgIntensity),
        target_rpe: Number(targetRpe.toFixed(1)),
        target_rir: Number((10 - targetRpe).toFixed(1)),
        days: [
          {
            day: 1,
            main_lifts: [
              { lift: "Squat", sets: w > 11 ? 2 : 4, reps: repScheme, load: Math.round(sq * squatPct), rpe: targetRpe },
              { lift: "Bench", sets: w > 11 ? 2 : 4, reps: repScheme, load: Math.round(bp * benchPct), rpe: targetRpe }
            ],
            accessories: w > 11 ? [] : [{ exercise: "Paused Leg Press", sets: 3, reps: "8" }]
          },
          {
            day: 2,
            main_lifts: [
              { lift: "Deadlift", sets: w > 11 ? 2 : 3, reps: repScheme, load: Math.round(dl * dlPct), rpe: targetRpe },
              { lift: "Competition Bench (Tempo)", sets: 3, reps: repScheme, load: Math.round(bp * (benchPct - 0.05)), rpe: 7.5 }
            ],
            accessories: w > 11 ? [] : [{ exercise: "Chest Supported Row", sets: 3, reps: "10" }]
          },
          {
            day: 3,
            main_lifts: [
              { lift: "Heavy Squat (Opener Prep)", sets: w > 11 ? 1 : 3, reps: repScheme, load: Math.round(sq * (squatPct + 0.02)), rpe: targetRpe },
              { lift: "Heavy Deadlift (Speed)", sets: 3, reps: "2", load: Math.round(dl * 0.75), rpe: 7 }
            ],
            accessories: []
          }
        ]
      });
    }

    const peakingProgram = {
      athlete_id: athleteId,
      name: "14-Week Championship Peaking Protocol",
      is_peaking_program: true,
      current_week: 1,
      status: "active",
      meet_date: meet_date || new Date(Date.now() + 98 * 24 * 60 * 60 * 1000).toISOString(),
      weeks,
      metadata: {
        total_weeks: 14,
        type: "competition_peaking",
        training_max: { squat: sq, bench: bp, deadlift: dl }
      },
      created_at: admin ? admin.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
    };

    let programId = `peaking_${athleteId}_${Date.now()}`;
    if (db) {
      const activeSnaps = await db.collection("programs")
        .where("athlete_id", "==", athleteId)
        .where("status", "==", "active")
        .get();
      for (const doc of activeSnaps.docs) {
        await doc.ref.update({ status: "archived" });
      }

      const newRef = db.collection("programs").doc();
      await newRef.set(peakingProgram);
      programId = newRef.id;
    }

    queryCache.delete(`programs_${athleteId}`);

    res.json({
      success: true,
      programId,
      program: { id: programId, ...peakingProgram }
    });
  } catch (err) {
    console.error("ERROR generating peaking program:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * SAVE OR UPDATE PROGRAM
 */
router.post("/save", requireSelfOrCoachOf("athlete_id"), async (req, res) => {
  try {
    const { athlete_id, weeks, metadata, name, programId, status } = req.body;
    if (!athlete_id || !weeks) return res.status(400).json({ error: "Missing data (athlete_id, weeks)" });

    if (!db) return res.json({ success: true, programId: programId || "mock_saved" });

    let programRef;
    if (programId) {
      programRef = db.collection("programs").doc(programId);
      await programRef.update({
        weeks,
        metadata: metadata || {},
        name: name || "Updated Protocol",
        status: status || "active",
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      programRef = db.collection("programs").doc();
      await programRef.set({
        athlete_id,
        name: name || "Custom Protocol",
        weeks,
        metadata: metadata || {},
        status: status || "active",
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    queryCache.delete(`programs_${athlete_id}`);

    return res.json({ success: true, programId: programRef.id });
  } catch (err) {
    console.error("SAVE_PROGRAM_ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/programs/ai-generate/:athleteId
 * Real-Time AI Program Synthesis with Sports Science Context
 */
router.post("/ai-generate/:athleteId", requireSelfOrCoachOf("athleteId"), async (req, res) => {
  try {
    const { athleteId } = req.params;

    const { generateRealtimeAIProgram } = require("../services/aiProgramBrain");
    const programData = await generateRealtimeAIProgram({
      athleteId,
      ...req.body
    });

    queryCache.delete(`programs_${athleteId}`);
    res.json(programData);
  } catch (err) {
    console.error("AI_GENERATE_ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/programs/ai-feedback/:athleteId
 * Train the AI Brain with athlete workout feedback & joint status
 */
router.post("/ai-feedback/:athleteId", requireSelfOrCoachOf("athleteId"), async (req, res) => {
  try {
    const { athleteId } = req.params;
    const { recordAthleteFeedback } = require("../services/aiProgramBrain");
    const updatedMemory = recordAthleteFeedback(athleteId, req.body);
    res.json({ success: true, memory: updatedMemory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/programs/ai-evolve-week/:athleteId
 * Autonomous Weekly AI Micro-Cycle Evolution Engine
 */
router.post("/ai-evolve-week/:athleteId", requireSelfOrCoachOf("athleteId"), (req, res) => {
  try {
    const { athleteId } = req.params;
    const { evolveTrainingWeek } = require("../services/weeklyEvolutionEngine");
    const { currentWeekNumber, currentProgram, weeklyCheckIn } = req.body;

    const evolvedResult = evolveTrainingWeek({
      athleteId,
      currentWeekNumber: Number(currentWeekNumber) || 1,
      currentProgram,
      weeklyCheckIn: weeklyCheckIn || {}
    });

    queryCache.delete(`programs_${athleteId}`);
    res.json(evolvedResult);
  } catch (err) {
    console.error("AI_EVOLVE_WEEK_ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;