function calculateE1RM(weight, reps) {
  if (!weight || !reps) return null;
  return Math.round(weight * (1 + reps / 30));
}

module.exports = { calculateE1RM };
