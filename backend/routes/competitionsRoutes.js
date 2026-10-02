const express = require('express');
const router = express.Router();
const competitionsController = require('../controllers/competitionsController');
const { requireSelfOrCoachOf } = require('../middleware/auth');

// Require ownership / approved coach on all competition operations
router.use(requireSelfOrCoachOf('athleteId'));

// GET all competition data for an athlete
router.get('/', competitionsController.getCompetitions);

// UPDATE entire competition data object
router.put('/', competitionsController.updateCompetitions);

// BUCKET LIST OPERATIONS
router.post('/bucket-list', competitionsController.addToBucketList);
router.delete('/bucket-list', competitionsController.removeFromBucketList);

// REGISTRATION OPERATIONS
router.post('/register', competitionsController.registerForCompetition);

// EQUIPMENT MANAGEMENT
router.put('/equipment', competitionsController.updateEquipmentStatus);

// NOTIFICATIONS
router.post('/notifications', competitionsController.addNotification);
router.delete('/notifications', competitionsController.clearNotifications);

// COMPETITION DAY DATA
router.put('/comp-day', competitionsController.updateCompDayData);

module.exports = router;
