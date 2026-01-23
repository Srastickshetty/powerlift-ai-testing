const fs = require("fs");
const path = require("path");

const logs = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/workoutLogs.json"), "utf-8")
);

console.log("\nAUTOREGULATION — VOLUME ADJUSTMENTS\n");

// Group logs by athlete
const athleteLogs = {};

logs.forEach(log => {
  if (!athleteLogs[log.athlete_id]) {
    athleteLogs[log.athlete_id] = [];
  }
  athleteLogs[log.athlete_id].push(log);
});

Object.keys(athleteLogs).forEach(athleteId => {
  const sessions = athleteLogs[athleteId].slice(-2);

  let totalRPE = 0;
  let rpeCount = 0;
  let missed = false;
  let fatigued = false;

  sessions.forEach(session => {
    session.main_lifts.forEach(liftLog => {
      const { prescribed, performed } = liftLog;

      performed.forEach(set => {
        totalRPE += set.rpe;
        rpeCount++;

        if (set.reps < prescribed.reps) missed = true;
        if (set.rpe >= 9.5) fatigued = true;
      });
    });
  });

  const avgRPE = totalRPE / rpeCount;

  let volumeAdjustment = 0;

  if (missed || fatigued || avgRPE >= 8.5) {
    volumeAdjustment = -1;
  }

  console.log(`Athlete: ${athleteId}`);
  console.log(`Avg RPE (last sessions): ${avgRPE.toFixed(2)}`);
  console.log(`Missed reps: ${missed}`);
  console.log(`Fatigued: ${fatigued}`);
  console.log(
    `→ Accessory volume adjustment: ${volumeAdjustment} set(s) per exercise`
  );
  console.log("-----------------------------");
});
