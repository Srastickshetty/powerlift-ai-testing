const { buildMainLift } = require("./buildMainLifts");
const { attachAccessories } = require("./attachAccessories");

function buildWeek({ week, athlete, blueprint, caps }) {
  if (!blueprint?.structure || !blueprint?.main_lifts) {
    throw new Error("Invalid blueprint structure passed to buildWeek");
  }

  const days = [];
  const daysPerWeek = blueprint.structure.days_per_week;
  const lifts = Object.entries(blueprint.main_lifts);

  for (let d = 1; d <= daysPerWeek; d++) {
    const main_lifts = [];

    lifts.forEach(([liftName, config]) => {
      // Check frequency: e.g., if frequency is 2, it runs on Day 1, 3, 5...
      if ((d - 1) % config.frequency === 0) {
        
        // Resolve source (Training Max or Legacy Lifts)
        const tm = athlete.training_max || athlete.lifts || {};
        
        // Extract raw value based on lift name
        const rawMax = tm[liftName.toLowerCase()];

        // ✅ FINAL CORRECT BLOCK with 0.9 (90%) modifier applied
        main_lifts.push(
          buildMainLift({
            lift: liftName,
            week,
            baseLoad: rawMax * 0.9,
            intensityCap: caps?.intensity_cap,
            fatigueRate: athlete.fatigue_rate,
            sets: config.sets,
            reps: config.reps
          })
        );
      }
    });

    const day = { 
      day: d, 
      main_lifts, 
      accessories: [] 
    };

    // Mutates the day object to add accessories based on the phase
    attachAccessories({
      day,
      athlete,
      phase: blueprint.phase || "normal"
    });

    days.push(day);
  }

  return { 
    week, 
    phase: blueprint.phase || "normal", 
    days 
  };
}

module.exports = { buildWeek };