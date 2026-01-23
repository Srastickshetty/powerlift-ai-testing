const fs = require("fs");
const path = require("path");

const programs = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/programs.json"), "utf-8")
);

const athletes = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/athleteFeatures.json"), "utf-8")
);

console.log("\nBEST PROGRAM SELECTION\n");

athletes.forEach((athlete) => {
  const results = [];

  programs.forEach((program) => {
    let score = 0;

    // Days compatibility
    if (program.days_per_week <= athlete.days_available) {
      score += 2;
    } else {
      return;
    }

    // Weak lift support
    if (
      athlete.weak_lift === "bench" &&
      program.lift_frequency.bench >= program.lift_frequency.squat
    ) {
      score += 2;
    }

    // Recovery vs volume
    if (
      athlete.recovery_score < 0.9 &&
      program.volume.average_weekly_volume > 15000
    ) {
      score -= 2;
    }

    // Experience vs intensity
    if (
      athlete.experience_level === 0 &&
      program.intensity.average_percentage > 0.8
    ) {
      score -= 1;
    }

    results.push({
      program_id: program.program_id,
      score,
      weekly_volume: program.volume.average_weekly_volume,
      periodization: program.periodization.style
    });
  });

  // Sort by score (desc), then volume (asc)
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.weekly_volume - b.weekly_volume;
  });

  const best = results[0];
  const secondBest = results[1];

  let confidence = 1.0;
  if (secondBest) {
    const diff = best.score - secondBest.score;
    confidence = Math.max(0.5, Math.min(1, 0.5 + diff * 0.25));
  }

  console.log(`Athlete: ${athlete.athlete_id}`);
  console.log(`Selected Program: ${best.program_id}`);
  console.log(`Match Score: ${best.score}`);
  console.log(`Confidence Score: ${confidence.toFixed(2)}`);
  console.log("-----------------------------");
});
