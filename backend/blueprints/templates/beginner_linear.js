module.exports = {
  blueprint_id: "beginner_linear_strength",
  intent: "Build base strength with simple linear progression",

  days_per_week: [3, 4],

  frequency: {
    squat: "medium",
    bench: "medium",
    deadlift: "low"
  },

  volume_profile: {
    total: "moderate",
    trend: "flat"
  },

  intensity_profile: {
    method: "percentage",
    aggression: "low"
  },

  progression_style: "linear",

  fatigue_tolerance: "low",

  peak_logic: {
    has_peak: false,
    peak_length_weeks: 0
  },

  accessory_bias: {
    squat: ["quads"],
    bench: ["triceps"],
    deadlift: ["hamstrings"]
  },

  suitable_for: {
    experience: ["beginner"],
    recovery: ["low", "medium"],
    injury_safe: true
  }
};
