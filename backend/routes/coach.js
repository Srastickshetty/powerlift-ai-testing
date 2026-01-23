const express = require("express");
const router = express.Router();
const {
  getCoachDashboard,
} = require("../controllers/coachController");

router.get("/dashboard", getCoachDashboard);

module.exports = router;
