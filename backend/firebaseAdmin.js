// backend/firebaseAdmin.js

const admin = require("firebase-admin");
const path = require("path");

// 1️⃣ Define the Service account JSON path FIRST
const serviceAccount = require(path.join(
  __dirname,
  "firebaseServiceAccount.json"
));

// 2️⃣ Initialize ONCE (Check if apps exist first)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Setting firestore settings here is valid
    firestore: {
      ignoreUndefinedProperties: true
    }
  });
}

// 3️⃣ Initialize Firestore instance
const db = admin.firestore();

// ✅ SAFETY: Ignore undefined fields globally
// (Doing it here again ensures the db instance itself is configured)
db.settings({
  ignoreUndefinedProperties: true,
});

// 4️⃣ EXPORT admin AND db
module.exports = {
  admin,
  db,
};