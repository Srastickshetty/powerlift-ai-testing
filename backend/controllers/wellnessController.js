const { db } = require('../firebaseAdmin');

// WELLNESS COLLECTION STRUCTURE:
// wellness/{athleteId}/
//   - sleep: []
//   - motivation: []
//   - recovery: []

exports.getWellnessData = async (req, res) => {
  try {
    const { athleteId } = req.query;
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });

    const doc = await db.collection('wellness').doc(athleteId).get();
    
    if (!doc.exists) {
      return res.json({
        sleep: [],
        motivation: [],
        recovery: []
      });
    }

    res.json(doc.data());
  } catch (error) {
    console.error('Error getting wellness data:', error);
    res.status(500).json({ error: 'Failed to fetch wellness data' });
  }
};

exports.logSleep = async (req, res) => {
  try {
    const { athleteId } = req.query;
    const { date, hours, quality, notes } = req.body;
    
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });
    if (!date || !hours) return res.status(400).json({ error: "Date and hours required" });

    const docRef = db.collection('wellness').doc(athleteId);
    const doc = await docRef.get();
    
    let sleep = [];
    if (doc.exists) {
      sleep = doc.data().sleep || [];
    }

    // Check if sleep data for this date already exists
    const existingIndex = sleep.findIndex(s => s.date === date);
    const sleepEntry = {
      date,
      hours: parseFloat(hours),
      quality: quality || 'good', // 'poor', 'fair', 'good', 'excellent'
      notes: notes || '',
      timestamp: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      sleep[existingIndex] = sleepEntry;
    } else {
      sleep.push(sleepEntry);
    }

    // Keep only last 90 days of sleep data
    sleep = sleep.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 90);

    await docRef.set({ sleep }, { merge: true });
    
    res.json({ success: true, message: "Sleep data logged", sleep });
  } catch (error) {
    console.error('Error logging sleep:', error);
    res.status(500).json({ error: 'Failed to log sleep data' });
  }
};

exports.logMotivation = async (req, res) => {
  try {
    const { athleteId } = req.query;
    const { level, notes, context } = req.body;
    
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });
    if (level === undefined || level < 1 || level > 10) {
      return res.status(400).json({ error: "Motivation level must be between 1-10" });
    }

    const docRef = db.collection('wellness').doc(athleteId);
    const doc = await docRef.get();
    
    let motivation = [];
    if (doc.exists) {
      motivation = doc.data().motivation || [];
    }

    const motivationEntry = {
      level: parseInt(level),
      date: new Date().toISOString().split('T')[0], // Today's date
      notes: notes || '',
      context: context || 'general', // 'pre-workout', 'post-workout', 'general', 'competition'
      timestamp: new Date().toISOString()
    };

    motivation.push(motivationEntry);

    // Keep only last 30 days of motivation data
    motivation = motivation.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 30);

    await docRef.set({ motivation }, { merge: true });
    
    res.json({ success: true, message: "Motivation level logged", motivation });
  } catch (error) {
    console.error('Error logging motivation:', error);
    res.status(500).json({ error: 'Failed to log motivation level' });
  }
};

exports.logRecovery = async (req, res) => {
  try {
    const { athleteId } = req.query;
    const { muscleSoreness, fatigue, stress, sleepQuality, overallRecovery, notes } = req.body;
    
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });

    const docRef = db.collection('wellness').doc(athleteId);
    const doc = await docRef.get();
    
    let recovery = [];
    if (doc.exists) {
      recovery = doc.data().recovery || [];
    }

    const recoveryEntry = {
      date: new Date().toISOString().split('T')[0],
      muscleSoreness: muscleSoreness || 5, // 1-10 scale
      fatigue: fatigue || 5, // 1-10 scale
      stress: stress || 5, // 1-10 scale
      sleepQuality: sleepQuality || 5, // 1-10 scale
      overallRecovery: overallRecovery || 5, // 1-10 scale
      notes: notes || '',
      timestamp: new Date().toISOString()
    };

    recovery.push(recoveryEntry);

    // Keep only last 30 days of recovery data
    recovery = recovery.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 30);

    await docRef.set({ recovery }, { merge: true });
    
    res.json({ success: true, message: "Recovery data logged", recovery });
  } catch (error) {
    console.error('Error logging recovery:', error);
    res.status(500).json({ error: 'Failed to log recovery data' });
  }
};

exports.getWellnessSummary = async (req, res) => {
  try {
    const { athleteId, days = 7 } = req.query;
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });

    const doc = await db.collection('wellness').doc(athleteId).get();
    
    if (!doc.exists) {
      return res.json({
        avgSleep: 0,
        avgMotivation: 0,
        avgRecovery: 0,
        dataPoints: 0
      });
    }

    const data = doc.data();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const recentSleep = (data.sleep || []).filter(s => new Date(s.date) >= cutoffDate);
    const recentMotivation = (data.motivation || []).filter(m => new Date(m.date) >= cutoffDate);
    const recentRecovery = (data.recovery || []).filter(r => new Date(r.date) >= cutoffDate);

    const avgSleep = recentSleep.length > 0 
      ? recentSleep.reduce((sum, s) => sum + s.hours, 0) / recentSleep.length 
      : 0;

    const avgMotivation = recentMotivation.length > 0 
      ? recentMotivation.reduce((sum, m) => sum + m.level, 0) / recentMotivation.length 
      : 0;

    const avgRecovery = recentRecovery.length > 0 
      ? recentRecovery.reduce((sum, r) => sum + r.overallRecovery, 0) / recentRecovery.length 
      : 0;

    res.json({
      avgSleep: Math.round(avgSleep * 10) / 10,
      avgMotivation: Math.round(avgMotivation * 10) / 10,
      avgRecovery: Math.round(avgRecovery * 10) / 10,
      dataPoints: Math.max(recentSleep.length, recentMotivation.length, recentRecovery.length),
      sleepQuality: recentSleep.length > 0 ? recentSleep[recentSleep.length - 1].quality : 'no_data'
    });
  } catch (error) {
    console.error('Error getting wellness summary:', error);
    res.status(500).json({ error: 'Failed to get wellness summary' });
  }
};

exports.deleteWellnessData = async (req, res) => {
  try {
    const { athleteId, type, date } = req.query;
    
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });
    if (!type) return res.status(400).json({ error: "Type required (sleep/motivation/recovery)" });

    const docRef = db.collection('wellness').doc(athleteId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: "No wellness data found" });
    }

    const data = doc.data();
    let updatedData = {};

    if (type === 'sleep' && data.sleep) {
      updatedData.sleep = data.sleep.filter(s => s.date !== date);
    } else if (type === 'motivation' && data.motivation) {
      updatedData.motivation = data.motivation.filter(m => m.date !== date);
    } else if (type === 'recovery' && data.recovery) {
      updatedData.recovery = data.recovery.filter(r => r.date !== date);
    }

    await docRef.set(updatedData, { merge: true });
    
    res.json({ success: true, message: `${type} data deleted` });
  } catch (error) {
    console.error('Error deleting wellness data:', error);
    res.status(500).json({ error: 'Failed to delete wellness data' });
  }
};
