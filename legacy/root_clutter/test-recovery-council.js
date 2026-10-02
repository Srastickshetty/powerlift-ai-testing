/**
 * TITAN-AI QA TEST: Recovery Council Consensus Test
 * Mock conflict: Nutrition Agent wants 4000kcal (high volume), but Sleep Agent reports 3 hours of REM
 * Expected: Head Coach agent resolves conflict with training intensity adjustment
 */

// Use require for CommonJS modules
const { RecoveryCouncil } = require('./backend/agents/recovery/recovery-council');

console.log('🧪 TITAN-AI QA: Recovery Council Consensus Test');
console.log('================================================');

// Mock athlete profile
const mockAthleteProfile = {
  id: 'athlete_001',
  weight: 85,
  height: 175,
  age: 30,
  gender: 'male',
  hrvBaseline: 75,
  restingHRBaseline: 60,
  experienceYears: 4,
  weightClass: '83kg'
};

// Mock test data - CONFLICT SCENARIO
const conflictTestData = {
  biometricData: {
    hrv: 45,                    // Critical: HRV 45 (Baseline: 75) - 40% drop
    restingHR: 78,               // Elevated resting HR
    sleepQuality: 4.0,           // VERY poor sleep
    sleepData: {
      quality: 4.0,              // Out of 10
      remHours: 3.0,             // CRITICAL: Only 3 hours REM
      deepSleepHours: 1.2,       // Poor deep sleep
      bedtime: 23,                // Late bedtime
      wakeTime: 7                 // Normal wake time
    },
    cumulativeFatigue: 9.2,      // Very high fatigue
    calorieIntake: 2800,         // Current intake
    proteinIntake: 160            // Decent protein
  },
  
  trainingData: {
    intensity: 'high',            // High intensity planned
    volume: 'high',              // High volume planned
    duration: 90,               // 90 minutes
    type: 'strength',            // Strength training
    plannedCalories: 4000         // Nutrition agent wants 4000kcal
  },
  
  performanceData: {
    currentVelocity: 0.28,        // Decreased velocity
    baselineVelocity: 0.35,       // Normal baseline
    currentPower: 380,            // Decreased power
    baselinePower: 450,           // Normal baseline
    technicalEfficiency: 0.75,    // Decreased efficiency
    baselineEfficiency: 0.85       // Normal efficiency
  }
};

console.log('⚔️ CONFLICT SCENARIO:');
console.log('====================');
console.log('Nutrition Agent: "Athlete needs 4000kcal for high volume training"');
console.log('Sleep Agent: "Critical REM deficiency - only 3 hours detected!"');
console.log('Head Coach Agent: "High intensity planned but recovery is poor"');
console.log('');
console.log('📊 Test Data:');
console.log(`- HRV: ${conflictTestData.biometricData.hrv} (Baseline: ${mockAthleteProfile.hrvBaseline})`);
console.log(`- REM Sleep: ${conflictTestData.biometricData.sleepData.remHours} hours`);
console.log(`- Sleep Quality: ${conflictTestData.biometricData.sleepQuality}/10`);
console.log(`- Planned Training: ${conflictTestData.trainingData.intensity} intensity, ${conflictTestData.trainingData.volume} volume`);
console.log(`- Planned Calories: ${conflictTestData.trainingData.plannedCalories}kcal`);
console.log('');

// Run test
try {
  // Initialize recovery council
  const recoveryCouncil = new RecoveryCouncil();
  await recoveryCouncil.initialize(mockAthleteProfile);
  
  console.log('🔄 Processing Recovery Council Analysis...');
  console.log('=====================================');
  
  const result = await recoveryCouncil.processDailyRecovery(
    conflictTestData.biometricData,
    conflictTestData.trainingData,
    conflictTestData.performanceData
  );

  console.log('🎯 RECOVERY COUNCIL RESULTS:');
  console.log('=============================');
  console.log(`Plan Priority: ${result.priority.toUpperCase()}`);
  console.log(`Timestamp: ${result.timestamp}`);
  console.log('');
  
  console.log('📋 RECOMMENDATIONS BY CATEGORY:');
  console.log('================================');
  
  Object.entries(result.recommendations).forEach(([category, recommendations]) => {
    if (recommendations.length > 0) {
      console.log(`\n${category.toUpperCase()}:`);
      recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.type}`);
        console.log(`     ${rec.message}`);
        if (rec.action) {
          console.log(`     Action: ${rec.action}`);
        }
      });
    }
  });
  console.log('');
  
  console.log('🚨 CRITICAL ALERTS:');
  console.log('==================');
  if (result.alerts.length > 0) {
    result.alerts.forEach((alert, index) => {
      console.log(`${index + 1}. [${alert.severity.toUpperCase()}] ${alert.type}`);
      console.log(`   ${alert.message}`);
      console.log(`   Agent: ${alert.agent}`);
    });
  } else {
    console.log('No critical alerts triggered');
  }
  console.log('');
  
  console.log('📊 COMPLIANCE METRICS:');
  console.log('======================');
  console.log(`Critical actions required: ${result.complianceMetrics.critical}`);
  console.log(`Required actions: ${result.complianceMetrics.required}`);
  console.log(`Optional actions: ${result.complianceMetrics.optional}`);
  console.log('');
  
  // Verify expected conflict resolution
  console.log('✅ CONFLICT RESOLUTION VALIDATION:');
  console.log('=================================');
  
  const hasSleepAlert = result.alerts.some(alert => 
    alert.type === 'SLEEP_DEFICIENCY' && alert.severity === 'critical'
  );
  
  const hasTrainingAdjustment = result.recommendations.training && 
    result.recommendations.training.some(rec => 
      rec.type === 'training_adjustment' && rec.priority === 'critical'
    );
  
  const hasNutritionAdjustment = result.recommendations.nutrition && 
    result.recommendations.nutrition.some(rec => 
      rec.type === 'calorie_adjustment' || rec.type === 'protein_increase'
    );
  
  const isHighPriority = result.priority === 'critical' || result.priority === 'high';
  
  console.log(`Sleep deficiency alert triggered: ${hasSleepAlert ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Training intensity adjustment: ${hasTrainingAdjustment ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Nutrition adjustment present: ${hasNutritionAdjustment ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`High priority plan generated: ${isHighPriority ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  // Check for specific conflict resolution patterns
  let conflictResolution = 'UNKNOWN';
  if (hasSleepAlert && hasTrainingAdjustment) {
    conflictResolution = '✅ CORRECT: Sleep deficiency triggered training reduction';
  } else if (hasNutritionAdjustment && !hasTrainingAdjustment) {
    conflictResolution = '⚠️ PARTIAL: Nutrition adjusted but training maintained';
  } else if (!hasSleepAlert && !hasTrainingAdjustment) {
    conflictResolution = '❌ INCORRECT: No conflict resolution detected';
  }
  
  console.log(`🔧 Conflict Resolution: ${conflictResolution}`);
  console.log('');
  
  const allTestsPassed = hasSleepAlert && hasTrainingAdjustment && hasNutritionAdjustment && isHighPriority;
  console.log(`🏆 OVERALL RESULT: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  // Output exact JSON response
  console.log('');
  console.log('📋 EXACT JSON RESPONSE:');
  console.log(JSON.stringify(result, null, 2));
  
} catch (error) {
  console.error('❌ TEST FAILED:', error.message);
  console.error(error.stack);
}
