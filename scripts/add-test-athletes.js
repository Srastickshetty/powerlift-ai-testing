const { db, admin } = require('../backend/firebaseAdmin');

const testAthletes = [
  {
    uid: "test_athlete_001",
    name: "Rahul Shetty",
    email: "rahul@test.com",
    training_mode: "coach",
    coach_id: "T37Oellg4pg5oE9HA6kWTqDIFvF2", // Your coach ID
    coach_request_status: "approved",
    status: "on_track",
    fatigue_rate: 0.2,
    miss_rate: 0.05,
    created_at: new Date(),
    metadata: {
      join_date: new Date(),
      last_active: new Date()
    }
  },
  {
    uid: "test_athlete_002", 
    name: "Sarah Johnson",
    email: "sarah@test.com",
    training_mode: "coach",
    coach_id: "T37Oellg4pg5oE9HA6kWTqDIFvF2",
    coach_request_status: "approved",
    status: "needs_attention",
    fatigue_rate: 0.4,
    miss_rate: 0.1,
    created_at: new Date(),
    metadata: {
      join_date: new Date(),
      last_active: new Date()
    }
  }
];

async function addTestAthletes() {
  try {
    console.log('Adding test athletes to Firestore...');
    
    for (const athlete of testAthletes) {
      await db.collection('athletes').doc(athlete.uid).set(athlete);
      console.log(`✅ Added athlete: ${athlete.name}`);
      
      // Also create Firebase Auth user if needed
      try {
        await admin.auth().createUser({
          uid: athlete.uid,
          email: athlete.email,
          password: 'test123456'
        });
        console.log(`✅ Created auth user for: ${athlete.email}`);
      } catch (authError) {
        if (authError.code === 'auth/uid-already-exists') {
          console.log(`⚠️ Auth user already exists for: ${athlete.email}`);
        } else {
          console.log(`❌ Auth error for ${athlete.email}:`, authError.message);
        }
      }
    }
    
    console.log('🎉 Test athletes added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding test athletes:', error);
    process.exit(1);
  }
}

addTestAthletes();
