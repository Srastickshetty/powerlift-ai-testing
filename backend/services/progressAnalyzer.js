// services/progressAnalyzer.js

function analyzeProgress(logs) {
  if (!logs || logs.length === 0) return [];

  const fatigueTrend = [];

  logs.forEach((session) => {
    let sessionRPE = 0;
    let rpeCount = 0;

    session.main_lifts.forEach((lift) => {
      lift.performed?.forEach((set) => {
        if (set.rpe) {
          sessionRPE += Number(set.rpe);
          rpeCount++;
        }
      });
    });

    fatigueTrend.push({
      date: session.date, // ✅ IMPORTANT
      fatigue: rpeCount
        ? Number((sessionRPE / rpeCount / 10).toFixed(2))
        : 0,
    });
  });

  return fatigueTrend;
}

module.exports = { analyzeProgress };
