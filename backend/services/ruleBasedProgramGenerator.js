const { selectProgramTemplate } = require("./selectProgramTemplate");
const { buildProgramFromBlueprint } = require("./buildProgramFromBlueprint");

/**
 * Phase 1 — Deterministic Program Generator
 * SINGLE SOURCE OF TRUTH
 */
function generateProgram({ athlete }) {
  if (!athlete) {
    throw new Error("Athlete data missing");
  }

  // 🔒 HARD VALIDATION (NO SILENT FAILS)
  if (!athlete.goal) {
    throw new Error("Athlete goal missing");
  }

  if (!Number.isFinite(Number(athlete.days_available))) {
    throw new Error("Athlete days_available invalid");
  }

  // ✅ NORMALIZED ATHLETE OBJECT
  const normalizedAthlete = {
    ...athlete,
    days_available: Number(athlete.days_available),
  };

  // 🔥 TEMPLATE SELECTION (ONLY PLACE)
  const template = selectProgramTemplate(normalizedAthlete);

  // 🔥 BUILD PROGRAM
  const program = buildProgramFromBlueprint({
    athlete: normalizedAthlete,
    blueprint: template,
  });

  if (!program?.weeks?.length) {
    throw new Error("Program generation failed — no weeks created");
  }

  return {
    weeks: program.weeks,
    metadata: {
      template: template.id,
      generated_by: "rule_engine_v1",
    },
  };
}

module.exports = { generateProgram };
