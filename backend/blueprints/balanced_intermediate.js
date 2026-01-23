module.exports = {
  blueprint_id: "balanced_intermediate_volume",
  intent: "Balanced development of all three lifts",

  days_per_week: [4],

  frequency: {
    squat: "medium",
    bench: "medium",
    deadlift: "medium"
  },

  volume_profile: {
    total: "moderate",
    trend: "increasing"
  },

  intensity_profile: {
    method: "percentage",
    aggression: "moderate"
  },

  progression_style: "undulating",

  fatigue_tolerance: "medium",

  peak_logic: {
    has_peak: false,
    peak_length_weeks: 0
  },

  accessory_bias: {
    squat: ["quads", "upper_back"],
    bench: ["triceps"],
    deadlift: ["hamstrings"]
  },

  suitable_for: {
    experience: ["intermediate"],
    recovery: ["medium"],
    injury_safe: true
  }
};
