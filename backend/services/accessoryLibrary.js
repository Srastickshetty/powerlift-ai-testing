module.exports = [
  {
    name: "Close Grip Bench",
    targets: ["bench"],
    weakPoint: "triceps",
    fatigueCost: 0.25
  },
  {
    name: "Paused Squat",
    targets: ["squat"],
    weakPoint: "bottom",
    fatigueCost: 0.35
  },
  {
    name: "Romanian Deadlift",
    targets: ["deadlift"],
    weakPoint: "posterior_chain",
    fatigueCost: 0.4
  },
  {
    name: "Chest Supported Row",
    targets: ["bench", "deadlift"],
    weakPoint: "upper_back",
    fatigueCost: 0.2
  },
  {
    name: "Hamstring Curl",
    targets: ["squat", "deadlift"],
    weakPoint: "hamstrings",
    fatigueCost: 0.15
  }
];
