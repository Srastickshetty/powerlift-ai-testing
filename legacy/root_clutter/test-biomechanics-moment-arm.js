/**
 * TITAN-AI QA TEST: Biomechanics Moment Arm Logic Verification
 * Verify mathematical formulas used to calculate "Mid-foot Deviation"
 * Confirm it correctly identifies forward lean
 */

console.log('🧪 TITAN-AI QA: Biomechanics Moment Arm Logic Test');
console.log('==================================================');

// Mock the Python biomechanics logic in JavaScript for verification
class BiomechanicsAnalyzer {
  constructor() {
    this.PIXELS_TO_CM = 0.1;  // Calibration factor
    this.MOMENT_ARM_THRESHOLDS = {
      'optimal': 5.0,  // cm
      'warning': 10.0,  // cm
      'critical': 15.0  // cm
    };
    
    this.JointAngles = {
      'squat_depth_threshold': 90,  // degrees
      'hip_flexion_optimal': 45,  // degrees
      'knee_flexion_optimal': 90  // degrees
    };
  }

  /**
   * Calculate mid-foot deviation (horizontal distance bar-midfoot)
   * Formula: |barbell_x - mid_foot_x| * PIXELS_TO_CM
   */
  calculateMidFootDeviation(barbellCenter, midFoot) {
    const deviation = Math.abs(barbellCenter[0] - midFoot[0]) * this.PIXELS_TO_CM;
    console.log(`📐 Mid-Foot Deviation Formula:`);
    console.log(`   |barbell_x(${barbellCenter[0]}) - mid_foot_x(${midFoot[0]})| × ${this.PIXELS_TO_CM}`);
    console.log(`   = |${barbellCenter[0] - midFoot[0]}| × ${this.PIXELS_TO_CM}`);
    console.log(`   = ${deviation.toFixed(2)} cm`);
    return deviation;
  }

  /**
   * Calculate moment arm leakage
   * Formula: base_leakage × (2.0 - hip_efficiency)
   */
  calculateMomentArmLeakage(midFootDeviation, hipAngle) {
    const optimalDeviation = this.MOMENT_ARM_THRESHOLDS['optimal'];
    
    // Calculate base leakage
    let baseLeakage;
    if (midFootDeviation <= optimalDeviation) {
      baseLeakage = 0.0;
    } else {
      const excessDeviation = midFootDeviation - optimalDeviation;
      baseLeakage = Math.min(50.0, excessDeviation * 2.0);  // Max 50% leakage
    }
    
    // Calculate hip efficiency
    let hipEfficiency = 1.0;
    if (hipAngle < this.JointAngles['hip_flexion_optimal']) {
      hipEfficiency = hipAngle / this.JointAngles['hip_flexion_optimal'];
    }
    
    // Calculate total leakage
    const totalLeakage = baseLeakage * (2.0 - hipEfficiency);
    
    console.log(`⚙️ Moment Arm Leakage Formula:`);
    console.log(`   Base Leakage: ${baseLeakage.toFixed(2)}%`);
    console.log(`   Hip Efficiency: ${hipEfficiency.toFixed(2)} (angle: ${hipAngle}°)`);
    console.log(`   Total Leakage: ${totalLeakage.toFixed(2)}%`);
    
    return Math.min(100.0, totalLeakage);
  }

  /**
   * Analyze forward lean detection
   */
  analyzeForwardLean(barbellPosition, midFootPosition, hipAngle) {
    const midFootDeviation = this.calculateMidFootDeviation(barbellPosition, midFootPosition);
    const momentArmLeakage = this.calculateMomentArmLeakage(midFootDeviation, hipAngle);
    
    // Determine if forward lean is detected
    const isForwardLean = barbellPosition[0] > midFootPosition[0];  // Bar ahead of mid-foot
    const severity = this.determineSeverity(midFootDeviation);
    
    return {
      midFootDeviation,
      momentArmLeakage,
      isForwardLean,
      severity,
      hipAngle,
      recommendation: this.generateRecommendation(midFootDeviation, momentArmLeakage, isForwardLean)
    };
  }

  determineSeverity(deviation) {
    if (deviation <= this.MOMENT_ARM_THRESHOLDS['optimal']) return 'OPTIMAL';
    if (deviation <= this.MOMENT_ARM_THRESHOLDS['warning']) return 'WARNING';
    if (deviation <= this.MOMENT_ARM_THRESHOLDS['critical']) return 'CRITICAL';
    return 'SEVERE';
  }

  generateRecommendation(deviation, leakage, isForwardLean) {
    if (isForwardLean && deviation > this.MOMENT_ARM_THRESHOLDS['optimal']) {
      return {
        type: 'FORWARD_LEAN_CORRECTION',
        priority: 'HIGH',
        message: `Forward lean detected: ${deviation.toFixed(1)}cm deviation causing ${leakage.toFixed(1)}% power leakage`,
        action: 'Sit back and keep bar over mid-foot'
      };
    }
    
    if (leakage > 20) {
      return {
        type: 'POWER_LEAKAGE_ALERT',
        priority: 'CRITICAL',
        message: `Critical power leakage: ${leakage.toFixed(1)}% efficiency loss`,
        action: 'Deload and focus on technique'
      };
    }
    
    return {
      type: 'TECHNIQUE_MAINTENANCE',
      priority: 'LOW',
      message: `Good bar position: ${deviation.toFixed(1)}cm deviation`,
      action: 'Maintain current technique'
    };
  }
}

// Test scenarios
console.log('📋 TEST SCENARIOS:');
console.log('==================');

const analyzer = new BiomechanicsAnalyzer();

