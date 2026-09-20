/**
 * TITAN-AI Autonomous Agents System
 * Central orchestrator for athletic agents
 */

const SentimentInterventionEngine = require('./sentiment/intervention-logic');
const { RecoveryCouncil } = require('./recovery/recovery-council');

class AgentOrchestrator {
  constructor() {
    this.agents = {
      sentiment: new SentimentInterventionEngine(),
      recovery: new RecoveryCouncil()
    };
    
    this.agentRegistry = new Map();
    this.activeWorkflows = new Map();
    this.initializeAgents();
  }

  /**
   * Initialize all agents and register capabilities
   */
  async initializeAgents() {
    this.agentRegistry.set('sentiment', {
      capabilities: ['emotional_support', 'fatigue_detection', 'cns_readiness'],
      triggers: ['high_rpe', 'velocity_mismatch', 'biometric_stress'],
      priority: 'high'
    });

    this.agentRegistry.set('recovery', {
      capabilities: ['nutrition_planning', 'sleep_optimization', 'training_autoregulation'],
      triggers: ['poor_sleep', 'calorie_deficit', 'performance_decline'],
      priority: 'high'
    });

    this.agentRegistry.set('meet_scout', {
      capabilities: ['meet_discovery', 'podium_prediction'],
      triggers: ['competition_prep', 'season_planning'],
      priority: 'medium'
    });

    this.agentRegistry.set('meet_logistics', {
      capabilities: ['live_scoring', 'platform_timing', 'attempt_selection'],
      triggers: ['competition_day', 'warmup_planning'],
      priority: 'critical'
    });

    this.agentRegistry.set('biomechanics', {
      capabilities: ['pose_estimation', 'moment_arm_analysis', 'power_leakage_detection', 'depth_verification'],
      triggers: ['video_analysis', 'technique_assessment'],
      priority: 'high'
    });
  }

