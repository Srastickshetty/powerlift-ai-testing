const fs = require("fs");
const path = require("path");

// Load data
const accessories = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/accessories.json"), "utf-8")
);

const athletes = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/athleteFeatures.json"), "utf-8")
);

// For now: fixed context (from generated program)
const TODAY_MAIN_LIFTS = ["squat", "bench"]; // example
const PROGRAM_PHASE = "strength";

console.log("\nSELECTED ACCESSORIES\n");

athletes.forEach((athlete) => {
  console.log(`Athlete: ${athlete.athlete_id}`);
  console.log(`Main lifts today: ${TODAY_MAIN_LIFTS.join(", ")}`);
  console.log(`Weak lift: ${athlete.weak_lift}\n`);

  const isDeadliftDay = TODAY_MAIN_LIFTS.includes("deadlift");

  // Step 1: filter by lift relevance & phase
  let candidates = accessories.filter((acc) =>
    acc.supports_lift.some((lift) => TODAY_MAIN_LIFTS.includes(lift)) &&
    acc.phase_allowed.includes(PROGRAM_PHASE)
  );

  // Step 2: fatigue control
  candidates = candidates.filter((acc) => {
    if (isDeadliftDay) {
      return acc.fatigue_cost === "low";
    }
    return acc.fatigue_cost !== "high";
  });

  const selected = [];

  // Step 3: weak lift priority
  const weakLiftAccessory = candidates.find((acc) =>
    acc.supports_lift.includes(athlete.weak_lift)
  );

  if (weakLiftAccessory) {
    selected.push(weakLiftAccessory);
  }

  // Step 4: fill remaining slots
  candidates.forEach((acc) => {
    if (selected.length >= 4) return;
    if (!selected.includes(acc)) {
      selected.push(acc);
    }
  });

  // Ensure minimum count
  const finalAccessories = selected.slice(0, Math.max(2, selected.length));

  finalAccessories.forEach((acc, index) => {
    console.log(`${index + 1}. ${acc.name} (${acc.fatigue_cost})`);
  });

  console.log("-----------------------------");
});
