const express = require("express");
const router = express.Router();
const { db, admin } = require("../firebaseAdmin");
const { computeWeeklyLiftMetrics } = require("../services/weeklyPerformance");
const { generateCoachAlerts } = require("../services/coachAlerts");
const { applyProposal } = require("../services/applyProposal");
const SentimentInterventionEngine = require("../agents/sentiment/intervention-logic");
const { requireRole, requireSelfOrCoachOf } = require("../middleware/auth");

const sentimentEngine = new SentimentInterventionEngine();

/**
 * Verify coach can only access their own coachId parameter (unless admin)
 */
function verifyCoachIdentity(req, res, next) {
  const { coachId } = req.params;
  const isAdmin = req.user?.role === "admin" || req.user?.email?.toLowerCase().includes("admin");
  if (!isAdmin && coachId && req.user?.uid !== coachId) {
    return res.status(403).json({
      error: "FORBIDDEN",
      message: "You are not authorized to view another coach's roster or data."
    });
  }
  next();
}

/**
 * GET /api/coach/public
 * Public coach directory for athlete discovery (no auth required)
 */
router.get("/public", async (req, res) => {
  try {
    if (!db) return res.json([]);
    const snapshot = await db.collection("athletes").where("role", "==", "coach").get();
    const coaches = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || data.displayName || "Certified Coach",
        bio: data.bio || "Strength & Conditioning Specialist",
        specialty: data.specialty || "Powerlifting / Bodybuilding",
        track: data.track || "powerlifting",
        acceptingClients: data.acceptingClients !== false
      };
    });
    res.json(coaches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
    COACH/ATHLETE MANAGEMENT ROUTES (Firestore Multi-Tenant)
   ───────────────────────────────────────────────────────────── */

/**
 * 📡 GET ALL ATHLETES ASSIGNED TO COACH
 */
router.get("/athletes/:coachId", requireRole("coach", "admin"), verifyCoachIdentity, async (req, res) => {
  try {
    const { coachId } = req.params;

    if (!db) return res.json([]);

    const snapshot = await db
      .collection("athletes")
      .where("coach_id", "==", coachId)
      .get();

    const athletes = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // ⏳ 24 Hour AI Auto Approval for Athlete Link if pending
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

      let email = data.email || null;
      if (!email && admin) {
        try {
          const userRecord = await admin.auth().getUser(doc.id);
          email = userRecord.email;
        } catch (err) {
          // auth lookup optional
        }
      }

      athletes.push({
        id: doc.id,
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
router.post("/request-coach/:athleteId", requireSelfOrCoachOf("athleteId"), async (req, res) => {
  try {
    const { athleteId } = req.params;
    const { coachId } = req.body;

    if (!db) return res.json({ success: true });

    await db.collection("athletes").doc(athleteId).update({
      training_mode: "coach",
      coach_id: coachId || req.body.coach_id || "coach_primary",
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
router.post("/approve-athlete/:athleteId", requireRole("coach", "admin"), async (req, res) => {
  try {
    const { athleteId } = req.params;
    if (!db) return res.json({ success: true });

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
router.get("/pending-programs", requireRole("coach", "admin"), async (req, res) => {
  try {
    if (!db) return res.json([]);
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
router.get("/controlled-programs/:coachId", requireRole("coach", "admin"), verifyCoachIdentity, async (req, res) => {
  try {
    const { coachId } = req.params;
    if (!db) return res.json([]);

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
router.post("/approve-program/:programId", requireRole("coach", "admin"), async (req, res) => {
  try {
    const { programId } = req.params;
    if (!db) return res.json({ success: true });

    const programRef = db.collection("programs").doc(programId);
    const programSnap = await programRef.get();
    
    if (!programSnap.exists) return res.status(404).json({ error: "Program not found" });
    
    const { athlete_id } = programSnap.data();
    const activePrograms = await db.collection("programs")
      .where("athlete_id", "==", athlete_id)
      .where("status", "==", "active")
      .get();

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
router.put("/edit-program/:programId", requireRole("coach", "admin"), async (req, res) => {
  try {
    const { programId } = req.params;
    const { updatedWeeks } = req.body;
    if (!db) return res.json({ success: true });

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

/**
 * 📡 Get program for athlete (Coach Smart Fetch)
 */
router.get("/athlete/:athleteId/program", requireSelfOrCoachOf("athleteId"), async (req, res) => {
  try {
    const { athleteId } = req.params;
    if (!db) return res.status(404).json({ error: "No database" });

    const snapshot = await db
      .collection("programs")
      .where("athlete_id", "==", athleteId)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "No program found for this athlete" });
    }

    let programDoc = snapshot.docs.find(doc => doc.data().status === "active") || snapshot.docs[0];

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
router.get("/competition-requests/:coachId", requireRole("coach", "admin"), verifyCoachIdentity, async (req, res) => {
  try {
    const { coachId } = req.params;
    if (!db) return res.json([]);
    
    const athleteSnapshot = await db
      .collection("athletes")
      .where("coach_id", "==", coachId)
      .where("coach_request_status", "==", "approved")
      .get();
    
    const athleteIds = athleteSnapshot.docs.map(doc => doc.id);
    if (athleteIds.length === 0) return res.json([]);
    
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
 * ✅ Coach Approve Competition Request
 */
router.post("/approve-competition/:requestId", requireRole("coach", "admin"), async (req, res) => {
  try {
    const { requestId } = req.params;
    if (db) {
      await db.collection("competitions").doc(requestId).set({
        status: "approved",
        approved_at: new Date()
      }, { merge: true });
    }
    res.json({ success: true, message: "Competition approved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ❌ Coach Deny Competition Request
 */
router.post("/deny-competition/:requestId", requireRole("coach", "admin"), async (req, res) => {
  try {
    const { requestId } = req.params;
    if (db) {
      await db.collection("competitions").doc(requestId).set({
        status: "denied",
        denied_at: new Date()
      }, { merge: true });
    }
    res.json({ success: true, message: "Competition denied" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🚨 Interventions Queue for Coach Strategy Room
 */
router.get("/interventions/:coachId", requireRole("coach", "admin"), verifyCoachIdentity, async (req, res) => {
  try {
    const { coachId } = req.params;
    if (!db) return res.json({ success: true, interventions: [] });

    // Fetch athletes for coach
    const athleteSnapshot = await db.collection("athletes")
      .where("coach_id", "==", coachId)
      .limit(20)
      .get();

    const interventions = [];

    athleteSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const fatigueRate = data.fatigue_rate || 0.25;
      const missRate = data.miss_rate || 0;

      if (fatigueRate > 0.4 || missRate > 0.15) {
        interventions.push({
          id: `int_${doc.id}`,
          athleteId: doc.id,
          athleteName: data.name || data.email || 'Athlete',
          severity: fatigueRate > 0.6 ? 'critical' : 'warning',
          type: fatigueRate > 0.6 ? 'FATIGUE_OVERLOAD' : 'TECHNIQUE_DEVIATION',
          message: fatigueRate > 0.6 
            ? 'High CNS fatigue and elevated RPE detected. Recommended: 3-day volume deload.'
            : 'Elevated miss rate on top sets. Adjust target RPE down by 1 point.',
          timestamp: new Date().toISOString()
        });
      }
    });

    res.json({ success: true, interventions });
  } catch (err) {
    console.error("Interventions fetch error:", err);
    res.json({ success: true, interventions: [] });
  }
});

/**
 * 📊 Program Structure
 */
router.get("/athlete/:athleteId/program-structure", requireSelfOrCoachOf("athleteId"), async (req, res) => {
  try {
    const { athleteId } = req.params;
    if (!db) return res.json({ totalWeeks: 12, totalDays: 48 });

    const snapshot = await db
      .collection("programs")
      .where("athlete_id", "==", athleteId)
      .get();

    if (snapshot.empty) return res.status(404).json({ error: "No active program found" });

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
 * 📜 Safe Program History
 */
router.get("/athlete/:athleteId/program-history", requireSelfOrCoachOf("athleteId"), async (req, res) => {
  try {
    const { athleteId } = req.params;
    if (!db) return res.json([]);

    const snapshot = await db
      .collection("programs")
      .where("athlete_id", "==", athleteId)
      .get();

    if (snapshot.empty) return res.json([]);

    const history = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        version: data.version || 1,
        weeks: data.weeks?.length || 0,
        reason: data.metadata?.reason || data.name || "Program update",
        approved_by: data.approved_by || "System",
        status: data.status || "active",
        created_at: data.created_at?.toDate ? data.created_at.toDate().getTime() : Date.now()
      };
    });

    history.sort((a, b) => b.created_at - a.created_at);
    res.json(history);
  } catch (err) {
    console.error("❌ PROGRAM HISTORY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🟡 Proposal Route
 */
router.get("/athlete/:athleteId/proposal", requireSelfOrCoachOf("athleteId"), async (req, res) => {
  try {
    const { athleteId } = req.params;
    if (!db) return res.json(null);

    const doc = await db.collection("proposals").doc(athleteId).get();
    if (!doc.exists) return res.json(null);

    res.json(doc.data());
  } catch (err) {
    res.json(null);
  }
});

/**
 * 🚀 Apply Proposal Route
 */
router.post("/athlete/:athleteId/proposal/apply", requireSelfOrCoachOf("athleteId"), async (req, res) => {
  try {
    const { athleteId } = req.params;
    const { coachId, overriddenWeek } = req.body;

    const result = await applyProposal({ athleteId, coachId, overriddenWeek });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;