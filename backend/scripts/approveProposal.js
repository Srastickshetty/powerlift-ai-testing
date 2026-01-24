const { applyProposal } = require("../services/applyProposal");

const result = applyProposal({
  athleteId: "athlete_001",
  coachId: "admin",
});

console.log("\nPROPOSAL APPROVED & APPLIED\n");
console.log(result);
