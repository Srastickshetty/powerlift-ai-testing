const templates = require("../data/programTemplates.json");

/**
 * Selects a program template based on athlete profile
 * Phase 1 source of truth
 */
function selectProgramTemplate(athlete) {
  console.log("🧪 TEMPLATE MATCH INPUT:", {
    goal: athlete.goal,
    days_available: athlete.days_available,
    typeof_days: typeof athlete.days_available
  });

  const matches = templates.filter(t =>
    t.goal === athlete.goal &&
    athlete.days_available >= t.structure.days_per_week
  );
if (!athlete.goal) {
  console.warn("⚠️ Athlete goal missing, defaulting to strength");
}

  if (!matches.length) {
    return templates[0];
  }

  // Pick the most demanding template the athlete can handle
  return matches.reduce((best, curr) =>
    curr.structure.days_per_week > best.structure.days_per_week
      ? curr
      : best
  );
}

module.exports = { selectProgramTemplate };
