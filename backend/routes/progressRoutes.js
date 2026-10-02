const express = require("express");
const router = express.Router();
const { db } = require("../firebaseAdmin");
const { requireSelfOrCoachOf } = require("../middleware/auth");

router.get("/:athleteId", requireSelfOrCoachOf("athleteId"), async (req, res) => {
  try {
    const { athleteId } = req.params;
    if (!db) {
      return res.json({ squat: [], bench: [], deadlift: [] });
    }

    const snapshot = await db.collection("logs").where("athlete_id", "==", athleteId).get();
    const chartData = { squat: [], bench: [], deadlift: [] };

    snapshot.docs.forEach(doc => {
      const d = doc.data();
      const date = d.date?.toDate ? d.date.toDate().toISOString().split('T')[0] : (d.date || new Date().toISOString().split('T')[0]);

      // Helper looks for Bench/Squat/Deadlift strings and matching numbers
      const deepSearch = (obj, currentLiftName = "") => {
        if (!obj || typeof obj !== 'object') return;

        if ((obj.load || obj.weight) && obj.reps) {
          const l = parseFloat(obj.load || obj.weight);
          const r = parseInt(obj.reps);
          const rpe = parseFloat(obj.rpe || 8);
          
          if (l <= 0 || r <= 0) return;

          // e1RM Formula: Weight / (1.0278 - (0.0278 * (Reps + (10 - RPE))))
          const effectiveReps = r + (10 - rpe);
          const e1rm = Math.round(l / (1.0278 - 0.0278 * effectiveReps));
          
          const name = currentLiftName.toLowerCase();
          const dataPoint = { date, value: e1rm };

          const updateBest = (arr, point) => {
            const existing = arr.find(p => p.date === point.date);
            if (existing) {
              if (point.value > existing.value) existing.value = point.value;
            } else {
              arr.push(point);
            }
          };

          if (name.includes('squat')) updateBest(chartData.squat, dataPoint);
          if (name.includes('bench')) updateBest(chartData.bench, dataPoint);
          if (name.includes('deadlift')) updateBest(chartData.deadlift, dataPoint);
          return;
        }

        Object.keys(obj).forEach(key => {
          const nextName = ["squat", "bench", "deadlift"].some(l => key.toLowerCase().includes(l)) ? key : currentLiftName;
          deepSearch(obj[key], nextName);
        });
      };

      deepSearch(d, d.lift || "");
    });

    // Sort by date ascending
    Object.keys(chartData).forEach(k => chartData[k].sort((a, b) => new Date(a.date) - new Date(b.date)));

    res.json(chartData);
  } catch (err) {
    console.error("PROGRESS_FETCH_ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch progress metrics" });
  }
});

module.exports = router;