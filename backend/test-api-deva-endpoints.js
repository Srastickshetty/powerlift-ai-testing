/**
 * test-api-deva-endpoints.js
 * Verifies Express router endpoints for Coach Deva principles and Multi-Coach Council
 */

const express = require("express");
const programsRouter = require("./routes/programs");

const app = express();
app.use(express.json());
app.use("/api/programs", programsRouter);

const server = app.listen(0, async () => {
  const port = server.address().port;
  console.log(`Test Express server running on port ${port}`);

  try {
    // 1. Test Coach Deva Principles
    const resDeva = await fetch(`http://localhost:${port}/api/programs/coach-deva-principles`);
    const dataDeva = await resDeva.json();
    console.log("Response /coach-deva-principles:", dataDeva.success ? "✅ OK" : "❌ FAILED");
    if (!dataDeva.principles?.movementPrinciples?.benchPress?.signatureTechnique?.includes("Bulldog Grip")) {
      throw new Error("Missing Bulldog grip in API response");
    }

    // 2. Test Multi-Coach Council
    const resCouncil = await fetch(`http://localhost:${port}/api/programs/multi-coach-council`);
    const dataCouncil = await resCouncil.json();
    console.log("Response /multi-coach-council:", dataCouncil.success ? "✅ OK" : "❌ FAILED");
    if (!dataCouncil.council?.coachDeva) {
      throw new Error("Missing coachDeva in council API response");
    }

    // 3. Test AI Evolve Week with Stable Mesocycle
    const mockProgram = {
      programTitle: "4-Day SBD Wave",
      daysPerWeek: 4,
      totalWeeks: 4,
      days: [
        {
          dayNumber: 1,
          dayName: "Day 1: Competition Squat",
          focus: "Squat",
          exercises: [
            { name: "Competition Squat", sets: 4, reps: "4", loadKg: 105, intensityTarget: "RPE 8", cue: "Deva midfoot cue" },
            { name: "Spoto Press", sets: 4, reps: "5", loadKg: 75, intensityTarget: "RPE 7.5", cue: "Deva bulldog cue" }
          ]
        },
        {
          dayNumber: 2,
          dayName: "Day 2: Competition Bench",
          focus: "Bench",
          exercises: [
            { name: "Competition Paused Bench Press", sets: 5, reps: "3", loadKg: 85, intensityTarget: "RPE 8.5", cue: "Deva bulldog cue" }
          ]
        }
      ]
    };

    const resEvolve = await fetch(`http://localhost:${port}/api/programs/ai-evolve-week/athlete_test_api`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentWeekNumber: 1,
        currentProgram: mockProgram,
        weeklyCheckIn: {
          avgRpe: 7.5,
          tonnageAchievedPct: 100,
          missedReps: 0,
          fatigueScore: 25,
          scaleWeightShiftKg: 0.1,
          jointTweaks: []
        }
      })
    });

    const dataEvolve = await resEvolve.json();
    console.log("Response /ai-evolve-week:", dataEvolve.success ? "✅ OK" : "❌ FAILED");
    console.log("Evolved week status:", dataEvolve.statusBadge);
    console.log("Is program stable (zero churn):", dataEvolve.isProgramStable ? "✅ YES" : "❌ NO");

    if (dataEvolve.evolvedWeek !== 2) throw new Error("Did not advance to Week 2");
    if (!dataEvolve.isProgramStable) throw new Error("Healthy lifter program was not marked stable");

    console.log("\n🎯 ALL API ROUTE TESTS PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("❌ API ROUTE TEST ERROR:", err.message);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
