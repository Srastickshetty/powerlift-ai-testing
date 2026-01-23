// backend/services/coachAlerts.js

function detectAlerts({ fatigueRate, missRate, progressTrend }) {
  const alerts = [];

  if (fatigueRate > 0.25) {
    alerts.push({
      type: "fatigue",
      level: "warning",
      message: "High fatigue accumulation detected",
    });
  }

  if (missRate > 0.15) {
    alerts.push({
      type: "performance",
      level: "critical",
      message: "Miss rate exceeding safe threshold",
    });
  }

  if (progressTrend < -0.5) {
    alerts.push({
      type: "regression",
      level: "warning",
      message: "Performance trending downward",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: "ok",
      level: "info",
      message: "Athlete progressing normally",
    });
  }

  return alerts;
}

module.exports = { detectAlerts };
