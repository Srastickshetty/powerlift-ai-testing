const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/programs.json");
const programs = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// Mappings
const periodizationMap = {
  linear: 0,
  block: 1,
  undulating: 2,
};

const intensityTypeMap = {
  percentage: 0,
  hybrid: 1,
  rpe: 2,
};

console.log("\nPROGRAM FEATURE VECTORS\n");

programs.forEach((program) => {
  const featureVector = {
    program_id: program.program_id,

    days_per_week: program.days_per_week,
    total_weeks: program.total_weeks,

    squat_freq: program.lift_frequency.squat,
    bench_freq: program.lift_frequency.bench,
    deadlift_freq: program.lift_frequency.deadlift,

    avg_intensity: program.intensity.average_percentage,
    max_intensity: program.intensity.max_percentage,

    uses_rpe: program.intensity.uses_rpe ? 1 : 0,
    intensity_type: intensityTypeMap[program.intensity.type],

    weekly_volume: program.volume.average_weekly_volume,
    volume_trend:
      program.volume.volume_trend === "increasing"
        ? 1
        : program.volume.volume_trend === "decreasing"
        ? -1
        : 0,

    periodization_type: periodizationMap[program.periodization.style],
    has_deload: program.periodization.has_deload ? 1 : 0,
  };

  console.log(featureVector);
  console.log("-----------------------------");
});
