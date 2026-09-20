const library = require("./accessoryLibrary");
const RULES = require("./accessoryRules");

/**
 * Enhanced Accessory Selection Engine
 * Creates a structured 3-tier accessory protocol for each training session:
 * Tier 1: Primary Compound Builder / Weak Point Variation
 * Tier 2: Muscular Hypertrophy & Antagonist Balance (Rows, Hamstrings, Triceps)
 * Tier 3: Core & Trunk Prehab Stability
 */
function selectAccessories({
  mainLift = "squat",
  weakLift,
  fatigueRate = 0.2,
  phase = "normal",
  dayNumber = 1
}) {
  const normalizedMain = (mainLift || "squat").toLowerCase();
  const normalizedWeak = (weakLift || "").toLowerCase();

  let maxItems = phase === "deload" ? 2 : 4;
  let fatigueBudget = phase === "deload" ? RULES.DELOAD_FATIGUE_CAP : (RULES.MAX_TOTAL_FATIGUE || 0.85);

  const selected = [];
  let usedFatigue = 0;
  const usedCategories = new Set();

  // Filter matching accessories for this day's movement patterns
  const candidates = library.filter((acc) => {
    const targets = acc.targets.map(t => t.toLowerCase());
    return targets.includes(normalizedMain) || (normalizedWeak && targets.includes(normalizedWeak));
  });

  // Shuffle slightly by dayNumber for realistic programming variety across weeks
  const prioritized = [...candidates].sort((a, b) => {
    // Prioritize weak point matches first if defined
    if (normalizedWeak && a.weakPoint === normalizedWeak) return -1;
    if (normalizedWeak && b.weakPoint === normalizedWeak) return 1;
    return 0;
  });

  // 1. Pick 1 Compound / Unilateral Builder
  for (const acc of prioritized) {
    if (["compound_variation", "hypertrophy_unilateral", "hypertrophy_compound"].includes(acc.category)) {
      if (!usedCategories.has(acc.category) && usedFatigue + acc.fatigueCost <= fatigueBudget) {
        selected.push({
          exercise: acc.name,
          category: "Primary Builder",
          sets: acc.sets,
          reps: acc.reps,
          rpe: acc.rpe,
          cue: acc.cue
        });
        usedFatigue += acc.fatigueCost;
        usedCategories.add(acc.category);
        break;
      }
    }
  }

  // 2. Pick 1-2 Hypertrophy / Antagonist Isolations
  for (const acc of prioritized) {
    if (["isolation_hypertrophy", "isolation_prehab", "hypertrophy_compound"].includes(acc.category)) {
      if (!selected.some(s => s.exercise === acc.name) && usedFatigue + acc.fatigueCost <= fatigueBudget) {
        selected.push({
          exercise: acc.name,
          category: "Hypertrophy & Armor",
          sets: acc.sets,
          reps: acc.reps,
          rpe: acc.rpe,
          cue: acc.cue
        });
        usedFatigue += acc.fatigueCost;
        if (selected.length >= maxItems - 1) break;
      }
    }
  }

  // 3. Always Pick 1 Core / Trunk Prehab movement
  const coreOptions = library.filter(a => a.category.startsWith("core"));
  const chosenCore = coreOptions[(dayNumber - 1) % coreOptions.length] || coreOptions[0];
  if (chosenCore && !selected.some(s => s.exercise === chosenCore.name) && selected.length < maxItems) {
    selected.push({
      exercise: chosenCore.name,
      category: "Core & Prehab",
      sets: chosenCore.sets,
      reps: chosenCore.reps,
      rpe: chosenCore.rpe,
      cue: chosenCore.cue
    });
  }

  return selected;
}

module.exports = { selectAccessories };
