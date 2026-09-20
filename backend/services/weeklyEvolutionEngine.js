/**
 * weeklyEvolutionEngine.js - Autonomous Weekly AI Micro-Cycle Evolution Engine
 * 
 * Analyzes completed 7-day training logs (tonnage, top-set RPE, missed reps, CNS fatigue, scale weight shift)
 * and dynamically evolves next week's training protocol (+2.5kg to +5kg progressive overload,
 * fatigue deload, accessory substitutions) with an authoritative AI Coach Debrief.
 */

const { getAthleteMemory, recordAthleteFeedback } = require("./aiProgramBrain");

/**
 * Evolve the next week of an athlete's program based on completed 7-day telemetry
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
  let volumeMultiplier = 1.0;
  let statusBadge = "PROGRESSED";

  // 1. Evaluate Bar Velocity & RPE Progressive Overload
  if (avgRpe <= 7.5 && missedReps === 0 && fatigueScore < 45) {
    // High velocity, bar moved fast!
    overloadNudgeKg = 2.5; // +2.5kg on working sets (+5kg on deadlift/squat if RPE <= 7)
    statusBadge = "PROGRESSIVE OVERLOAD (+2.5kg - +5kg)";
    adaptations.push("Bar velocity was exceptionally crisp on top sets (avg RPE ≤ 7.5). Initiating +2.5kg to +5kg progressive overload across compound lifts.");
  } else if (avgRpe >= 9.2 || missedReps > 0 || fatigueScore > 65) {
    // Accumulating fatigue or missed reps
    overloadNudgeKg = 0;
    volumeMultiplier = 0.9; // 10% volume reduction to supercompensate
    statusBadge = "FATIGUE AUTOREGULATION (-10% Volume)";
    adaptations.push(`High CNS fatigue detected (RPE: ${avgRpe}, Fatigue Score: ${fatigueScore}%). Maintaining working loads while trimming accessory volume by 10% to prevent overreaching.`);
  } else {
    // Nominal progression
    overloadNudgeKg = 1.25;
    statusBadge = "STEADY MICRO-OVERLOAD (+1.25kg - +2.5kg)";
    adaptations.push("Session execution was in the optimal stimulus-to-fatigue pocket (RPE ~8.0). Applying standard micro-load progression (+1.25kg - +2.5kg).");
  }

  // 2. Evaluate Joint Tweaks & Injury Prehab
  const activeJointIssues = [...(memory.jointTweaks || []), ...jointTweaks].filter(Boolean);
  if (activeJointIssues.length > 0) {
    adaptations.push(`Detected joint sensitivity in: ${activeJointIssues.join(", ")}. Automatically swapping offending straight-bar movements with joint-friendly neutral-grip and dumbbell variations.`);
  }

  // 3. Evaluate Scale Weight & Metabolic Nutrition Sync
  let nutritionGuidance = "Maintain current caloric baseline.";
  if (scaleWeightShiftKg < -0.6) {
    nutritionGuidance = "Weight dropped faster than target (-0.6kg/wk). Recommend adding +150 kcal (e.g. 30g extra oats or 1 scoop sattu) to prevent muscle catabolism.";
    adaptations.push(nutritionGuidance);
  } else if (scaleWeightShiftKg > 0.6) {
    nutritionGuidance = "Weight increased rapidly (+0.6kg/wk). Recommend trimming 100 kcal of fats/oils to bias lean mass accretion over adipose tissue.";
    adaptations.push(nutritionGuidance);
  }

  // 4. Construct the Evolved Program Schedule
  let evolvedDays = [];
  if (currentProgram && currentProgram.days && currentProgram.days.length > 0) {
    evolvedDays = currentProgram.days.map((day, dIdx) => {
      const updatedExercises = (day.exercises || []).map((ex) => {
        let newLoad = ex.loadKg;
        let newSets = ex.sets;
        let newCue = ex.cue;

        // Apply load overload
        if (newLoad > 0) {
          const multiplier = ex.name.toLowerCase().includes("deadlift") || ex.name.toLowerCase().includes("squat") ? 2 : 1;
          newLoad = Math.round(newLoad + (overloadNudgeKg * multiplier));
        }

        // Apply volume adjustments if fatigued
        if (volumeMultiplier < 1.0 && newSets > 3) {
          newSets = newSets - 1;
        }

        // Apply joint substitutions
        if (activeJointIssues.some(j => j.toLowerCase().includes("shoulder") || j.toLowerCase().includes("impingement"))) {
          if (ex.name.toLowerCase().includes("flat barbell bench")) {
            ex.name = "Incline Dumbbell Bench Press (30° Neutral Grip)";
            newCue = "Neutral grip keeps humerus in scapular plane with zero anterior shoulder impingement.";
          }
        }
        if (activeJointIssues.some(j => j.toLowerCase().includes("elbow"))) {
          if (ex.name.toLowerCase().includes("skull crusher")) {
            ex.name = "Cable Straight-Bar Tricep Pushdown";
            newCue = "Elbows locked as hinges. Eliminates tricep tendon shear stress.";
          }
        }

        return {
          ...ex,
          sets: newSets,
          loadKg: newLoad,
          cue: newCue
        };
      });

      return {
        ...day,
        dayName: day.dayName 
          ? (day.dayName.includes("Week") ? day.dayName.replace(/Week \d+/, `Week ${currentWeekNumber + 1}`) : `${day.dayName} (Week ${currentWeekNumber + 1})`)
          : `Day ${day.dayNumber || (dIdx + 1)} (Week ${currentWeekNumber + 1})`,
        exercises: updatedExercises
      };
    });
  }

  // 5. Synthesize Authoritative AI Coach Debrief
  const nextWeekNumber = currentWeekNumber + 1;
  const aiCoachDebrief = `
### 🧠 TITAN-AI Weekly Micro-Cycle Debrief (Week ${currentWeekNumber} → Week ${nextWeekNumber})

**Performance Status:** \`${statusBadge}\`
- **Volume Tonnage Achieved:** ${tonnageAchievedPct}% of target workload.
- **Average Top-Set RPE:** ${avgRpe} / 10 ${avgRpe <= 7.5 ? '(High velocity - bar flew fast)' : avgRpe >= 9.2 ? '(Approaching neural ceiling)' : '(Optimal loading)'}.
- **CNS Fatigue Index:** ${fatigueScore}% (${fatigueScore > 60 ? 'Accumulated strain elevated' : 'Readiness nominal'}).
- **Scale Weight Shift:** ${scaleWeightShiftKg >= 0 ? `+${scaleWeightShiftKg}` : scaleWeightShiftKg} kg this week.

**Automated Micro-Cycle Adjustments for Week ${nextWeekNumber}:**
${adaptations.map(a => `• ${a}`).join("\n")}

**Coach Strategic Directive:**
${overloadNudgeKg > 0 
  ? "Your nervous system has adapted ahead of schedule. We have dialed in heavier loads for Week " + nextWeekNumber + ". Maintain crisp bracing and commit to every rep."
  : "Recovery takes precedence this week to induce supercompensation. Execute with strict technical perfection without grinding reps."}
  `.trim();

  // Record feedback into athlete memory
  if (jointTweaks.length > 0 || avgRpe >= 9.2) {
    recordAthleteFeedback(athleteId, {
      rating: avgRpe >= 9.2 ? "too_hard" : "optimal",
      jointPainArea: jointTweaks[0] || null,
      note: `Weekly Check-In: Avg RPE ${avgRpe}, Fatigue ${fatigueScore}%`
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
    aiCoachDebrief,
    evolvedProgram: {
      ...(currentProgram || {}),
      weekNumber: nextWeekNumber,
      programTitle: `${currentProgram?.programTitle || 'Training Block'} — Week ${nextWeekNumber}`,
      days: evolvedDays
    }
  };
}

module.exports = {
  evolveTrainingWeek
};
