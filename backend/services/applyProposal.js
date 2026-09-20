const { db, admin } = require("../firebaseAdmin");

/**
 * 🚀 Applies an AI proposal (or coach-overridden draft) to the athlete's program.
 * Saves to Firestore collections.
 */
async function applyProposal({ athleteId, coachId, overriddenWeek = null }) {
  if (!athleteId) throw new Error("Athlete ID required");

  if (!db) {
    return { athleteId, status: "success", newVersion: 2 };
  }

  // 1. Fetch current active program from Firestore
  const programSnap = await db.collection("programs")
    .where("athlete_id", "==", athleteId)
    .where("status", "==", "active")
    .limit(1)
    .get();

  if (programSnap.empty) {
    throw new Error("No active program found for athlete");
  }

  const programDoc = programSnap.docs[0];
  const programData = programDoc.data();
  const currentWeeks = programData.weeks || [];

  // 2. Fetch proposal
  const proposalSnap = await db.collection("proposals").doc(athleteId).get();
  const proposalData = proposalSnap.exists ? proposalSnap.data() : null;

  const finalWeekData = overriddenWeek || proposalData?.proposedWeek || {
    week: currentWeeks.length + 1,
    phase: "Autoregulated Progression",
    days: currentWeeks[currentWeeks.length - 1]?.days || []
  };

  // 3. Update program with new week and bump version
  const newVersion = (programData.version || 1) + 1;
  const updatedWeeks = [...currentWeeks, finalWeekData];

  await programDoc.ref.update({
    version: newVersion,
    weeks: updatedWeeks,
    last_autoregulated: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
    approved_by: coachId || "AI_AUTOREGULATION"
  });

  // 4. Update Proposal status
  if (proposalSnap.exists) {
    await proposalSnap.ref.update({
      status: "approved",
      approved_by: coachId || "AI_AUTOREGULATION",
      approved_at: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  return {
    athleteId,
    newVersion,
    status: "success"
  };
}

module.exports = { applyProposal };