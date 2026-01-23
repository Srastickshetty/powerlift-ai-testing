function getWeeksToMeet(meetDate) {
  const today = new Date();
  const meet = new Date(meetDate);
  return Math.ceil(
    (meet - today) / (1000 * 60 * 60 * 24 * 7)
  );
}

function getPhase(weeksOut) {
  if (weeksOut > 6) return "normal";
  if (weeksOut > 4) return "intensification";
  if (weeksOut > 2) return "peak";
  if (weeksOut > 0) return "taper";
  return "post_meet";
}

module.exports = { getWeeksToMeet, getPhase };
