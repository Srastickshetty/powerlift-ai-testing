const { matchAthleteToCluster } = require("../services/athleteClusterMatcher");

const athlete = {
  experience_level: "intermediate",
  days_available: 4,
  recovery_score: 0.7,
  fatigue_rate: 0.3,
  injury_risk: 0.1,
  uses_rpe: true
};

console.log(matchAthleteToCluster(athlete));
