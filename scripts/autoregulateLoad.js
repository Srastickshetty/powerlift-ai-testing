const fs = require("fs");
const path = require("path");

const logs = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/workoutLogs.json"), "utf-8")
);

console.log("\nAUTOREGULATION — LOAD ADJUSTMENTS\n");

// Group logs by athlete
const athleteLogs = {};

logs.forEach(log => {
  if (!athleteLogs[log.athlete_id]) {
    athleteLogs[log.athlete_id] = [];
  }
  athleteLogs[log.athlete_id].push(log);
});

Object.keys(athleteLogs).forEach(athleteId => {
  const sessions = athleteLogs[athleteId];

  let missed = false;
  let highRPE = false;
  let fatigued = false;

  sessions.slice(-2).forEach(session => {
    session.main_lifts.forEach(liftLog => {
      const { prescribed, performed } = liftLog;

      performed.forEach(set => {
        if (set.reps < prescribed.reps) missed = true;
        if (set.rpe >= 9.5) highRPE = true;
      });
    });
  });

  if (missed || highRPE) fatigued = true;

  let loadMultiplier = 1.0;

  if (fatigued) {
    loadMultiplier = 0.95;
  } else {
    loadMultiplier = 1.025;
  }

  console.log(`Athlete: ${athleteId}`);
  console.log(`Missed reps: ${missed}`);
  console.log(`High RPE: ${highRPE}`);
  console.log(`→ Load multiplier for next week: ${loadMultiplier}`);
  console.log("-----------------------------");
});
