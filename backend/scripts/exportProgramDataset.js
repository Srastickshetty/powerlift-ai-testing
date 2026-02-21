const fs = require("fs");
const path = require("path");
const { extractProgramFeatures } = require("../services/programFeatureExtractor");

const programsPath = path.join(__dirname, "../data/programLibrary.json");
const outputDir = path.join(__dirname, "../ml_data");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// 1️⃣ Load program library
const programs = JSON.parse(fs.readFileSync(programsPath, "utf-8"));

// 2️⃣ Unified dataset (IMPORTANT CHANGE)
const dataset = [];

// 3️⃣ Extract + pack features
Object.entries(programs).forEach(([programId, programMeta]) => {
  const features = extractProgramFeatures(programMeta);

  const vector = [
    features.days_per_week,
    features.block_length,

    features.squat_freq,
    features.bench_freq,
    features.deadlift_freq,

    features.avg_intensity,
    features.max_intensity,
    features.uses_rpe,

    features.avg_volume,
    features.volume_trend,

    features.periodization_type,
    features.has_deload,
    features.deload_week,
  ];

  dataset.push({
    program_id: programId,
    features: vector,
  });
});

// 4️⃣ Write SINGLE ML-ready dataset
fs.writeFileSync(
  path.join(outputDir, "program_features.json"),
  JSON.stringify(dataset, null, 2)
);

console.log("✅ Program ML dataset exported");
console.log(`Programs exported: ${dataset.length}`);
