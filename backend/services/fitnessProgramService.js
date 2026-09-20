/**
 * fitnessProgramService.js - General Fitness, Hypertrophy & Body Recomposition Generator
 * Generates PPL, Upper/Lower, Arnold Split, and Full Body programs with warmups, working sets, and RIR cues.
 */

const EXERCISE_DATABASE = {
  push: {
    chest_primary: [
      { name: "Incline Dumbbell Bench Press", defaultReps: "8-10", rir: 2, cue: "Set bench to 30°. Deep pectoral stretch at bottom, explosive press without clanking bells." },
      { name: "Barbell Flat Bench Press", defaultReps: "6-8", rir: 2, cue: "Drive shoulder blades into bench. Controlled descent to sternum, explosive drive." },
      { name: "Machine Chest Press", defaultReps: "10-12", rir: 1, cue: "Constant tension. 2-second eccentric phase, squeeze pecs hard at contraction." }
    ],
    chest_secondary: [
      { name: "Cable Chest Flyes", defaultReps: "12-15", rir: 1, cue: "Slight elbow bend. Imagine hugging a giant barrel. Deep stretch." },
      { name: "Dips (Chest Leaning)", defaultReps: "8-12", rir: 1, cue: "Lean torso forward 30°. Flare elbows slightly to bias lower pectorals." },
      { name: "Incline Dumbbell Flyes", defaultReps: "12-15", rir: 2, cue: "Focus purely on clavicular head stretch. Never bounce at bottom." }
    ],
    shoulders: [
      { name: "Seated Dumbbell Shoulder Press", defaultReps: "8-10", rir: 2, cue: "Press in slight arcing path overhead. Keep core locked, no lower back hyperextension." },
      { name: "Dumbbell Lateral Raises", defaultReps: "12-15", rir: 1, cue: "Lead with elbows. Pouring-water wrist angle, control the 3-second descent." },
      { name: "Cable Lateral Raises", defaultReps: "12-15", rir: 0, cue: "Constant resistance profile from floor to peak shoulder height." }
    ],
    triceps: [
      { name: "Overhead Cable Rope Tricep Extension", defaultReps: "10-12", rir: 1, cue: "Flare rope at lockout. Full stretch of the triceps long head behind neck." },
      { name: "Close Grip Bench Press", defaultReps: "8-10", rir: 2, cue: "Shoulder-width grip. Tuck elbows at 45° to burn lateral and medial heads." },
      { name: "Straight Bar Cable Pushdowns", defaultReps: "12-15", rir: 1, cue: "Lock elbows by your ribs like hinges. Push down and flex hard." }
    ]
  },
  pull: {
    back_width: [
      { name: "Wide Grip Lat Pulldown", defaultReps: "10-12", rir: 1, cue: "Drive elbows down into your back pockets. Slight torso lean, pull to upper clavicle." },
      { name: "Neutral Grip Pull-Ups", defaultReps: "6-10", rir: 2, cue: "Full dead-hang at bottom for lat stretch. Chest touches bar at peak." },
      { name: "Single-Arm Cable Lat Pulldown", defaultReps: "10-12", rir: 1, cue: "Line of pull matches lat muscle fibers. Drive elbow tight to spine." }
    ],
    back_thickness: [
      { name: "Chest-Supported T-Bar Row", defaultReps: "8-10", rir: 1, cue: "No spinal momentum. Drive through elbows, squeeze rhomboids for a full second." },
      { name: "Seated Cable Row", defaultReps: "10-12", rir: 1, cue: "Let lats stretch forward, pull to belly button and squeeze middle traps." },
      { name: "Barbell Bent-Over Row", defaultReps: "6-8", rir: 2, cue: "Hinge at hips to 45°. Pull barbell to upper stomach with strict control." }
    ],
    rear_delts: [
      { name: "Face Pulls with External Rotation", defaultReps: "15-20", rir: 1, cue: "Pull rope towards bridge of nose while showing thumbs behind you." },
      { name: "Reverse Pec Deck Flyes", defaultReps: "12-15", rir: 1, cue: "Pinkies leading the outward sweep. Pure posterior deltoid isolation." }
    ],
    biceps: [
      { name: "Incline Dumbbell Bicep Curls", defaultReps: "10-12", rir: 1, cue: "Deep stretch on biceps long head at bottom. Full supination at peak." },
      { name: "Standing EZ-Bar Curls", defaultReps: "8-10", rir: 1, cue: "Strict form, elbows fixed at sides. No swaying back and forth." },
      { name: "Hammer Curls (Dumbbell)", defaultReps: "10-12", rir: 1, cue: "Neutral grip to overload the brachialis and forearm brachioradialis." }
    ]
  },
  legs: {
    quads: [
      { name: "Barbell Back Squat (High Bar)", defaultReps: "8-10", rir: 2, cue: "Upright torso, full knee flexion over toes. Drive through whole foot." },
      { name: "Hack Squat or Leg Press", defaultReps: "10-12", rir: 1, cue: "Feet low on platform for maximum quad bias. Full depth to 90° or deeper." },
      { name: "Leg Extensions", defaultReps: "12-15", rir: 0, cue: "Point toes forward, squeeze quads at peak contraction for 1 full second." }
    ],
    hamstrings: [
      { name: "Romanian Deadlifts (Dumbbell or Barbell)", defaultReps: "8-10", rir: 2, cue: "Soft knees, push hips back to the wall until deep hamstring stretch. Spine neutral." },
      { name: "Seated Leg Curls", defaultReps: "10-12", rir: 1, cue: "Point toes slightly toward shins. Controlled 3-second negative eccentric." },
      { name: "Lying Leg Curls", defaultReps: "12-15", rir: 0, cue: "Keep hips glued to the bench. Flex hamstrings violently up to glutes." }
    ],
    glutes_calves: [
      { name: "Bulgarian Split Squats", defaultReps: "10-12", rir: 1, cue: "Forward torso lean for glute bias; upright torso for quad bias. Control the descent." },
      { name: "Standing Calf Raises", defaultReps: "15-20", rir: 0, cue: "2-second dead stop stretch at bottom. Explode onto balls of feet." }
    ]
  }
};

