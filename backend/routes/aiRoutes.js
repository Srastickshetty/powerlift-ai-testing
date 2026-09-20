const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getCoachingAdvice, analyzeLiftingVideo } = require('../services/aiService');

// Multer configuration
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
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// --- 1. TEXT CHAT ROUTE (BYOK Supported) ---
router.post('/chat', async (req, res) => {
  try {
    const { message, groqKey } = req.body;
    const userKey = req.headers['x-groq-key'] || groqKey;

    if (!message) return res.status(400).json({ error: "Message is required" });

    const reply = await getCoachingAdvice(message, userKey);
    res.json({ reply, byok: !!userKey });
  } catch (error) {
    console.error("❌ ROUTE ERROR (Chat):", error.message);
    res.status(500).json({ 
      error: "Coach AI is unavailable.", 
      details: error.message 
    });
  }
});

// --- 2. VIDEO ANALYSIS ROUTE (BYOK Supported) ---
router.post('/analyze-video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No video uploaded." });

    const exerciseType = req.body.exerciseType || 'squat';
    const userGeminiKey = req.headers['x-gemini-key'] || req.body.geminiKey;

    console.log(`[AI_VIDEO]: Analyzing ${req.file.filename} (${exerciseType})...`);
    const analysis = await analyzeLiftingVideo(req.file.path, exerciseType, userGeminiKey);
    
    res.json({ 
      success: true,
      feedback: typeof analysis === 'object' ? analysis.feedback : analysis, 
      metrics: typeof analysis === 'object' ? analysis.metrics : null,
      byok: !!userGeminiKey 
    });
  } catch (error) {
    console.error("❌ ROUTE ERROR (Video):", error.message);
    res.status(500).json({ 
      error: error.message.includes("BYOK_REQUIRED") ? "API_KEY_REQUIRED" : "Form Analysis Failed", 
      details: error.message 
    });
  }
});

// --- 3. COMPETITION SEARCH ROUTE ---
router.post('/search-competitions', async (req, res) => {
  try {
    const { location = 'any', federation = 'any', dateRange = 'upcoming' } = req.body;
    
    const mockCompetitions = [
      { id: 1, name: 'IPF National Powerlifting Championships', date: '2025-06-15', location: 'Denver, CO', federation: 'IPF', status: 'upcoming' },
      { id: 2, name: 'USAPL State Strength Classic', date: '2025-07-20', location: 'Austin, TX', federation: 'USAPL', status: 'upcoming' },
      { id: 3, name: 'USPA Raw Open', date: '2025-08-10', location: 'Phoenix, AZ', federation: 'USPA', status: 'upcoming' },
      { id: 4, name: 'WRPF Pro Invitational', date: '2025-09-14', location: 'Chicago, IL', federation: 'WRPF', status: 'upcoming' }
    ];
    
    let filtered = mockCompetitions;
    if (federation !== 'any') {
      filtered = filtered.filter(c => c.federation === federation);
    }
    
    res.json({ 
      competitions: filtered,
      message: `Found ${filtered.length} competitions`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search competitions' });
  }
});

module.exports = router;