const library = require("./accessoryLibrary");
const RULES = require("./accessoryRules");

function selectAccessories({
  mainLift,
  weakLift,
  fatigueRate,
  phase
}) {
  let fatigueBudget =
    phase === "deload"
      ? RULES.DELOAD_FATIGUE_CAP
      : RULES.MAX_TOTAL_FATIGUE;

  const selected = [];
  let usedFatigue = 0;

  for (const acc of library) {
    if (
      acc.targets.includes(mainLift) ||
      acc.targets.includes(weakLift)
    ) {
      if (usedFatigue + acc.fatigueCost > fatigueBudget) continue;

      selected.push({
        exercise: acc.name,
        sets: 3,
        reps: 10
      });

      usedFatigue += acc.fatigueCost;

      if (selected.length >= RULES.MAX_ACCESSORIES_PER_DAY) break;
    }
  }

  return selected;
}

module.exports = { selectAccessories };
