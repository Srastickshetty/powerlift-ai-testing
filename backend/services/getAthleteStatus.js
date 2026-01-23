function getAthleteStatus({ fatigueRate, missRate, progressTrend = 0 }) {
  let status = "on_track";
  const alerts = [];

  if (fatigueRate > 0.25) {
    alerts.push("High fatigue detected");
  }

  if (missRate > 0.3) {
    alerts.push("Missed workouts frequently");
  }

  if (progressTrend < 0) {
    alerts.push("Performance declining");
  }

  if (alerts.length >= 2) {
    status = "needs_intervention";
  } else if (alerts.length === 1) {
    status = "watch";
  }

  return { status, alerts };
}

module.exports = getAthleteStatus;
