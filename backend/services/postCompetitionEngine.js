const { db, admin } = require("../firebaseAdmin");
const { generateProgram } = require("./ruleBasedProgramGenerator");

async function finalizeCompetition({ athleteId, newPRs }) {
  if (!athleteId) throw new Error("athleteId missing");
  if (!newPRs) throw new Error("newPRs missing");

  // 1️⃣ Get athlete
  const athleteSnap = await db
    .collection("athletes")
    .where("uid", "==", athleteId)
    .limit(1)
    .get();

  if (athleteSnap.empty) {
    throw new Error("Athlete not found");
  }

  const athleteDoc = athleteSnap.docs[0];
  const athlete = athleteDoc.data();

  // 2️⃣ Update training max with new PRs
  const updatedTrainingMax = {
    squat: newPRs.squat,
    bench: newPRs.bench,
    deadlift: newPRs.deadlift
  };

  await athleteDoc.ref.update({
    training_max: updatedTrainingMax,
    last_competition: admin.firestore.FieldValue.serverTimestamp()
  });

  // 3️⃣ Archive active program (competition block)
  const activePrograms = await db
    .collection("programs")
    .where("athlete_id", "==", athleteId)
    .where("status", "==", "active")
    .get();

  for (const doc of activePrograms.docs) {
    await doc.ref.update({ status: "archived" });
  }

  // 4️⃣ Generate new base program
  const clusterMatch = {
    cluster_id: "0",
    label: "moderate_volume_rpe",
    confidence: 0.9
  };

  const newProgram = generateProgram({
    athlete: { ...athlete, training_max: updatedTrainingMax },
    clusterMatch
  });

  const newRef = db.collection("programs").doc();

  await newRef.set({
    athlete_id: athleteId,
    name: "Post Competition Base Block",
    version: 1,
    weeks: newProgram.weeks,
    metadata: newProgram.metadata,
status: athlete.training_mode === "coach" ? "pending_coach_review" : "active",
    created_at: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    success: true,
    newProgramId: newRef.id
  };
}

module.exports = { finalizeCompetition };
