export function getDefaultSession(track) {
  return track === "pl" ? {
    id: "session-today",
    name: "Squat Heavy & Volume Bench",
    duration: "~70 min",
    exerciseCount: 5,
    topSet: "140 kg × 3 @ RPE 8",
    exercises: [
      { name: "Competition Squat", sets: "4 sets · Top 140kg, then 3×5 @ 120kg" },
      { name: "Competition Pause Bench", sets: "4 sets · 3×6 @ 95kg" },
      { name: "Bulgarian Split Squats", sets: "3 sets · 10 reps @ 24kg DBs" },
      { name: "Romanian Deadlift", sets: "3 sets · 8 reps @ 110kg" }
    ]
  } : {
    id: "session-today",
    name: "Upper Body Hypertrophy (Chest & Back)",
    duration: "~65 min",
    exerciseCount: 6,
    topSet: "Incline DB Press 34 kg × 10 · 2 RIR",
    exercises: [
      { name: "Incline Dumbbell Press", sets: "4 sets · 8-10 reps @ 34kg" },
      { name: "Chest-Supported Row", sets: "4 sets · 10-12 reps @ 45kg" },
      { name: "Cable Crossover", sets: "3 sets · 12-15 reps @ 15kg" },
      { name: "Lat Pulldown (Neutral)", sets: "3 sets · 10-12 reps @ 60kg" }
    ]
  };
}
