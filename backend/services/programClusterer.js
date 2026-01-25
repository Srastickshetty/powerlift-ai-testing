const { classifyProgram } = require("./programClusterRules");

function clusterPrograms(programFeatures) {
  const clusters = {};

  programFeatures.forEach((program) => {
    const clusterKey = classifyProgram(program);

    if (!clusters[clusterKey]) {
      clusters[clusterKey] = [];
    }

    clusters[clusterKey].push(program.program_id);
  });

  return clusters;
}

module.exports = { clusterPrograms };
