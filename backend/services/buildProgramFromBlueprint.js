const { buildWeek } = require("./buildWeek");

function buildProgramFromBlueprint({
  blueprint,
  athlete,
  caps = {}
}) {
  if (!blueprint.weeks) {
    throw new Error("Blueprint weeks missing");
  }

  const weeks = [];

  for (let w = 1; w <= blueprint.weeks; w++) {
    weeks.push(
      buildWeek({
        week: w,
        athlete,
        blueprint,
        caps
      })
    );
  }

  return { weeks };
}

module.exports = { buildProgramFromBlueprint };
