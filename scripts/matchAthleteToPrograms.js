const fs = require("fs");
const path = require("path");

// Load program feature data
const programs = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/programs.json"), "utf-8")
);

// 🔴 IMPORTANT: Load ATHLETE FEATURES, not raw athletes
const athletes = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/athleteFeatures.json"), "utf-8")
);

console.log("\nPROGRAM MATCHING RESULTS\n");

athletes.forEach((athlete) => {
  console.log(`Athlete: ${athlete.athlete_id}`);

  programs.forEach((program) => {
    let score = 0;

    // Rule 1: Days compatibility
    if (program.days_per_week <= athlete.days_available) {
      score += 2;
    } else {
      return; // incompatible
    }

    // Rule 2: Weak lift support
    if (
      athlete.weak_lift === "bench" &&
      program.lift_frequency.bench >= program.lift_frequency.squat
    ) {
      score += 2;
    }

    // Rule 3: Recovery vs volume
    if (
      athlete.recovery_score < 0.9 &&
      program.volume.average_weekly_volume > 15000
    ) {
      score -= 2;
    }

    // Rule 4: Experience vs intensity
    if (
      athlete.experience_level === 0 &&
      program.intensity.average_percentage > 0.8
    ) {
      score -= 1;
    }

    console.log(
      `→ Program ${program.program_id} | Match Score: ${score}`
    );
  });

  console.log("-----------------------------");
});