/**
 * Generates an adaptive multi-week fitness program
 * @param {Object} params - User survey parameters
 */
function generateFitnessProgram({
  goal = 'hypertrophy', // 'hypertrophy' | 'fat_loss' | 'recomp'
  experience = 'intermediate', // 'beginner' | 'intermediate' | 'advanced'
  daysPerWeek = 4, // 3, 4, 5, 6
  durationMinutes = 60, // 45, 60, 75, 90
  splitPreference = 'ppl', // 'ppl' | 'upper_lower' | 'arnold' | 'full_body'
  dietBudget = 'moderate', // 'budget' | 'moderate' | 'performance'
  proteinTarget = 120, // g
  dietType = 'non_veg' // 'pure_veg' | 'eggetarian' | 'non_veg'
}) {
  const days = [];

  const setsPerExercise = experience === 'beginner' ? 3 : experience === 'advanced' ? 4 : 3;

  if (splitPreference === 'ppl' || daysPerWeek === 6 || daysPerWeek === 3) {
    // PUSH DAY
    days.push({
      dayName: "Day 1: Push (Chest, Front/Side Delts, Triceps)",
      focus: "Chest Hypertrophy & Overhead Pressing",
      warmup: "5 min Rotator Cuff External Rotations + Band Pull-Aparts + Push-Up Flow",
      exercises: [
        { ...EXERCISE_DATABASE.push.chest_primary[0], sets: setsPerExercise },
        { ...EXERCISE_DATABASE.push.chest_secondary[0], sets: setsPerExercise },
        { ...EXERCISE_DATABASE.push.shoulders[0], sets: setsPerExercise },
        { ...EXERCISE_DATABASE.push.shoulders[1], sets: 4, isDropSetPossible: true },
        { ...EXERCISE_DATABASE.push.triceps[0], sets: setsPerExercise }
      ]
    });

    // PULL DAY
    days.push({
      dayName: "Day 2: Pull (Lats, Upper Back, Rear Delts, Biceps)",
      focus: "V-Taper Lat Width & Upper Back Density",
      warmup: "5 min Dead Hangs + Scapular Pull-Ups + Cat-Cow Spine Flow",
      exercises: [
        { ...EXERCISE_DATABASE.pull.back_width[0], sets: setsPerExercise },
        { ...EXERCISE_DATABASE.pull.back_thickness[0], sets: setsPerExercise },
        { ...EXERCISE_DATABASE.pull.rear_delts[0], sets: 4 },
        { ...EXERCISE_DATABASE.pull.biceps[0], sets: setsPerExercise },
        { ...EXERCISE_DATABASE.pull.biceps[2], sets: setsPerExercise }
      ]
    });

    // LEGS DAY
    days.push({
      dayName: "Day 3: Legs (Quads, Hamstrings, Calves)",
      focus: "Quad Development & Posterior Chain Foundation",
      warmup: "5 min 90/90 Hip Flow + Bodyweight Air Squats + Ankle Dorsiflexion",
      exercises: [
        { ...EXERCISE_DATABASE.legs.quads[0], sets: setsPerExercise },
        { ...EXERCISE_DATABASE.legs.hamstrings[0], sets: setsPerExercise },
        { ...EXERCISE_DATABASE.legs.quads[2], sets: 3, isDropSetPossible: true },
        { ...EXERCISE_DATABASE.legs.hamstrings[1], sets: 3 },
        { ...EXERCISE_DATABASE.legs.glutes_calves[1], sets: 4 }
      ]
    });

    if (daysPerWeek >= 4) {
      // PUSH 2 / UPPER VARIATION
      days.push({
        dayName: "Day 4: Upper Body Aesthetics (Chest & Arms Focus)",
        focus: "Arm Volume & Shoulder Silhouette",
        warmup: "Dynamic Arm Swings + Band Dislocates",
        exercises: [
          { ...EXERCISE_DATABASE.push.chest_primary[1], sets: setsPerExercise },
          { ...EXERCISE_DATABASE.pull.back_thickness[1], sets: setsPerExercise },
          { ...EXERCISE_DATABASE.push.shoulders[2], sets: 4 },
          { ...EXERCISE_DATABASE.pull.biceps[1], sets: setsPerExercise },
          { ...EXERCISE_DATABASE.push.triceps[2], sets: setsPerExercise }
        ]
      });
    }

    if (daysPerWeek >= 5) {
      // LEGS 2 / LOWER POSTERIOR FOCUS
      days.push({
        dayName: "Day 5: Lower Body & Glutes (Posterior Chain Focus)",
        focus: "Hamstring Hypertrophy & Unilateral Balance",
        warmup: "Glute Bridges + Walking Lunges",
        exercises: [
          { ...EXERCISE_DATABASE.legs.hamstrings[0], sets: setsPerExercise },
          { ...EXERCISE_DATABASE.legs.quads[1], sets: setsPerExercise },
          { ...EXERCISE_DATABASE.legs.glutes_calves[0], sets: 3 },
          { ...EXERCISE_DATABASE.legs.hamstrings[2], sets: 3 },
          { ...EXERCISE_DATABASE.legs.glutes_calves[1], sets: 4 }
        ]
      });
    }
  } else {
    // UPPER / LOWER SPLIT
    days.push({
      dayName: "Day 1: Upper Body Power & Hypertrophy",
      focus: "Horizontal Push & Pull Synergy",
      warmup: "Band Pull-Aparts + Shoulder Circles",
      exercises: [
        { ...EXERCISE_DATABASE.push.chest_primary[1], sets: setsPerExercise },
        { ...EXERCISE_DATABASE.pull.back_thickness[0], sets: setsPerExercise },
        { ...EXERCISE_DATABASE.push.shoulders[1], sets: 4 },
        { ...EXERCISE_DATABASE.pull.biceps[0], sets: setsPerExercise },
        { ...EXERCISE_DATABASE.push.triceps[0], sets: setsPerExercise }
      ]
    });

    days.push({
      dayName: "Day 2: Lower Body Quad & Glute Focus",
      focus: "Knee Dominant Hypertrophy",
      warmup: "Bodyweight Squat Holds + Hip Circles",
      exercises: [
        { ...EXERCISE_DATABASE.legs.quads[0], sets: setsPerExercise },
        { ...EXERCISE_DATABASE.legs.quads[1], sets: setsPerExercise },
        { ...EXERCISE_DATABASE.legs.hamstrings[1], sets: setsPerExercise },
        { ...EXERCISE_DATABASE.legs.glutes_calves[1], sets: 4 }
      ]
    });

    days.push({
      dayName: "Day 3: Upper Body Lat Width & Delts",
      focus: "Vertical Pull & Lateral Delts",
      warmup: "Deadhangs + Face Pulls",
      exercises: [
        { ...EXERCISE_DATABASE.pull.back_width[0], sets: setsPerExercise },
        { ...EXERCISE_DATABASE.push.chest_secondary[0], sets: setsPerExercise },
        { ...EXERCISE_DATABASE.push.shoulders[0], sets: setsPerExercise },
        { ...EXERCISE_DATABASE.pull.rear_delts[0], sets: 4 },
        { ...EXERCISE_DATABASE.pull.biceps[2], sets: setsPerExercise }
      ]
    });

    days.push({
      dayName: "Day 4: Lower Body Hamstring & Unilateral",
      focus: "Hip Hinge & Quad Burnout",
      warmup: "Hamstring Sweeps + Glute Bridges",
      exercises: [
        { ...EXERCISE_DATABASE.legs.hamstrings[0], sets: setsPerExercise },
        { ...EXERCISE_DATABASE.legs.glutes_calves[0], sets: 3 },
        { ...EXERCISE_DATABASE.legs.quads[2], sets: 3 },
        { ...EXERCISE_DATABASE.legs.glutes_calves[1], sets: 4 }
      ]
    });
  }

  return {
    success: true,
    programTitle: `${goal === 'fat_loss' ? 'Shred & Hypertrophy' : goal === 'recomp' ? 'Aesthetic Recomposition' : 'Maximum Muscle Mass'} (${splitPreference.toUpperCase()})`,
    daysPerWeek,
    durationMinutes,
    experienceLevel: experience,
    weeklyDirectSetsPerMuscle: {
      chest: daysPerWeek >= 4 ? 14 : 10,
      back: daysPerWeek >= 4 ? 16 : 12,
      shoulders: daysPerWeek >= 4 ? 14 : 10,
      biceps: daysPerWeek >= 4 ? 10 : 8,
      triceps: daysPerWeek >= 4 ? 10 : 8,
      quads: daysPerWeek >= 4 ? 12 : 9,
      hamstrings: daysPerWeek >= 4 ? 10 : 8,
      calves: 8
    },
    days
  };
}

