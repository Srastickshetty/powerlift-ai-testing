export function getTrainingDayIndex(startDate, daysPerWeek) {
  const start = new Date(startDate);
  const today = new Date();

  let count = 0;
  let date = new Date(start);

  while (date <= today) {
    const day = date.getDay(); // 0=Sun, 6=Sat

    // Mon–Fri training assumption (safe default)
    if (day !== 0 && day !== 6) {
      count++;
    }

    date.setDate(date.getDate() + 1);
  }

  // Training day index (0-based)
  return Math.max(0, count - 1);
}
