const fs = require("fs");
const path = require("path");
const { extractProgramFeatures } = require("../services/programFeatureExtractor");

const programsPath = path.join(__dirname, "../data/programLibrary.json");
const programs = JSON.parse(fs.readFileSync(programsPath, "utf-8"));

console.log("TYPE:", typeof programs);
console.log("KEYS:", Object.keys(programs));

Object.entries(programs).forEach(([programId, programMeta]) => {
  const vector = extractProgramFeatures(programMeta);
  console.log("Program:", programId);
  console.table(vector);
});
