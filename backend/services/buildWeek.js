const { buildMainLift } = require("./buildMainLifts");
// ✅ Import the accessory attachment service
const { attachAccessories } = require("./attachAccessories");

function buildWeek({
  week,
  athlete,
  blueprint,
  caps
}) {
  // 1. Construct the day object with main lifts first
  const day1 = {
    day: 1,
    main_lifts: [
      buildMainLift({
        lift: "Squat",
        week,
        baseLoad: athlete.training_max.squat,
        intensityCap: caps.intensity_cap,
        fatigueRate: athlete.fatigue_rate
      }),
      buildMainLift({
        lift: "Bench",
        week,
        baseLoad: athlete.training_max.bench,
        intensityCap: caps.intensity_cap,
        fatigueRate: athlete.fatigue_rate
      })
    ],
    accessories: [] // Initialized empty, to be filled by the service
  };

  // 2. ✅ Attach accessories to the day object using the provided service
  attachAccessories({
    day: day1,
    athlete,
    phase: blueprint.phase
  });

  // 3. Return the complete week structure
  return {
    week,
    days: [day1]
  };
}

module.exports = { buildWeek };