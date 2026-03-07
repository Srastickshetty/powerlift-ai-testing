const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { applyDeload } = require("../services/applyProgramVersion");

// 🔑 IMPORT YOUR DB INSTANCE & ADMIN
const { db, admin } = require("../firebaseAdmin");

// 🔧 New Metric & Alert Services
const { buildProgress } = require("../services/progressService");
const { computeWeeklyLiftMetrics } = require("../services/weeklyPerformance");
const { generateCoachAlerts } = require("../services/coachAlerts");

// 🧠 Autoregulation Services
const { autoregulateNextWeek } = require("../services/applyAutoregulation");
const { applyProposal } = require("../services/applyProposal");

// Data paths
const dataDir = path.join(__dirname, "../data");
const programsPath = path.join(dataDir, "programs.json");
const logsPath = path.join(dataDir, "workoutLogs.json");
const proposalsPath = path.join(dataDir, "autoregulationProposals.json");
const athletesPath = path.join(dataDir, "athletes.json");

/* ─────────────────────────────────────────────────────────────
    🆕 COACH/ATHLETE MANAGEMENT ROUTES (Firestore)
   ───────────────────────────────────────────────────────────── */

/**
 * 📡 GET ALL ATHLETES ASSIGNED TO COACH
 */
router.get("/athletes/:coachId", async (req, res) => {
  try {
    const { coachId } = req.params;

    const snapshot = await db
      .collection("athletes")
      .where("training_mode", "==", "coach")
      .where("coach_id", "==", coachId)
      .get();

    const athletes = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // ⏳ 24 Hour AI Auto Approval for Athlete Link
      if (data.coach_request_status === "pending" && data.coach_requested_at) {
        const requestTime = new Date(data.coach_requested_at.toDate?.() || data.coach_requested_at);
        const now = new Date();
        const diffHours = (now - requestTime) / (1000 * 60 * 60);

        if (diffHours >= 24) {
          await doc.ref.update({
            coach_request_status: "approved",
            approved_by: "AI_AUTO_APPROVAL"
          });
          data.coach_request_status = "approved";
        }
      }

      // 📧 Fetch Firebase Auth user record for email
      let email = null;
      try {
        const userRecord = await admin.auth().getUser(doc.id);
        email = userRecord.email;
      } catch (err) {
        console.warn(`Auth lookup failed for UID ${doc.id}:`, err.message);
      }

      athletes.push({
        uid: doc.id,
        email,
        ...data,
      });
    }

    res.json(athletes);
  } catch (err) {
    console.error("❌ FETCH COACH ATHLETES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📨 Athlete requests coach
 */
router.post("/request-coach/:athleteId", async (req, res) => {
  try {
    const { athleteId } = req.params;
    await db.collection("athletes").doc(athleteId).update({
      training_mode: "coach",
      coach_id: "T37Oellg4pg5oE9HA6kWTqDIFvF2", 
      coach_request_status: "pending",
      coach_requested_at: new Date()
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ Coach Approve Athlete Link
 */
router.post("/approve-athlete/:athleteId", async (req, res) => {
  try {
    const { athleteId } = req.params;
    await db.collection("athletes").doc(athleteId).update({
      coach_request_status: "approved"
    });

    const activePrograms = await db
      .collection("programs")
      .where("athlete_id", "==", athleteId)
      .where("status", "==", "active")
      .get();

    for (const doc of activePrograms.docs) {
      await doc.ref.update({
        metadata: {
          ...doc.data().metadata,
          controlled_by: "coach",
          supervision_started_at: new Date()
        }
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📋 Get programs pending coach review
 */
router.get("/pending-programs", async (req, res) => {
  try {
    const snapshot = await db.collection("programs").where("status", "==", "pending_coach_review").get();
    const programs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(programs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🛠 Get programs currently active under coach supervision
 */
router.get("/controlled-programs/:coachId", async (req, res) => {
  try {
    const { coachId } = req.params;

    // Get approved athletes for this coach
    const athleteSnapshot = await db
      .collection("athletes")
      .where("coach_id", "==", coachId)
      .where("coach_request_status", "==", "approved")
      .get();

    const athleteIds = athleteSnapshot.docs.map(doc => doc.id);

    if (athleteIds.length === 0) {
      return res.json([]);
    }

    const programSnapshot = await db
      .collection("programs")
      .where("athlete_id", "in", athleteIds)
      .where("status", "==", "active")
      .get();

    const programs = programSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(programs);

  } catch (err) {
    console.error("CONTROLLED_PROGRAM_FETCH_ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


/**
 * 🔥 Coach Approve Program Protocol
 */
router.post("/approve-program/:programId", async (req, res) => {
  try {
    const { programId } = req.params;
    const programRef = db.collection("programs").doc(programId);
    const programSnap = await programRef.get();
    
    if (!programSnap.exists) return res.status(404).json({ error: "Program not found" });
    
    const { athlete_id } = programSnap.data();
    const activePrograms = await db.collection("programs").where("athlete_id", "==", athlete_id).where("status", "==", "active").get();

    for (const doc of activePrograms.docs) {
      await doc.ref.update({ status: "archived" });
    }

    await programRef.update({
      status: "active",
      approved_by: "coach",
      approved_at: new Date(),
      metadata: { controlled_by: "coach" }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Coach edits program before approval
 */
router.put("/edit-program/:programId", async (req, res) => {
  try {
    const { programId } = req.params;
    const { updatedWeeks } = req.body;
    await db.collection("programs").doc(programId).update({
      weeks: updatedWeeks,
      edited_by: "coach",
      edited_at: new Date()
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
    🆕 FIRESTORE PROGRAM DISPLAY ROUTES (Improved Logic)
   ───────────────────────────────────────────────────────────── */

/**
 * 📡 Get program for athlete (Coach Smart Fetch)
 * Prioritizes active, falls back to most recent so page never appears empty.
 */
router.get("/athlete/:athleteId/program", async (req, res) => {
  try {
    const { athleteId } = req.params;
    console.log("ATHLETE ID RECEIVED:", athleteId);

    const snapshot = await db
      .collection("programs")
      .where("athlete_id", "==", athleteId)
      .get();

    console.log("MATCHING PROGRAM COUNT:", snapshot.size);

    if (snapshot.empty) {
      return res.status(404).json({ error: "No program found for this athlete" });
    }

    // Prefer active program
    let programDoc = snapshot.docs.find(doc => doc.data().status === "active");

    // If none active, fallback to most recent document
    if (!programDoc) {
      console.log("No active program found, falling back to recent document.");
      programDoc = snapshot.docs[0];
    }

    res.json({
      id: programDoc.id,
      ...programDoc.data()
    });

  } catch (err) {
    console.error("❌ COACH PROGRAM FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🏆 Get competition requests for coach
 */
router.get("/competition-requests/:coachId", async (req, res) => {
  try {
    const { coachId } = req.params;
    
    // Get athletes assigned to this coach
    const athleteSnapshot = await db
      .collection("athletes")
      .where("coach_id", "==", coachId)
      .where("coach_request_status", "==", "approved")
      .get();
    
    const athleteIds = athleteSnapshot.docs.map(doc => doc.id);
    
    if (athleteIds.length === 0) {
      return res.json([]);
    }
    
    // Get competition data for these athletes
    const competitionSnapshot = await db
      .collection("competitions")
      .where("athlete_id", "in", athleteIds)
      .where("status", "in", ["requested", "pending_approval"])
      .get();
    
    const competitionRequests = competitionSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(competitionRequests);
    
  } catch (err) {
    console.error("❌ COMPETITION REQUESTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📊 Program Structure (Based on fetched program)
 */
router.get("/athlete/:athleteId/program-structure", async (req, res) => {
  try {
    const { athleteId } = req.params;
    const snapshot = await db
      .collection("programs")
      .where("athlete_id", "==", athleteId)
      .get();

    if (snapshot.empty) return res.status(404).json({ error: "No active program found" });

    // Use active or fallback
    let doc = snapshot.docs.find(d => d.data().status === "active") || snapshot.docs[0];
    const program = doc.data();
    const weeks = program.weeks || [];

    res.json({
      totalWeeks: weeks.length,
      totalDays: weeks.reduce((acc, w) => acc + (w.days?.length || 0), 0),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📜 Safe Program History (No orderBy to prevent 500 errors)
 */
router.get("/athlete/:athleteId/program-history", async (req, res) => {
  try {
    const { athleteId } = req.params;

    const snapshot = await db
      .collection("programs")
      .where("athlete_id", "==", athleteId)
      .get();

    if (snapshot.empty) {
      return res.json([]);
    }

    const history = snapshot.docs.map(doc => {
      const data = doc.data();

      return {
        id: doc.id,
        version: data.version || 1,
        weeks: data.weeks?.length || 0,
        reason: data.metadata?.reason || "Program update",
        approved_by: data.approved_by || "System",
        status: data.status || "unknown",
        created_at: data.created_at
          ? data.created_at.toDate().getTime()
          : 0
      };
    });

    // Sort newest first
    history.sort((a, b) => b.created_at - a.created_at);

    res.json(history);

  } catch (err) {
    console.error("❌ PROGRAM HISTORY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🟡 Proposal Route (Stub for frontend)
 */
router.get("/athlete/:athleteId/proposal", async (req, res) => {
  res.json(null);
});

/**
 * 💾 Draft Route (Stub for frontend)
 */
router.get("/athlete/:athleteId/program-draft", async (req, res) => {
  res.json(null);
});

/* ─────────────────────────────────────────────────────────────
    📊 PERFORMANCE MONITORING ROUTES (Stubbed/Legacy)
   ───────────────────────────────────────────────────────────── */

router.get("/dashboard", async (req, res) => {
    // Note: This logic depends on local JSON files. 
    // If you've moved to Firestore, this will need a rewrite.
    res.status(501).json({ message: "Dashboard requires Firestore migration" });
});

module.exports = router;