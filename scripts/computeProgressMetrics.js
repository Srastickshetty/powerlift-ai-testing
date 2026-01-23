const fs = require("fs");
const path = require("path");

const logs = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/workoutLogs.json"), "utf-8")
);

console.log("\nPROGRESS METRICS\n");

logs.forEach((log) => {
  console.log(
    `Athlete: ${log.athlete_id} | Date: ${log.date} | Week ${log.week} Day ${log.day}`
  );

  let sessionFatigue = false;

  log.main_lifts.forEach((liftLog) => {
    const { lift, prescribed, performed } = liftLog;

    // Find best set (highest e1RM)
    let bestSet = null;
    let bestE1RM = 0;
    let missedReps = false;

    performed.forEach((set) => {
      const e1RM = set.load * (1 + set.reps / 30);

      if (e1RM > bestE1RM) {
        bestE1RM = e1RM;
        bestSet = set;
      }

      if (set.reps < prescribed.reps) {
        missedReps = true;
      }

      if (set.rpe >= 9.5) {
        sessionFatigue = true;
      }
    });

    if (missedReps) {
      sessionFatigue = true;
    }

    console.log(`  Lift: ${lift}`);
    console.log(
      `    Best Set: ${bestSet.reps} reps @ ${bestSet.load}kg (RPE ${bestSet.rpe})`
    );
    console.log(`    Estimated 1RM: ${bestE1RM.toFixed(1)}kg`);

    if (missedReps) {
      console.log("    ⚠️ Missed reps detected");
    }
  });

  if (sessionFatigue) {
    console.log("  ⚠️ SESSION FLAGGED AS FATIGUED");
  }

  console.log("-----------------------------");
});
