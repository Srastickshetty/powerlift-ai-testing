/**
 * weeklyEvolutionEngine.js - Stable Block Periodization & Acute Intervention Engine
 * 
 * Implements Coach Deva Khule (@devapowerlifts / Grind Karo) Periodization Principle:
 * Programs do NOT scramble or rewrite exercises weekly. Exercises remain STABLE across
 * the 4-week mesocycle to consolidate motor learning, technical consistency, and progressive overload.
 * 
 * Micro-cycle adjustments occur strictly along planned wave loading:
 *  - Week 1: Accumulation & Technical Baseline (RPE 7.5 - 8.0)
 *  - Week 2: Progressive Overload Wave (+2.5kg to +5kg compounds, +1.25kg accessories, RPE 8.0 - 8.5)
 *  - Week 3: Peak Intensity & Neural Realization (RPE 8.5 - 9.0)
 *  - Week 4: Active Deload & Joint Resensitization (Volume cut 40%, 75-80% load, RPE 6.0)
 * 
 * Surgical adjustments occur ONLY when an ACUTE INTERVENTION FLAG is raised:
 *  1. Joint pain / tweak reported -> Surgical exercise substitution (e.g. Bulldog Grip or neutral grip swap).
 *  2. Redline fatigue (RPE >= 9.2 or fatigue > 75%) -> Trim 1 accessory set; hold compound weights steady.
 *  3. Rapid scale weight drop (>0.6kg/wk) -> Fueling & carbohydrate re-feed protocol.
 */

const { getAthleteMemory, recordAthleteFeedback, getCoachDevaPrinciples } = require("./aiProgramBrain");

/**
 * Evolve or Advance training week within the stable mesocycle
 */
