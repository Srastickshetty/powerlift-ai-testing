const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
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
const indianPowerliftingRoutes = require('./routes/indianPowerliftingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ───────── PRE-START DIRECTORY CHECK ─────────
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📁 Created 'uploads' directory for video processing.");
}

// ───────── 1. SECURITY HEADERS & SERVER OBSCURITY ─────────
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: false, // Disabled to allow external Google Fonts & WebGL MediaPipe CDN assets
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// ───────── 2. RATE LIMITING & BRUTE FORCE DEFENSE ─────────
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1200, // Generous limit for high-frequency gym telemetry
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "RATE_LIMIT_EXCEEDED",
    message: "Security Protocol: Too many requests from this IP. Please slow down."
  }
});
app.use('/api', generalApiLimiter);

// Strict Rate Limiter for Authentication & AI Endpoints
const strictSecurityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 50 attempts per 15 minutes to thwart brute-force & credential stuffing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "SECURITY_LOCKOUT",
    message: "Security Notice: Rate threshold exceeded for sensitive endpoint. Try again in 15 minutes."
  }
});
app.use('/api/users/login', strictSecurityLimiter);
app.use('/api/users/register', strictSecurityLimiter);
app.use('/api/ai', strictSecurityLimiter);

// ───────── 3. SECURE CORS & ORIGIN VALIDATION ─────────
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173', 'https://powerlift-ai-frontend.vercel.app'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow local CLI/curl, mobile app wrappers, or same-origin without Origin header
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy: Request origin blocked by TITAN security.'));
  },
  credentials: true
}));

// ───────── 4. DOS DEFENSE & REQUEST SANITIZATION ─────────
// Limit body size to prevent JSON memory exhaustion / DoS
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Anti-NoSQL Injection & Prototype Pollution Sanitizer
function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('__proto__') || key === 'constructor') {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key]);
    }
  }
  return obj;
}

app.use((req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
});

// ───────── 5. REQUEST AUDIT LOGGER ─────────
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ───────── 6. ROUTES ─────────
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
app.use('/api/india', indianPowerliftingRoutes); 
app.use('/api/admin', adminRoutes); 

// ───────── 4. PRODUCTION STATIC SERVING & SYSTEM CHECK ─────────
const frontendDist = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(frontendDist, "index.html"));
  });
  console.log("📦 Serving production frontend from ../frontend/dist");
} else {
  app.get("/", (req, res) => {
    res.send("POWERLIFT_AI // BACKEND_ONLINE");
  });
}

// ───────── 7. SECURITY ERROR HANDLER & EXCEPTION SHIELD ─────────
app.use((err, req, res, next) => {
  console.error(`[SECURITY_ALERT]: Error on ${req.method} ${req.url}:`, err.message);
  res.status(err.status || 500).json({
    error: "SECURITY_FILTER_TRIGGERED",
    message: process.env.NODE_ENV === "production" 
      ? "An error occurred while processing your request securely." 
      : err.message
  });
});

// ───────── 8. START SERVER ─────────
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`[SYSTEM_READY]: Backend running on http://localhost:${PORT}`);
});