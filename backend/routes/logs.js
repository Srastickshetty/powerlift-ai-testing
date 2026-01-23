const express = require("express");
const router = express.Router();

const {
  logWorkout,
  getLogsByAthlete,
} = require("../controllers/logController");

router.post("/", logWorkout);
router.get("/", getLogsByAthlete);

module.exports = router;
