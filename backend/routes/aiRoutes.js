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

// --- 4. COMPETITION SEARCH ROUTE ---
router.post('/search-competitions', async (req, res) => {
  try {
    const { location, federation, dateRange } = req.body;
    
    // Mock AI competition search results
    const mockCompetitions = [
      { 
        id: Date.now() + 1, 
        name: 'IPF National Championships', 
        date: '2024-06-15', 
        location: location === 'any' ? 'Denver, CO' : location, 
        federation: federation === 'any' ? 'IPF' : federation, 
        status: 'upcoming' 
      },
      { 
        id: Date.now() + 2, 
        name: 'State Powerlifting Meet', 
        date: '2024-04-20', 
        location: location === 'any' ? 'Austin, TX' : location, 
        federation: federation === 'any' ? 'USAPL' : federation, 
        status: 'upcoming' 
      },
      { 
        id: Date.now() + 3, 
        name: 'Raw Classic', 
        date: '2024-05-10', 
        location: location === 'any' ? 'Phoenix, AZ' : location, 
        federation: federation === 'any' ? 'USPA' : federation, 
        status: 'upcoming' 
      },
      { 
        id: Date.now() + 4, 
        name: 'Winter Classic', 
        date: '2023-12-15', 
        location: location === 'any' ? 'Chicago, IL' : location, 
        federation: federation === 'any' ? 'USPA' : federation, 
        status: 'completed' 
      },
      { 
        id: Date.now() + 5, 
        name: 'Summer Showdown', 
        date: '2024-08-20', 
        location: location === 'any' ? 'Miami, FL' : location, 
        federation: federation === 'any' ? 'IPF' : federation, 
        status: 'upcoming' 
      }
    ];
    
    // Filter by date range if specified
    let filteredCompetitions = mockCompetitions;
    if (dateRange === 'upcoming') {
      filteredCompetitions = mockCompetitions.filter(c => c.status === 'upcoming');
    } else if (dateRange === 'past') {
      filteredCompetitions = mockCompetitions.filter(c => c.status === 'completed');
    }
    
    // Filter by federation if specified
    if (federation !== 'any') {
      filteredCompetitions = filteredCompetitions.filter(c => c.federation === federation);
    }
    
    res.json({ 
      competitions: filteredCompetitions,
      message: `Found ${filteredCompetitions.length} competitions`
    });
  } catch (error) {
    console.error('AI competition search error:', error);
    res.status(500).json({ error: 'Failed to search competitions' });
  }
});

module.exports = router;