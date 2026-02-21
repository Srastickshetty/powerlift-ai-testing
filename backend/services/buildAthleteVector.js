function buildAthleteVector(athlete) {
  if (!athlete) throw new Error("Athlete missing");

  return {
    volume_tolerance:
      athlete.experience_level === "advanced" ? "high" :
      athlete.experience_level === "beginner" ? "low" : "medium",

    intensity_tolerance:
      athlete.goal === "strength" ? "high" :
      athlete.goal === "rehab" ? "low" : "medium",

    fatigue_rate: athlete.fatigue_rate ?? 0.5,

    risk_level:
      athlete.injury_history ? "high" : "medium",

    days_available: athlete.days_available ?? 3
  };
}

module.exports = { buildAthleteVector };
