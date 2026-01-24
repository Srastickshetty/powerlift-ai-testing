module.exports = function createNewVersion(programData, newProgram, reason) {
  const nextVersion = programData.activeVersion + 1;

  programData.versions.push({
    version: nextVersion,
    created_at: new Date().toISOString().slice(0, 10),
    reason,
    program: structuredClone(newProgram),
  });

  programData.activeVersion = nextVersion;
};
