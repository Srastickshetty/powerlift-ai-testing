const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require('dotenv').config();

// ROUTE IMPORTS
const userRoutes = require("./routes/users");
const coachRoutes = require("./routes/coachRoutes");
const logRoutes = require("./routes/logs");
const programRoutes = require("./routes/programs");
const progressRoutes = require("./routes/progressRoutes");
const statusRoutes = require("./routes/status");
const postCompetitionRoutes = require("./routes/postCompetition");
const aiRoutes = require('./routes/aiRoutes'); 
const agentsRoutes = require('./routes/agents');
const titanOsRoutes = require('./routes/titan-os'); 
const competitionsRoutes = require('./routes/competitionsRoutes');
const wellnessRoutes = require('./routes/wellnessRoutes');
const aiConversationRoutes = require('./routes/aiConversationRoutes'); 

const app = express();

// ───────── PRE-START DIRECTORY CHECK ─────────
// Ensure the 'uploads' directory exists for Multer to store videos
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📁 Created 'uploads' directory for video processing.");
}

// ───────── 1. GLOBAL MIDDLEWARE ─────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json()); 

// ───────── 2. REQUEST LOGGER ─────────
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ───────── 3. ROUTES ─────────
app.use("/api/users", userRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/post-competition", postCompetitionRoutes);

// REGISTER THE AI ENDPOINT
app.use('/api/ai', aiRoutes); 

// REGISTER THE AGENTS ENDPOINT
app.use('/api/agents', agentsRoutes); 

// REGISTER THE TITAN-OS ENDPOINT
app.use('/api/titan-os', titanOsRoutes); 

// REGISTER THE NEW PERSISTENCE ENDPOINTS
app.use('/api/competitions', competitionsRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/ai-conversations', aiConversationRoutes); 

// ───────── 4. SYSTEM CHECK ─────────
app.get("/", (req, res) => {
  res.send("POWERLIFT_AI // BACKEND_ONLINE");
});

// ───────── 5. START SERVER ─────────
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`[SYSTEM_READY]: Backend running on http://localhost:${PORT}`);
});