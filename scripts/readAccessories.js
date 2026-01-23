const fs = require("fs");
const path = require("path");

const accessories = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/accessories.json"), "utf-8")
);

console.log("\nACCESSORY KNOWLEDGE BASE\n");

accessories.forEach((acc) => {
  console.log(acc.name);
  console.log("Supports:", acc.supports_lift.join(", "));
  console.log("Fatigue:", acc.fatigue_cost);
  console.log("-----------------------------");
});
