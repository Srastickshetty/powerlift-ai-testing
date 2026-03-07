const { db } = require('../firebaseAdmin');

// COMPETITIONS COLLECTION STRUCTURE:
// competitions/{athleteId}/
//   - registered: []
//   - bucketList: []
//   - equipment: []
//   - notifications: []
//   - compDayData: {}

exports.getCompetitions = async (req, res) => {
  try {
    const { athleteId } = req.query;
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });

    const doc = await db.collection('competitions').doc(athleteId).get();
    
    if (!doc.exists) {
      // Return default structure if no data exists
      return res.json({
        registered: [],
        bucketList: [],
        equipment: [
          { id: 1, name: 'Singlet', status: 'ready', notes: '' },
          { id: 2, name: 'Knee Sleeves', status: 'ready', notes: '' },
          { id: 3, name: 'Belt', status: 'ready', notes: '' },
          { id: 4, name: 'Wrist Wraps', status: 'ready', notes: '' },
          { id: 5, name: 'Chalk', status: 'ready', notes: '' },
          { id: 6, name: 'Lifting Shoes', status: 'ready', notes: '' }
        ],
        notifications: [],
        compDayData: {
          currentLift: null,
          attempts: { squat: [], bench: [], deadlift: [] },
          warmupStatus: [],
          compStartTime: null
        }
      });
    }

    res.json(doc.data());
  } catch (error) {
    console.error('Error getting competitions:', error);
    res.status(500).json({ error: 'Failed to fetch competitions' });
  }
};

exports.updateCompetitions = async (req, res) => {
  try {
    const { athleteId } = req.query;
    const competitionData = req.body;
    
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });

    await db.collection('competitions').doc(athleteId).set(competitionData, { merge: true });
    
    res.json({ success: true, message: "Competition data updated" });
  } catch (error) {
    console.error('Error updating competitions:', error);
    res.status(500).json({ error: 'Failed to update competitions' });
  }
};

exports.addToBucketList = async (req, res) => {
  try {
    const { athleteId } = req.query;
    const competition = req.body;
    
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });
    if (!competition.id) return res.status(400).json({ error: "Competition ID required" });

    const docRef = db.collection('competitions').doc(athleteId);
    const doc = await docRef.get();
    
    let bucketList = [];
    if (doc.exists) {
      bucketList = doc.data().bucketList || [];
    }

    // Check if already exists
    if (bucketList.find(c => c.id === competition.id)) {
      return res.status(400).json({ error: "Competition already in bucket list" });
    }

    bucketList.push({
      ...competition,
      addedDate: new Date().toISOString()
    });

    await docRef.set({ bucketList }, { merge: true });
    
    res.json({ success: true, message: "Added to bucket list", bucketList });
  } catch (error) {
    console.error('Error adding to bucket list:', error);
    res.status(500).json({ error: 'Failed to add to bucket list' });
  }
};

exports.removeFromBucketList = async (req, res) => {
  try {
    const { athleteId, competitionId } = req.query;
    
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });
    if (!competitionId) return res.status(400).json({ error: "competitionId required" });

    const docRef = db.collection('competitions').doc(athleteId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: "No competition data found" });
    }

    const bucketList = (doc.data().bucketList || []).filter(c => c.id !== parseInt(competitionId));
    
    await docRef.set({ bucketList }, { merge: true });
    
    res.json({ success: true, message: "Removed from bucket list", bucketList });
  } catch (error) {
    console.error('Error removing from bucket list:', error);
    res.status(500).json({ error: 'Failed to remove from bucket list' });
  }
};

exports.registerForCompetition = async (req, res) => {
  try {
    const { athleteId } = req.query;
    const competition = req.body;
    
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });
    if (!competition.id) return res.status(400).json({ error: "Competition ID required" });

    const docRef = db.collection('competitions').doc(athleteId);
    const doc = await docRef.get();
    
    let registered = [];
    if (doc.exists) {
      registered = doc.data().registered || [];
    }

    // Check if already registered
    if (registered.find(c => c.id === competition.id)) {
      return res.status(400).json({ error: "Already registered for this competition" });
    }

    registered.push({
      ...competition,
      registeredDate: new Date().toISOString(),
      status: 'registered'
    });

    await docRef.set({ registered }, { merge: true });
    
    res.json({ success: true, message: "Registered for competition", registered });
  } catch (error) {
    console.error('Error registering for competition:', error);
    res.status(500).json({ error: 'Failed to register for competition' });
  }
};

exports.updateEquipmentStatus = async (req, res) => {
  try {
    const { athleteId } = req.query;
    const { equipmentId, status, notes } = req.body;
    
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });
    if (!equipmentId) return res.status(400).json({ error: "equipmentId required" });

    const docRef = db.collection('competitions').doc(athleteId);
    const doc = await docRef.get();
    
    let equipment = [];
    if (doc.exists) {
      equipment = doc.data().equipment || [
        { id: 1, name: 'Singlet', status: 'ready', notes: '' },
        { id: 2, name: 'Knee Sleeves', status: 'ready', notes: '' },
        { id: 3, name: 'Belt', status: 'ready', notes: '' },
        { id: 4, name: 'Wrist Wraps', status: 'ready', notes: '' },
        { id: 5, name: 'Chalk', status: 'ready', notes: '' },
        { id: 6, name: 'Lifting Shoes', status: 'ready', notes: '' }
      ];
    }

    equipment = equipment.map(item => 
      item.id === equipmentId ? { ...item, status, notes: notes || '' } : item
    );

    await docRef.set({ equipment }, { merge: true });
    
    res.json({ success: true, message: "Equipment status updated", equipment });
  } catch (error) {
    console.error('Error updating equipment status:', error);
    res.status(500).json({ error: 'Failed to update equipment status' });
  }
};

exports.addNotification = async (req, res) => {
  try {
    const { athleteId } = req.query;
    const notification = req.body;
    
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });
    if (!notification.message) return res.status(400).json({ error: "Notification message required" });

    const docRef = db.collection('competitions').doc(athleteId);
    const doc = await docRef.get();
    
    let notifications = [];
    if (doc.exists) {
      notifications = doc.data().notifications || [];
    }

    const newNotification = {
      id: Date.now(),
      message: notification.message,
      type: notification.type || 'info',
      timestamp: new Date().toISOString(),
      read: false
    };

    // Keep only last 20 notifications
    notifications = [newNotification, ...notifications].slice(0, 20);

    await docRef.set({ notifications }, { merge: true });
    
    res.json({ success: true, message: "Notification added", notifications });
  } catch (error) {
    console.error('Error adding notification:', error);
    res.status(500).json({ error: 'Failed to add notification' });
  }
};

exports.clearNotifications = async (req, res) => {
  try {
    const { athleteId } = req.query;
    
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });

    await db.collection('competitions').doc(athleteId).set({ 
      notifications: [] 
    }, { merge: true });
    
    res.json({ success: true, message: "Notifications cleared" });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
};

exports.updateCompDayData = async (req, res) => {
  try {
    const { athleteId } = req.query;
    const compDayData = req.body;
    
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });

    await db.collection('competitions').doc(athleteId).set({ 
      compDayData: {
        ...compDayData,
        lastUpdated: new Date().toISOString()
      }
    }, { merge: true });
    
    res.json({ success: true, message: "Competition day data updated" });
  } catch (error) {
    console.error('Error updating comp day data:', error);
    res.status(500).json({ error: 'Failed to update competition day data' });
  }
};
