const fs = require("fs");
const path = require("path");

const logs = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/workoutLogs.json"), "utf-8")
);

console.log("\nCOACH DASHBOARD (LOGIC VIEW)\n");

// Group logs by athlete
const athleteLogs = {};

logs.forEach((log) => {
  if (!athleteLogs[log.athlete_id]) {
    athleteLogs[log.athlete_id] = [];
  }
  athleteLogs[log.athlete_id].push(log);
});

Object.keys(athleteLogs).forEach((athleteId) => {
  const sessions = athleteLogs[athleteId];
  let fatiguedSessions = 0;
  let sessionsWithMisses = 0;

  const liftE1RM = {};

  sessions.forEach((session) => {
    let sessionFatigue = false;

    session.main_lifts.forEach((liftLog) => {
      const { lift, prescribed, performed } = liftLog;

      performed.forEach((set) => {
        const e1RM = set.load * (1 + set.reps / 30);

        if (!liftE1RM[lift]) {
          liftE1RM[lift] = [];
        }
        liftE1RM[lift].push(e1RM);

        if (set.reps < prescribed.reps) {
          sessionsWithMisses++;
          sessionFatigue = true;
        }

        if (set.rpe >= 9.5) {
          sessionFatigue = true;
        }
      });
    });

    if (sessionFatigue) fatiguedSessions++;
  });

  console.log(`Athlete: ${athleteId}`);
  console.log(`Sessions logged: ${sessions.length}`);
  console.log(`Fatigue rate: ${(fatiguedSessions / sessions.length).toFixed(2)}`);
  console.log(
    `Miss rate: ${(sessionsWithMisses / sessions.length).toFixed(2)}`
  );

  let progressing = false;

  Object.keys(liftE1RM).forEach((lift) => {
    const values = liftE1RM[lift];
    const change = ((values[values.length - 1] - values[0]) / values[0]) * 100;

    console.log(
      `  ${lift.toUpperCase()} e1RM change: ${change.toFixed(1)}%`
    );

    if (change > 1) progressing = true;
  });

  let status = "🟢 On Track";
  if (!progressing || sessionsWithMisses > 0) {
    status = "🔴 Needs Intervention";
  } else if (fatiguedSessions / sessions.length > 0.4) {
    status = "🟡 Monitor";
  }

  console.log(`Status: ${status}`);
  console.log("-----------------------------");
});
