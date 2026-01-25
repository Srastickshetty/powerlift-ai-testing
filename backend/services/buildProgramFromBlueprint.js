const { buildWeek } = require("./buildWeek");

function buildProgramFromBlueprint({
  blueprint,
  athlete,
  caps
}) {
  const weeks = [];

  for (let w = 1; w <= athlete.total_weeks; w++) {
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
