const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");
const FEATURE_FLAGS_FILE = path.join(DATA_DIR, "feature_flags.json");
const BROADCASTS_FILE = path.join(DATA_DIR, "broadcasts.json");
const WAITLIST_FILE = path.join(DATA_DIR, "coach_waitlist.json");

// Ensure default data files exist
function initAdminDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Feature Flags
  if (!fs.existsSync(FEATURE_FLAGS_FILE)) {
    const defaultFlags = {
      humanCoachMode: false, // Default false: "Coming in v2.0"
      aiProgramBrain: true,
      weeklyEvolution: true,
      backroomTimer: true,
      desiNutrition: true,
      physiqueGallery: true,
      liveLogging: true,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(FEATURE_FLAGS_FILE, JSON.stringify(defaultFlags, null, 2));
  }

  // Broadcasts
  if (!fs.existsSync(BROADCASTS_FILE)) {
    const defaultBroadcasts = {
      activeBroadcast: {
        id: "bc_init_01",
        title: "⚡ TITAN-AI v1.0 Production Platform Live!",
        message: "AI Head Coach & Sports Science Periodization Engine is active. 1-on-1 Human Coach roster is launching in v2.0.",
        urgency: "update", // 'info' | 'update' | 'warning' | 'urgent' | 'success'
        targetAudience: "all", // 'all' | 'powerlifting' | 'fitness'
        timestamp: new Date().toISOString(),
        author: "Super Admin"
      },
      history: []
    };
    fs.writeFileSync(BROADCASTS_FILE, JSON.stringify(defaultBroadcasts, null, 2));
  }

  // Coach Waitlist
  if (!fs.existsSync(WAITLIST_FILE)) {
    fs.writeFileSync(WAITLIST_FILE, JSON.stringify([], null, 2));
  }
}

initAdminDataFiles();

function readJsonFile(filePath, fallback = {}) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
  return fallback;
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
    return false;
  }
}

/**
 * GET /api/admin/overview
 * Platform pulse, counts, athlete & coach roster oversight
 */
