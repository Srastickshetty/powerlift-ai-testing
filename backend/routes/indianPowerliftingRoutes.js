/**
 * indianPowerliftingRoutes.js - Indian Powerlifting Standards, Meets & High-Protein Nutrition Engine
 */

const express = require('express');
const router = express.Router();
const indianData = require('../data/indianPowerliftingData.json');

/**
 * GET /api/india/standards
 * Retrieve federations, national weight classes, and qualifying benchmarks
 */
router.get('/standards', (req, res) => {
  try {
    res.json({
      success: true,
      federations: indianData.federations,
      weight_classes: indianData.weight_classes,
      equipment_presets: indianData.equipment_presets
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const fs = require('fs');
const path = require('path');
const dataFilePath = path.join(__dirname, '../data/indianPowerliftingData.json');
const BROADCASTS_FILE = path.join(__dirname, '../data/broadcasts.json');

// In-memory meets cache initialized from JSON
let activeMeets = [...(indianData.indian_meets || [])];

// Official All-Time Indian National Records (Powerlifting India / IPF Raw)
const NATIONAL_RECORDS = {
  men: {
    "59kg": { squat: 212.5, bench: 140.0, deadlift: 247.5, total: 600.0, holder: "Govind Sharma" },
    "66kg": { squat: 240.0, bench: 157.5, deadlift: 275.0, total: 665.0, holder: "Surender Singh" },
    "74kg": { squat: 260.0, bench: 172.5, deadlift: 302.5, total: 730.0, holder: "Pradeep Patel" },
    "83kg": { squat: 285.0, bench: 185.0, deadlift: 325.0, total: 790.0, holder: "Ankush Sharma" },
    "93kg": { squat: 305.0, bench: 200.0, deadlift: 342.5, total: 840.0, holder: "Vikramaditya Rathore" },
    "105kg": { squat: 320.0, bench: 210.0, deadlift: 355.0, total: 875.0, holder: "Hardeep Singh" },
    "120kg": { squat: 340.0, bench: 222.5, deadlift: 365.0, total: 920.0, holder: "Jaspreet Gill" },
    "120+kg": { squat: 365.0, bench: 235.0, deadlift: 380.0, total: 970.0, holder: "Amritpal Singh" }
  },
  women: {
    "47kg": { squat: 132.5, bench: 82.5, deadlift: 165.0, total: 375.0, holder: "Rekha Rani" },
    "52kg": { squat: 152.5, bench: 95.0, deadlift: 182.5, total: 425.0, holder: "Sanjana Roy" },
    "57kg": { squat: 170.0, bench: 105.0, deadlift: 200.0, total: 470.0, holder: "Pooja Patel" },
    "63kg": { squat: 185.0, bench: 112.5, deadlift: 215.0, total: 510.0, holder: "Shweta Verma" },
    "69kg": { squat: 200.0, bench: 122.5, deadlift: 230.0, total: 545.0, holder: "Ananya Sharma" },
    "76kg": { squat: 212.5, bench: 130.0, deadlift: 242.5, total: 580.0, holder: "Komalpreet Kaur" },
    "84kg": { squat: 225.0, bench: 137.5, deadlift: 255.0, total: 615.0, holder: "Sunita Yadav" },
    "84+kg": { squat: 245.0, bench: 150.0, deadlift: 270.0, total: 660.0, holder: "Gurpreet Kaur" }
  }
};

/**
 * GET /api/india/national-records
 * All-time Indian Powerlifting national records per weight class
 */
router.get('/national-records', (req, res) => {
  res.json({
    success: true,
    records: NATIONAL_RECORDS
  });
});

/**
 * GET /api/india/meets
 * Upcoming Indian Powerlifting meets and custom athlete-submitted meets
 */
router.get('/meets', (req, res) => {
  try {
    res.json({
      success: true,
      meets: activeMeets
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/india/meets/custom
 * Allow any athlete/coach to submit a real meet and sync across all athletes
 */
router.post('/meets/custom', (req, res) => {
  try {
    const { name, federation, state, city, venue, month, date, registrationLink, flyerUrl, submittedBy } = req.body;
    if (!name || !city) {
      return res.status(400).json({ error: "Meet name and city are required" });
    }

    const newMeet = {
      id: `custom_meet_${Date.now()}`,
      name,
      federation: federation || "Powerlifting India / State Unit",
      state: state || "Karnataka",
      city,
      venue: venue || "District Sports Complex",
      month: month || "Upcoming 2026",
      date: date || new Date().toISOString().split('T')[0],
      registrationLink: registrationLink || `https://www.google.com/search?q=${encodeURIComponent(name + ' registration')}`,
      flyerUrl: flyerUrl || null,
      submittedBy: submittedBy || "Athlete",
      isCustom: true,
      qualifying_required: false,
      levels: ["Classic Raw"]
    };

    activeMeets.unshift(newMeet);

    // 1. Persist to JSON file
    try {
      if (fs.existsSync(dataFilePath)) {
        const fileContent = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
        fileContent.indian_meets = activeMeets;
        fs.writeFileSync(dataFilePath, JSON.stringify(fileContent, null, 2), 'utf8');
      }
    } catch (writeErr) {
      console.warn("File write warning:", writeErr.message);
    }

    // 2. Global Sync: Dispatch active platform broadcast so all users get notified
    try {
      if (fs.existsSync(BROADCASTS_FILE)) {
        const bcastData = JSON.parse(fs.readFileSync(BROADCASTS_FILE, 'utf8'));
        const newBroadcast = {
          id: `bc_meet_${Date.now()}`,
          title: `🏆 New Meet Added: ${name}`,
          message: `${city}, ${state || 'India'} (${month || 'Upcoming'}). Registration details now live in Meet Finder!`,
          urgency: 'urgent',
          targetAudience: 'powerlifting',
          timestamp: new Date().toISOString(),
          author: submittedBy || "Community Lifter"
        };
        bcastData.activeBroadcast = newBroadcast;
        if (!bcastData.history) bcastData.history = [];
        bcastData.history.unshift(newBroadcast);
        fs.writeFileSync(BROADCASTS_FILE, JSON.stringify(bcastData, null, 2), 'utf8');
      }
    } catch (bcErr) {
      console.warn("Could not dispatch broadcast:", bcErr.message);
    }

    res.status(201).json({ 
      success: true, 
      message: "Meet registered and synchronized across all athletes!",
      meet: newMeet, 
      totalMeets: activeMeets.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/india/qualifying-check
 * Evaluates athlete total against Powerlifting India / IPF benchmarks
 */
router.post('/qualifying-check', (req, res) => {
  try {
    const { bodyweightKg = 74, gender = 'men', age = 22, currentTotal = 500 } = req.body;
    const genderKey = gender.toLowerCase() === 'women' || gender.toLowerCase() === 'female' ? 'women' : 'men';
    const classes = indianData.weight_classes[genderKey] || indianData.weight_classes.men;

    // Find best fitting weight class
    let matchedClass = classes[0];
    for (const c of classes) {
      const limit = parseFloat(c.class);
      if (bodyweightKg <= limit || c.class.includes('+')) {
        matchedClass = c;
        break;
      }
    }

    // Determine age division
    let division = 'Senior';
    let targetStandard = matchedClass.senior_national;
    if (age <= 18) {
      division = 'Sub-Junior (U18)';
      targetStandard = matchedClass.sub_junior;
    } else if (age <= 23) {
      division = 'Junior (U23)';
      targetStandard = matchedClass.junior;
    }

    const seniorGap = matchedClass.senior_national - currentTotal;
    const isSeniorQualified = currentTotal >= matchedClass.senior_national;
    const isDivisionQualified = currentTotal >= targetStandard;

    res.json({
      success: true,
      bodyweightKg,
      gender: genderKey,
      age,
      division,
      weight_class: matchedClass.class,
      current_total: currentTotal,
      target_standard: targetStandard,
      senior_national_benchmark: matchedClass.senior_national,
      is_division_qualified: isDivisionQualified,
      is_senior_qualified: isSeniorQualified,
      senior_gap_kg: Math.max(0, seniorGap),
      status_message: isSeniorQualified 
        ? "🏆 Senior National Competitor! You meet the benchmark for Powerlifting India Senior Nationals."
        : isDivisionQualified
        ? `🔥 ${division} Benchmark Cleared! Only +${seniorGap}kg to Senior National standard.`
        : `Developing Athlete: +${targetStandard - currentTotal}kg to reach ${division} benchmark.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/india/nutrition-plan
 * Generate an authentic Indian high-protein meal plan (Veg, Eggetarian, Non-Veg)
 */
router.post('/nutrition-plan', (req, res) => {
  try {
    const { 
      bodyweightKg = 75, 
      dietType = 'vegetarian', 
      multiplier = 2.0, 
      calorieTarget = 2600 
    } = req.body;

    const targetProteinGrams = Math.round(bodyweightKg * multiplier); // ~150g for 75kg
    const targetFatGrams = Math.round((calorieTarget * 0.25) / 9);
    const targetCarbGrams = Math.round((calorieTarget - (targetProteinGrams * 4 + targetFatGrams * 9)) / 4);

    let meals = [];
    let estDailyCostINR = 140;

    if (dietType === 'vegetarian') {
      estDailyCostINR = 140;
      meals = [
        {
          meal_name: "Meal 1 — Desi Power Breakfast",
          timing: "8:00 AM",
          items: [
            "60g Sattu Drink (with cold water, black salt, lemon, and roasted cumin)",
            "150g Hung Curd / Greek Dahi with 1 tsp roasted flaxseeds",
            "2 Whole Wheat Rotis / 1 Bowl Poha"
          ],
          protein_g: 27,
          carbs_g: 65,
          fat_g: 10,
          notes: "Sattu provides sustained complex carbs and clean gut-friendly plant protein."
        },
        {
          meal_name: "Meal 2 — Post-Workout Anabolic Window",
          timing: "12:30 PM",
          items: [
            "1 Scoop Whey Protein (25g protein) with 300ml water",
            "1 Large Banana"
          ],
          protein_g: 26,
          carbs_g: 30,
          fat_g: 1.5,
          notes: "Rapid amino acid delivery to rebuild micro-tears from heavy squatting/benching."
        },
        {
          meal_name: "Meal 3 — High-Protein Lunch",
          timing: "2:00 PM",
          items: [
            "60g Soya Chunks Curry (boiled and squeezed dry, cooked in onion-tomato masala)",
            "1 Bowl Thick Moong / Toor Dal (200g)",
            "1.5 Cups Steamed Brown / White Rice + Green Salad"
          ],
          protein_g: 45,
          carbs_g: 75,
          fat_g: 6,
          notes: "Soya chunks provide unmatched 52% protein density at an affordable Indian budget."
        },
        {
          meal_name: "Meal 4 — Pre-Bed Strength Recovery Dinner",
          timing: "8:30 PM",
          items: [
            "180g Low-Fat Paneer Bhurji / Grilled Paneer with turmeric and bell peppers",
            "2 Multigrain Rotis",
            "Cucumber & Tomato Salad with lemon juice"
          ],
          protein_g: 38,
          carbs_g: 45,
          fat_g: 20,
          notes: "Slow-digesting micellar casein in paneer prevents catabolism across 8 hours of sleep."
        },
        {
          meal_name: "Optional Snack / Intra-Workout",
          timing: "Evening",
          items: [
            "30g Roasted Chana (Bhuna Chana)",
            "Handful of Almonds & Walnuts (15g)"
          ],
          protein_g: 8,
          carbs_g: 18,
          fat_g: 8,
          notes: "Mineral dense magnesium and zinc for athletic recovery."
        }
      ];
    } else if (dietType === 'eggetarian') {
      estDailyCostINR = 160;
      meals = [
        {
          meal_name: "Meal 1 — Egg Power Breakfast",
          timing: "8:00 AM",
          items: [
            "2 Whole Eggs + 4 Egg Whites (Omelette / Bhurji)",
            "2 Slices Whole Wheat Toast / 2 Rotis",
            "1 Glass Lemon Water with electrolyte salt"
          ],
          protein_g: 29,
          carbs_g: 35,
          fat_g: 12,
          notes: "Whole eggs supply dietary cholesterol essential for testosterone production."
        },
        {
          meal_name: "Meal 2 — Post-Workout Recovery",
          timing: "12:00 PM",
          items: [
            "1 Scoop Whey Protein Isolate",
            "1 Bowl Oatmeal with 1 tsp Peanut Butter"
          ],
          protein_g: 30,
          carbs_g: 45,
          fat_g: 8,
          notes: "Replenishes muscle glycogen depleted during top singles."
        },
        {
          meal_name: "Meal 3 — High-Protein Lunch",
          timing: "2:30 PM",
          items: [
            "50g Soya Chunks Curry or 150g Paneer",
            "1 Bowl Thick Dal Tadka",
            "1.5 Cups Steamed Rice + Beetroot Salad"
          ],
          protein_g: 40,
          carbs_g: 70,
          fat_g: 10,
          notes: "Complete plant-dairy amino profile."
        },
        {
          meal_name: "Meal 4 — Evening Eggs & Strength Dinner",
          timing: "8:30 PM",
          items: [
            "5 Boiled Egg Whites + 1 Whole Egg",
            "150g Dahi / Curd",
            "2 Multigrain Rotis with Sabzi"
          ],
          protein_g: 36,
          carbs_g: 40,
          fat_g: 11,
          notes: "High biological value proteins with zero heaviness before bed."
        }
      ];
    } else {
      // Non-Vegetarian
      estDailyCostINR = 220;
      meals = [
        {
          meal_name: "Meal 1 — High-Protein Kickoff",
          timing: "8:00 AM",
          items: [
            "3 Whole Eggs + 3 Egg Whites Scramble",
            "2 Whole Wheat Parathas (light oil) or 2 Rotis",
            "1 Cup Black Coffee / Green Tea"
          ],
          protein_g: 32,
          carbs_g: 40,
          fat_g: 16,
          notes: "Great sustained morning energy."
        },
        {
          meal_name: "Meal 2 — Post-Lift Fuel",
          timing: "12:00 PM",
          items: [
            "1 Scoop Whey Protein",
            "200g Steamed White Rice with Pinch of Salt"
          ],
          protein_g: 27,
          carbs_g: 56,
          fat_g: 1.5,
          notes: "High glycemic post-workout carb reload."
        },
        {
          meal_name: "Meal 3 — Desi Chicken Feast",
          timing: "2:00 PM",
          items: [
            "180g Chicken Breast (Tandoori, Curry, or Pan-Seared with Indian spices)",
            "1 Bowl Dal",
            "2 Rotis + Green Cucumber & Onion Salad"
          ],
          protein_g: 55,
          carbs_g: 45,
          fat_g: 8,
          notes: "Massive 55g lean protein punch with natural iron and zinc."
        },
        {
          meal_name: "Meal 4 — Strength Dinner",
          timing: "8:30 PM",
          items: [
            "150g Fish (Rohu/Katla/Tilapia) or 150g Grilled Chicken",
            "1 Bowl Dahi / Curd",
            "1 Cup Rice or 2 Rotis"
          ],
          protein_g: 42,
          carbs_g: 38,
          fat_g: 7,
          notes: "Omega-3 rich fish or lean chicken for anti-inflammatory joint recovery."
        }
      ];
    }

    const totalProvidedProtein = meals.reduce((sum, m) => sum + m.protein_g, 0);

    res.json({
      success: true,
      bodyweightKg,
      diet_type: dietType,
      targets: {
        protein_g: targetProteinGrams,
        carbs_g: targetCarbGrams,
        fat_g: targetFatGrams,
        calories: calorieTarget,
        hydration_liters: Math.max(3.5, Math.round((bodyweightKg * 0.045) * 10) / 10)
      },
      actual_menu_protein: totalProvidedProtein,
      estimated_daily_cost_inr: estDailyCostINR,
      meals,
      staple_cheat_sheet: indianData.indian_nutrition_database.filter(s => {
        if (dietType === 'vegetarian') return s.type === 'vegetarian';
        if (dietType === 'eggetarian') return s.type === 'vegetarian' || s.type === 'eggetarian';
        return true;
      })
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/india/fitness-program
 * Generates custom fitness/bodybuilding split (PPL, Upper/Lower, Arnold, Full Body)
 */
router.post('/fitness-program', async (req, res) => {
  try {
    const userGroqKey = req.headers["x-groq-key"] || null;
    const userGeminiKey = req.headers["x-gemini-key"] || null;
    const { generateRealtimeAIProgram } = require('../services/aiProgramBrain');
    
    const program = await generateRealtimeAIProgram({
      pathway: 'fitness',
      userGroqKey,
      userGeminiKey,
      ...req.body
    });
    res.json(program);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/india/fitness-diet
 * Calculates budget-matched Indian diet portions
 */
router.post('/fitness-diet', (req, res) => {
  try {
    const { calculateIndianBudgetDiet } = require('../services/fitnessProgramService');
    const diet = calculateIndianBudgetDiet(req.body);
    res.json({ success: true, diet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
