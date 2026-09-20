/**
 * accessoryLibrary.js - Comprehensive Powerlifting Accessory & Variation Database
 * Realistic exercise library as prescribed by competitive powerlifting coaches
 */

module.exports = [
  // ==========================================
  // SQUAT BUILDERS & VARIATIONS
  // ==========================================
  {
    name: "2-Sec Paused Squat",
    category: "compound_variation",
    targets: ["squat", "Squat"],
    weakPoint: "bottom",
    fatigueCost: 0.25,
    sets: 3,
    reps: "4-5",
    rpe: 7.5,
    cue: "Full stop in hole without losing back tightness. Explode upward on drive."
  },
  {
    name: "Pin Squat (At Parallel)",
    category: "compound_variation",
    targets: ["squat", "Squat"],
    weakPoint: "midrange",
    fatigueCost: 0.25,
    sets: 3,
    reps: "3-4",
    rpe: 8,
    cue: "Rest bar on pins for 1 full second. Drive through midfoot without bouncing."
  },
  {
    name: "Bulgarian Split Squats (Dumbbells)",
    category: "hypertrophy_unilateral",
    targets: ["squat", "Squat"],
    weakPoint: "quads",
    fatigueCost: 0.20,
    sets: 3,
    reps: "8-10",
    rpe: 8,
    cue: "Elevate rear foot. Keep chest proud and load lead quad with controlled knee flexion."
  },
  {
    name: "Paused Leg Press (Wide Stance)",
    category: "hypertrophy_compound",
    targets: ["squat", "Squat"],
    weakPoint: "quads",
    fatigueCost: 0.18,
    sets: 3,
    reps: "10-12",
    rpe: 7.5,
    cue: "1-second dead stop at maximum depth. Build quad thickness without spinal compression."
  },
  {
    name: "Hack Squat / Front Squat",
    category: "hypertrophy_compound",
    targets: ["squat", "Squat"],
    weakPoint: "quads",
    fatigueCost: 0.22,
    sets: 3,
    reps: "8-10",
    rpe: 8,
    cue: "Emphasize upright torso and full knee flexion over toes."
  },
  {
    name: "Hip Adductor Machine",
    category: "isolation_prehab",
    targets: ["squat", "Squat"],
    weakPoint: "adductors",
    fatigueCost: 0.10,
    sets: 3,
    reps: "12-15",
    rpe: 8,
    cue: "Controlled eccentric. Critical for groin health and wide-stance squat stability."
  },
  {
    name: "Standing Calf Raises",
    category: "isolation_prehab",
    targets: ["squat", "Squat"],
    weakPoint: "ankle_stability",
    fatigueCost: 0.08,
    sets: 3,
    reps: "12-15",
    rpe: 8,
    cue: "Full deep stretch at bottom to optimize ankle dorsiflexion mobility."
  },

  // ==========================================
  // BENCH BUILDERS & VARIATIONS
  // ==========================================
  {
    name: "Spoto Press (1-Inch Off Chest)",
    category: "compound_variation",
    targets: ["bench", "Bench"],
    weakPoint: "off_chest",
    fatigueCost: 0.22,
    sets: 3,
    reps: "5",
    rpe: 7.5,
    cue: "Hover bar motionless 1 inch above shirt. Reverse with violent lat-driven leg drive."
  },
  {
    name: "Close Grip Bench Press",
    category: "compound_variation",
    targets: ["bench", "Bench"],
    weakPoint: "triceps",
    fatigueCost: 0.22,
    sets: 3,
    reps: "6-8",
    rpe: 8,
    cue: "Hands shoulder-width apart. Keep elbows tucked at 45 degrees for tricep lockout power."
  },
  {
    name: "Larsen Press (Feet-Up Bench)",
    category: "compound_variation",
    targets: ["bench", "Bench"],
    weakPoint: "arch_stability",
    fatigueCost: 0.20,
    sets: 3,
    reps: "6-8",
    rpe: 7.5,
    cue: "Legs out straight, heels off floor. Eliminates leg drive to demand supreme upper-body tightness."
  },
  {
    name: "3-Second Competition Paused Bench",
    category: "compound_variation",
    targets: ["bench", "Bench"],
    weakPoint: "pause_command",
    fatigueCost: 0.24,
    sets: 3,
    reps: "3-4",
    rpe: 8,
    cue: "Hold motionless on chest through an exaggerated 3-count before driving."
  },
  {
    name: "Incline Dumbbell Press",
    category: "hypertrophy_compound",
    targets: ["bench", "Bench"],
    weakPoint: "upper_pecs",
    fatigueCost: 0.18,
    sets: 3,
    reps: "8-10",
    rpe: 8,
    cue: "30-degree incline. Flare elbows comfortably and stretch chest at bottom."
  },
  {
    name: "JM Press",
    category: "isolation_hypertrophy",
    targets: ["bench", "Bench"],
    weakPoint: "triceps",
    fatigueCost: 0.16,
    sets: 3,
    reps: "8-10",
    rpe: 8,
    cue: "Hybrid close grip bench and skullcrusher. Direct bar toward throat/chin for maximal tricep overload."
  },
  {
    name: "Overhead Rope Cable Tricep Extension",
    category: "isolation_hypertrophy",
    targets: ["bench", "Bench"],
    weakPoint: "triceps",
    fatigueCost: 0.12,
    sets: 3,
    reps: "12-15",
    rpe: 8.5,
    cue: "Spread ropes wide at top of lockout. Stretches long head of triceps."
  },
  {
    name: "Barbell Seal Row / Chest Supported Row",
    category: "hypertrophy_compound",
    targets: ["bench", "deadlift", "Bench", "Deadlift"],
    weakPoint: "upper_back",
    fatigueCost: 0.18,
    sets: 4,
    reps: "8-10",
    rpe: 8,
    cue: "Pull elbows toward hips without using lower back momentum. Builds bench shelf & deadlift posture."
  },
  {
    name: "Lat Pulldowns (Neutral Grip)",
    category: "hypertrophy_compound",
    targets: ["bench", "deadlift", "Bench", "Deadlift"],
    weakPoint: "lats",
    fatigueCost: 0.15,
    sets: 3,
    reps: "10-12",
    rpe: 8,
    cue: "Drive elbows down to engage lats. Essential for locking the bar into your body in deadlift."
  },
  {
    name: "Face Pulls with External Rotation",
    category: "isolation_prehab",
    targets: ["bench", "Bench"],
    weakPoint: "rear_delts",
    fatigueCost: 0.10,
    sets: 3,
    reps: "15-20",
    rpe: 8,
    cue: "Pull rope to forehead and rotate thumbs back. Maintains healthy rotator cuffs under heavy benching."
  },
  {
    name: "Cable Lateral Raises",
    category: "isolation_hypertrophy",
    targets: ["bench", "Bench"],
    weakPoint: "deltoids",
    fatigueCost: 0.10,
    sets: 3,
    reps: "12-15",
    rpe: 8.5,
    cue: "Constant tension across lateral head. Builds shoulder girdle thickness."
  },

  // ==========================================
  // DEADLIFT BUILDERS & VARIATIONS
  // ==========================================
  {
    name: "2-Sec Paused Deadlift (1-Inch Off Floor)",
    category: "compound_variation",
    targets: ["deadlift", "Deadlift"],
    weakPoint: "off_floor",
    fatigueCost: 0.28,
    sets: 3,
    reps: "3",
    rpe: 7.5,
    cue: "Break floor and freeze for 2 count below knees. Reinforces bracing and wedge position."
  },
  {
    name: "Deficit Deadlift (1.5-Inch Deficit)",
    category: "compound_variation",
    targets: ["deadlift", "Deadlift"],
    weakPoint: "off_floor",
    fatigueCost: 0.26,
    sets: 3,
    reps: "4",
    rpe: 8,
    cue: "Stand on 1.5-inch plate. Forces deeper starting hip angle and violent quad push."
  },
  {
    name: "Romanian Deadlift (RDL)",
    category: "hypertrophy_compound",
    targets: ["deadlift", "squat", "Deadlift", "Squat"],
    weakPoint: "posterior_chain",
    fatigueCost: 0.24,
    sets: 3,
    reps: "8",
    rpe: 8,
    cue: "Push hips back toward wall while maintaining neutral spine. Massive hamstring and glute builder."
  },
  {
    name: "Stiff-Legged Deadlift (From Floor)",
    category: "compound_variation",
    targets: ["deadlift", "Deadlift"],
    weakPoint: "hamstrings",
    fatigueCost: 0.25,
    sets: 3,
    reps: "6",
    rpe: 7.5,
    cue: "High hips, slight knee bend. Pure posterior chain recruitment."
  },
  {
    name: "Block Pull (Below Knee)",
    category: "compound_variation",
    targets: ["deadlift", "Deadlift"],
    weakPoint: "lockout",
    fatigueCost: 0.25,
    sets: 3,
    reps: "3-4",
    rpe: 8.5,
    cue: "Bar elevated on 3-inch blocks. Overload glute extension and grip tolerance for contest lockouts."
  },
  {
    name: "Lying or Seated Hamstring Curl",
    category: "isolation_hypertrophy",
    targets: ["deadlift", "squat", "Deadlift", "Squat"],
    weakPoint: "hamstrings",
    fatigueCost: 0.12,
    sets: 3,
    reps: "10-12",
    rpe: 8.5,
    cue: "Slow 3-second negative eccentric. Knee flexion strength protects patellar tendon and ACL."
  },
  {
    name: "Heavy Barbell / Dumbbell Shrugs",
    category: "hypertrophy_compound",
    targets: ["deadlift", "Deadlift"],
    weakPoint: "traps_grip",
    fatigueCost: 0.14,
    sets: 3,
    reps: "10-12",
    rpe: 8,
    cue: "2-second squeeze at top. Builds massive trap shelf to prevent shoulder roll under 250kg+ deadlifts."
  },

  // ==========================================
  // TRUNK & CORE STABILITY (PREHAB)
  // ==========================================
  {
    name: "Ab Wheel Rollouts",
    category: "core_stability",
    targets: ["squat", "deadlift", "bench", "Squat", "Deadlift", "Bench"],
    weakPoint: "core",
    fatigueCost: 0.10,
    sets: 3,
    reps: "10-12",
    rpe: 8,
    cue: "Maintain posterior pelvic tilt. Anti-extension strength for bracing under heavy barbell axial load."
  },
  {
    name: "Hanging Leg / Knee Raises",
    category: "core_stability",
    targets: ["squat", "deadlift", "Squat", "Deadlift"],
    weakPoint: "core",
    fatigueCost: 0.08,
    sets: 3,
    reps: "12-15",
    rpe: 8,
    cue: "Curl pelvis upwards. Decompresses lumbar spine while building lower abdominal strength."
  },
  {
    name: "Copenhagen Side Plank",
    category: "core_prehab",
    targets: ["squat", "Squat"],
    weakPoint: "adductors_core",
    fatigueCost: 0.08,
    sets: 3,
    reps: "30s each",
    rpe: 8,
    cue: "Top leg resting on bench, bottom leg elevated. Bulletproofs adductors against groin strains."
  },
  {
    name: "McGill Big 3 (Bird-Dog + Side Plank + Curl-Up)",
    category: "core_prehab",
    targets: ["squat", "deadlift", "Squat", "Deadlift"],
    weakPoint: "spine_stiffness",
    fatigueCost: 0.06,
    sets: 2,
    reps: "6 reps each",
    rpe: 6,
    cue: "Maximum isometric stiffness without spinal flexion. The gold standard for powerlifter spine health."
  }
];
