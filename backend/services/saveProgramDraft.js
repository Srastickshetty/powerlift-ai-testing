const fs = require("fs");
const path = require("path");

const programsPath = path.join(__dirname, "../data/programs.json");

function saveProgramDraft({ athleteId, program, metadata }) {
  const programs = JSON.parse(fs.readFileSync(programsPath, "utf-8"));

  if (!programs[athleteId]) {
    throw new Error("Athlete program not found");
  }

  const athleteProgram = programs[athleteId];

  const newVersion = athleteProgram.versions.length + 1;

  athleteProgram.versions.push({
    version: newVersion,
    state: "draft",
    created_at: new Date().toISOString(),
    generated_by: metadata.generated_by,
    cluster: metadata.cluster,
    confidence: metadata.confidence,
    program,
  });

  // ❌ DO NOT change activeVersion
  fs.writeFileSync(programsPath, JSON.stringify(programs, null, 2));

  return {
    athleteId,
    draftVersion: newVersion,
    state: "draft",
  };
}

module.exports = { saveProgramDraft };
