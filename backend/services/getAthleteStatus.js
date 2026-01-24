// services/getAthleteStatus.js

function getAthleteStatus(weeklyMetrics) {
  if (!weeklyMetrics || weeklyMetrics.length === 0) {
    return "no_data";
  }

  const severe = weeklyMetrics.some(
    (m) => m?.avgRPE >= 9 || m?.missRate >= 0.25
  );

  const moderate = weeklyMetrics.some(
    (m) => m?.avgRPE >= 8 || m?.missRate >= 0.15
  );

  if (severe) return "needs_intervention";
  if (moderate) return "monitor";
  return "on_track";
}

module.exports = { getAthleteStatus };
