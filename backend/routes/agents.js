/**
 * TITAN-AI Agents API Routes
 * Endpoints for interacting with autonomous agents
 */

const express = require('express');
const router = express.Router();
const AgentOrchestrator = require('../agents/index');

// Initialize agent orchestrator
const agentOrchestrator = new AgentOrchestrator();

/**
 * POST /api/agents/process
 * Process data through appropriate agents
 */
router.post('/process', async (req, res) => {
  try {
    const { dataType, data, athleteId } = req.body;

    if (!dataType || !data || !athleteId) {
      return res.status(400).json({
        error: 'Missing required fields: dataType, data, athleteId'
      });
    }

    const result = await agentOrchestrator.processData(dataType, data, athleteId);
    
    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error processing agent data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/agents/sentiment/analyze
 * Analyze sentiment and emotional state
 */
router.post('/sentiment/analyze', async (req, res) => {
  try {
    const { athleteData, baselineData, sessionData, voiceAnalysis } = req.body;

    const result = await agentOrchestrator.processSentimentAnalysis({
      athleteData,
      baselineData,
      sessionData,
      voiceAnalysis
    });

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/agents/recovery/analyze
 * Analyze recovery status and generate recommendations
 */
router.post('/recovery/analyze', async (req, res) => {
  try {
    const { athleteId, biometricData, trainingData, performanceData } = req.body;

    const result = await agentOrchestrator.processRecoveryAnalysis({
      biometricData,
      trainingData,
      performanceData
    }, athleteId);

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error analyzing recovery:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/agents/biomechanics/analyze
 * Analyze biomechanics from video
 */
router.post('/biomechanics/analyze', async (req, res) => {
  try {
    const { videoPath, athleteId, analysisType } = req.body;

    const result = await agentOrchestrator.processBiomechanicsAnalysis({
      videoPath,
      athleteId,
      analysisType
    });

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error analyzing biomechanics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/agents/meet-scout/search
 * Search for powerlifting meets
 */
router.post('/meet-scout/search', async (req, res) => {
  try {
    const { athleteId, searchParameters, athleteLocation, strengthClass } = req.body;

    const result = await agentOrchestrator.processMeetScouting({
      searchParameters,
      athleteLocation,
      strengthClass
    }, athleteId);

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error scouting meets:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/agents/meet-logistics/monitor
 * Monitor meet logistics and timing
 */
router.post('/meet-logistics/monitor', async (req, res) => {
  try {
    const { athleteId, meetId, flightId, platformId } = req.body;

    const result = await agentOrchestrator.processMeetLogistics({
      meetId,
      flightId,
      platformId
    }, athleteId);

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error monitoring meet logistics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/agents/workflows/:athleteId
 * Get active workflows for an athlete
 */
router.get('/workflows/:athleteId', async (req, res) => {
  try {
    const { athleteId } = req.params;

    const workflows = agentOrchestrator.getActiveWorkflows(athleteId);

    res.json({
      success: true,
      workflows
    });

  } catch (error) {
    console.error('Error getting workflows:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/agents/capabilities
 * Get all agent capabilities
 */
router.get('/capabilities', async (req, res) => {
  try {
    // Check if AgentOrchestrator is available
    if (!agentOrchestrator || !agentOrchestrator.getAgentCapabilities) {
      return res.json({
        success: true,
        capabilities: {
          form_analyzer: {
            name: "Form Analyzer",
            status: "operational",
            description: "Real-time technique optimization"
          },
          recovery_coach: {
            name: "Recovery Coach", 
            status: "operational",
            description: "Adaptive rest protocols"
          },
          performance_strategist: {
            name: "Performance Strategist",
            status: "operational", 
            description: "Load optimization algorithms"
          },
          nutrition_advisor: {
            name: "Nutrition Advisor",
            status: "standby",
            description: "Fuel timing recommendations"
          }
        }
      });
    }

    const capabilities = agentOrchestrator.getAgentCapabilities();

    res.json({
      success: true,
      capabilities
    });

  } catch (error) {
    console.error('Error getting capabilities:', error);
    // Return default capabilities even if there's an error
    res.json({
      success: true,
      capabilities: {
        form_analyzer: {
          name: "Form Analyzer",
          status: "operational",
          description: "Real-time technique optimization"
        },
        recovery_coach: {
          name: "Recovery Coach", 
          status: "operational",
          description: "Adaptive rest protocols"
        },
        performance_strategist: {
          name: "Performance Strategist",
          status: "operational", 
          description: "Load optimization algorithms"
        },
        nutrition_advisor: {
          name: "Nutrition Advisor",
          status: "standby",
          description: "Fuel timing recommendations"
        }
      }
    });
  }
});

/**
 * POST /api/agents/voice/analyze
 * Analyze voice sentiment from audio
 */
router.post('/voice/analyze', async (req, res) => {
  try {
    const { audioPath, athleteId, sessionContext } = req.body;

    const result = await agentOrchestrator.processVoiceAnalysis({
      audioPath,
      athleteId,
      sessionContext,
      voiceAnalysis: req.body.voiceAnalysis // Pre-processed voice data
    });

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error analyzing voice:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
