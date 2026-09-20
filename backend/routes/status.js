const express = require("express");
const router = express.Router();
const { db } = require("../firebaseAdmin");
const { generateCoachAlerts } = require("../services/coachAlerts");

const handleStatus = async (req, res) => {
  try {
    if (!db) {
      return res.json({
        status: "ONLINE",
        service: "POWERLIFT_AI_BACKEND",
        athletes: []
      });
    }

    const snapshot = await db.collection("athletes").limit(50).get();
    const athletes = snapshot.docs.map(doc => {
      const athlete = doc.data();
      const alerts = generateCoachAlerts({
        progress: athlete.progress || {},
        weeklyMetrics: athlete.weeklyMetrics || []
      });

      return {
        id: doc.id,
        uid: doc.id,
        ...athlete,
        alerts,
      };
    });

    res.json({
      status: "ONLINE",
      service: "POWERLIFT_AI_BACKEND",
      athletes
    });
  } catch (err) {
    console.error("Status route error:", err);
    res.status(500).json({ error: err.message });
  }
};

router.get("/", handleStatus);
router.get("/status", handleStatus);
router.get("/db", (req, res) => {
  res.json({
    status: "connected",
    database: "online",
    firebase: Boolean(db),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

