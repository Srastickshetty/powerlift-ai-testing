const fs = require("fs");
const path = require("path");

const programsPath = path.join(__dirname, "../data/programs.json");

/**
 * 🔻 Apply Deload Version
 */
function applyDeload({ athleteId, reason = "coach_deload", appliedBy }) {
  const programs = JSON.parse(fs.readFileSync(programsPath, "utf-8"));
  const program = programs[athleteId];

  if (!program) {
    throw new Error("Program not found for athlete");
  }

  const activeVersion =
    program.versions.find((v) => v.version === program.activeVersion);

  if (!activeVersion) {
    throw new Error("Active program version not found");
  }

  const lastWeek =
    activeVersion.program.weeks[
      activeVersion.program.weeks.length - 1
    ];

  // 🔻 Clone last week
  const deloadWeek = structuredClone(lastWeek);
  deloadWeek.week = lastWeek.week + 1;

  // 🔻 Apply deload logic
  deloadWeek.days.forEach((day) => {
    day.main_lifts.forEach((lift) => {
      lift.sets = Math.max(1, Math.floor(lift.sets * 0.5));
      lift.load = Math.round(lift.load * 0.85);
    });
  });

  const newVersionNumber = program.versions.length + 1;

  program.versions.push({
    version: newVersionNumber,
    created_at: new Date().toISOString(),
    reason,
    approved_by: appliedBy,
    program: {
      weeks: [...activeVersion.program.weeks, deloadWeek],
    },
  });

  program.activeVersion = newVersionNumber;

  fs.writeFileSync(programsPath, JSON.stringify(programs, null, 2));

  return {
    athleteId,
    newVersion: newVersionNumber,
    week: deloadWeek.week,
  };
}

/* ✅ CRITICAL EXPORT */
module.exports = {
  applyDeload,
};
