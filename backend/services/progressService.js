const { calculateE1RM } = require("./e1rmCalculator");
const { computeWeeklyLiftMetrics } = require("./weeklyPerformance");
const { analyzeProgress } = require("./progressAnalyzer");
const { getAthleteStatus } = require("./getAthleteStatus");

function buildProgress(logs) {
  if (!logs || logs.length === 0) {
    return {
      squat: [],
      bench: [],
      deadlift: [],
      fatigue: [],
      status: "no_data",
    };
  }

  const lifts = ["Squat", "Bench", "Deadlift"];
  const e1rmSeries = {
    Squat: [],
    Bench: [],
    Deadlift: [],
  };

  logs.forEach((session) => {
    session.main_lifts.forEach((lift) => {
      if (!lifts.includes(lift.lift)) return;

      lift.performed?.forEach((set) => {
        if (!set.reps || !set.load) return;

        const e1rm = calculateE1RM(set.load, set.reps, set.rpe);

        e1rmSeries[lift.lift].push({
          date: session.date,
          e1rm: Math.round(e1rm),
        });
      });
    });
  });

  const fatigueTrend = analyzeProgress(logs);

  const weeklyMetrics = lifts.map((lift) =>
    computeWeeklyLiftMetrics(logs, lift)
  );

  const status = getAthleteStatus(weeklyMetrics);

  return {
    squat: e1rmSeries.Squat,
    bench: e1rmSeries.Bench,
    deadlift: e1rmSeries.Deadlift,
    fatigue: fatigueTrend,
    status,
  };
}

module.exports = { buildProgress };
