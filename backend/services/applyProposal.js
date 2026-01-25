const fs = require("fs");
const path = require("path");

const proposalsPath = path.join(__dirname, "../data/autoregulationProposals.json");
const programsPath = path.join(__dirname, "../data/programs.json");

/**
 * 🚀 Applies an AI proposal (or coach-overridden draft) to the athlete's program.
 * Creates a new version and updates the active status.
 */
function applyProposal({ athleteId, coachId, overriddenWeek = null }) {
  // 1. Load Data
  const proposals = JSON.parse(fs.readFileSync(proposalsPath, "utf-8"));
  const programs = JSON.parse(fs.readFileSync(programsPath, "utf-8"));

  const proposal = proposals[athleteId];
  const program = programs[athleteId];

  // 2. Validation
  if (!proposal) throw new Error("No proposals found for athlete");
  if (proposal.status === "approved") throw new Error("Proposal already approved");
  if (!program) throw new Error("Program not found");

  // 3. Determine the content of the new week
  // If the coach edited the week in the UI, use overriddenWeek. Otherwise, use the AI proposal.
  const finalWeekData = overriddenWeek || proposal.proposedWeek;

  // 4. Get the current program structure to append to
  const activeIndex = (program.activeVersion ?? 1) - 1;
  const currentWeeks = program.versions[activeIndex]?.program?.weeks || [];

  // 5. Create the New Version
  const newVersion = {
    version: program.versions.length + 1,
    created_at: new Date().toISOString(),
    reason: proposal.reason || "Autoregulation Adjustment",
    approved_by: coachId,
    program: {
      // We keep the history of previous weeks and append the newly approved week
      weeks: [...currentWeeks, finalWeekData],
    },
  };

  // 6. Update Program State
  program.versions.push(newVersion);
  program.activeVersion = newVersion.version;

  // 7. Update Proposal Status (or you could delete it)
  proposal.status = "approved";
  proposal.approvedBy = coachId;
  proposal.approvedAt = new Date().toISOString();

  // 8. Persist to Disk
  fs.writeFileSync(programsPath, JSON.stringify(programs, null, 2));
  fs.writeFileSync(proposalsPath, JSON.stringify(proposals, null, 2));

  return {
    athleteId,
    newVersion: newVersion.version,
    status: "success"
  };
}

module.exports = { applyProposal };