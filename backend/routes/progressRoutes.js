const express = require("express");
const router = express.Router();

const workoutLogs = require("../data/workoutLogs.json");

// Utility to calculate e1RM
function calculateE1RM(weight, reps) {
  if (!weight || !reps) return null;
  return Math.round(weight * (1 + reps / 30));
}

router.get("/:athleteId", (req, res) => {
  const { athleteId } = req.params;

  const logs = workoutLogs.filter(
    (log) => log.athlete_id === athleteId
  );

  const progress = {
    squat: [],
    bench: [],
    deadlift: [],
  };

  logs.forEach((log) => {
    if (!log.main_lifts) return;

    log.main_lifts.forEach((lift) => {
      if (!lift.performed) return;

      const liftKey = lift.lift
        .toLowerCase()
        .replace(/\s/g, "");

      // Normalize names → squat / bench / deadlift
      let category = null;
      if (liftKey.includes("squat")) category = "squat";
      if (liftKey.includes("bench")) category = "bench";
      if (liftKey.includes("deadlift")) category = "deadlift";

      if (!category) return;

      lift.performed.forEach((set) => {
        const e1rm = calculateE1RM(
          Number(set.load),
          Number(set.reps)
        );

        if (!e1rm) return;

       const existing = progress[category].find(
  (p) => p.date === log.date
);

if (!existing || e1rm > existing.e1rm) {
  if (existing) {
    existing.e1rm = e1rm;
  } else {
    progress[category].push({
      date: log.date,
      e1rm,
    });
  }
}

      });
    });
  });

  const safeProgress = {
  squat: progressData.squat || [],
  bench: progressData.bench || [],
  deadlift: progressData.deadlift || [],
};

res.json(safeProgress);

});

module.exports = router;
