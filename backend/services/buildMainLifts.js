const RULES = require("./programRules");

/**
 * buildMainLift - Authentic Powerlifting Competition Lift Engine
 * Generates structured primary lift workouts with:
 * - Top Single @ RPE 8 (Neurological potentiation & contest command practice)
 * - Volume Back-off Sets (Hypertrophy & technical mastery)
 * - Precise target loads (kg) and coaching cues
 */
function buildMainLift({
  lift,
  week = 1,
  baseLoad = 0,
  intensityCap = 0.90,
  fatigueRate = 0,
  sets = 4,
  reps = 5,
  isSecondary = false
}) {
  const resolvedBaseLoad = typeof baseLoad === "number" && !isNaN(baseLoad) ? baseLoad : 0;

  // Wave intensity progression
  const BASE_INTENSITY = 0.72;
  const WEEKLY_INCREMENT = 0.025;
  let intensity = BASE_INTENSITY + (week - 1) * WEEKLY_INCREMENT;

  const maxAllowed = intensityCap || (RULES.MAX_INTENSITY || 0.92);
  intensity = Math.min(intensity, maxAllowed);

  if (fatigueRate > 0.75) {
    intensity *= 0.95;
  }

  const workingLoad = resolvedBaseLoad > 0 ? Math.round(resolvedBaseLoad * intensity) : null;
  const topSingleLoad = resolvedBaseLoad > 0 ? Math.round(resolvedBaseLoad * (0.88 + Math.min(0.04, (week - 1) * 0.01))) : null;

  // Coaching cues tailored to IPF / Powerlifting India standards
  const CUES = {
    Squat: "Brace 360 into belt. Spread floor with feet. Hip crease below top of knee for unquestionable IPF depth.",
    Bench: "Drive lats into pad. Maintain motionless chest contact until PRESS command. Drive heel into floor.",
    Deadlift: "Pull slack out of bar until click. Wedge hips close to barbell. Lock knees and pull shoulders back."
  };

  const cue = CUES[lift] || "Maintain rigid core bracing and explosive concentric drive.";

  // If heavy day (week >= 2 and not deload/secondary), include Top Single protocol
  const hasTopSingle = week >= 2 && !isSecondary && sets >= 3;

  return {
    lift,
    sets,
    reps,
    intensity_pct: parseFloat(intensity.toFixed(4)),
    load: workingLoad,
    target_rpe: Math.min(8, RULES.MAX_RPE || 10),
    rest_seconds: 180,
    has_top_single: hasTopSingle,
    top_single: hasTopSingle ? {
      reps: 1,
      target_rpe: 8.0,
      load: topSingleLoad,
      cue: "Contest command simulation: pause, execute with clean technical mastery (RPE 8, 2 reps in reserve)."
    } : null,
    backoff_sets: {
      sets: hasTopSingle ? sets - 1 : sets,
      reps: reps,
      target_rpe: 7.5,
      load: workingLoad,
      percentage: Math.round(intensity * 100)
    },
    coaching_cue: cue
  };
}

module.exports = { buildMainLift };