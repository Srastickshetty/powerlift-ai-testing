module.exports = {
  blueprint_id: "high_freq_bench",
  intent: "Increase bench strength via frequency and volume",

  days_per_week: [4, 5],

  frequency: {
    squat: "medium",
    bench: "high",
    deadlift: "low"
  },

  volume_profile: {
    total: "high",
    trend: "decreasing"
  },

  intensity_profile: {
    method: "hybrid",
    aggression: "moderate"
  },

  progression_style: "block",

  fatigue_tolerance: "high",

  peak_logic: {
    has_peak: true,
    peak_length_weeks: 2
  },

  accessory_bias: {
    squat: ["upper_back"],
    bench: ["triceps", "upper_chest"],
    deadlift: ["lats"]
  },

  suitable_for: {
    experience: ["intermediate", "advanced"],
    recovery: ["medium", "high"],
    injury_safe: false
  }
};
