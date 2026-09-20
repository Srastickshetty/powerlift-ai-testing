/**
 * TITAN-AI Athletic Intervention & Fatigue Engine
 * Calculates Comprehensive Readiness & Intervention Score using
 * RPE-Velocity Gap, Biometric Biomarkers (HRV/RHR), and Performance Metrics
 */

class SentimentInterventionEngine {
  constructor() {
    this.interventionThresholds = {
      // RPE-Velocity Gap Detection
      rpeVelocityGap: {
        highRpe: 8,
        velocityTargetMultiplier: 1.1,
        hrvBaselineDrop: 0.15
      },
      
      // Biometric Stress Indicators
      biometricStress: {
        hrvCritical: 0.8, // 80% of baseline
        restingHRElevation: 1.1, // 10% above baseline
        sleepQualityThreshold: 6.5, // out of 10
        cumulativeFatigueScore: 7.5
      },
      
      // Performance Degradation
      performanceDrop: {
        velocityDropThreshold: 0.08, // 8% drop
        powerOutputDrop: 0.12, // 12% drop
        technicalEfficiencyDrop: 0.15 // 15% drop
      },
      
      // Intervention Scoring
      interventionLevels: {
        monitoring: 0.3,
        advisory: 0.6,
        critical: 0.8
      }
    };
  }

  /**
   * Calculate comprehensive Intervention Score
   * @param {Object} athleteData - Current athlete biometric and performance data
   * @param {Object} baselineData - Athlete's baseline measurements
   * @param {Object} sessionData - Current training session data
   * @returns {Object} Intervention assessment with recommendations
   */
  calculateInterventionScore(athleteData = {}, baselineData = {}, sessionData = {}) {
    const scores = {
      rpeVelocityGap: this.calculateRPEVelocityGap(sessionData),
      biometricStress: this.calculateBiometricStress(athleteData, baselineData),
      performanceDegradation: this.calculatePerformanceDegradation(sessionData, baselineData),
    };

    // Pure athletic weights (100% focused on performance & recovery)
    const weights = {
      rpeVelocityGap: 0.35,
      biometricStress: 0.40,
      performanceDegradation: 0.25,
    };

    const compositeScore = Object.entries(scores).reduce((total, [key, score]) => {
      return total + (score * (weights[key] || 0));
    }, 0);

    const interventionLevel = this.determineInterventionLevel(compositeScore);
    const recommendations = this.generateRecommendations(interventionLevel, scores);

    return {
      compositeScore: Math.round(compositeScore * 100) / 100,
      readinessScore: Math.max(0, Math.round((1 - compositeScore) * 100)),
      interventionLevel,
      componentScores: scores,
      recommendations,
      timestamp: new Date().toISOString(),
      alerts: this.generateAlerts(scores, interventionLevel)
    };
  }

