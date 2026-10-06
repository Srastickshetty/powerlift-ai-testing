export const DEFAULT_EXERCISES = [
  {
    id: "ex_1",
    name: "Competition Squat",
    muscle: "Quads / Glutes",
    lastTime: "135 kg × 5 @ 7.0",
    target: "140 kg × 5 @ 7.5",
    sets: [
      { type: "Warm-up", weight: 60, reps: 5, rating: null, done: true },
      { type: "Warm-up", weight: 100, reps: 5, rating: null, done: true },
      { type: "Top Set", weight: 140, reps: 5, rating: 8, target: "140 × 5 @ 7.5", done: false },
      { type: "Back-off", weight: 122.5, reps: 5, rating: 7, target: "122.5 × 5 @ 7", done: false },
      { type: "Back-off", weight: 122.5, reps: 5, rating: 7, target: "122.5 × 5 @ 7", done: false },
    ]
  },
  {
    id: "ex_2",
    name: "Competition Pause Bench",
    muscle: "Chest / Triceps",
    lastTime: "92.5 kg × 6 @ 7.0",
    target: "95 kg × 6 @ 7.5",
    sets: [
      { type: "Warm-up", weight: 60, reps: 8, rating: null, done: false },
      { type: "Working", weight: 95, reps: 6, rating: 7, target: "95 × 6 @ 7.5", done: false },
      { type: "Working", weight: 95, reps: 6, rating: 7, target: "95 × 6 @ 7.5", done: false },
      { type: "Working", weight: 95, reps: 6, rating: 8, target: "95 × 6 @ 8", done: false },
    ]
  },
  {
    id: "ex_3",
    name: "Romanian Deadlift",
    muscle: "Hamstrings / Lower Back",
    lastTime: "105 kg × 8 @ 7.0",
    target: "110 kg × 8 @ 7.5",
    sets: [
      { type: "Working", weight: 110, reps: 8, rating: 7, target: "110 × 8", done: false },
      { type: "Working", weight: 110, reps: 8, rating: 7, target: "110 × 8", done: false },
      { type: "Working", weight: 110, reps: 8, rating: 8, target: "110 × 8", done: false },
    ]
  }
];

export function generateClientUuid() {
  return `set_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
