const express = require("express");
const router = express.Router();
const { db } = require("../firebaseAdmin");

router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const doc = await db.collection("athletes").doc(uid).get();

    if (!doc.exists) {
      return res.json(null); // new user
    }

    const data = doc.data();

    return res.json({
      uid,
      role: data.role || "client",
      ...data,
    });
  } catch (err) {
    console.error("❌ /api/users error:", err);
    return res.status(500).json(null);
  }
});

module.exports = router;
