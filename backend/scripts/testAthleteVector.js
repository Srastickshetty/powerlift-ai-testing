const fs = require("fs");
const path = require("path");
const { buildAthleteFeatureVector } = require("../services/athleteFeatureVector");

const logs = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/workoutLogs.json"))
);

const vector = buildAthleteFeatureVector({
  athleteId: "athlete_001",
  logs,
  profile: {
    training_years: 3,
    compliance: 0.82
  }
});

console.log(JSON.stringify(vector, null, 2));
