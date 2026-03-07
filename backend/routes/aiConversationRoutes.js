const express = require('express');
const router = express.Router();
const aiConversationController = require('../controllers/aiConversationController');

// GET all AI data for an athlete
router.get('/', aiConversationController.getAiData);

// CONVERSATION MANAGEMENT
router.post('/conversations', aiConversationController.saveConversation);
router.delete('/conversations', aiConversationController.clearConversations);

// INSIGHT MANAGEMENT
router.post('/insights', aiConversationController.saveInsight);
router.put('/insights/acknowledge', aiConversationController.acknowledgeInsight);
router.put('/insights/archive', aiConversationController.archiveInsight);
router.get('/insights/stats', aiConversationController.getInsightStats);

// VOICE COMMANDS
router.post('/voice-commands', aiConversationController.saveVoiceCommand);

module.exports = router;
