const fs = require("fs");
const path = require("path");
const { extractProgramFeatures } = require("../services/programFeatureExtractor");
const { clusterPrograms } = require("../services/programClusterer");

const programsPath = path.join(__dirname, "../data/programLibrary.json");

const programs = JSON.parse(fs.readFileSync(programsPath, "utf-8"));

const features = Object.entries(programs).map(
  ([programId, programMeta]) =>
    extractProgramFeatures(programMeta, programId)
);


const clusters = clusterPrograms(features);

console.log("📦 PROGRAM CLUSTERS\n");
Object.entries(clusters).forEach(([cluster, programIds]) => {
  console.log(`🔹 ${cluster}`);
  programIds.forEach((id) => console.log(`   - ${id}`));
});
