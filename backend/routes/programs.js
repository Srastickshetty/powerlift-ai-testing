const express = require("express");
const router = express.Router();

const { getProgramByAthlete } = require("../controllers/programController");

router.get("/:athleteId", getProgramByAthlete);

module.exports = router;
