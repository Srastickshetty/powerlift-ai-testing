const express = require("express");
const router = express.Router();
const { db, admin } = require("../firebaseAdmin");
const { generateProgram } = require("../services/ruleBasedProgramGenerator");
const { requireSelfOrCoachOf } = require("../middleware/auth");

/**
 * FINALIZE COMPETITION
 * - Update athlete PRs safely
 * - Recalculate training max
 * - Archive ONLY competition block
 * - Generate new base program
 */
router.post("/finalize/:athleteId", requireSelfOrCoachOf("athleteId"), async (req, res) => {
  try {
    const { athleteId } = req.params;
    const { newPRs } = req.body;

    if (!newPRs || typeof newPRs !== "object") {
      return res.status(400).json({ error: "Valid PR data required" });
    }

    // 🔎 Fetch athlete
    const athleteQuery = await db
      .collection("athletes")
      .where("uid", "==", athleteId)
      .limit(1)
      .get();

    if (athleteQuery.empty) {
      return res.status(404).json({ error: "Athlete not found" });
    }

    const athleteDoc = athleteQuery.docs[0];
    const athlete = athleteDoc.data();

    const oldPRs = athlete.last_competition_pr || {};

    // 🛡️ Validate PRs (only update if higher)
    const validatedPRs = {
      squat: Math.max(newPRs.squat || 0, oldPRs.squat || 0),
      bench: Math.max(newPRs.bench || 0, oldPRs.bench || 0),
      deadlift: Math.max(newPRs.deadlift || 0, oldPRs.deadlift || 0),
    };

    // 📈 Training Max = 90% of PR (coach standard)
    const updatedTM = {
      squat: Math.round(validatedPRs.squat * 0.9),
      bench: Math.round(validatedPRs.bench * 0.9),
      deadlift: Math.round(validatedPRs.deadlift * 0.9),
    };

    // 🔥 Update Athlete Profile
    await athleteDoc.ref.update({
      training_max: updatedTM,
      last_competition_pr: validatedPRs,
      last_competition_date: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 🔒 Archive ONLY competition block
    const activePrograms = await db
      .collection("programs")
      .where("athlete_id", "==", athleteId)
      .where("status", "==", "active")
      .get();

    for (const docSnap of activePrograms.docs) {
      const data = docSnap.data();
      if (data.metadata?.type === "competition_block") {
        await docSnap.ref.update({ status: "archived" });
      }
    }

    // 🧠 Generate New Base Program
    const clusterMatch = {
      cluster_id: "0",
      label: "moderate_volume_rpe",
      confidence: 0.9,
    };

    const newProgram = generateProgram({
      athlete: { ...athlete, training_max: updatedTM },
      clusterMatch,
    });

    const ref = db.collection("programs").doc();

    await ref.set({
      athlete_id: athleteId,
      name: "Post-Competition Base Program",
      version: 1,
      weeks: newProgram.weeks,
      metadata: {
        type: "base_program",
        source: "post_comp_recalculated",
        generatedAt: new Date().toISOString(),
      },
status: athlete.training_mode === "coach" ? "pending_coach_review" : "active",
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({
      success: true,
      newProgramId: ref.id,
      updatedTrainingMax: updatedTM,
    });

  } catch (err) {
    console.error("❌ FINALIZE COMP ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
