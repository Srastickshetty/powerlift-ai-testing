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

const accessories = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/accessories.json"), "utf-8")
);

// Selected program (from Stage 3)
const SELECTED_PROGRAM_ID = "program_002";
const PROGRAM_PHASE = "strength";

console.log("\nFULL GENERATED TRAINING PROGRAM\n");

athletes.forEach((athlete) => {
  const program = programs.find(p => p.program_id === SELECTED_PROGRAM_ID);
  const rules = blueprintRules[SELECTED_PROGRAM_ID];

  const weeklyProgression =
    athlete.experience_level === 2 ? 0.0125 : 0.025;

  console.log(`Athlete: ${athlete.athlete_id}`);
  console.log(`Program: ${SELECTED_PROGRAM_ID}`);
  console.log(`Weeks: ${program.total_weeks}\n`);

  for (let week = 1; week <= program.total_weeks; week++) {
    let deloadFactor = 1.0;
    if (program.has_deload && week === program.deload_week) {
      deloadFactor = 0.9;
    }

    const weekFactor =
      Math.pow(1 + weeklyProgression, week - 1) * deloadFactor;

    console.log(`===== WEEK ${week} =====`);

    for (let day = 1; day <= program.days_per_week; day++) {
      const todayMainLifts = ["squat", "bench"];
      if (day === program.days_per_week) {
        todayMainLifts.push("deadlift");
      }

      console.log(`\nDay ${day}`);

      // Main lifts
      const squatWeight = Math.round(
        athlete.squat_tm * rules.squat.intensity * weekFactor
      );
      console.log(`Squat: ${rules.squat.sets}x${rules.squat.reps} @ ${squatWeight}kg`);

      const benchWeight = Math.round(
        athlete.bench_tm * rules.bench.intensity * weekFactor
      );
      console.log(`Bench: ${rules.bench.sets}x${rules.bench.reps} @ ${benchWeight}kg`);

      if (todayMainLifts.includes("deadlift")) {
        const dlWeight = Math.round(
          athlete.deadlift_tm * rules.deadlift.intensity * weekFactor
        );
        console.log(
          `Deadlift: ${rules.deadlift.sets}x${rules.deadlift.reps} @ ${dlWeight}kg`
        );
      }

      // Accessory selection
      const isDeadliftDay = todayMainLifts.includes("deadlift");

      let candidates = accessories.filter(acc =>
        acc.supports_lift.some(lift => todayMainLifts.includes(lift)) &&
        acc.phase_allowed.includes(PROGRAM_PHASE)
      );

      candidates = candidates.filter(acc => {
        if (isDeadliftDay) return acc.fatigue_cost === "low";
        return acc.fatigue_cost !== "high";
      });

      const selectedAccessories = [];

      const weakLiftAccessory = candidates.find(acc =>
        acc.supports_lift.includes(athlete.weak_lift)
      );

      if (weakLiftAccessory) selectedAccessories.push(weakLiftAccessory);

      candidates.forEach(acc => {
        if (selectedAccessories.length >= 4) return;
        if (!selectedAccessories.includes(acc)) {
          selectedAccessories.push(acc);
        }
      });

      console.log("\nAccessories:");
      selectedAccessories.slice(0, Math.max(2, selectedAccessories.length))
        .forEach((acc, i) => {
          console.log(`${i + 1}. ${acc.name}`);
        });
    }

    if (deloadFactor < 1.0) {
      console.log("\n⚠️ DELOAD WEEK");
    }

    console.log("\n-----------------------------\n");
  }
});
