const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getCoachingAdvice, analyzeLiftingVideo } = require('../services/aiService');

// --- 1. MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

// --- 2. TEXT CHAT ROUTE ---
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    console.log(`[AI_CHAT]: Calling service...`);
    const reply = await getCoachingAdvice(message);
    res.json({ reply });
  } catch (error) {
    console.error("❌ ROUTE ERROR (Chat):", error.message);
    res.status(500).json({ 
      error: "Coach AI is unavailable.", 
      details: error.message 
    });
  }
});

// --- 3. VIDEO ANALYSIS ROUTE ---
router.post('/analyze-video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No video uploaded." });

    console.log(`[AI_VIDEO]: Analyzing ${req.file.filename}...`);
    const feedback = await analyzeLiftingVideo(req.file.path);
    
    res.json({ feedback });
  } catch (error) {
    console.error("❌ ROUTE ERROR (Video):", error.message);
    res.status(500).json({ 
      error: "Form Analysis Failed", 
      details: error.message 
    });
  }
});

module.exports = router;