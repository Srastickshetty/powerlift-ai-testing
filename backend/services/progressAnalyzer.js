const fs = require("fs");
const path = require("path");

const logsPath = path.join(__dirname, "../data/workoutLogs.json");
const outputPath = path.join(__dirname, "../data/athleteStatus.json");

function readLogs() {
  return JSON.parse(fs.readFileSync(logsPath, "utf-8"));
}

function analyzeAthlete(athlete_id, logs) {
  const athleteLogs = logs.filter(
    (l) => l.athlete_id === athlete_id
  );

  if (athleteLogs.length === 0) return null;

  let totalSets = 0;
  let missedSets = 0;
  let totalRPE = 0;
  let rpeCount = 0;

  athleteLogs.forEach((session) => {
    session.main_lifts.forEach((lift) => {
      lift.performed.forEach((set) => {
        totalSets++;

        if (
          Number(set.reps) < lift.prescribed.reps ||
          (set.rpe && Number(set.rpe) > 9)
        ) {
          missedSets++;
        }

        if (set.rpe) {
          totalRPE += Number(set.rpe);
          rpeCount++;
        }
      });
    });
  });

  const miss_rate = missedSets / totalSets;
  const fatigue_rate = rpeCount ? totalRPE / rpeCount / 10 : 0;

  const compliance = athleteLogs.length / 20; // temp baseline

  let status = "on_track";
  if (compliance < 0.65 || miss_rate > 0.25) {
    status = "needs_intervention";
  } else if (compliance < 0.85 || fatigue_rate > 0.75) {
    status = "monitor";
  }

  return {
    athlete_id,
    compliance: Number((compliance * 100).toFixed(1)),
    miss_rate: Number(miss_rate.toFixed(2)),
    fatigue_rate: Number(fatigue_rate.toFixed(2)),
    status,
    last_session: athleteLogs.at(-1).date,
  };
}

function runAnalysis() {
  const logs = readLogs();
  const athleteIds = [...new Set(logs.map((l) => l.athlete_id))];

  const results = athleteIds
    .map((id) => analyzeAthlete(id, logs))
    .filter(Boolean);

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log("✅ Athlete status updated");
}

runAnalysis();