// Test 1: Optimal bar position
console.log('\n🎯 TEST 1: OPTIMAL BAR POSITION');
console.log('================================');
const test1 = analyzer.analyzeForwardLean(
  [400, 300],  // Barbell center (x, y)
  [400, 500],  // Mid-foot position (x, y) - directly under bar
  45           // Hip angle (optimal)
);

console.log(`✅ Result: ${test1.severity}`);
console.log(`📝 Recommendation: ${test1.recommendation.message}`);
console.log(`🔧 Action: ${test1.recommendation.action}`);

// Test 2: Forward lean (bar ahead of mid-foot)
console.log('\n⚠️ TEST 2: FORWARD LEAN DETECTION');
console.log('===================================');
const test2 = analyzer.analyzeForwardLean(
  [450, 300],  // Barbell center (50px ahead of mid-foot)
  [400, 500],  // Mid-foot position
  35           // Hip angle (poor - too flexed)
);

console.log(`⚠️ Result: ${test2.severity}`);
console.log(`📝 Recommendation: ${test2.recommendation.message}`);
console.log(`🔧 Action: ${test2.recommendation.action}`);

// Test 3: Severe forward lean
console.log('\n🚨 TEST 3: SEVERE FORWARD LEAN');
console.log('================================');
const test3 = analyzer.analyzeForwardLean(
  [550, 300],  // Barbell center (150px ahead of mid-foot)
  [400, 500],  // Mid-foot position
  25           // Hip angle (very poor - excessive flexion)
);

console.log(`🚨 Result: ${test3.severity}`);
console.log(`📝 Recommendation: ${test3.recommendation.message}`);
console.log(`🔧 Action: ${test3.recommendation.action}`);

// Test 4: Backward lean (bar behind mid-foot)
console.log('\n📐 TEST 4: BACKWARD LEAN DETECTION');
console.log('=================================');
const test4 = analyzer.analyzeForwardLean(
  [350, 300],  // Barbell center (50px behind mid-foot)
  [400, 500],  // Mid-foot position
  50           // Hip angle (good - extended)
);

console.log(`📐 Result: ${test4.severity}`);
console.log(`📝 Recommendation: ${test4.recommendation.message}`);
console.log(`🔧 Action: ${test4.recommendation.action}`);

// Validation
console.log('\n✅ MATHEMATICAL FORMULA VERIFICATION:');
console.log('===================================');

console.log('🔬 Mid-Foot Deviation Formula:');
console.log('   Formula: |barbell_x - mid_foot_x| × PIXELS_TO_CM');
console.log('   Purpose: Calculates horizontal distance between bar and center of mass');
console.log('   Forward Lean: barbell_x > mid_foot_x (positive deviation)');
console.log('   Backward Lean: barbell_x < mid_foot_x (positive deviation)');
console.log('   Optimal: barbell_x ≈ mid_foot_x (deviation ≤ 5.0cm)');

console.log('\n⚙️ Moment Arm Leakage Formula:');
console.log('   Formula: base_leakage × (2.0 - hip_efficiency)');
console.log('   Base Leakage: excess_deviation × 2.0 (max 50%)');
console.log('   Hip Efficiency: hip_angle ÷ 45° (optimal angle)');
console.log('   Total Leakage: Amplified by poor hip mechanics');

console.log('\n🎯 FORWARD LEAN DETECTION VERIFICATION:');
console.log('===================================');

const validationResults = [
  {
    test: 'Optimal Position',
    expectedSeverity: 'OPTIMAL',
    actualSeverity: test1.severity,
    expectedForwardLean: false,
    actualForwardLean: test1.isForwardLean,
    passed: test1.severity === 'OPTIMAL' && !test1.isForwardLean
  },
  {
    test: 'Forward Lean',
    expectedSeverity: 'WARNING',
    actualSeverity: test2.severity,
    expectedForwardLean: true,
    actualForwardLean: test2.isForwardLean,
    passed: test2.severity === 'WARNING' && test2.isForwardLean
  },
  {
    test: 'Severe Forward Lean',
    expectedSeverity: 'SEVERE',
    actualSeverity: test3.severity,
    expectedForwardLean: true,
    actualForwardLean: test3.isForwardLean,
    passed: test3.severity === 'SEVERE' && test3.isForwardLean
  },
  {
    test: 'Backward Lean',
    expectedSeverity: 'WARNING',
    actualSeverity: test4.severity,
    expectedForwardLean: false,
    actualForwardLean: test4.isForwardLean,
    passed: test4.severity === 'WARNING' && !test4.isForwardLean
  }
];

validationResults.forEach((result, index) => {
  console.log(`${index + 1}. ${result.test}:`);
  console.log(`   Expected Severity: ${result.expectedSeverity} | Actual: ${result.actualSeverity} ${result.actualSeverity === result.expectedSeverity ? '✅' : '❌'}`);
  console.log(`   Expected Forward Lean: ${result.expectedForwardLean} | Actual: ${result.actualForwardLean} ${result.actualForwardLean === result.expectedForwardLean ? '✅' : '❌'}`);
  console.log(`   Result: ${result.passed ? '✅ PASS' : '❌ FAIL'}`);
});

const allTestsPassed = validationResults.every(result => result.passed);
console.log(`\n🏆 OVERALL FORMULA VERIFICATION: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

console.log('\n📋 EXACT JSON RESPONSE:');
console.log('========================');
console.log(JSON.stringify({
  testResults: validationResults,
  mathematicalFormulas: {
    midFootDeviation: '|barbell_x - mid_foot_x| × PIXELS_TO_CM',
    momentArmLeakage: 'base_leakage × (2.0 - hip_efficiency)',
    hipEfficiency: 'hip_angle ÷ 45°',
    baseLeakage: 'excess_deviation × 2.0 (max 50%)'
  },
  thresholds: analyzer.MOMENT_ARM_THRESHOLDS,
  timestamp: new Date().toISOString()
}, null, 2));
