const express = require("express");
const router = express.Router();
const { getUserProfile } = require("../controllers/userController");

router.get("/:uid", (req, res) => {
  const uid = req.params.uid;

  // TEMP: hardcode admin as coach
  if (uid === "KqI4xtQXMDOOHnBpSclQ4D4hQrH3") {
    return res.json({
      role: "coach",
      athlete_id: null,
    });
  }

  // client user
  return res.json({
    role: "client",
    athlete_id: "athlete_001",
  });
});


module.exports = router;
