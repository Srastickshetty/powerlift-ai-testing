const fs = require("fs");
const path = require("path");

const proposalsPath = path.join(
  __dirname,
  "../data/autoregulationProposals.json"
);

const programsPath = path.join(
  __dirname,
  "../data/programs.json"
);

function applyProposal({ athleteId, coachId }) {
  const proposals = JSON.parse(fs.readFileSync(proposalsPath, "utf-8"));

  const proposal = proposals[athleteId];

  if (!proposal) {
    throw new Error("No proposals found for athlete");
  }

  if (proposal.status === "approved") {
    throw new Error("Proposal already approved");
  }

  const programs = JSON.parse(fs.readFileSync(programsPath, "utf-8"));
  const program = programs[athleteId];

  if (!program) {
    throw new Error("Program not found");
  }

  const activeIndex = (program.activeVersion ?? 1) - 1;
  const baseWeeks = program.versions[activeIndex].program.weeks;

  const newVersion = {
    version: program.versions.length + 1,
    created_at: new Date().toISOString(),
    reason: "autoregulation",
    program: {
      weeks: [...baseWeeks, proposal.proposedWeek],
    },
  };

  program.versions.push(newVersion);
  program.activeVersion = newVersion.version;

  proposal.status = "approved";
  proposal.approvedBy = coachId;
  proposal.approvedAt = new Date().toISOString();

  fs.writeFileSync(programsPath, JSON.stringify(programs, null, 2));
  fs.writeFileSync(proposalsPath, JSON.stringify(proposals, null, 2));

  return {
    athleteId,
    newVersion: newVersion.version,
  };
}

module.exports = { applyProposal };
