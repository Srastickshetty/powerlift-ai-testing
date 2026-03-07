/**
 * TITAN-AI Sentiment-Trigger Logic for Proactive Emotional Support
 * Calculates Intervention Score using Biometric + Velocity data
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

    this.voiceSentimentWeights = {
      pitchVariability: 0.25,
      speechRate: 0.20,
      jitter: 0.25,
      shimmer: 0.15,
      energyLevel: 0.15
    };
  }

  /**
   * Calculate comprehensive Intervention Score
   * @param {Object} athleteData - Current athlete biometric and performance data
   * @param {Object} baselineData - Athlete's baseline measurements
   * @param {Object} sessionData - Current training session data
   * @param {Object} voiceAnalysis - Optional voice sentiment analysis
   * @returns {Object} Intervention assessment with recommendations
   */
  calculateInterventionScore(athleteData, baselineData, sessionData, voiceAnalysis = null) {
    const scores = {
      rpeVelocityGap: this.calculateRPEVelocityGap(sessionData),
      biometricStress: this.calculateBiometricStress(athleteData, baselineData),
      performanceDegradation: this.calculatePerformanceDegradation(sessionData, baselineData),
      voiceSentiment: voiceAnalysis ? this.calculateVoiceSentiment(voiceAnalysis) : 0
    };

    // Weighted composite score
    const weights = {
      rpeVelocityGap: 0.30,
      biometricStress: 0.35,
      performanceDegradation: 0.25,
      voiceSentiment: voiceAnalysis ? 0.10 : 0
    };

    const compositeScore = Object.entries(scores).reduce((total, [key, score]) => {
      return total + (score * weights[key]);
    }, 0);

    const interventionLevel = this.determineInterventionLevel(compositeScore);
    const recommendations = this.generateRecommendations(interventionLevel, scores);

    return {
      compositeScore: Math.round(compositeScore * 100) / 100,
      interventionLevel,
      componentScores: scores,
      recommendations,
      timestamp: new Date().toISOString(),
      alerts: this.generateAlerts(scores, interventionLevel)
    };
  }

  /**
   * Calculate RPE-Velocity Gap Score
   * Detects when velocity is high but RPE is also high (mental fatigue indicator)
   */
  calculateRPEVelocityGap(sessionData) {
    const { currentRPE, currentVelocity, targetVelocity, recentSessions } = sessionData;
    const thresholds = this.interventionThresholds.rpeVelocityGap;

    let score = 0;

    // High RPE with good/velocity indicates mental fatigue
    if (currentRPE >= thresholds.highRpe) {
      if (currentVelocity > targetVelocity * thresholds.velocityTargetMultiplier) {
        score += 0.7; // Strong indicator of mental fatigue
      } else if (currentVelocity > targetVelocity) {
        score += 0.4; // Moderate indicator
      }
    }

    // Check for RPE trend over recent sessions
    if (recentSessions && recentSessions.length >= 3) {
      const rpeTrend = this.calculateTrend(recentSessions.map(s => s.rpe));
      if (rpeTrend > 0.3) { // Increasing RPE trend
        score += 0.3;
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate Biometric Stress Score
   * Analyzes HRV, resting HR, sleep quality, and cumulative fatigue
   */
  calculateBiometricStress(athleteData, baselineData) {
    const thresholds = this.interventionThresholds.biometricStress;
    let score = 0;

    // HRV Analysis
    const hrvRatio = athleteData.hrv / baselineData.hrv;
    if (hrvRatio < thresholds.hrvCritical) {
      score += 0.4;
    } else if (hrvRatio < 0.9) {
      score += 0.2;
    }

    // Resting Heart Rate Analysis
    const restingHRRatio = athleteData.restingHR / baselineData.restingHR;
    if (restingHRRatio > thresholds.restingHRElevation) {
      score += 0.3;
    }

    // Sleep Quality Analysis
    if (athleteData.sleepQuality < thresholds.sleepQualityThreshold) {
      score += 0.2;
    }

    // Cumulative Fatigue Score
    if (athleteData.cumulativeFatigue > thresholds.cumulativeFatigueScore) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate Performance Degradation Score
   * Analyzes velocity, power output, and technical efficiency drops
   */
  calculatePerformanceDegradation(sessionData, baselineData) {
    const thresholds = this.interventionThresholds.performanceDrop;
    let score = 0;

    // Velocity Drop Analysis
    const velocityDrop = (baselineData.avgVelocity - sessionData.currentVelocity) / baselineData.avgVelocity;
    if (velocityDrop > thresholds.velocityDropThreshold) {
      score += 0.4;
    }

    // Power Output Drop Analysis
    if (sessionData.currentPower && baselineData.avgPower) {
      const powerDrop = (baselineData.avgPower - sessionData.currentPower) / baselineData.avgPower;
      if (powerDrop > thresholds.powerOutputDrop) {
        score += 0.3;
      }
    }

    // Technical Efficiency Drop (if available)
    if (sessionData.technicalEfficiency && baselineData.technicalEfficiency) {
      const efficiencyDrop = (baselineData.technicalEfficiency - sessionData.technicalEfficiency) / baselineData.technicalEfficiency;
      if (efficiencyDrop > thresholds.technicalEfficiencyDrop) {
        score += 0.3;
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate Voice Sentiment Score
   * Analyzes vocal patterns for stress and anxiety indicators
   */
  calculateVoiceSentiment(voiceAnalysis) {
    const { pitchVariability, speechRate, jitter, shimmer, energyLevel } = voiceAnalysis;
    let score = 0;

    // High pitch variability indicates stress/anxiety
    if (pitchVariability > 0.7) {
      score += 0.25 * this.voiceSentimentWeights.pitchVariability;
    }

    // Rapid speech rate can indicate anxiety
    if (speechRate > 0.8) {
      score += 0.2 * this.voiceSentimentWeights.speechRate;
    }

    // High jitter indicates vocal tension
    if (jitter > 0.6) {
      score += 0.3 * this.voiceSentimentWeights.jitter;
    }

    // High shimmer indicates vocal instability
    if (shimmer > 0.5) {
      score += 0.25 * this.voiceSentimentWeights.shimmer;
    }

    // Low energy level can indicate fatigue
    if (energyLevel < 0.3) {
      score += 0.2 * this.voiceSentimentWeights.energyLevel;
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
          message: 'Immediate training modification required. Consider deload or rest day.',
          action: 'auto_deload'
        });
        recommendations.push({
          priority: 'HIGH',
          type: 'RECOVERY_FOCUS',
          message: 'Prioritize recovery: 8+ hours sleep, active recovery, stress management.',
          action: 'recovery_protocol'
        });
        break;

      case 'ADVISORY':
        recommendations.push({
          priority: 'MEDIUM',
          type: 'VOLUME_ADJUSTMENT',
          message: 'Reduce training volume by 20-30% for next session.',
          action: 'volume_reduction'
        });
        if (componentScores.rpeVelocityGap > 0.5) {
          recommendations.push({
            priority: 'MEDIUM',
            type: 'MENTAL_RECOVERY',
            message: 'Mental fatigue detected. Consider meditation or light cardio.',
            action: 'mental_recovery'
          });
        }
        break;

      case 'MONITORING':
        recommendations.push({
          priority: 'LOW',
          type: 'OBSERVATION',
          message: 'Continue monitoring biometric markers and performance trends.',
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
        type: 'MENTAL_FATIGUE',
        severity: 'HIGH',
        message: 'High mental fatigue detected: RPE elevated despite good velocity',
        indicator: 'rpe_velocity_gap'
      });
    }

    if (scores.biometricStress > 0.8) {
      alerts.push({
        type: 'BIOLOGICAL_STRESS',
        severity: 'CRITICAL',
        message: 'Critical biometric stress: HRV and resting HR indicators elevated',
        indicator: 'biometric_stress'
      });
    }

    if (scores.voiceSentiment > 0.6) {
      alerts.push({
        type: 'VOCAL_STRESS',
        severity: 'MEDIUM',
        message: 'Vocal analysis indicates elevated stress or anxiety',
        indicator: 'voice_sentiment'
      });
    }

    return alerts;
  }

  /**
   * Utility function to calculate trend from array of values
   */
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
