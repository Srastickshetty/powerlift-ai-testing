const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/programs.json");
const programs = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

console.log("\nPROGRAM COMPARISON\n");

programs.forEach((program) => {
  console.log(`Program: ${program.program_id}`);
  console.log(`Days/week: ${program.days_per_week}`);
  console.log(`Bench freq: ${program.lift_frequency.bench}`);
  console.log(`Avg Intensity: ${program.intensity.average_percentage}`);
  console.log(`Weekly Volume: ${program.volume.average_weekly_volume}`);
  console.log(`Periodization: ${program.periodization.style}`);
  console.log("---------------------------");
});
