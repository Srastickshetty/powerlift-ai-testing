const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");
require('dotenv').config();
const { validateEnv } = require('./utils/validateEnv');
validateEnv();

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
const { verifyAuth, requireRole, requireAdmin } = require('./middleware/auth');

const app = express();

// ───────── PRE-START DIRECTORY CHECK ─────────
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📁 Created 'uploads' directory for video processing.");
}

// ───────── 1. SECURITY HEADERS & SERVER OBSCURITY (HELMET PWA CSP) ─────────
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com", "https://*.firebaseapp.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: [
        "'self'",
        "https://*.googleapis.com",
        "https://*.firebaseio.com",
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com",
        "https://api.groq.com",
        "https://generativelanguage.googleapis.com",
        "http://localhost:5001",
        "http://127.0.0.1:5001"
      ],
      frameSrc: ["'self'", "https://*.firebaseapp.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// ───────── 2. RATE LIMITING & BRUTE FORCE DEFENSE ─────────
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "RATE_LIMIT_EXCEEDED",
    message: "Security Protocol: Too many requests from this IP. Please slow down."
  }
});
app.use('/api', generalApiLimiter);

// Strict Rate Limiter for Authentication Endpoints
const strictSecurityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "SECURITY_LOCKOUT",
    message: "Security Notice: Rate threshold exceeded for sensitive endpoint. Try again in 15 minutes."
  }
});
app.use('/api/users/login', strictSecurityLimiter);
app.use('/api/users/register', strictSecurityLimiter);

// Rate Limiter for Cost-Sensitive AI Generation
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "AI_RATE_LIMIT",
    message: "AI synthesis rate limit reached. Please wait before generating more protocols."
  }
});
app.use('/api/ai', aiLimiter);
app.use('/api/programs/ai-generate', aiLimiter);
app.use('/api/programs/generate', aiLimiter);

// ───────── 3. SECURE CORS & ORIGIN VALIDATION (EXACT MATCH) ─────────
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : ['https://powerlift-ai-frontend.vercel.app'];

const devOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile app runtime / server-to-server)
    if (!origin) return callback(null, true);

    // Development only: permit exact local development ports
    if (process.env.NODE_ENV !== 'production' && devOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Exact allowlist match in production
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS Policy: Request origin blocked by security policy.'));
  },
  credentials: true
}));

// ───────── 4. DOS DEFENSE & REQUEST SANITIZATION (200KB LIMIT) ─────────
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true, limit: '200kb' }));

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

// ───────── 6. GLOBAL FIREBASE AUTHENTICATION (P0 SECURITY) ─────────
// Public exceptions: /api/status, /api/users/login, /api/users/register, /api/coach/public
app.use('/api', (req, res, next) => {
  const publicEndpoints = ['/status', '/users/login', '/users/register', '/coach/public'];
  if (publicEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    return next();
  }
  return verifyAuth(req, res, next);
});

// ───────── 7. ROUTES ─────────
app.use("/api/status", statusRoutes);
app.use("/api/users", userRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/post-competition", postCompetitionRoutes);
app.use('/api/ai', aiRoutes); 
app.use('/api/agents', agentsRoutes); 
app.use('/api/titan-os', titanOsRoutes); 
app.use('/api/competitions', competitionsRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/ai-conversations', aiConversationRoutes); 
app.use('/api/india', indianPowerliftingRoutes); 
app.use('/api/admin', requireAdmin, adminRoutes); 

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

// ───────── 8. START SERVER (IF RUN DIRECTLY) ─────────
const PORT = process.env.PORT || 5001;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[SYSTEM_READY]: Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;