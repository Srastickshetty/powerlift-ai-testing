/**
 * resetAndSeedDatabase.js
 * Purges all sample/test data and seeds exactly 2 clean production accounts:
 * 1. Admin: admin@titan-ai.in / AdminPassword@2026
 * 2. Coach: coach@titan-ai.in / CoachPassword@2026
 */

const fs = require('fs');
const path = require('path');
const { admin, db } = require('../firebaseAdmin');

async function main() {
  console.log("🧹 [1/3] Purging local sample data files...");

  const dataDir = path.join(__dirname, '../data');
  const filesToReset = [
    { file: 'workoutLogs.json', content: '[]\n' },
    { file: 'athleteStatus.json', content: '{}\n' },
    { file: 'athlete_memories.json', content: '{}\n' },
    { file: 'coach_waitlist.json', content: '[]\n' },
    { file: 'broadcasts.json', content: '[]\n' }
  ];

  for (const { file, content } of filesToReset) {
    const target = path.join(dataDir, file);
    fs.writeFileSync(target, content, 'utf8');
    console.log(`   - Cleared ${file}`);
  }

  console.log("\n🗑️ [2/3] Cleaning dummy athletes in Firestore...");
  try {
    const athletesSnapshot = await db.collection("athletes").get();
    const testIdsToDelete = [
      "test_athlete_001", 
      "test_athlete_002", 
      "athlete_001",
      "athlete_demo",
      "coach_demo"
    ];

    for (const doc of athletesSnapshot.docs) {
      if (testIdsToDelete.includes(doc.id) || doc.id.startsWith("test_")) {
        await doc.ref.delete();
        console.log(`   - Deleted test athlete doc: ${doc.id}`);
      }
    }
  } catch (err) {
    console.warn("   - Note on Firestore cleanup:", err.message);
  }

  console.log("\n🌱 [3/3] Seeding official Admin and Coach accounts...");

  const accounts = [
    {
      uid: "titan_admin_master",
      email: "admin@titan-ai.in",
      password: "AdminPassword@2026",
      displayName: "System Administrator",
      role: "admin",
      pathway: "powerlifting"
    },
    {
      uid: "titan_coach_master",
      email: "coach@titan-ai.in",
      password: "CoachPassword@2026",
      displayName: "Head Coach Vikram Singh",
      role: "coach",
      pathway: "powerlifting"
    }
  ];

  for (const acc of accounts) {
    let authUser;
    try {
      authUser = await admin.auth().getUserByEmail(acc.email);
      await admin.auth().updateUser(authUser.uid, {
        password: acc.password,
        displayName: acc.displayName,
        emailVerified: true
      });
      console.log(`   ✅ Updated existing Firebase Auth user: ${acc.email}`);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        authUser = await admin.auth().createUser({
          uid: acc.uid,
          email: acc.email,
          password: acc.password,
          displayName: acc.displayName,
          emailVerified: true
        });
        console.log(`   ✅ Created new Firebase Auth user: ${acc.email} (UID: ${authUser.uid})`);
      } else {
        console.error(`   ❌ Auth error for ${acc.email}:`, err.message);
      }
    }

    const effectiveUid = authUser ? authUser.uid : acc.uid;

    // Save profile to Firestore
    await db.collection("athletes").doc(effectiveUid).set({
      uid: effectiveUid,
      email: acc.email,
      displayName: acc.displayName,
      name: acc.displayName,
      role: acc.role,
      profile_complete: true,
      pathway: acc.pathway,
      bodyweight: 80,
      gender: "male",
      training_mode: acc.role === "coach" ? "coach" : "self",
      coach_request_status: "none",
      training_max: {
        squat: 200,
        bench: 140,
        deadlift: 240
      },
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`   ✅ Profile synced to Firestore: ${acc.email} [Role: ${acc.role}]`);
  }

  // Also update backend/data/users.json with official UIDs
  const usersJsonPath = path.join(dataDir, 'users.json');
  const usersMapping = {
    uids: {
      "titan_admin_master": { role: "admin", email: "admin@titan-ai.in" },
      "titan_coach_master": { role: "coach", email: "coach@titan-ai.in" }
    }
  };
  fs.writeFileSync(usersJsonPath, JSON.stringify(usersMapping, null, 2), 'utf8');
  console.log("   ✅ Synced backend/data/users.json");

  console.log("\n========================================================");
  console.log("🎉 DATABASE PURGE & SEED COMPLETE");
  console.log("========================================================");
  console.log("1. ADMIN ACCOUNT:");
  console.log("   Email:    admin@titan-ai.in");
  console.log("   Password: AdminPassword@2026");
  console.log("   Target:   /admin (Admin Command Center)");
  console.log("--------------------------------------------------------");
  console.log("2. COACH ACCOUNT:");
  console.log("   Email:    coach@titan-ai.in");
  console.log("   Password: CoachPassword@2026");
  console.log("   Target:   /coach (Coach Strategy Room)");
  console.log("========================================================");
  process.exit(0);
}

main().catch(err => {
  console.error("FATAL ERROR in resetAndSeedDatabase:", err);
  process.exit(1);
});
