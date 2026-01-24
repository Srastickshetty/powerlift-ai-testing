// services/coachAlerts.js

function generateCoachAlerts({ progress, weeklyMetrics }) {
  const alerts = [];

  // 🚨 Fatigue alert
  if (progress.fatigue?.length >= 2) {
    const recent = progress.fatigue.at(-1).fatigue;
    const prev = progress.fatigue.at(-2).fatigue;

    if (recent - prev > 0.15) {
      alerts.push({
        level: "critical",
        message: "Fatigue spike detected week-over-week",
      });
    }
  }

  // 📉 Stagnation alert (no e1RM progress)
  ["squat", "bench", "deadlift"].forEach((lift) => {
    const series = progress[lift];
    if (!series || series.length < 3) return;

    const last = series.at(-1).e1rm;
    const prev = series.at(-2).e1rm;

    if (last <= prev) {
      alerts.push({
        level: "warning",
        message: `${lift} performance stagnating`,
      });
    }
  });

  // ❌ Miss-rate alert
  weeklyMetrics.forEach((m) => {
    if (m?.missRate > 0.25) {
      alerts.push({
        level: "critical",
        message: `${m.lift} miss rate high`,
      });
    }
  });

  // 🟢 Positive PR alert
  ["squat", "bench", "deadlift"].forEach((lift) => {
    const series = progress[lift];
    if (!series || series.length < 2) return;

    if (series.at(-1).e1rm > series.at(-2).e1rm) {
      alerts.push({
        level: "positive",
        message: `New ${lift} PR achieved`,
      });
    }
  });

  return alerts;
}

module.exports = { generateCoachAlerts };
