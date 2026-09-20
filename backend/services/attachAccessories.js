const { selectAccessories } = require("./selectAccessories");

function attachAccessories({
  day,
  athlete,
  phase
}) {
  const mainLift = day.main_lifts[0]?.lift || "squat";
  const weakLift = athlete.weak_lift || athlete.weakness;

  day.accessories = selectAccessories({
    mainLift,
    weakLift,
    fatigueRate: athlete.fatigue_rate,
    phase,
    dayNumber: day.day || 1
  });

  return day;
}

module.exports = { attachAccessories };
