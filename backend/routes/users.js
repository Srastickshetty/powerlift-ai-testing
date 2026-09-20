const express = require("express");
const router = express.Router();
const { db } = require("../firebaseAdmin");

router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const doc = await db.collection("athletes").doc(uid).get();

    if (!doc.exists) {
      return res.json(null); // new user
    }

    const data = doc.data();

    return res.json({
      uid,
      role: data.role || "client",
      ...data,
    });
  } catch (err) {
    console.error("❌ /api/users error:", err);
    return res.status(500).json(null);
  }
});

router.get("/:uid/mode", async (req, res) => {
  try {
    const { uid } = req.params;
    if (!db) {
      return res.json({ mode: "TRAINING", days_to_platform: null, selected_meet: null });
    }
    const doc = await db.collection("athletes").doc(uid).get();
    if (!doc.exists) {
      return res.json({ mode: "TRAINING", days_to_platform: null, selected_meet: null });
    }
    const data = doc.data();
    return res.json({
      mode: data.mode || "TRAINING",
      days_to_platform: data.days_to_platform || (data.mode === "MEET_PREP" ? 98 : null),
      selected_meet: data.selected_meet || null
    });
  } catch (err) {
    console.error("❌ /api/users/:uid/mode error:", err);
    return res.status(500).json({ error: err.message, mode: "TRAINING" });
  }
});

router.put("/:uid/mode", async (req, res) => {
  try {
    const { uid } = req.params;
    const { mode, meet_data, days_to_platform } = req.body;
    if (db) {
      await db.collection("athletes").doc(uid).set({
        mode: mode || "TRAINING",
        selected_meet: meet_data || null,
        days_to_platform: days_to_platform || null,
        updated_at: new Date().toISOString()
      }, { merge: true });
    }
    return res.json({ success: true, mode, days_to_platform });
  } catch (err) {
    console.error("❌ PUT /api/users/:uid/mode error:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/:uid/lock_in", async (req, res) => {
  try {
    const { uid } = req.params;
    const { meet_id, podium_probability, lock_in_timestamp, meet_data } = req.body;
    
    // Default to 14 weeks (98 days)
    const daysToPlatform = 98;

    if (db) {
      await db.collection("athletes").doc(uid).set({
        mode: "MEET_PREP",
        locked_meet_id: meet_id,
        podium_probability: podium_probability || 0,
        days_to_platform: daysToPlatform,
        selected_meet: meet_data || { id: meet_id, name: "Target Championship" },
        lock_in_timestamp: lock_in_timestamp || new Date().toISOString()
      }, { merge: true });
    }

    return res.json({
      success: true,
      mode: "MEET_PREP",
      days_to_platform: daysToPlatform,
      podium_probability
    });
  } catch (err) {
    console.error("❌ POST /api/users/:uid/lock_in error:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
