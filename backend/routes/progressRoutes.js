const express = require("express");
const router = express.Router();
const { db } = require("../firebaseAdmin");

router.get("/:athleteId", async (req, res) => {
  try {
    const { athleteId } = req.params;
    const snapshot = await db.collection("logs").where("athlete_id", "==", athleteId).get();
    const chartData = { squat: [], bench: [], deadlift: [] };

    console.log(`--- SCANNING ${snapshot.size} DOCS FOR ${athleteId} ---`);

    snapshot.docs.forEach(doc => {
      const d = doc.data();
      const date = d.date?.toDate ? d.date.toDate().toISOString().split('T')[0] : (d.date || new Date().toISOString().split('T')[0]);

      // This helper looks for Bench/Squat/Deadlift strings and matching numbers ANYWHERE
     const deepSearch = (obj, currentLiftName = "") => {
        if (!obj || typeof obj !== 'object') return;

        if ((obj.load || obj.weight) && obj.reps) {
          const l = parseFloat(obj.load || obj.weight);
          const r = parseInt(obj.reps);
          const rpe = parseFloat(obj.rpe || 8);
          
          // Safety check: ignore empty or placeholder sets
          if (l <= 0 || r <= 0) return;

          // e1RM Formula: Weight / (1.0278 - (0.0278 * (Reps + (10 - RPE))))
          const effectiveReps = r + (10 - rpe);
          const e1rm = Math.round(l / (1.0278 - 0.0278 * effectiveReps));
          
          const name = currentLiftName.toLowerCase();
          const dataPoint = { date, value: e1rm };

          // Only keep the heaviest lift per day to keep the chart clean
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

    // Sort
    Object.keys(chartData).forEach(k => chartData[k].sort((a, b) => new Date(a.date) - new Date(b.date)));

    console.log(`✅ SCAN COMPLETE -> S:${chartData.squat.length} B:${chartData.bench.length} D:${chartData.deadlift.length}`);
    res.json(chartData);
  } catch (err) {
    console.error("DEBUG ERROR:", err);
    res.status(500).send("Error");
  }
});

module.exports = router;