router.get("/overview", (req, res) => {
  try {
    const flags = readJsonFile(FEATURE_FLAGS_FILE, {});
    const broadcasts = readJsonFile(BROADCASTS_FILE, {});
    const waitlist = readJsonFile(WAITLIST_FILE, []);

    // High level athletes roster
    const athletes = [
      {
        id: "ath_001",
        name: "Rahul Shetty",
        email: "rahul.shetty@gmail.com",
        pathway: "powerlifting",
        split: "Competition SBD 4-Day Wave",
        cnsReadiness: 84,
        experienceLevel: "Advanced (IPF 83kg)",
        totalTonnageKg: 28450,
        lastActive: "12 mins ago",
        status: "Optimal Progression"
      },
      {
        id: "ath_002",
        name: "Ananya Sharma",
        email: "ananya.fit@gmail.com",
        pathway: "fitness",
        split: "PPL Hypertrophy (Pure Veg)",
        cnsReadiness: 92,
        experienceLevel: "Intermediate",
        totalTonnageKg: 19200,
        lastActive: "45 mins ago",
        status: "Active / On Track"
      },
      {
        id: "ath_003",
        name: "Vikramaditya Rathore",
        email: "vikram.power@gmail.com",
        pathway: "powerlifting",
        split: "Westside Conjugate Heavy Waves",
        cnsReadiness: 66,
        experienceLevel: "Elite Competitor (93kg)",
        totalTonnageKg: 42100,
        lastActive: "2 hours ago",
        status: "High Fatigue / Deload Due"
      },
      {
        id: "ath_004",
        name: "Pooja Patel",
        email: "pooja.patel99@gmail.com",
        pathway: "fitness",
        split: "Upper/Lower Lean Recomp",
        cnsReadiness: 89,
        experienceLevel: "Beginner-Intermediate",
        totalTonnageKg: 14800,
        lastActive: "4 hours ago",
        status: "Optimal Progression"
      },
      {
        id: "ath_005",
        name: "Karan Johar Verma",
        email: "karan.lifts@outlook.com",
        pathway: "powerlifting",
        split: "Sheiko Russian Volume Wave",
        cnsReadiness: 78,
        experienceLevel: "Intermediate (74kg)",
        totalTonnageKg: 31200,
        lastActive: "Yesterday",
        status: "Active / Steady"
      }
    ];

    // High level coaches roster
    const coaches = [
      {
        id: "coach_primary",
        name: "Head Coach Admin (You)",
        email: "srastickshetty@gmail.com",
        role: "Super Admin & Head Coach",
        specialty: "IPF SBD Biomechanics & Periodization",
        athletesManaged: athletes.length,
        status: "Platform Root Authority",
        accessLevel: "Unrestricted Master Key"
      },
      {
        id: "coach_partner_01",
        name: "Arjun Mehta (Powerlifting India Lead)",
        email: "arjun@powerliftingindia.org",
        role: "Certified Coach (Pre-Registered)",
        specialty: "National Raw & Equipped Peaking",
        athletesManaged: 0,
        status: "v2.0 Roster Standby",
        accessLevel: "Pending v2.0 Activation"
      }
    ];

    const overview = {
      success: true,
      stats: {
        totalAthletes: athletes.length,
        powerliftingAthletes: athletes.filter(a => a.pathway === "powerlifting").length,
        fitnessAthletes: athletes.filter(a => a.pathway === "fitness").length,
        totalCoaches: coaches.length,
        totalTonnageKg: athletes.reduce((acc, a) => acc + (a.totalTonnageKg || 0), 0),
        activeBroadcastCount: broadcasts.activeBroadcast ? 1 : 0,
        waitlistCount: waitlist.length,
        humanCoachModeStatus: flags.humanCoachMode ? "ACTIVE (v2.0 Released)" : "RESTRICTED (Coming in v2.0)"
      },
      featureFlags: flags,
      activeBroadcast: broadcasts.activeBroadcast || null,
      athletes,
      coaches,
      waitlist
    };

    res.json(overview);
  } catch (err) {
    console.error("ADMIN_OVERVIEW_ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/feature-flags
 * Retrieve feature release flags
 */
router.get("/feature-flags", (req, res) => {
  try {
    const flags = readJsonFile(FEATURE_FLAGS_FILE, {});
    res.json({ success: true, flags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/feature-flags
 * Toggle / update platform feature flags
 */
router.post("/feature-flags", (req, res) => {
  try {
    const current = readJsonFile(FEATURE_FLAGS_FILE, {});
    const updated = {
      ...current,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    writeJsonFile(FEATURE_FLAGS_FILE, updated);
    console.log("🚩 Feature flags updated:", updated);
    res.json({ success: true, flags: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/broadcast/active
 * Publicly pollable for all logged-in users to render active global announcement
 */
router.get("/broadcast/active", (req, res) => {
  try {
    const broadcasts = readJsonFile(BROADCASTS_FILE, { activeBroadcast: null });
    res.json({ success: true, broadcast: broadcasts.activeBroadcast || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/broadcast
 * Dispatch a global broadcast to all users
 */
router.post("/broadcast", (req, res) => {
  try {
    const { title, message, urgency = "update", targetAudience = "all" } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: "Broadcast requires both title and message." });
    }

    const broadcasts = readJsonFile(BROADCASTS_FILE, { activeBroadcast: null, history: [] });

    // Archive previous active broadcast
    if (broadcasts.activeBroadcast) {
      broadcasts.history = broadcasts.history || [];
      broadcasts.history.unshift(broadcasts.activeBroadcast);
      broadcasts.history = broadcasts.history.slice(0, 20); // keep last 20
    }

    const newBroadcast = {
      id: `bc_${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      urgency, // 'info' | 'update' | 'warning' | 'urgent' | 'success'
      targetAudience, // 'all' | 'powerlifting' | 'fitness'
      timestamp: new Date().toISOString(),
      author: "Super Admin"
    };

    broadcasts.activeBroadcast = newBroadcast;
    writeJsonFile(BROADCASTS_FILE, broadcasts);

    console.log(`📢 GLOBAL BROADCAST DISPATCHED: [${urgency.toUpperCase()}] ${title}`);
    res.json({ success: true, broadcast: newBroadcast });
  } catch (err) {
    console.error("ADMIN_BROADCAST_ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/admin/broadcast/active
 * Retract / clear active broadcast
 */
router.delete("/broadcast/active", (req, res) => {
  try {
    const broadcasts = readJsonFile(BROADCASTS_FILE, { activeBroadcast: null, history: [] });
    if (broadcasts.activeBroadcast) {
      broadcasts.history = broadcasts.history || [];
      broadcasts.history.unshift(broadcasts.activeBroadcast);
    }
    broadcasts.activeBroadcast = null;
    writeJsonFile(BROADCASTS_FILE, broadcasts);
    res.json({ success: true, message: "Active broadcast retracted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/coach-waitlist
 * Athletes request human coach pairing -> joins waitlist
 */
router.post("/coach-waitlist", (req, res) => {
  try {
    const { athleteId, athleteName, email, pathway, notes } = req.body;
    const waitlist = readJsonFile(WAITLIST_FILE, []);

    const existingIdx = waitlist.findIndex(w => w.athleteId === athleteId || (email && w.email === email));
    const entry = {
      athleteId: athleteId || "anonymous",
      athleteName: athleteName || "Lifter",
      email: email || "Not provided",
      pathway: pathway || "powerlifting",
      notes: notes || "Requested 1-on-1 human coaching",
      requestedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      waitlist[existingIdx] = entry;
    } else {
      waitlist.unshift(entry);
    }

    writeJsonFile(WAITLIST_FILE, waitlist);
    res.json({ success: true, message: "Added to v2.0 Coach Early Access Waitlist!", entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/coach-waitlist
 * View athletes on the waitlist
 */
router.get("/coach-waitlist", (req, res) => {
  try {
    const waitlist = readJsonFile(WAITLIST_FILE, []);
    res.json({ success: true, count: waitlist.length, waitlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
