const fs = require("fs");
const path = require("path");

const logs = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/workoutLogs.json"), "utf-8")
);

console.log("\nAUTO-DELOAD ENGINE\n");

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

  let fatigueCount = 0;
  let e1RMTrend = {};

  sessions.forEach(session => {
    let fatigued = false;

    session.main_lifts.forEach(liftLog => {
      const { lift, prescribed, performed } = liftLog;

      performed.forEach(set => {
        const e1RM = set.load * (1 + set.reps / 30);

        if (!e1RMTrend[lift]) e1RMTrend[lift] = [];
        e1RMTrend[lift].push(e1RM);

        if (set.reps < prescribed.reps || set.rpe >= 9.5) {
          fatigued = true;
        }
      });
    });

    if (fatigued) fatigueCount++;
  });

  let stagnant = false;

  Object.keys(e1RMTrend).forEach(lift => {
    const values = e1RMTrend[lift];
    if (values.length >= 2) {
      const change = values[values.length - 1] - values[values.length - 2];
      if (change <= 0) stagnant = true;
    }
  });

  const triggerDeload = fatigueCount >= 2 || stagnant;

  console.log(`Athlete: ${athleteId}`);
  console.log(`Fatigue sessions: ${fatigueCount}`);
  console.log(`Stagnant e1RM: ${stagnant}`);

  if (triggerDeload) {
    console.log("⚠️ AUTO-DELOAD TRIGGERED");
    console.log("→ Load reduction: -10%");
    console.log("→ Volume reduction: -30%");
    console.log("→ Duration: 1 week");
  } else {
    console.log("✅ No deload needed");
  }

  console.log("-----------------------------");
});
