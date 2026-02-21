module.exports = {
  blueprint_id: "competition_peak_8w",
  intent: "Peak strength for a specific competition date",

  days_per_week: [4, 5],

  frequency: {
    squat: "medium",
    bench: "high",
    deadlift: "medium"
  },

  volume_profile: {
    total: "decreasing",
    trend: "decreasing"
  },

  intensity_profile: {
    method: "rpe",
    aggression: "high"
  },

  progression_style: "block",

  fatigue_tolerance: "high",

  peak_logic: {
    has_peak: true,
    peak_length_weeks: 3
  },

  accessory_bias: {
    squat: ["bracing"],
    bench: ["triceps"],
    deadlift: ["lats"]
  },

  suitable_for: {
    experience: ["intermediate", "advanced"],
    recovery: ["high"],
    injury_safe: false
  }
};
