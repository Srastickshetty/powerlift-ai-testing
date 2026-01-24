// services/deloadEngine.js

function applyDeload(week) {
  const deloadWeek = structuredClone(week);

  deloadWeek.days.forEach((day) => {
    day.main_lifts.forEach((lift) => {
      // 🔻 Reduce load by 12%
      lift.load = Math.round(lift.load * 0.88);

      // 🔻 Reduce volume by ~35%
      lift.sets = Math.max(1, Math.round(lift.sets * 0.65));
    });
  });

  return deloadWeek;
}

module.exports = { applyDeload };