function evolveTrainingWeek({
  athleteId = "athlete_demo",
  currentWeekNumber = 1,
  currentProgram = null,
  weeklyCheckIn = {}
}) {
  const {
    avgRpe = 8.0,
    tonnageAchievedPct = 90,
    missedReps = 0,
    fatigueScore = 30, // 0-100
    scaleWeightShiftKg = 0, // e.g. -0.4 or +0.2
    jointTweaks = [],
    lifterNotes = ""
  } = weeklyCheckIn;

  const memory = getAthleteMemory(athleteId);
  const adaptations = [];
  let overloadNudgeKg = 0;
  let statusBadge = "PLANNED MESOCYCLE WAVE";
  const nextWeekNumber = currentWeekNumber + 1;

  // 1. Evaluate Performance Against Planned Wave
  const isRedlineFatigue = (avgRpe >= 9.2 || missedReps >= 3 || fatigueScore > 75);
  const isHighVelocity = (avgRpe <= 7.5 && missedReps === 0 && fatigueScore < 45);

  if (nextWeekNumber === 2) {
    overloadNudgeKg = 2.5;
    statusBadge = "PROGRESSIVE OVERLOAD WAVE (+2.5kg - +5kg)";
    adaptations.push("Week 2 Planned Wave: Progressive overload engaged (+2.5kg to +5kg on compounds). Exercise selection remains 100% stable to consolidate motor unit recruitment.");
  } else if (nextWeekNumber === 3) {
    overloadNudgeKg = isHighVelocity ? 5.0 : 2.5;
    statusBadge = "PEAK INTENSITY & NEURAL REALIZATION";
    adaptations.push("Week 3 Planned Peak: High-intensity neural work. Bar velocity must remain crisp; commit to every top set with Coach Deva's full brace.");
  } else if (nextWeekNumber === 4) {
    overloadNudgeKg = -15; // Represents deload reduction
    statusBadge = "ACTIVE DELOAD & JOINT RESENSITIZATION";
    adaptations.push("Week 4 Scheduled Deload: Volume trimmed by 40%, intensity capped at RPE 6. Connective tissue resensitization and CNS supercompensation.");
  } else {
    // Mesocycle completed or continuation
    overloadNudgeKg = 2.5;
    statusBadge = "BLOCK TRANSITION & OVERLOAD";
    adaptations.push("Mesocycle completed. Advancing baseline 1RMs and initiating next training wave.");
  }

  // 2. ACUTE FLAG EVALUATION: Joint Tweaks & Prehab
  const activeJointIssues = [...(memory.jointTweaks || []), ...jointTweaks].filter(Boolean);
  let surgicalSubstitutionsApplied = [];

  if (activeJointIssues.length > 0) {
    adaptations.push(`⚠️ Acute joint awareness flagged: ${activeJointIssues.join(", ")}. Executing targeted biomechanical adjustments without altering the overall block structure.`);
  }

  // 3. ACUTE FLAG EVALUATION: Scale Weight & Metabolic Nutrition
  let nutritionGuidance = "Maintain current caloric baseline (1.8-2.2g/kg protein, complex carbs pre-workout).";
  if (scaleWeightShiftKg < -0.6) {
    nutritionGuidance = "Weight dropped faster than target (-0.6kg/wk). Adding +150-200 kcal (e.g. 40g oats + 1 banana or 1 scoop sattu) to safeguard muscle glycogen and prevent catabolism.";
    adaptations.push(nutritionGuidance);
  } else if (scaleWeightShiftKg > 0.7) {
    nutritionGuidance = "Scale weight jumped rapidly (+0.7kg/wk). Slightly reduce added cooking oils/fats by 150 kcal to ensure lean mass accretion over adipose tissue.";
    adaptations.push(nutritionGuidance);
  }

  // 4. Determine Target Week's Days
  let evolvedDays = [];

  // Check if currentProgram has pre-computed mesocycle weeks
  const plannedWeekObj = currentProgram?.weeks?.find(w => w.weekNumber === nextWeekNumber);

  if (plannedWeekObj && plannedWeekObj.days && plannedWeekObj.days.length > 0) {
    // Mesocycle week already exists! Use the exact planned days to preserve program stability.
    evolvedDays = JSON.parse(JSON.stringify(plannedWeekObj.days));
  } else if (currentProgram && currentProgram.days && currentProgram.days.length > 0) {
    // Generate next week by advancing the base program days
    evolvedDays = currentProgram.days.map((day, dIdx) => {
      const updatedExercises = (day.exercises || []).map((ex) => {
        let load = Number(ex.loadKg) || 0;
        let sets = Number(ex.sets) || 3;
        let reps = ex.reps;
        let intensityTarget = ex.intensityTarget;

        if (nextWeekNumber === 4) {
          // Deload
          load = Math.max(20, Math.round((load * 0.82) / 2.5) * 2.5);
          sets = Math.max(2, sets - 1);
          intensityTarget = "RPE 6 (Deload)";
        } else if (nextWeekNumber === 2) {
          // Overload
          const multiplier = ex.name.toLowerCase().includes("deadlift") || ex.name.toLowerCase().includes("squat") ? 2 : 1;
          load = Math.round((load + (2.5 * multiplier)) / 2.5) * 2.5;
          intensityTarget = "RPE 8.0 - 8.5";
        } else if (nextWeekNumber === 3) {
          // Peak
          const multiplier = ex.name.toLowerCase().includes("deadlift") || ex.name.toLowerCase().includes("squat") ? 2 : 1;
          load = Math.round((load + (2.5 * multiplier)) / 2.5) * 2.5;
          intensityTarget = "RPE 8.5 - 9.0";
        }

        return {
          ...ex,
          sets,
          loadKg: load,
          intensityTarget
        };
      });

      return {
        ...day,
        dayName: day.dayName 
          ? (day.dayName.includes("Week") ? day.dayName.replace(/Week \d+/, `Week ${nextWeekNumber}`) : `${day.dayName} (Week ${nextWeekNumber})`)
          : `Day ${day.dayNumber || (dIdx + 1)} (Week ${nextWeekNumber})`,
        exercises: updatedExercises
      };
    });
  }

  // 5. Apply Surgical Joint Substitutions to Evolved Days (Acute Only)
  if (activeJointIssues.length > 0 && evolvedDays.length > 0) {
    evolvedDays = evolvedDays.map(day => {
      const modifiedExs = (day.exercises || []).map(ex => {
        const exNameLower = ex.name.toLowerCase();

        // Shoulder impingement -> swap flat barbell bench for neutral grip dumbbell or Spoto press
        if (activeJointIssues.some(j => j.toLowerCase().includes("shoulder"))) {
          if (exNameLower.includes("flat barbell bench") || exNameLower.includes("competition paused bench")) {
            surgicalSubstitutionsApplied.push("Flat Barbell Bench → 30° Incline Dumbbell Bench (Neutral Grip)");
            return {
              ...ex,
              name: "Incline Dumbbell Bench Press (30° Neutral Grip)",
              cue: "Deva Joint Safeguard: Neutral palms face each other, tuck elbows 45° in scapular plane. Completely unloads anterior shoulder capsule."
            };
          }
        }

        // Elbow irritation -> swap skull crushers for cable pushdowns
        if (activeJointIssues.some(j => j.toLowerCase().includes("elbow"))) {
          if (exNameLower.includes("skull crusher") || exNameLower.includes("french press")) {
            surgicalSubstitutionsApplied.push("Skull Crushers → Cable Straight-Bar Tricep Pushdown");
            return {
              ...ex,
              name: "Cable Straight-Bar Tricep Pushdown",
              cue: "Deva Joint Safeguard: Keep elbows pinned to ribs as fixed door hinges. Eliminates tricep tendon shear stress."
            };
          }
        }

        // Lower back erector pump -> swap conventional deadlift for block pull or trap bar
        if (activeJointIssues.some(j => j.toLowerCase().includes("back"))) {
          if (exNameLower.includes("competition deadlift") || exNameLower.includes("conventional deadlift")) {
            surgicalSubstitutionsApplied.push("Conventional Deadlift → 3-Inch Elevated Block Pulls / Trap Bar");
            return {
              ...ex,
              name: "Elevated Block Deadlifts (3-Inch Blocks)",
              cue: "Deva Levers Safeguard: Elevating bar 3 inches cuts lumbar moment arm by 35% while training max leg wedge and lockout glute drive."
            };
          }
        }

        // Wrist strain -> reinforce Bulldog Grip
        if (activeJointIssues.some(j => j.toLowerCase().includes("wrist"))) {
          if (exNameLower.includes("bench")) {
            return {
              ...ex,
              cue: "Coach Deva Mandatory Bulldog Grip: Place bar diagonally across thenar eminence (heel of palm). Stack wrists vertically over radius/ulna to eliminate wrist extension shear."
            };
          }
        }

        return ex;
      });

      return {
        ...day,
        exercises: modifiedExs
      };
    });
  }

  // 6. Handle Redline Fatigue (Trim 1 accessory set without altering main lifts)
  if (isRedlineFatigue && evolvedDays.length > 0) {
    adaptations.push("High systemic fatigue detected (RPE ≥ 9.2 / Fatigue > 75%). Trimming 1 accessory set across sessions to facilitate supercompensation while preserving main SBD compound lifts.");
    evolvedDays = evolvedDays.map(day => ({
      ...day,
      exercises: (day.exercises || []).map((ex, exIdx) => {
        // Keep first compound lift sets intact; trim accessory sets by 1
        if (exIdx > 1 && ex.sets > 2) {
          return { ...ex, sets: ex.sets - 1 };
        }
        return ex;
      })
    }));
  }

  // 7. Synthesize Authoritative Multi-Coach Debrief
  const aiCoachDebrief = `
### 🧠 TITAN-AI Stable Mesocycle Debrief (Week ${currentWeekNumber} ➔ Week ${nextWeekNumber})

**Current Periodization Phase:** \`${statusBadge}\`
- **Volume Tonnage Achieved:** ${tonnageAchievedPct}% of prescribed workload.
- **Top-Set Average RPE:** ${avgRpe} / 10 ${avgRpe <= 7.5 ? '(High velocity - exceptional bar speed)' : avgRpe >= 9.2 ? '(Approaching neural ceiling)' : '(Optimal stimulus zone)'}.
- **CNS Fatigue Index:** ${fatigueScore}% (${fatigueScore > 70 ? 'Elevated systemic fatigue' : 'Readiness optimal'}).
- **Scale Weight Shift:** ${scaleWeightShiftKg >= 0 ? `+${scaleWeightShiftKg}` : scaleWeightShiftKg} kg this week.

**Coach Deva Khule & Multi-Council Directives for Week ${nextWeekNumber}:**
${adaptations.map(a => `• ${a}`).join("\n")}
${surgicalSubstitutionsApplied.length > 0 ? `• **Surgical Joint Adjustments Applied:** ${surgicalSubstitutionsApplied.join("; ")}` : "• **Program Stability Confirmed:** All exercises and split remain locked to maximize neural adaptation and SBD motor consolidation."}

**Coach Technical Cues for Week ${nextWeekNumber}:**
• **Squat:** Keep bar trajectory strictly over midfoot. 360° intra-abdominal cylinder brace into belt.
• **Bench:** Lock in the **Bulldog Grip** (bar across thenar eminence). Retract scapulae and push heels toward head to lock the arch.
• **Deadlift:** Pull the slack out of the bar until collars click audibly. Squeeze oranges in armpits and wedge hips into the bar.

**Nutrition & Recovery Sync:**
${nutritionGuidance}
  `.trim();

  // Record feedback into athlete memory
  if (jointTweaks.length > 0 || avgRpe >= 9.2) {
    recordAthleteFeedback(athleteId, {
      rating: avgRpe >= 9.2 ? "too_hard" : "optimal",
      jointPainArea: jointTweaks[0] || null,
      note: `Week ${currentWeekNumber} Check-In: Avg RPE ${avgRpe}, Fatigue ${fatigueScore}%`
    });
  }

  return {
    success: true,
    athleteId,
    previousWeek: currentWeekNumber,
    evolvedWeek: nextWeekNumber,
    statusBadge,
    overloadNudgeKg,
    adaptations,
    surgicalSubstitutions: surgicalSubstitutionsApplied,
    aiCoachDebrief,
    isProgramStable: surgicalSubstitutionsApplied.length === 0,
    evolvedProgram: {
      ...(currentProgram || {}),
      weekNumber: nextWeekNumber,
      programTitle: `${currentProgram?.programTitle ? currentProgram.programTitle.replace(/Week \d+/, `Week ${nextWeekNumber}`) : `Mesocycle Block — Week ${nextWeekNumber}`}`,
      days: evolvedDays
    }
  };
}

module.exports = {
  evolveTrainingWeek
};
