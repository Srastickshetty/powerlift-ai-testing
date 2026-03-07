const { db } = require('../firebaseAdmin');

// AI CONVERSATION COLLECTION STRUCTURE:
// aiConversations/{athleteId}/
//   - conversations: []
//   - insights: []
//   - voiceCommands: []

exports.getAiData = async (req, res) => {
  try {
    const { athleteId } = req.query;
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });

    const doc = await db.collection('aiConversations').doc(athleteId).get();
    
    if (!doc.exists) {
      return res.json({
        conversations: [],
        insights: [],
        voiceCommands: []
      });
    }

    res.json(doc.data());
  } catch (error) {
    console.error('Error getting AI data:', error);
    res.status(500).json({ error: 'Failed to fetch AI data' });
  }
};

exports.saveConversation = async (req, res) => {
  try {
    const { athleteId } = req.query;
    const { message, response, context } = req.body;
    
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });
    if (!message || !response) return res.status(400).json({ error: "Message and response required" });

    const docRef = db.collection('aiConversations').doc(athleteId);
    const doc = await docRef.get();
    
    let conversations = [];
    if (doc.exists) {
      conversations = doc.data().conversations || [];
    }

    const conversationEntry = {
      id: Date.now(),
      message,
      response,
      context: context || 'general',
      timestamp: new Date().toISOString(),
      sessionId: req.body.sessionId || 'default'
    };

    conversations.push(conversationEntry);

    // Keep only last 50 conversations
    conversations = conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50);

    await docRef.set({ conversations }, { merge: true });
    
    res.json({ success: true, message: "Conversation saved", conversations });
  } catch (error) {
    console.error('Error saving conversation:', error);
    res.status(500).json({ error: 'Failed to save conversation' });
  }
};

exports.saveInsight = async (req, res) => {
  try {
    const { athleteId } = req.query;
    const { insight, category, priority, data } = req.body;
    
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });
    if (!insight) return res.status(400).json({ error: "Insight content required" });

    const docRef = db.collection('aiConversations').doc(athleteId);
    const doc = await docRef.get();
    
    let insights = [];
    if (doc.exists) {
      insights = doc.data().insights || [];
    }

    const insightEntry = {
      id: Date.now(),
      insight,
      category: category || 'general', // 'technique', 'programming', 'recovery', 'competition', 'general'
      priority: priority || 'medium', // 'low', 'medium', 'high', 'critical'
      data: data || {},
      timestamp: new Date().toISOString(),
      acknowledged: false,
      archived: false
    };

    insights.push(insightEntry);

    // Keep only last 100 insights, filter out archived ones
    insights = insights
      .filter(i => !i.archived)
      .sort((a, b) => {
        // Sort by priority first, then by timestamp
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.timestamp) - new Date(a.timestamp);
      })
      .slice(0, 100);

    await docRef.set({ insights }, { merge: true });
    
    res.json({ success: true, message: "Insight saved", insights });
  } catch (error) {
    console.error('Error saving insight:', error);
    res.status(500).json({ error: 'Failed to save insight' });
  }
};

exports.saveVoiceCommand = async (req, res) => {
  try {
    const { athleteId } = req.query;
    const { command, intent, confidence, response, successful } = req.body;
    
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });
    if (!command) return res.status(400).json({ error: "Command required" });

    const docRef = db.collection('aiConversations').doc(athleteId);
    const doc = await docRef.get();
    
    let voiceCommands = [];
    if (doc.exists) {
      voiceCommands = doc.data().voiceCommands || [];
    }

    const voiceCommandEntry = {
      id: Date.now(),
      command,
      intent: intent || 'unknown',
      confidence: confidence || 0,
      response: response || '',
      successful: successful || false,
      timestamp: new Date().toISOString()
    };

    voiceCommands.push(voiceCommandEntry);

    // Keep only last 30 days of voice commands
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    voiceCommands = voiceCommands
      .filter(vc => new Date(vc.timestamp) >= cutoffDate)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 100);

    await docRef.set({ voiceCommands }, { merge: true });
    
    res.json({ success: true, message: "Voice command saved", voiceCommands });
  } catch (error) {
    console.error('Error saving voice command:', error);
    res.status(500).json({ error: 'Failed to save voice command' });
  }
};

exports.acknowledgeInsight = async (req, res) => {
  try {
    const { athleteId, insightId } = req.query;
    
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });
    if (!insightId) return res.status(400).json({ error: "insightId required" });

    const docRef = db.collection('aiConversations').doc(athleteId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: "No AI data found" });
    }

    const insights = (doc.data().insights || []).map(insight => 
      insight.id === parseInt(insightId) 
        ? { ...insight, acknowledged: true, acknowledgedAt: new Date().toISOString() }
        : insight
    );

    await docRef.set({ insights }, { merge: true });
    
    res.json({ success: true, message: "Insight acknowledged", insights });
  } catch (error) {
    console.error('Error acknowledging insight:', error);
    res.status(500).json({ error: 'Failed to acknowledge insight' });
  }
};

exports.archiveInsight = async (req, res) => {
  try {
    const { athleteId, insightId } = req.query;
    
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });
    if (!insightId) return res.status(400).json({ error: "insightId required" });

    const docRef = db.collection('aiConversations').doc(athleteId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: "No AI data found" });
    }

    const insights = (doc.data().insights || []).map(insight => 
      insight.id === parseInt(insightId) 
        ? { ...insight, archived: true, archivedAt: new Date().toISOString() }
        : insight
    );

    await docRef.set({ insights }, { merge: true });
    
    res.json({ success: true, message: "Insight archived", insights });
  } catch (error) {
    console.error('Error archiving insight:', error);
    res.status(500).json({ error: 'Failed to archive insight' });
  }
};

exports.clearConversations = async (req, res) => {
  try {
    const { athleteId, olderThan } = req.query; // olderThan in days
    
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });

    const docRef = db.collection('aiConversations').doc(athleteId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: "No AI data found" });
    }

    let conversations = doc.data().conversations || [];
    
    if (olderThan) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThan));
      conversations = conversations.filter(c => new Date(c.timestamp) >= cutoffDate);
    } else {
      conversations = []; // Clear all if no olderThan specified
    }

    await docRef.set({ conversations }, { merge: true });
    
    res.json({ success: true, message: "Conversations cleared", conversations });
  } catch (error) {
    console.error('Error clearing conversations:', error);
    res.status(500).json({ error: 'Failed to clear conversations' });
  }
};

exports.getInsightStats = async (req, res) => {
  try {
    const { athleteId, days = 30 } = req.query;
    
    if (!athleteId) return res.status(400).json({ error: "athleteId required" });

    const doc = await db.collection('aiConversations').doc(athleteId).get();
    
    if (!doc.exists) {
      return res.json({
        totalInsights: 0,
        unacknowledgedInsights: 0,
        criticalInsights: 0,
        categoryBreakdown: {}
      });
    }

    const insights = doc.data().insights || [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const recentInsights = insights.filter(i => new Date(i.timestamp) >= cutoffDate);
    const unacknowledged = recentInsights.filter(i => !i.acknowledged);
    const critical = recentInsights.filter(i => i.priority === 'critical');
    
    const categoryBreakdown = recentInsights.reduce((acc, insight) => {
      acc[insight.category] = (acc[insight.category] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalInsights: recentInsights.length,
      unacknowledgedInsights: unacknowledged.length,
      criticalInsights: critical.length,
      categoryBreakdown
    });
  } catch (error) {
    console.error('Error getting insight stats:', error);
    res.status(500).json({ error: 'Failed to get insight stats' });
  }
};
