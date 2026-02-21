// services/accessorySelector.js

const accessories = require("../data/accessoryLibrary.json");

function scoreAccessory(acc, athlete, phase) {
  let score = 0;

  if (athlete.weak_lifts?.some(w => acc.targets.includes(w))) {
    score += 3;
  }

  if (athlete.weak_muscles?.some(m => acc.targets.includes(m))) {
    score += 2;
  }

  if (!acc.phase_allowed.includes(phase)) {
    score -= 2;
  }

  score -= acc.fatigue_cost * athlete.fatigue_rate * 10;

  return score;
}

function selectAccessories({ mainLift, athlete, phase }) {
  let maxAccessories = 3;

  if (athlete.fatigue_rate > 0.6) maxAccessories = 1;
  if (athlete.fatigue_rate > 0.4) maxAccessories = 2;
  if (phase === "deload") maxAccessories = 1;

  const scored = accessories
    .filter(acc =>
      acc.targets.includes(mainLift.toLowerCase()) ||
      acc.targets.some(t => athlete.weak_muscles?.includes(t))
    )
    .map(acc => ({
      ...acc,
      score: scoreAccessory(acc, athlete, phase)
    }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, maxAccessories).map(acc => ({
    exercise: acc.name,
    sets: phase === "deload" ? 2 : 3,
    reps: phase === "peaking" ? 8 : 10
  }));
}

module.exports = { selectAccessories };
