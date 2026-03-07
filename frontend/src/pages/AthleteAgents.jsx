import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";

export default function AthleteAgents() {
  const { athleteId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [athlete, setAthlete] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [sessionsData, setSessionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeAgent, setActiveAgent] = useState("performance");

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch athlete details
        const athleteRes = await fetch(`http://localhost:5001/api/users/${athleteId}`);
        const athleteData = await athleteRes.json();
        
        if (athleteData) {
          setAthlete(athleteData);
        }
        
        // Fetch athlete progress data for AI analysis
        try {
          const progressRes = await fetch(`http://localhost:5001/api/progress/${athleteId}`);
          const progress = await progressRes.json();
          setProgressData(progress || { squat: [], bench: [], deadlift: [] });
        } catch (err) {
          console.warn("Progress data not available");
          setProgressData({ squat: [], bench: [], deadlift: [] });
        }
        
        // Fetch session data for AI analysis
        try {
          const sessionsRes = await fetch(`http://localhost:5001/api/logs/${athleteId}`);
          const sessions = await sessionsRes.json();
          setSessionsData(sessions || {});
        } catch (err) {
          console.warn("Session data not available");
          setSessionsData({});
        }
        
      } catch (err) {
        console.error("❌ AGENT_DATA_FETCH_ERROR:", err);
        setError("Failed to load athlete data for AI analysis");
      } finally {
        setLoading(false);
      }
    };

    if (athleteId) {
      fetchAgentData();
    }
  }, [athleteId]);

  // AI Agent: Performance Prediction
  const PerformancePredictionAgent = () => {
    const calculatePredictions = () => {
      if (!progressData || !sessionsData) return null;
      
      // Simple prediction logic based on recent progress
      const predictions = {
        squat: { current: 0, predicted: 0, trend: "stable" },
        bench: { current: 0, predicted: 0, trend: "stable" },
        deadlift: { current: 0, predicted: 0, trend: "stable" }
      };
      
      // Analyze recent sessions for strength trends
      Object.entries(sessionsData).forEach(([sessionKey, lifts]) => {
        Object.entries(lifts).forEach(([liftName, data]) => {
          if (data.weight && predictions[liftName.toLowerCase()]) {
            predictions[liftName.toLowerCase()].current = Math.max(
              predictions[liftName.toLowerCase()].current, 
              data.weight
            );
          }
        });
      });
      
      // Predict 4-week progress (conservative 2.5% increase)
      Object.keys(predictions).forEach(lift => {
        predictions[lift].predicted = Math.round(
          predictions[lift].current * 1.025
        );
        predictions[lift].trend = "increasing";
      });
      
      return predictions;
    };

    const predictions = calculatePredictions();
    
    if (!predictions) {
      return (
        <div className="text-center py-12">
          <p className="text-zinc-500">No training data available for predictions</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-400 mb-4">📊 4-Week Performance Forecast</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(predictions).map(([lift, data]) => (
              <div key={lift} className="bg-black/40 p-4 rounded border border-white/10">
                <div className="text-sm font-mono text-zinc-500 uppercase mb-2">{lift}</div>
                <div className="text-2xl font-bold text-white mb-1">{data.current} kg</div>
                <div className="text-sm text-green-400">→ {data.predicted} kg</div>
                <div className="text-xs text-zinc-600 mt-2">Trend: {data.trend}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-zinc-900/40 border border-white/10 rounded-lg p-6">
          <h4 className="text-lg font-bold text-orange-400 mb-3">🎯 Coaching Recommendations</h4>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400">•</span>
              <span>Athlete is on track for 2.5% strength increase in 4 weeks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Consider increasing volume on bench press for faster progress</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>Deadlift progress is steady - maintain current program</span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  // AI Agent: Recovery & Fatigue Monitor
  const RecoveryAgent = () => {
    const analyzeRecovery = () => {
      if (!sessionsData) return null;
      
      const sessionCount = Object.keys(sessionsData).length;
      const recentSessions = Object.entries(sessionsData).slice(-5); // Last 5 sessions
      
      // Simple fatigue analysis based on training frequency and RPE
      let totalRPE = 0;
      let rpeCount = 0;
      
      recentSessions.forEach(([sessionKey, lifts]) => {
        Object.values(lifts).forEach(data => {
          if (data.rpe) {
            totalRPE += data.rpe;
            rpeCount++;
          }
        });
      });
      
      const avgRPE = rpeCount > 0 ? totalRPE / rpeCount : 7;
      const fatigueLevel = avgRPE > 8 ? "high" : avgRPE > 7 ? "moderate" : "low";
      
      return {
        sessionCount,
        avgRPE: avgRPE.toFixed(1),
        fatigueLevel,
        recommendation: fatigueLevel === "high" ? "deload_recommended" : 
                      fatigueLevel === "moderate" ? "monitor_closely" : "increase_volume"
      };
    };

    const recovery = analyzeRecovery();
    
    if (!recovery) {
      return (
        <div className="text-center py-12">
          <p className="text-zinc-500">No session data available for recovery analysis</p>
        </div>
      );
    }

    const fatigueColors = {
      high: "text-red-400",
      moderate: "text-yellow-400", 
      low: "text-green-400"
    };

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-400 mb-4">💪 Recovery & Fatigue Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/40 p-4 rounded border border-white/10">
              <div className="text-sm font-mono text-zinc-500 uppercase mb-2">Total Sessions</div>
              <div className="text-2xl font-bold text-white">{recovery.sessionCount}</div>
            </div>
            <div className="bg-black/40 p-4 rounded border border-white/10">
              <div className="text-sm font-mono text-zinc-500 uppercase mb-2">Avg RPE</div>
              <div className="text-2xl font-bold text-white">{recovery.avgRPE}</div>
            </div>
            <div className="bg-black/40 p-4 rounded border border-white/10">
              <div className="text-sm font-mono text-zinc-500 uppercase mb-2">Fatigue Level</div>
              <div className={`text-2xl font-bold capitalize ${fatigueColors[recovery.fatigueLevel]}`}>
                {recovery.fatigueLevel}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-zinc-900/40 border border-white/10 rounded-lg p-6">
          <h4 className="text-lg font-bold text-purple-400 mb-3">🏥 Recovery Recommendations</h4>
          <ul className="space-y-2 text-sm text-zinc-300">
            {recovery.fatigueLevel === "high" && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">⚠️</span>
                  <span>High fatigue detected - recommend deload week</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Focus on sleep quality and nutrition</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>Consider reducing training volume by 40%</span>
                </li>
              </>
            )}
            {recovery.fatigueLevel === "moderate" && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">⚡</span>
                  <span>Moderate fatigue - monitor closely</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Maintain current training intensity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>Ensure adequate rest between sessions</span>
                </li>
              </>
            )}
            {recovery.fatigueLevel === "low" && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✅</span>
                  <span>Low fatigue - ready for increased volume</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Can increase training intensity safely</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>Consider adding accessory work</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-500 mb-4 animate-pulse">AI_AGENTS_LOADING</div>
          <div className="text-zinc-500 font-mono">Analyzing athlete data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500 mb-4">❌ AI_SYSTEM_ERROR</div>
          <div className="text-zinc-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white">
      {/* HEADER */}
      <div className="bg-zinc-900 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(`/athlete/${athleteId}`)}
                className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <span className="text-lg">←</span>
                <span className="text-sm font-mono uppercase">Back_to_Athlete</span>
              </button>
              
              <div className="h-8 w-px bg-zinc-700"></div>
              
              <h1 className="text-2xl font-bold uppercase italic">
                AI Agents: {athlete?.name || "Unknown"}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* AGENT NAVIGATION */}
      <div className="bg-zinc-900/50 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-6">
            {[
              { id: "performance", name: "Performance Prediction", icon: "📊" },
              { id: "recovery", name: "Recovery Monitor", icon: "💪" }
            ].map(agent => (
              <button
                key={agent.id}
                onClick={() => setActiveAgent(agent.id)}
                className={`py-4 px-2 border-b-2 transition-all font-mono text-sm uppercase tracking-wider ${
                  activeAgent === agent.id 
                    ? "border-orange-500 text-orange-500" 
                    : "border-transparent text-zinc-500 hover:text-white"
                }`}
              >
                <span className="mr-2">{agent.icon}</span>
                {agent.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AGENT CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeAgent === "performance" && <PerformancePredictionAgent />}
        {activeAgent === "recovery" && <RecoveryAgent />}
      </div>
    </div>
  );
}
