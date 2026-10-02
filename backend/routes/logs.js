const express = require("express");
const router = express.Router();
const { db, admin } = require("../firebaseAdmin");
const queryCache = require("../services/queryCache");
const { requireSelfOrCoachOf } = require("../middleware/auth");

/**
 * GET /api/logs/:athleteId
 * Fetch training logs for an athlete (verified self, approved coach, or admin)
 */
router.get("/:athleteId", requireSelfOrCoachOf("athleteId"), async (req, res) => {
  try {
    const { athleteId } = req.params;

    // 1. Check Cache First
    const cacheKey = `logs_${athleteId}`;
    const cached = queryCache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    if (!db) {
      return res.json({});
    }

    // 2. Query Firestore
    const snapshot = await db.collection("logs")
      .where("athlete_id", "==", athleteId)
      .get();

    if (snapshot.empty) {
      queryCache.set(cacheKey, {});
      return res.json({});
    }

    // 3. Transform Firestore logs into structured day-based object
    const logsByDay = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      // New Format (day_id + entries object)
      if (data.day_id && typeof data.entries === 'object' && !Array.isArray(data.entries)) {
        const dayId = data.day_id;
        const entries = data.entries || {};

        if (!logsByDay[dayId]) logsByDay[dayId] = {};
        Object.assign(logsByDay[dayId], entries);
      } 
      // Old Format (individual fields)
      else if (data.lift && typeof data.lift === 'string') {
        const dayKey = data.day_id || `W1D1`; 
        if (!logsByDay[dayKey]) logsByDay[dayKey] = {};
        
        logsByDay[dayKey][data.lift] = {
          weight: data.load,
          reps: data.reps,
          rpe: data.rpe,
          date: data.date
        };
      }
    });
    
    // Cache and Return
    queryCache.set(cacheKey, logsByDay);
    return res.json(logsByDay);

  } catch (err) {
    console.error("❌ LOGS_FETCH_ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

/**
 * POST /api/logs
 * Save workout log entry (enforces athlete ownership)
 */
router.post("/", requireSelfOrCoachOf("athleteId"), async (req, res) => {
  try {
    const athleteId = req.body.athleteId || req.user.uid;
    const { dayId, entries } = req.body;
    
    if (!athleteId || !dayId || !entries) {
      return res.status(400).json({ error: "Missing required fields (athleteId, dayId, entries)" });
    }

    if (!db) {
      return res.status(201).json({ success: true, id: `${athleteId}_${dayId}` });
    }

    const timestamp = admin.firestore.Timestamp.fromDate(new Date());
    const docId = `${athleteId}_${dayId}`;
    const logRef = db.collection("logs").doc(docId);
    
    const logEntry = {
      athlete_id: athleteId,
      day_id: dayId,
      entries: entries,
      date: timestamp,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: timestamp
    };
    
    await logRef.set(logEntry, { merge: true });
    
    queryCache.delete(`logs_${athleteId}`);
    
    res.status(201).json({ success: true, id: docId });
  } catch (err) {
    console.error("❌ LOGS_POST_ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/logs/debug/:athleteId
 * Debug endpoint protected by ownership
 */
router.get("/debug/:athleteId", requireSelfOrCoachOf("athleteId"), async (req, res) => {
  try {
    const { athleteId } = req.params;
    if (!db) return res.json({ athleteId, totalDocuments: 0, documents: [] });

    const snapshot = await db.collection("logs").where("athlete_id", "==", athleteId).get();
    
    const allDocs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.() || doc.data().created_at
    }));
    
    res.json({ athleteId, totalDocuments: snapshot.size, documents: allDocs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;