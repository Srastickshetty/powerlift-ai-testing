const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { applyDeload } = require("../services/applyProgramVersion");

// 🔧 New Metric & Alert Services
const { buildProgress } = require("../services/progressService");
const { computeWeeklyLiftMetrics } = require("../services/weeklyPerformance");
const { generateCoachAlerts } = require("../services/coachAlerts");

// 🧠 Autoregulation Services
const { autoregulateNextWeek } = require("../services/applyAutoregulation");
const { applyProposal } = require("../services/applyProposal");

// Data paths
const dataDir = path.join(__dirname, "../data");
const programsPath = path.join(dataDir, "programs.json");
const logsPath = path.join(dataDir, "workoutLogs.json");
const proposalsPath = path.join(dataDir, "autoregulationProposals.json");
const athletesPath = path.join(dataDir, "athletes.json");

/**
 * 📊 GET /dashboard
 * Returns live summary of all athletes with AI-generated alerts
 */
router.get("/dashboard", (req, res) => {
  try {
    const programs = JSON.parse(fs.readFileSync(programsPath, "utf-8"));
    const logs = JSON.parse(fs.readFileSync(logsPath, "utf-8"));
    const athletes = JSON.parse(fs.readFileSync(athletesPath, "utf-8"));

    const result = Object.keys(programs).map((athleteId) => {
      const athlete = athletes.find((a) => a.athlete_id === athleteId) || {};
      const athleteLogs = Array.isArray(logs) ? logs.filter((l) => l.athlete_id === athleteId) : [];
      const lastSession = athleteLogs.length > 0 ? athleteLogs[athleteLogs.length - 1].date : null;

      // 🔁 Calculate Live Progress & Alerts
      const progress = buildProgress(athleteLogs, programs[athleteId]);

      const weeklyMetrics = ["Squat", "Bench", "Deadlift"].map((lift) =>
        computeWeeklyLiftMetrics(athleteLogs, lift)
      );

      const alerts = generateCoachAlerts({
        progress,
        weeklyMetrics,
      });

      return {
        athlete_id: athleteId,
        name: athlete.name || athleteId,
        status: progress.status || "on_track",
        fatigue_rate: athlete.fatigue_rate ?? 0,
        miss_rate: athlete.miss_rate ?? 0,
        last_session: lastSession,
        alerts, 
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🛠 GET /athlete/:athleteId/program
 * Fetches current active program
 */
router.get("/athlete/:athleteId/program", (req, res) => {
  try {
    const programs = JSON.parse(fs.readFileSync(programsPath, "utf-8"));
    const program = programs[req.params.athleteId];
    if (!program) return res.status(404).json({ error: "Program not found" });
    
    res.json(program);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch program" });
  }
});

/**
 * 1️⃣ Generate Proposal (AI Suggestion)
 */
router.post("/athlete/:athleteId/autoregulation/propose", (req, res) => {
  const { athleteId } = req.params;
  try {
    const programs = JSON.parse(fs.readFileSync(programsPath, "utf-8"));
    const logs = JSON.parse(fs.readFileSync(logsPath, "utf-8"));

    const program = programs[athleteId];
    if (!program) return res.status(404).json({ error: "Program not found" });

    const proposal = autoregulateNextWeek({
      program,
      logs: logs.filter((l) => l.athlete_id === athleteId),
      fatigueRate: program.fatigue_rate ?? 0.3,
    });

    const proposals = fs.existsSync(proposalsPath) ? JSON.parse(fs.readFileSync(proposalsPath, "utf-8")) : {};
    proposals[athleteId] = proposal;

    fs.writeFileSync(proposalsPath, JSON.stringify(proposals, null, 2));
    res.json(proposal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 💾 Save Draft (Coach Manual Edit)
 */
router.post("/athlete/:athleteId/save-draft", (req, res) => {
  try {
    const { athleteId } = req.params;
    const { proposedWeek } = req.body;

    let proposals = fs.existsSync(proposalsPath) ? JSON.parse(fs.readFileSync(proposalsPath, "utf-8")) : {};

    if (!proposals[athleteId]) {
      return res.status(404).json({ error: "No pending proposal found" });
    }

    proposals[athleteId].proposedWeek = proposedWeek;
    proposals[athleteId].lastEditedAt = new Date().toISOString();
    proposals[athleteId].isDraft = true;

    fs.writeFileSync(proposalsPath, JSON.stringify(proposals, null, 2));
    res.json({ saved: true, lastEditedAt: proposals[athleteId].lastEditedAt });
  } catch (err) {
    res.status(500).json({ error: "Failed to save draft" });
  }
});

/**
 * 2️⃣ Get Pending Proposal
 */
router.get("/athlete/:athleteId/proposal", (req, res) => {
  try {
    if (!fs.existsSync(proposalsPath)) return res.json(null);
    const proposals = JSON.parse(fs.readFileSync(proposalsPath, "utf-8"));
    res.json(proposals[req.params.athleteId] || null);
  } catch (err) {
    res.status(500).json({ error: "Failed to load proposals" });
  }
});

/**
 * 3️⃣ Approve Proposal
 */
router.post("/athlete/:athleteId/approve-proposal", (req, res) => {
  try {
    const { proposedWeek } = req.body; 

    const result = applyProposal({
      athleteId: req.params.athleteId,
      coachId: "admin",
      overriddenWeek: proposedWeek 
    });

    if (fs.existsSync(proposalsPath)) {
      const proposals = JSON.parse(fs.readFileSync(proposalsPath, "utf-8"));
      delete proposals[req.params.athleteId];
      fs.writeFileSync(proposalsPath, JSON.stringify(proposals, null, 2));
    }

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * 4️⃣ Reject Proposal
 */
router.post("/athlete/:athleteId/reject-proposal", (req, res) => {
  try {
    if (fs.existsSync(proposalsPath)) {
      const proposals = JSON.parse(fs.readFileSync(proposalsPath, "utf-8"));
      delete proposals[req.params.athleteId];
      fs.writeFileSync(proposalsPath, JSON.stringify(proposals, null, 2));
    }
    res.json({ rejected: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to reject proposal" });
  }
});
/**
 * 🔻 Apply Deload (Coach forced)
 */
router.post("/athlete/:athleteId/deload", (req, res) => {
  try {
    const { athleteId } = req.params;

    const result = applyDeload({
      athleteId,
      reason: "coach_deload",
      appliedBy: "coach",
    });

    res.json({
      success: true,
      message: "Deload applied successfully",
      newVersion: result.newVersion,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * 🟡 Apply Deload (Coach Decision)
 */
router.post("/athlete/:athleteId/deload", (req, res) => {
  try {
    const programs = JSON.parse(fs.readFileSync(programsPath, "utf-8"));
    const athleteId = req.params.athleteId;

    const program = programs[athleteId];
    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    const activeVersion =
      program.versions[program.activeVersion - 1];

    const lastWeek =
      activeVersion.program.weeks.at(-1);

    const deloadWeek = applyDeload(lastWeek);

    deloadWeek.week = lastWeek.week + 1;

    const newVersionNumber = program.versions.length + 1;

    program.versions.push({
      version: newVersionNumber,
      created_at: new Date().toISOString(),
      reason: "deload_applied",
      approved_by: "coach",
      program: {
        weeks: [...activeVersion.program.weeks, deloadWeek],
      },
    });

    program.activeVersion = newVersionNumber;

    fs.writeFileSync(programsPath, JSON.stringify(programs, null, 2));

    res.json({
      success: true,
      message: "Deload applied successfully",
      newVersion: newVersionNumber,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📜 5️⃣ Get Program History
 */
router.get("/athlete/:athleteId/program-history", (req, res) => {
  try {
    const programs = JSON.parse(fs.readFileSync(programsPath, "utf-8"));
    const program = programs[req.params.athleteId];

    if (!program || !program.versions) return res.json([]);

    const history = program.versions.map(v => ({
      version: v.version,
      created_at: v.created_at,
      reason: v.reason,
      approved_by: v.approved_by || null,
      weeks: v.program.weeks.length,
      // Added detailed metrics for the frontend deep-dive
      start_week: v.program.weeks[0]?.week || 1,
      end_week: v.program.weeks[v.program.weeks.length - 1]?.week || 1
    }));

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Failed to load history" });
  }
});

module.exports = router;