function computeWeeklyLiftMetrics(logs, liftName) {
  let rpeSum = 0;
  let rpeCount = 0;
  let missed = 0;
  let total = 0;

  logs.forEach(session => {
    session.main_lifts
      .filter(l => l.lift === liftName)
      .forEach(lift => {
        lift.performed.forEach(set => {
          total++;
          if (set.rpe) {
            rpeSum += Number(set.rpe);
            rpeCount++;
          }
          if (Number(set.reps) < lift.prescribed.reps) {
            missed++;
          }
        });
      });
  });

  return {
    avgRPE: rpeCount ? rpeSum / rpeCount : null,
    missRate: total ? missed / total : 0
  };
}

module.exports = { computeWeeklyLiftMetrics };
