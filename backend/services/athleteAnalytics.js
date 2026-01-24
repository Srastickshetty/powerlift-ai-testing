const { analyzeProgress } = require("./progressAnalyzer");
const { getAthleteStatus } = require("./getAthleteStatus");
const { generateCoachAlerts } = require("./coachAlerts");
const { computeWeeklyLiftMetrics } = require("./weeklyPerformance");

/**
 * 🔍 Main analytics entry point for ONE athlete
 * Used by Coach Dashboard
 */
// services/athleteAnalytics.js

function analyzeAthlete(athlete_id, logs) {
  const athleteLogs = logs.filter(
    (l) => l.athlete_id === athlete_id
  );

  if (athleteLogs.length === 0) return null;

  let totalSets = 0;
  let missedSets = 0;
  let totalRPE = 0;
  let rpeCount = 0;

  athleteLogs.forEach((session) => {
    session.main_lifts.forEach((lift) => {
      lift.performed?.forEach((set) => {
        totalSets++;

        if (
          Number(set.reps) < lift.prescribed?.reps ||
          (set.rpe && Number(set.rpe) > 9)
        ) {
          missedSets++;
        }

        if (set.rpe) {
          totalRPE += Number(set.rpe);
          rpeCount++;
        }
      });
    });
  });

  const miss_rate = totalSets ? missedSets / totalSets : 0;
  const fatigue_rate = rpeCount ? totalRPE / rpeCount / 10 : 0;

  const compliance = Math.min(1, athleteLogs.length / 20);

  let status = "on_track";
  if (compliance < 0.65 || miss_rate > 0.25) {
    status = "needs_intervention";
  } else if (compliance < 0.85 || fatigue_rate > 0.75) {
    status = "monitor";
  }

  return {
    athlete_id,
    compliance: Number((compliance * 100).toFixed(1)),
    miss_rate: Number(miss_rate.toFixed(2)),
    fatigue_rate: Number(fatigue_rate.toFixed(2)),
    status,
    last_session: athleteLogs.at(-1)?.date || null,
  };
}

module.exports = { analyzeAthlete };
