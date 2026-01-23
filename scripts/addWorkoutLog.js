const fs = require("fs");
const path = require("path");

const logPath = path.join(__dirname, "../data/workoutLogs.json");

// Load existing logs
let logs = [];
if (fs.existsSync(logPath)) {
  logs = JSON.parse(fs.readFileSync(logPath, "utf-8"));
}

// Example: new log coming from user/app
const newLog = {
  log_id: `log_${Date.now()}`,
  athlete_id: "athlete_001",
  program_id: "program_002",

  week: 1,
  day: 2,
  date: "2026-01-02",

  main_lifts: [
    {
      lift: "squat",
      prescribed: { sets: 3, reps: 5, load: 101 },
      performed: [
        { set: 1, reps: 5, load: 101, rpe: 8 },
        { set: 2, reps: 5, load: 101, rpe: 8.5 },
        { set: 3, reps: 4, load: 101, rpe: 9.5 }
      ]
    },
    {
      lift: "bench",
      prescribed: { sets: 4, reps: 6, load: 64 },
      performed: [
        { set: 1, reps: 6, load: 64, rpe: 7.5 },
        { set: 2, reps: 6, load: 64, rpe: 8 },
        { set: 3, reps: 5, load: 64, rpe: 9 }
      ]
    }
  ],

  accessories: [
    { exercise: "Lat Pulldown", sets: 3, reps: 12, load: 55 }
  ],

  session_notes: "Missed last bench rep due to fatigue"
};

// 🔒 DUPLICATE CHECK (athlete + date)
const duplicate = logs.find(
  (log) =>
    log.athlete_id === newLog.athlete_id &&
    log.date === newLog.date
);

if (duplicate) {
  console.log("❌ Log already exists for this athlete and date.");
  process.exit(1);
}

// Append and save
logs.push(newLog);
fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));

console.log("✅ Workout log added successfully.");
