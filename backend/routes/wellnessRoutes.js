const express = require('express');
const router = express.Router();
const wellnessController = require('../controllers/wellnessController');

// GET all wellness data for an athlete
router.get('/', wellnessController.getWellnessData);

// SLEEP TRACKING
router.post('/sleep', wellnessController.logSleep);

// MOTIVATION TRACKING
router.post('/motivation', wellnessController.logMotivation);

// RECOVERY TRACKING
router.post('/recovery', wellnessController.logRecovery);

// WELLNESS SUMMARY
router.get('/summary', wellnessController.getWellnessSummary);

// DELETE WELLNESS DATA
router.delete('/', wellnessController.deleteWellnessData);

module.exports = router;
