function applyCompetitionModifiers(week, phase) {
  week.days.forEach(day => {
    day.main_lifts.forEach(lift => {
      if (phase === "intensification") {
        lift.reps = Math.max(2, lift.reps - 1);
      }

      if (phase === "peak") {
        lift.sets = Math.max(2, lift.sets - 1);
        lift.reps = Math.max(1, lift.reps - 2);
      }

      if (phase === "taper") {
        lift.sets = 1;
        lift.reps = 1;
        lift.accessories = [];
      }
    });

    if (phase === "peak" || phase === "taper") {
      day.accessories = [];
    }
  });

  return week;
}

module.exports = { applyCompetitionModifiers };
