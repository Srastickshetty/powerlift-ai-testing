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

  const e1rmSeries = {
    squat: [],
    bench: [],
    deadlift: [],
  };

  logs.forEach((session) => {
    // Group by lift to find the peak per session
    const dailyPeaks = {};

    session.main_lifts.forEach((lift) => {
      const liftName = lift.lift.toLowerCase();
      if (!['squat', 'bench', 'deadlift'].includes(liftName)) return;

      lift.performed?.forEach((set) => {
        if (!set.reps || !set.load) return;

        const e1rm = calculateE1RM(set.load, set.reps, set.rpe || 8);
        
        // Only keep the highest e1rm found in this session for this specific lift
        if (!dailyPeaks[liftName] || e1rm > dailyPeaks[liftName]) {
          dailyPeaks[liftName] = e1rm;
        }
      });
    });

    // Push only the session peaks to the series
    Object.keys(dailyPeaks).forEach(liftName => {
      e1rmSeries[liftName].push({
        date: session.date,
        value: Math.round(dailyPeaks[liftName]),
      });
    });
  });
  const fatigueTrend = analyzeProgress(logs);

  const weeklyMetrics = ['squat', 'bench', 'deadlift'].map((lift) =>
    computeWeeklyLiftMetrics(logs, lift)
  );

  const status = getAthleteStatus(weeklyMetrics);

  return {
    squat: e1rmSeries.squat,
    bench: e1rmSeries.bench,
    deadlift: e1rmSeries.deadlift,
    fatigue: fatigueTrend,
    status,
  };
}

module.exports = { buildProgress };
