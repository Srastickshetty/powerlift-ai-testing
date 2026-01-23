const { calculateE1RM } = require("./e1rmCalculator");

function extractE1RMTrend(logs, liftName) {
  return logs
    .map((session) => {
      let topSet = null;

      session.main_lifts
        .filter((l) => l.lift === liftName)
        .forEach((lift) => {
          lift.performed.forEach((set) => {
            if (!topSet || set.load > topSet.load) {
              topSet = set;
            }
          });
        });

      if (!topSet) return null;

      return {
        date: session.date,
        e1rm: calculateE1RM(topSet.load, topSet.reps),
      };
    })
    .filter(Boolean);
}

module.exports = { extractE1RMTrend };
