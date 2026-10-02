// backend/firebaseAdmin.js
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

let credential = null;

// 1. Check direct environment variables
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  credential = admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  });
}
// 2. Check JSON string in environment
else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    credential = admin.credential.cert(parsed);
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", err.message);
  }
}
// 3. Check local JSON file (development only, excluded from git)
else {
  const localAccountPath = path.join(__dirname, "firebaseServiceAccount.json");
  if (fs.existsSync(localAccountPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(localAccountPath, "utf8"));
      credential = admin.credential.cert(serviceAccount);
    } catch (fileErr) {
      console.warn("Could not read local firebaseServiceAccount.json:", fileErr.message);
    }
  }
}

// 4. Initialize Firebase Admin
if (!admin.apps.length) {
  if (credential) {
    admin.initializeApp({
      credential,
      firestore: {
        ignoreUndefinedProperties: true
      }
    });
    console.log("🔥 Firebase Admin SDK initialized successfully.");
  } else {
    console.warn("⚠️ Firebase Admin credentials not found. Initializing in test fallback mode.");
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "powerlift-ai-dev",
      firestore: {
        ignoreUndefinedProperties: true
      }
    });
  }
}

// 5. Initialize Firestore instance
let db = null;
try {
  db = admin.firestore();
  db.settings({
    ignoreUndefinedProperties: true,
  });
} catch (e) {
  console.warn("Firestore not available:", e.message);
}

module.exports = {
  admin,
  db,
};