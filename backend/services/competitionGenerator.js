const { buildMainLift } = require("./buildMainLifts");
const { generateAttempts } = require("./competitionAttemptEngine");

function generateCompetitionBlock({ athlete, competitionDate }) {
  if (!athlete) throw new Error("Athlete data missing");
  if (!competitionDate) throw new Error("Competition date missing");

  const today = new Date();
  const compDate = new Date(competitionDate);
  compDate.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysToComp = Math.ceil((compDate - today) / msPerDay);

  if (daysToComp <= 0) {
    throw new Error("Competition date must be in the future");
  }

  const totalDays = daysToComp + 7; // include 7 days post-comp deload
  const tm = athlete.training_max;
  const attempts = generateAttempts({ athlete, logs: athlete.logs || {} });

  const daysArray = [];

  for (let offset = 0; offset <= totalDays; offset++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + offset);

    const daysBeforeComp = daysToComp - offset;
    const daysAfterComp = offset - daysToComp;

    // COMP DAY
    if (daysBeforeComp === 0) {
      daysArray.push({
        date: currentDate.toISOString(),
        phase: "competition_day",
        day_name: "Competition Day",
        main_lifts: [
          { lift: "Squat", attempt_plan: attempts.Squat },
          { lift: "Bench", attempt_plan: attempts.Bench },
          { lift: "Deadlift", attempt_plan: attempts.Deadlift }
        ],
        accessories: []
      });
      continue;
    }

    // 2 DAYS BEFORE COMP → FULL REST
    if (daysBeforeComp === 1 || daysBeforeComp === 2) {
      daysArray.push({
        date: currentDate.toISOString(),
        phase: "pre_comp_rest",
        day_name: "Full Rest",
        main_lifts: [],
        accessories: [],
        notes: "Complete CNS recovery. No lifting."
      });
      continue;
    }

    // 3–6 DAYS BEFORE → TAPER
    if (daysBeforeComp >= 3 && daysBeforeComp <= 6) {
      const lift = ["Squat", "Bench", "Deadlift"][offset % 3];
      const baseLoad = tm[lift.toLowerCase()] || 0;

      daysArray.push({
        date: currentDate.toISOString(),
        phase: "taper",
        main_lifts: [
          buildMainLift({
            lift,
            week: 1,
            baseLoad,
            intensityCap: 0.82,
            fatigueRate: 0.2,
            sets: 2,
            reps: 2
          })
        ],
        accessories: []
      });
      continue;
    }

    // PEAK PHASE
    if (daysBeforeComp > 6) {
      const lift = ["Squat", "Bench", "Deadlift"][offset % 3];
      const baseLoad = tm[lift.toLowerCase()] || 0;

      daysArray.push({
        date: currentDate.toISOString(),
        phase: "peak",
        main_lifts: [
          buildMainLift({
            lift,
            week: 1,
            baseLoad,
            intensityCap: 0.9,
            fatigueRate: 0.3,
            sets: 3,
            reps: 3
          })
        ],
        accessories: []
      });
      continue;
    }

    // POST COMP DELOAD (7 days)
    if (daysAfterComp >= 1 && daysAfterComp <= 7) {
      const lift = ["Squat", "Bench", "Deadlift"][offset % 3];
      const baseLoad = tm[lift.toLowerCase()] || 0;

      daysArray.push({
        date: currentDate.toISOString(),
        phase: "post_comp_deload",
        main_lifts: [
          buildMainLift({
            lift,
            week: 1,
            baseLoad,
            intensityCap: 0.65,
            fatigueRate: 0.1,
            sets: 2,
            reps: 5
          })
        ],
        accessories: []
      });
      continue;
    }

    // Fallback rest
    daysArray.push({
      date: currentDate.toISOString(),
      phase: "rest",
      main_lifts: [],
      accessories: []
    });
  }

  // Group into weeks (7-day blocks)
  const weeks = [];
  for (let i = 0; i < daysArray.length; i += 7) {
    weeks.push({
      week: weeks.length + 1,
      days: daysArray.slice(i, i + 7)
    });
  }

  return {
    weeks,
    metadata: {
      type: "competition_block",
      competitionDate,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { generateCompetitionBlock };
