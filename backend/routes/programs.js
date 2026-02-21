const express = require("express");
const router = express.Router();

// Lazy load Firebase to avoid initialization errors
let db, admin;
try {
  const firebase = require("../firebaseAdmin");
  db = firebase.db;
  admin = firebase.admin;
} catch (err) {
  console.warn("⚠️ Firebase not available, using mock data only");
}

const queryCache = require("../services/queryCache");

/**
 * GET ACTIVE OR PENDING PROGRAM - FROM FIRESTORE OR FALLBACK
 */
router.get("/:athleteId", async (req, res) => {
  try {
    const { athleteId } = req.params;
    console.log(`\n📥 GET /api/programs - athlete: ${athleteId}`);

    // Try Firestore first
    if (db) {
      try {
        // Fetch all programs for this athlete and get the most recent active one
        const snapshot = await db
          .collection("programs")
          .where("athlete_id", "==", athleteId)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const program = { programId: doc.id, ...doc.data() };
          console.log(`✅ Returned Firestore program (${doc.id}) with ${program.weeks?.length || 0} weeks`);
          return res.json(program);
        }
      } catch (firestoreErr) {
        console.warn(`⚠️ Firestore query failed: ${firestoreErr.message}, falling back to mock data`);
      }
    }

    // FALLBACK: Return mock program if Firestore unavailable or athlete has no program
    console.log("📋 Using fallback mock program");
    const mockProgram = {
      programId: "mock_program_001",
      athlete_id: athleteId,
      status: "active",
      metadata: { type: "strength_phase" },
      weeks: [
        {
          week: 1,
          phase: "Strength Phase",
          days: [
            {
              day_number: 1,
              main_lifts: [
                { lift: "Squat", sets: 4, reps: "5", load: 315, rpe: 8, id: "squat_1" },
                { lift: "Bench Press", sets: 4, reps: "5", load: 225, rpe: 8, id: "bench_1" }
              ],
              accessories: [
                { exercise: "Leg Press", sets: 3, reps: "8", id: "legpress_1" }
              ]
            },
            {
              day_number: 2,
              main_lifts: [
                { lift: "Deadlift", sets: 3, reps: "3", load: 405, rpe: 8, id: "deadlift_1" },
                { lift: "Squat", sets: 3, reps: "8", load: 275, rpe: 7, id: "squat_2" }
              ],
              accessories: []
            }
          ]
        }
      ],
      created_at: new Date().toISOString()
    };

    console.log("✅ Returning fallback mock program with", mockProgram.weeks.length, "weeks");
    return res.json(mockProgram);
  } catch (err) {
    console.error("❌ ERROR in GET program:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * SAVE OR UPDATE PROGRAM
 */
router.post("/save", async (req, res) => {
  try {
    const { athlete_id, weeks, metadata, name, programId } = req.body;
    if (!athlete_id || !weeks) return res.status(400).json({ error: "Missing data" });

    let programRef;
    if (programId) {
      programRef = db.collection("programs").doc(programId);
      await programRef.update({
        weeks,
        metadata: metadata || {},
        name: name || "Updated Protocol",
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        status: "pending_coach_review",
      });
    } else {
      programRef = db.collection("programs").doc();
      await programRef.set({
        athlete_id,
        name: name || "Manual Protocol",
        weeks,
        metadata: metadata || {},
        status: "pending_coach_review",
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Invalidate cache after update
    queryCache.delete(`programs_${athlete_id}`);

    console.log(`[SAVE_SUCCESS]: Program ${programRef.id} saved for ${athlete_id}`);
    return res.json({ success: true, programId: programRef.id });
  } catch (err) {
    console.error("❌ SAVE_PROGRAM_ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;