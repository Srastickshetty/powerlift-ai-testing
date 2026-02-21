// services/programStructureAnalyzer.js

/**
 * Analyze program structure from weeks
 * @param {Array} weeks - program weeks array
 */
function analyzeProgramStructure(weeks = []) {
  if (!weeks.length) {
    return {
      programSummary: null,
      weeklyPhases: [],
    };
  }

  /* ---------------- HELPERS ---------------- */

  const getWeekVolume = (week) => {
    let volume = 0;
    week.days.forEach((day) => {
      day.main_lifts.forEach((lift) => {
        volume += lift.sets * lift.reps * lift.load;
      });
    });
    return volume;
  };

  const getWeekIntensity = (week) => {
    let totalLoad = 0;
    let count = 0;
    week.days.forEach((day) => {
      day.main_lifts.forEach((lift) => {
        totalLoad += lift.load;
        count++;
      });
    });
    return count ? totalLoad / count : 0;
  };

  /* ---------------- METRICS ---------------- */

  const volumeByWeek = weeks.map(getWeekVolume);
  const intensityByWeek = weeks.map(getWeekIntensity);

  const volumeTrend =
    volumeByWeek.at(-1) > volumeByWeek[0]
      ? "increasing"
      : volumeByWeek.at(-1) < volumeByWeek[0]
      ? "decreasing"
      : "stable";

  const intensityTrend =
    intensityByWeek.at(-1) > intensityByWeek[0]
      ? "increasing"
      : intensityByWeek.at(-1) < intensityByWeek[0]
      ? "decreasing"
      : "stable";

  /* ---------------- WEEK PHASES ---------------- */

  const weeklyPhases = weeks.map((week, i) => {
    let phase = "maintenance";

    if (volumeTrend === "increasing" && intensityTrend === "stable") {
      phase = "accumulation";
    }

    if (volumeTrend === "stable" && intensityTrend === "increasing") {
      phase = "intensification";
    }

    if (volumeTrend === "decreasing" && intensityTrend === "increasing") {
      phase = "peaking";
    }

    if (volumeTrend === "decreasing" && intensityTrend === "decreasing") {
      phase = "deload";
    }

    return {
      week: week.week,
      phase,
    };
  });

  /* ---------------- LIFT PRIORITY ---------------- */

  const liftTotals = { Squat: 0, Bench: 0, Deadlift: 0 };

  weeks.forEach((week) => {
    week.days.forEach((day) => {
      day.main_lifts.forEach((lift) => {
        liftTotals[lift.lift] += lift.sets * lift.reps * lift.load;
      });
    });
  });

  const totalVolume =
    liftTotals.Squat + liftTotals.Bench + liftTotals.Deadlift;

  const liftPriority = {};
  Object.entries(liftTotals).forEach(([lift, vol]) => {
    const share = vol / totalVolume;
    if (share > 0.4) liftPriority[lift] = "primary";
    else if (share > 0.25) liftPriority[lift] = "secondary";
    else liftPriority[lift] = "maintenance";
  });

  /* ---------------- DELOAD EXPECTATION ---------------- */

  const deloadExpected =
    volumeTrend === "decreasing" ||
    weeks.length >= 6;

  /* ---------------- FINAL OUTPUT ---------------- */

  return {
    programSummary: {
      phase: weeklyPhases.at(-1).phase,
      volume_trend: volumeTrend,
      intensity_trend: intensityTrend,
      lift_priority: liftPriority,
      deload_expected: deloadExpected,
      confidence: Math.min(1, weeks.length / 8),
    },
    weeklyPhases,
  };
}


module.exports = { analyzeProgramStructure };
