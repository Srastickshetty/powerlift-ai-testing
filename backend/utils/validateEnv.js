/**
 * backend/utils/validateEnv.js
 * Validates required environment variables at server boot per P0 Security.
 */

function validateEnv() {
  const isProduction = process.env.NODE_ENV === "production";
  const warnings = [];
  const errors = [];

  // Check CORS allowlist
  if (!process.env.ALLOWED_ORIGINS) {
    if (isProduction) {
      errors.push("ALLOWED_ORIGINS is required in production (comma-separated list of allowed origins).");
    } else {
      warnings.push("ALLOWED_ORIGINS not set. Defaulting to local dev and Vercel frontend.");
    }
  }

  // Check Firebase credentials
  const hasEnvCreds = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;
  const hasJsonCreds = !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const fs = require("fs");
  const path = require("path");
  const hasLocalFile = fs.existsSync(path.join(__dirname, "../firebaseServiceAccount.json"));

  if (!hasEnvCreds && !hasJsonCreds && !hasLocalFile) {
    if (isProduction) {
      errors.push("Missing Firebase Admin credentials! Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, or FIREBASE_SERVICE_ACCOUNT_JSON.");
    } else {
      warnings.push("Missing Firebase credentials. Server running with fallback test mode.");
    }
  }

  // Check AI keys
  if (!process.env.GROQ_API_KEY && !process.env.GOOGLE_AI_API_KEY) {
    warnings.push("Neither GROQ_API_KEY nor GOOGLE_AI_API_KEY is configured. AI generation will use sports science rule-based fallbacks.");
  }

  // Output results
  if (warnings.length > 0) {
    console.warn("⚠️  [ENV CONFIGURATION WARNINGS]:\n" + warnings.map(w => `   - ${w}`).join("\n"));
  }

  if (errors.length > 0) {
    console.error("🛑 [CRITICAL ENV VALIDATION ERRORS]:\n" + errors.map(e => `   - ${e}`).join("\n"));
    if (isProduction) {
      throw new Error("Fatal: Missing critical production environment configuration.");
    }
  }

  console.log("🔒 Environment validation passed.");
}

module.exports = { validateEnv };
