const express = require("express");
const router = express.Router();

// Lazy load Firebase
let db, admin;
try {
  const firebase = require("../firebaseAdmin");
  db = firebase.db;
  admin = firebase.admin;
} catch (err) {
  console.warn("⚠️ Firebase not available, using mock data only");
}

const programs = require("../data/programs.json");

// Request coach link
router.post("/request-coach/:athleteId", async (req, res) => {
  try {
    const { athleteId } = req.params;
    console.log(`\n🔗 POST /api/coach/request-coach - athlete: ${athleteId}`);

    if (db) {
      await db.collection("athletes").doc(athleteId).update({
        coach_request_status: "pending",
        coach_id: "T37Oellg4pg5oE9HA6kWTqDIFvF2",
        training_mode: "coach",
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Coach request updated for ${athleteId}`);
    } else {
      console.log("📋 Mock: Coach request set to pending");
    }

    res.json({ success: true, message: "Coach request transmitted" });
  } catch (err) {
    console.error("❌ Coach request error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Terminate coach link
router.post("/terminate-link/:athleteId", async (req, res) => {
  try {
    const { athleteId } = req.params;
    console.log(`\n⚡ POST /api/coach/terminate-link - athlete: ${athleteId}`);

    if (db) {
      await db.collection("athletes").doc(athleteId).update({
        coach_request_status: "none",
        coach_id: null,
        training_mode: "self",
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Coach link terminated for ${athleteId}`);
    } else {
      console.log("📋 Mock: Coach link terminated");
    }

    res.json({ success: true, message: "Coach link terminated" });
  } catch (err) {
    console.error("❌ Coach termination error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Force deload
router.post("/force-deload", (req, res) => {
  const { athlete_id } = req.body;

  if (!programs[athlete_id]) {
    return res.status(404).json({ error: "Program not found" });
  }

  programs[athlete_id].forceDeload = true;

  res.json({ success: true });
});

// Toggle autoregulation
router.post("/toggle-autoreg", (req, res) => {
  const { athlete_id, enabled } = req.body;

  if (!programs[athlete_id]) {
    return res.status(404).json({ error: "Program not found" });
  }

  programs[athlete_id].autoreg_enabled = enabled;

  res.json({ success: true });
});

// Set competition
router.post("/set-competition", (req, res) => {
  const { athlete_id, date } = req.body;

  if (!programs[athlete_id]) {
    return res.status(404).json({ error: "Program not found" });
  }

  programs[athlete_id].competition = {
    confirmed: true,
    date,
  };

  res.json({ success: true });
});

module.exports = router;