  /**
   * Calculate RPE-Velocity Gap Score
   * Detects when velocity is high but RPE is also high (mental/CNS fatigue indicator)
   */
  calculateRPEVelocityGap(sessionData = {}) {
    const { currentRPE = 7, currentVelocity = 0.5, targetVelocity = 0.5, recentSessions = [] } = sessionData;
    const thresholds = this.interventionThresholds.rpeVelocityGap;

    let score = 0;

    if (currentRPE >= thresholds.highRpe) {
      if (currentVelocity > targetVelocity * thresholds.velocityTargetMultiplier) {
        score += 0.7; // Strong indicator of CNS/mental fatigue
      } else if (currentVelocity > targetVelocity) {
        score += 0.4;
      }
    }

    if (recentSessions && recentSessions.length >= 3) {
      const rpeTrend = this.calculateTrend(recentSessions.map(s => s.rpe || 7));
      if (rpeTrend > 0.3) {
        score += 0.3;
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate Biometric Stress Score
   * Analyzes HRV, resting HR, sleep quality, and cumulative fatigue
   */
  calculateBiometricStress(athleteData = {}, baselineData = {}) {
    const thresholds = this.interventionThresholds.biometricStress;
    let score = 0;

    const athleteHRV = athleteData.hrv || baselineData.hrv || 70;
    const baselineHRV = baselineData.hrv || 70;
    const hrvRatio = athleteHRV / (baselineHRV || 70);

    if (hrvRatio < thresholds.hrvCritical) {
      score += 0.4;
    } else if (hrvRatio < 0.9) {
      score += 0.2;
    }

    const athleteRHR = athleteData.restingHR || baselineData.restingHR || 60;
    const baselineRHR = baselineData.restingHR || 60;
    const restingHRRatio = athleteRHR / (baselineRHR || 60);

    if (restingHRRatio > thresholds.restingHRElevation) {
      score += 0.3;
    }

    const sleepQuality = athleteData.sleepQuality ?? 7;
    if (sleepQuality < thresholds.sleepQualityThreshold) {
      score += 0.2;
    }

    if ((athleteData.cumulativeFatigue || 0) > thresholds.cumulativeFatigueScore) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate Performance Degradation Score
   * Analyzes velocity, power output, and technical efficiency drops
   */
  calculatePerformanceDegradation(sessionData = {}, baselineData = {}) {
    const thresholds = this.interventionThresholds.performanceDrop;
    let score = 0;

    const avgVel = baselineData.avgVelocity || 0.6;
    const curVel = sessionData.currentVelocity || 0.6;
    const velocityDrop = (avgVel - curVel) / (avgVel || 1);

    if (velocityDrop > thresholds.velocityDropThreshold) {
      score += 0.4;
    }

    if (sessionData.currentPower && baselineData.avgPower) {
      const powerDrop = (baselineData.avgPower - sessionData.currentPower) / baselineData.avgPower;
      if (powerDrop > thresholds.powerOutputDrop) {
        score += 0.3;
      }
    }

    if (sessionData.technicalEfficiency && baselineData.technicalEfficiency) {
      const efficiencyDrop = (baselineData.technicalEfficiency - sessionData.technicalEfficiency) / baselineData.technicalEfficiency;
      if (efficiencyDrop > thresholds.technicalEfficiencyDrop) {
        score += 0.3;
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Determine intervention level based on composite score
   */
  determineInterventionLevel(compositeScore) {
    const thresholds = this.interventionThresholds.interventionLevels;
    
    if (compositeScore >= thresholds.critical) {
      return 'CRITICAL';
    } else if (compositeScore >= thresholds.advisory) {
      return 'ADVISORY';
    } else if (compositeScore >= thresholds.monitoring) {
      return 'MONITORING';
    } else {
      return 'NORMAL';
    }
  }

  /**
   * Generate personalized recommendations based on intervention level
   */
  generateRecommendations(interventionLevel, componentScores) {
    const recommendations = [];

    switch (interventionLevel) {
      case 'CRITICAL':
        recommendations.push({
          priority: 'IMMEDIATE',
          type: 'TRAINING_MODIFICATION',
          message: 'Critical fatigue detected. Deload or take an active recovery day.',
          action: 'auto_deload'
        });
        recommendations.push({
          priority: 'HIGH',
          type: 'RECOVERY_FOCUS',
          message: 'Prioritize recovery: 8+ hours sleep, hydration, and nutritional surplus.',
          action: 'recovery_protocol'
        });
        break;

      case 'ADVISORY':
        recommendations.push({
          priority: 'MEDIUM',
          type: 'VOLUME_ADJUSTMENT',
          message: 'Reduce training volume by 20-30% for the next session.',
          action: 'volume_reduction'
        });
        if (componentScores.rpeVelocityGap > 0.5) {
          recommendations.push({
            priority: 'MEDIUM',
            type: 'CNS_RECOVERY',
            message: 'Elevated perceived exertion. Focus on bar speed and technique crispness.',
            action: 'technique_focus'
          });
        }
        break;

      case 'MONITORING':
        recommendations.push({
          priority: 'LOW',
          type: 'OBSERVATION',
          message: 'Biometric markers stable. Continue programmed progression.',
          action: 'monitor'
        });
        break;
    }

    return recommendations;
  }

  /**
   * Generate specific alerts for critical indicators
   */
  generateAlerts(scores, interventionLevel) {
    const alerts = [];

    if (scores.rpeVelocityGap > 0.7) {
      alerts.push({
        type: 'CNS_FATIGUE',
        severity: 'HIGH',
        message: 'CNS fatigue detected: RPE elevated despite maintained bar velocity',
        indicator: 'rpe_velocity_gap'
      });
    }

    if (scores.biometricStress > 0.8) {
      alerts.push({
        type: 'BIOLOGICAL_STRESS',
        severity: 'CRITICAL',
        message: 'Elevated autonomic stress: HRV depressed / resting HR elevated',
        indicator: 'biometric_stress'
      });
    }

    if (scores.performanceDegradation > 0.7) {
      alerts.push({
        type: 'POWER_LOSS',
        severity: 'HIGH',
        message: 'Concentric velocity drop exceeds allowable threshold (>8%)',
        indicator: 'velocity_loss'
      });
    }

    return alerts;
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + (val * index), 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }
}

module.exports = SentimentInterventionEngine;
