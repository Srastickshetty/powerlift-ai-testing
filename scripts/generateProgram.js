const fs = require("fs");
const path = require("path");

// Load data
const athletes = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/athleteFeatures.json"), "utf-8")
);

const programs = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/programs.json"), "utf-8")
);

const blueprintRules = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/blueprintRules.json"), "utf-8")
);

// Selected program (from Stage 3)
const SELECTED_PROGRAM_ID = "program_002";

console.log("\nGENERATED TRAINING PROGRAM (WITH PROGRESSION)\n");

athletes.forEach((athlete) => {
  const program = programs.find(
    (p) => p.program_id === SELECTED_PROGRAM_ID
  );
  const rules = blueprintRules[SELECTED_PROGRAM_ID];

  // Progression rate
  const weeklyProgression =
    athlete.experience_level === 2 ? 0.0125 : 0.025;

  console.log(`Athlete: ${athlete.athlete_id}`);
  console.log(`Program: ${SELECTED_PROGRAM_ID}`);
  console.log(`Total Weeks: ${program.total_weeks}\n`);

  for (let week = 1; week <= program.total_weeks; week++) {
    let deloadFactor = 1.0;

    if (program.has_deload && week === program.deload_week) {
      deloadFactor = 0.9;
    }

    const weekFactor =
      Math.pow(1 + weeklyProgression, week - 1) * deloadFactor;

    console.log(`Week ${week}`);

    for (let day = 1; day <= program.days_per_week; day++) {
      console.log(`  Day ${day}`);

      const squatWeight = Math.round(
        athlete.squat_tm * rules.squat.intensity * weekFactor
      );
      console.log(
        `  Squat: ${rules.squat.sets}x${rules.squat.reps} @ ${squatWeight}kg`
      );

      const benchWeight = Math.round(
        athlete.bench_tm * rules.bench.intensity * weekFactor
      );
      console.log(
        `  Bench: ${rules.bench.sets}x${rules.bench.reps} @ ${benchWeight}kg`
      );

      if (day === program.days_per_week) {
        const dlWeight = Math.round(
          athlete.deadlift_tm * rules.deadlift.intensity * weekFactor
        );
        console.log(
          `  Deadlift: ${rules.deadlift.sets}x${rules.deadlift.reps} @ ${dlWeight}kg`
        );
      }
    }

    if (deloadFactor < 1.0) {
      console.log("  ⚠️ DELOAD WEEK");
    }

    console.log("-----------------------------");
  }
});
