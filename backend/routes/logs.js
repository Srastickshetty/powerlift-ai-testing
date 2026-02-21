const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { db, admin } = require("../firebaseAdmin");
const queryCache = require("../services/queryCache");

router.get("/:athleteId", async (req, res) => {
  try {
    const { athleteId } = req.params;

    // LOG 1: What is the Coach asking for?
    console.log("\n📥 GET /api/logs/:athleteId - Fetching logs for:", athleteId);
    console.log("🔍 COACH_REQUEST_FOR_ID:", athleteId);

    // 1. Check Cache First
    const cacheKey = `logs_${athleteId}`;
    const cached = queryCache.get(cacheKey);
    if (cached) {
      console.log("📥 Cache hit for logs:", athleteId);
      return res.json(cached);
    }

    console.log("❌ Cache miss, querying Firestore for athlete:", athleteId);

    // 2. Query Firestore
    const snapshot = await db.collection("logs")
      .where("athlete_id", "==", athleteId)
      .get();

    console.log("📥 Firestore returned", snapshot.size, "documents");

    // 3. Fallback to Local JSON file if Firestore is empty (As requested)
    if (snapshot.empty) {
      console.log("⚠️ No Firestore logs found. Checking local workoutlogs.json fallback...");
      try {
        const filePath = path.join(__dirname, "../data/workoutlogs.json");
        if (fs.existsSync(filePath)) {
          const fileData = fs.readFileSync(filePath, "utf-8");
          const allLogs = JSON.parse(fileData);

          // LOG 2: What IDs are in the file?
          console.log("📄 IDS_FOUND_IN_FILE:", allLogs.map(l => l.athlete_id));

          const athleteLogs = allLogs.filter(log => log.athlete_id === athleteId);
          console.log("✅ MATCHES_FOUND_IN_FILE:", athleteLogs.length);

          if (athleteLogs.length > 0) {
            queryCache.set(cacheKey, athleteLogs);
            return res.json(athleteLogs);
          }
        }
      } catch (fileErr) {
        console.warn("⚠️ Local file fallback failed:", fileErr.message);
      }

      // If both fail, return empty
      queryCache.set(cacheKey, {});
      return res.json({});
    }

    // 4. Transform Firestore logs into structured day-based object
    const logsByDay = {};

    snapshot.docs.forEach((doc, idx) => {
      const data = doc.data();

      // New Format (day_id + entries object)
      if (data.day_id && typeof data.entries === 'object' && !Array.isArray(data.entries)) {
        console.log(` 📄 Doc ${idx + 1} [NEW FORMAT]: dayId=${data.day_id}`);
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

    console.log("📥 BACKEND RETURNING LOGS BY DAY:", Object.keys(logsByDay));
    
    // Cache and Return
    queryCache.set(cacheKey, logsByDay);
    return res.json(logsByDay);

  } catch (err) {
    console.error("❌ LOGS_FETCH_ERROR:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { athleteId, dayId, entries } = req.body;
    console.log("\n💾 POST /api/logs - Saving logs for:", athleteId);
    
    if (!athleteId || !dayId || !entries) {
      return res.status(400).json({ error: "Missing required fields (athleteId, dayId, entries)" });
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
    
    console.log("✅ Log saved with ID:", docId);
    queryCache.delete(`logs_${athleteId}`);
    
    res.status(201).json({ success: true, id: docId });
  } catch (err) {
    console.error("❌ LOGS_POST_ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/debug/:athleteId", async (req, res) => {
  try {
    const { athleteId } = req.params;
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