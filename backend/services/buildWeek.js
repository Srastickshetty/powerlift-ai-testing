const { buildMainLift } = require("./buildMainLifts");
const { attachAccessories } = require("./attachAccessories");

// Pre-lift warmup primers prescribed by elite strength coaches
const WARMUP_PRIMERS = {
  Squat: {
    focus: "Hip, Groin & Ankle Mobility Primer",
    estimated_time: "5-6 min",
    drills: [
      { name: "90/90 Hip Flow", prescription: "90 sec", cue: "Mobilize hip internal/external rotation for clean contest depth" },
      { name: "World's Greatest Stretch", prescription: "5 per side", cue: "Thoracic extension and adductor opening" },
      { name: "Goblet Squat Isometric Hold", prescription: "30 sec", cue: "Pry hips open with elbows at competition depth" },
      { name: "Ankle Wall Mobilization", prescription: "10 per side", cue: "Drive knee past toes to optimize dorsiflexion" }
    ]
  },
  Bench: {
    focus: "Scapular Retraction & Rotator Cuff Armor",
    estimated_time: "4-5 min",
    drills: [
      { name: "Band Pull-Aparts & Dislocates", prescription: "20 reps", cue: "Warm up rear delts and reinforce upper back bench shelf" },
      { name: "Scapular Wall Slides", prescription: "10 reps", cue: "Upward and downward scapular tracking" },
      { name: "Push-Up Plus with Lat Squeeze", prescription: "10 reps", cue: "Serratus anterior activation for shoulder joint stability" },
      { name: "Prone Cobra Holds", prescription: "2 × 20 sec", cue: "Thoracic extension for rigid bench arch" }
    ]
  },
  Deadlift: {
    focus: "Posterior Chain Hinge & Core Wedging",
    estimated_time: "5 min",
    drills: [
      { name: "Single-Leg Glute Bridges", prescription: "10 per side", cue: "Activate glute max and pelvic neutrality before pulling" },
      { name: "Cat-Cow & Quadruped Rockbacks", prescription: "10 reps", cue: "Lumbar-pelvic dissociation under breathing" },
      { name: "Hamstring Sweeps", prescription: "10 per side", cue: "Dynamic hamstring lengthening for start position" },
      { name: "Empty Barbell RDL (3s pause)", prescription: "8 reps", cue: "Lock lats against ribs and feel hamstring tension" }
    ]
  }
};

function buildWeek({ week, athlete, blueprint, caps }) {
  if (!blueprint?.structure || !blueprint?.main_lifts) {
    throw new Error("Invalid blueprint structure passed to buildWeek");
  }

  const days = [];
  const daysPerWeek = blueprint.structure.days_per_week;
  const lifts = Object.entries(blueprint.main_lifts);

  for (let d = 1; d <= daysPerWeek; d++) {
    const main_lifts = [];

    lifts.forEach(([liftName, config]) => {
      if ((d - 1) % config.frequency === 0) {
        const tm = athlete.training_max || athlete.lifts || {};
        const rawMax = tm[liftName.toLowerCase()] || 100;

        main_lifts.push(
          buildMainLift({
            lift: liftName,
            week,
            baseLoad: rawMax * 0.9,
            intensityCap: caps?.intensity_cap,
            fatigueRate: athlete.fatigue_rate,
            sets: config.sets,
            reps: config.reps,
            isSecondary: d > 2 && config.frequency > 1
          })
        );
      }
    });

    // Primary lift dictates warmup primer
    const primaryLift = main_lifts[0]?.lift || "Squat";
    const warmupPrimer = WARMUP_PRIMERS[primaryLift] || WARMUP_PRIMERS.Squat;

    const day = { 
      day: d, 
      warmup_primer: warmupPrimer,
      main_lifts, 
      accessories: [] 
    };

    // Attach structured 3-tier accessories
    attachAccessories({
      day,
      athlete,
      phase: blueprint.phase || "normal"
    });

    days.push(day);
  }

  return { 
    week, 
    phase: blueprint.phase || "normal", 
    days 
  };
}

module.exports = { buildWeek };