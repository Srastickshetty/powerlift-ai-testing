export const coachDashboardData = [
  {
    athlete_id: "athlete_001",
    name: "Shetty",
    status: "needs_intervention",
    fatigue_rate: 0.5,
    miss_rate: 0.5,
    last_session: "2026-02-12",

    lifts: {
      squat: +1.8,
      bench: -0.5,
      deadlift: +2.2,
    },

    analytics: {
      e1RMTrend: [
        { week: 1, squat: 170, bench: 115, deadlift: 200 },
        { week: 2, squat: 172, bench: 116, deadlift: 203 },
        { week: 3, squat: 174, bench: 116, deadlift: 205 },
        { week: 4, squat: 173, bench: 115, deadlift: 204 },
      ],
      fatigueTrend: [
        { week: 1, fatigue: 0.2 },
        { week: 2, fatigue: 0.35 },
        { week: 3, fatigue: 0.5 },
        { week: 4, fatigue: 0.6 },
      ],
    },
  },

  {
    athlete_id: "athlete_002",
    name: "Arjun",
    status: "on_track",
    fatigue_rate: 0.1,
    miss_rate: 0.0,
    last_session: "2026-02-11",

    lifts: {
      squat: +3.2,
      bench: +2.1,
      deadlift: +4.0,
    },

    analytics: {
      e1RMTrend: [
        { week: 1, squat: 160, bench: 105, deadlift: 190 },
        { week: 2, squat: 163, bench: 107, deadlift: 195 },
        { week: 3, squat: 166, bench: 109, deadlift: 198 },
        { week: 4, squat: 169, bench: 110, deadlift: 202 },
      ],
      fatigueTrend: [
        { week: 1, fatigue: 0.1 },
        { week: 2, fatigue: 0.15 },
        { week: 3, fatigue: 0.2 },
        { week: 4, fatigue: 0.25 },
      ],
    },
  },
];
