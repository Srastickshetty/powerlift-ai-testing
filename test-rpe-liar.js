/**
 * TITAN-AI QA TEST: RPE-Liar Test (Sentiment & Velocity)
 * Mock data payload: { BarVelocity: 0.5, UserRPE: 10, HRV: 45 (Baseline: 65) }
 * Expected: "High CNS Stress" intervention notification
 */

const SentimentInterventionEngine = require('./backend/agents/sentiment/intervention-logic');

console.log('🧪 TITAN-AI QA: RPE-Liar Test');
console.log('=====================================');

// Initialize sentiment engine
const sentimentEngine = new SentimentInterventionEngine();

// Mock test data - RPE-Liar scenario
const testData = {
  athleteData: {
    hrv: 45,                    // Critical: HRV 45 (Baseline: 65) - 30% drop
    restingHR: 72,               // Slightly elevated
    sleepQuality: 5.5,           // Poor sleep
    cumulativeFatigue: 8.2,      // High fatigue
    calorieIntake: 2800,         // Decent intake
    proteinIntake: 180           // Good protein
  },
  
  baselineData: {
    hrv: 65,                    // Normal baseline
    restingHR: 65,               // Normal baseline
    avgVelocity: 0.35,          // Normal bar velocity
    avgPower: 450,               // Normal power
    technicalEfficiency: 0.85     // Normal efficiency
  },
  
  sessionData: {
    currentRPE: 10,              // LIAR: Claims maximal effort
    currentVelocity: 0.5,        // But velocity is GOOD (above target)
    targetVelocity: 0.4,         // Target was 0.4 m/s
    currentPower: 520,           // Power is actually high
    technicalEfficiency: 0.88,    // Technique is good
    recentSessions: [
      { rpe: 8, velocity: 0.38 },
      { rpe: 8.5, velocity: 0.36 },
      { rpe: 9, velocity: 0.35 }  // Increasing RPE trend
    ]
  },
  
  // Optional voice analysis (simulated high stress)
  voiceAnalysis: {
    pitchVariability: 0.75,      // High variability (stress)
    speechRate: 0.85,            // Rapid speech (anxiety)
    jitter: 0.65,                // High jitter (tension)
    shimmer: 0.55,               // Moderate shimmer
    energyLevel: 0.25             // Low energy (fatigue)
  }
};

console.log('📊 Test Data:');
console.log(`- Current RPE: ${testData.sessionData.currentRPE}/10`);
console.log(`- Current Velocity: ${testData.sessionData.currentVelocity} m/s (Target: ${testData.sessionData.targetVelocity} m/s)`);
console.log(`- HRV: ${testData.athleteData.hrv} (Baseline: ${testData.baselineData.hrv})`);
console.log(`- HRV Drop: ${((1 - testData.athleteData.hrv / testData.baselineData.hrv) * 100).toFixed(1)}%`);
console.log('');

// Run the test
try {
  const result = sentimentEngine.calculateInterventionScore(
    testData.athleteData,
    testData.baselineData,
    testData.sessionData,
    testData.voiceAnalysis
  );

  console.log('🎯 INTERVENTION ANALYSIS RESULTS:');
  console.log('================================');
  console.log(`Composite Score: ${result.compositeScore}`);
  console.log(`Intervention Level: ${result.interventionLevel}`);
  console.log('');
  
  console.log('📈 Component Scores:');
  console.log(`- RPE-Velocity Gap: ${(result.componentScores.rpeVelocityGap * 100).toFixed(1)}%`);
  console.log(`- Biometric Stress: ${(result.componentScores.biometricStress * 100).toFixed(1)}%`);
  console.log(`- Performance Degradation: ${(result.componentScores.performanceDegradation * 100).toFixed(1)}%`);
  console.log(`- Voice Sentiment: ${(result.componentScores.voiceSentiment * 100).toFixed(1)}%`);
  console.log('');
  
  console.log('🚨 ALERTS:');
  if (result.alerts.length > 0) {
    result.alerts.forEach((alert, index) => {
      console.log(`${index + 1}. [${alert.severity.toUpperCase()}] ${alert.type}`);
      console.log(`   ${alert.message}`);
      console.log(`   Indicator: ${alert.indicator}`);
    });
  } else {
    console.log('No alerts triggered');
  }
  console.log('');
  
  console.log('💡 RECOMMENDATIONS:');
  if (result.recommendations.length > 0) {
    result.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.priority.toUpperCase()}] ${rec.type}`);
      console.log(`   ${rec.message}`);
      console.log(`   Action: ${rec.action}`);
    });
  } else {
    console.log('No recommendations generated');
  }
  console.log('');
  
  // Verify expected results
  console.log('✅ TEST VALIDATION:');
  console.log('==================');
  
  const expectedCritical = result.interventionLevel === 'CRITICAL';
  const expectedHighRPE = result.componentScores.rpeVelocityGap > 0.5;
  const expectedBiometricStress = result.componentScores.biometricStress > 0.7;
  const expectedAlerts = result.alerts.some(alert => alert.type === 'MENTAL_FATIGUE');
  
  console.log(`Expected CRITICAL intervention: ${expectedCritical ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`RPE-Velocity Gap detected: ${expectedHighRPE ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Biometric stress detected: ${expectedBiometricStress ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Mental Fatigue alert triggered: ${expectedAlerts ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  const allTestsPassed = expectedCritical && expectedHighRPE && expectedBiometricStress && expectedAlerts;
  console.log(`🏆 OVERALL RESULT: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  // Output exact JSON response
  console.log('');
  console.log('📋 EXACT JSON RESPONSE:');
  console.log(JSON.stringify(result, null, 2));
  
} catch (error) {
  console.error('❌ TEST FAILED:', error.message);
  console.error(error.stack);
}
