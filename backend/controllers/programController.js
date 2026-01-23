const fs = require("fs");
const path = require("path");

const programsPath = path.join(__dirname, "../data/programs.json");

function readPrograms() {
  return JSON.parse(fs.readFileSync(programsPath, "utf-8"));
}

exports.getProgramByAthlete = (req, res) => {
  const { athleteId } = req.params;
  const programs = readPrograms();

  const program = programs[athleteId];

  if (!program) {
    return res.status(404).json({ error: "Program not found" });
  }

  res.json(program);
};