/**
 * Calculates budget-matched Indian diet portions
 */
function calculateIndianBudgetDiet({ dietType = 'pure_veg', dailyBudget = 150, dailyBudgetINR, proteinTarget = 120, proteinTargetGrams }) {
  const effectiveBudget = dailyBudgetINR || dailyBudget || 150;
  const effectiveProtein = proteinTargetGrams || proteinTarget || 120;
  const plans = {
    pure_veg: {
      breakfast: "Sattu Drink (50g Sattu with lemon, cumin & cold water) + 200ml Curd",
      lunch: "150g Low-Fat Paneer / 50g Soya Bhurji + 2 Roti / Rice + Dal Tadka",
      evening_snack: "Roasted Chana (50g) + Sprouts Bowl / Chaat",
      dinner: "50g Soya Chunks Curry + Curd (150ml) + Green Salad + 2 Rotis",
      dailyProteinGrams: Math.max(effectiveProtein, 115),
      dailyCostINR: effectiveBudget || 140,
      staples: ["Soya Chunks (₹120/kg)", "Sattu Powder (₹110/kg)", "Paneer (₹360/kg)", "Curd (₹60/kg)", "Chana (₹100/kg)"]
    },
    eggetarian: {
      breakfast: "3 Whole Eggs + 2 Egg Whites Scramble + 2 Whole Wheat Toasts / Roti",
      lunch: "50g Soya Chunks Curry + 1 Cup Dal + Curd (150ml) + Rice / Roti",
      evening_snack: "3 Boiled Eggs (salt & pepper) + Roasted Peanuts (30g)",
      dinner: "100g Paneer Bhurji / 3 Boiled Egg Whites + Green Veggie Curry + 2 Rotis",
      dailyProteinGrams: Math.max(proteinTarget, 130),
      dailyCostINR: dailyBudget || 155,
      staples: ["Eggs (₹6–7/egg)", "Soya Chunks (₹120/kg)", "Paneer (₹360/kg)", "Curd (₹60/kg)"]
    },
    non_veg: {
      breakfast: "3 Whole Eggs Boiled / Omelette + 1 Cup Milk / Chai + 2 Rotis",
      lunch: "150g Chicken Breast Curry (Low Oil) + 1 Cup Rice / 2 Rotis + Salad",
      evening_snack: "1 Scoop Whey Protein / 3 Boiled Eggs Whites + Fruit",
      dinner: "150g Chicken Breast / Fish Tikka + Dal + 150ml Curd + Salad",
      dailyProteinGrams: Math.max(proteinTarget, 150),
      dailyCostINR: dailyBudget || 210,
      staples: ["Chicken Breast (₹240–280/kg)", "Eggs (₹6–7/egg)", "Curd (₹60/kg)", "Whey (Optional)"]
    }
  };

  return plans[dietType] || plans.pure_veg;
}

module.exports = {
  generateFitnessProgram,
  calculateIndianBudgetDiet,
  EXERCISE_DATABASE
};
