const { selectAccessories } = require("./selectAccessories");

function attachAccessories({
  day,
  athlete,
  phase
}) {
  const mainLift = day.main_lifts[0]?.lift;
  const weakLift = athlete.weak_lift;

  day.accessories = selectAccessories({
    mainLift,
    weakLift,
    fatigueRate: athlete.fatigue_rate,
    phase
  });

  return day;
}

module.exports = { attachAccessories };
