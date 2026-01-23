const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/athletes.json");
const outputPath = path.join(__dirname, "../data/athleteFeatures.json");

const athletes = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

console.log("\nATHLETE FEATURE VECTORS\n");

const athleteFeatures = []; // 🔴 IMPORTANT ADDITION

athletes.forEach((athlete) => {
  // Training maxes
  const squat_tm = athlete.squat_1rm * 0.9;
  const bench_tm = athlete.bench_1rm * 0.9;
  const deadlift_tm = athlete.deadlift_1rm * 0.9;

  // Strength ratios
  const bench_squat_ratio = athlete.bench_1rm / athlete.squat_1rm;
  const deadlift_squat_ratio = athlete.deadlift_1rm / athlete.squat_1rm;

  // Weak lift
  let weak_lift = "squat";
  if (bench_squat_ratio < deadlift_squat_ratio) {
    weak_lift = "bench";
  } else {
    weak_lift = "deadlift";
  }

  // Experience level
  let experience_level = 0; // beginner
  if (athlete.training_age_years >= 1.5 && athlete.training_age_years <= 4) {
    experience_level = 1; // intermediate
  } else if (athlete.training_age_years > 4) {
    experience_level = 2; // advanced
  }

  // Recovery proxy
  let recovery_score = 1.0;
  if (athlete.age > 30) recovery_score -= 0.1;
  recovery_score -= athlete.injuries.length * 0.1;
  if (athlete.training_age_years > 3) recovery_score += 0.1;

  const athleteVector = {
    athlete_id: athlete.athlete_id,
    age: athlete.age,
    bodyweight: athlete.bodyweight,
    days_available: athlete.days_available,

    squat_tm,
    bench_tm,
    deadlift_tm,

    bench_squat_ratio,
    deadlift_squat_ratio,

    weak_lift,
    experience_level,
    recovery_score
  };

  athleteFeatures.push(athleteVector); // 🔴 IMPORTANT ADDITION

  console.log(athleteVector);
  console.log("-----------------------------");
});

// 🔴 WRITE TO FILE (MOST IMPORTANT PART)
fs.writeFileSync(outputPath, JSON.stringify(athleteFeatures, null, 2));

console.log("\n✅ Athlete features saved to data/athleteFeatures.json\n");