  /**
   * Process incoming data and trigger appropriate agents
   */
  async processData(dataType, data, athleteId) {
    const workflowId = this.generateWorkflowId();
    
    try {
      const workflow = {
        id: workflowId,
        athleteId,
        dataType,
        startTime: new Date().toISOString(),
        status: 'processing',
        results: {}
      };

      this.activeWorkflows.set(workflowId, workflow);

      // Route to appropriate agents based on data type
      const agentResults = await this.routeToAgents(dataType, data, athleteId);
      
      workflow.results = agentResults;
      workflow.status = 'completed';
      workflow.endTime = new Date().toISOString();
      
      return {
        workflowId,
        status: 'completed',
        results: agentResults,
        recommendations: this.generateUnifiedRecommendations(agentResults)
      };

    } catch (error) {
      console.error(`Error in workflow ${workflowId}:`, error);
      return {
        workflowId,
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Route data to appropriate agents based on type and triggers
   */
  async routeToAgents(dataType, data, athleteId) {
    const results = {};

    switch (dataType) {
      case 'training_session':
      case 'biometric_update':
        results.sentiment = await this.processSentimentAnalysis(data);
        results.recovery = await this.processRecoveryAnalysis(data, athleteId);
        break;

      case 'video_analysis':
        results.biomechanics = await this.processBiomechanicsAnalysis(data);
        break;

      case 'competition_prep':
        results.meet_scout = await this.processMeetScouting(data, athleteId);
        break;

      case 'competition_day':
        results.meet_logistics = await this.processMeetLogistics(data, athleteId);
        break;

      default:
        console.warn(`Unknown data type: ${dataType}`);
    }

    return results;
  }

  /**
   * Process athletic sentiment and fatigue analysis
   */
  async processSentimentAnalysis(data) {
    try {
      const athleteData = data.athleteData || {};
      const baselineData = data.baselineData || {};
      const sessionData = data.sessionData || {};

      const result = this.agents.sentiment.calculateInterventionScore(
        athleteData,
        baselineData,
        sessionData
      );

      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Process recovery council analysis
   */
  async processRecoveryAnalysis(data, athleteId) {
    try {
      if (!this.agents.recovery.athleteProfile) {
        const athleteProfile = await this.getAthleteProfile(athleteId);
        await this.agents.recovery.initialize(athleteProfile);
      }

      const result = await this.agents.recovery.processDailyRecovery(
        data.biometricData || {},
        data.trainingData || {},
        data.performanceData || {}
      );

      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Process biomechanics analysis
   */
  async processBiomechanicsAnalysis(data) {
    try {
      return {
        success: true,
        data: {
          message: 'Biomechanics analysis processed',
          videoPath: data.videoPath,
          analysisType: data.analysisType || 'full_biomechanics'
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Process meet scouting
   */
  async processMeetScouting(data, athleteId) {
    try {
      return {
        success: true,
        data: {
          message: 'Meet scouting initiated',
          searchParameters: data.searchParameters,
          athleteLocation: data.athleteLocation,
          strengthClass: data.strengthClass
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Process meet logistics
   */
  async processMeetLogistics(data, athleteId) {
    try {
      return {
        success: true,
        data: {
          message: 'Meet logistics monitoring active',
          meetId: data.meetId,
          flightId: data.flightId,
          platformTiming: 'real_time'
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate unified recommendations from all agent results
   */
  generateUnifiedRecommendations(agentResults) {
    const recommendations = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      lifestyle: []
    };

    if (agentResults.sentiment && agentResults.sentiment.success) {
      const sentimentRecs = agentResults.sentiment.data.recommendations || [];
      for (const rec of sentimentRecs) {
        this.categorizeRecommendation(rec, recommendations, 'readiness');
      }
    }

    if (agentResults.recovery && agentResults.recovery.success) {
      const recoveryRecs = agentResults.recovery.data.recommendations || {};
      for (const [category, recs] of Object.entries(recoveryRecs)) {
        for (const rec of recs) {
          this.categorizeRecommendation(rec, recommendations, category);
        }
      }
    }

    return recommendations;
  }

  categorizeRecommendation(recommendation, recommendations, category = 'general') {
    const priority = (recommendation.priority || 'medium').toLowerCase();
    
    const rec = {
      ...recommendation,
      category,
      timestamp: new Date().toISOString()
    };

    switch (priority) {
      case 'critical':
      case 'immediate':
        recommendations.critical.push(rec);
        break;
      case 'high':
      case 'required':
        recommendations.high.push(rec);
        break;
      case 'medium':
        recommendations.medium.push(rec);
        break;
      case 'low':
      case 'optional':
      default:
        recommendations.low.push(rec);
        break;
    }

    if (category === 'lifestyle') {
      recommendations.lifestyle.push(rec);
    }
  }

  generateWorkflowId() {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getAthleteProfile(athleteId) {
    try {
      const { db } = require('../firebaseAdmin');
      if (db) {
        const doc = await db.collection('athletes').doc(athleteId).get();
        if (doc.exists) return doc.data();
      }
    } catch (err) {
      console.warn("Athlete profile lookup fallback:", err.message);
    }
    return {
      id: athleteId,
      weight: 83,
      height: 175,
      age: 26,
      gender: 'male',
      hrvBaseline: 75,
      restingHRBaseline: 58
    };
  }

  getActiveWorkflows(athleteId) {
    const workflows = [];
    for (const [id, workflow] of this.activeWorkflows.entries()) {
      if (workflow.athleteId === athleteId) {
        workflows.push(workflow);
      }
    }
    return workflows;
  }

  getAgentCapabilities() {
    const capabilities = {};
    for (const [agentName, agentInfo] of this.agentRegistry.entries()) {
      capabilities[agentName] = {
        capabilities: agentInfo.capabilities,
        triggers: agentInfo.triggers,
        priority: agentInfo.priority
      };
    }
    return capabilities;
  }
}

module.exports = AgentOrchestrator;
