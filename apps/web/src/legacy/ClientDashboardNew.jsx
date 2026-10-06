import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../auth/authContext";
import EvolutionMatrix from "../components/EvolutionMatrix";
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Activity, Target, Heart, TrendingUp, Calendar,
  Video, Mic, AlertTriangle, CheckCircle, Clock, Zap,
  MessageSquare, Trophy, BarChart3, Settings, Play,
  Pause, RotateCcw, Save, Eye, Users, Shield, Sparkles,
  Timer, Dumbbell, Award, Star, ChevronRight, ChevronLeft,
  Battery, Zap as Lightning, Thermometer, User
} from 'lucide-react';

/* ───────────────────────────
    🎨 MODERN UI COMPONENTS
─────────────────────────── */

// Modern Card Component
const ModernCard = ({ children, className = "", title, icon, gradient = "from-slate-800 to-slate-900", headerActions }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gradient-to-br ${gradient} rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden ${className}`}
  >
    {(title || icon || headerActions) && (
      <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className="p-2 bg-slate-700 rounded-lg">{icon}</div>}
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
        </div>
        {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </motion.div>
);

// AI Insight Badge
const AIInsight = ({ type, message, timestamp, icon }) => {
  const colors = {
    alert: "bg-red-500/20 text-red-300 border-red-500/30",
    success: "bg-green-500/20 text-green-300 border-green-500/30",
    info: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    system: "bg-purple-500/20 text-purple-300 border-purple-500/30"
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-3 rounded-lg border backdrop-blur-sm ${colors[type] || colors.info}`}
    >
      <div className="flex items-start gap-2">
        {icon || <Brain className="w-4 h-4 mt-0.5 flex-shrink-0" />}
        <div className="flex-1">
          <p className="text-sm">{message}</p>
          {timestamp && (
            <p className="text-xs opacity-70 mt-1">
              {new Date(timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// TITAN-OS Agent Status
const AgentStatus = ({ agent, active, onClick, metrics }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onClick(agent)}
    className={`p-4 rounded-xl border transition-all duration-200 ${
      active
        ? 'bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
        : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${active ? 'bg-purple-600' : 'bg-slate-700'}`}>
        {agent.icon}
      </div>
      <div className="text-left flex-1">
        <div className={`font-medium ${active ? 'text-purple-300' : 'text-slate-300'}`}>
          {agent.name}
        </div>
        <div className="text-xs text-slate-400">{agent.description}</div>
        {metrics && (
          <div className="text-xs text-slate-500 mt-1">
            {metrics}
          </div>
        )}
      </div>
      <div className={`w-2 h-2 rounded-full ${agent.status === 'operational' ? 'bg-green-500' : 'bg-yellow-500'}`} />
    </div>
  </motion.button>
);

// Enhanced Progress Bar
const ProgressBar = ({ value, max, color = "bg-blue-500", label, showValue = true }) => (
  <div className="space-y-2">
    {label && <div className="flex justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      {showValue && <span className="text-white">{value}/{max}</span>}
    </div>}
    <div className="w-full bg-slate-700 rounded-full h-2">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        className={`h-2 rounded-full ${color}`}
      />
    </div>
  </div>
);

// Status Indicator
const StatusIndicator = ({ status, label }) => {
  const colors = {
    operational: "bg-green-500",
    standby: "bg-yellow-500",
    offline: "bg-red-500",
    active: "bg-blue-500"
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${colors[status] || colors.offline} animate-pulse`} />
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
};

export default function ClientDashboard() {
  const [tab, setTab] = useState("today");
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState(null);
  const [weekIndex, setWeekIndex] = useState(0);
  const [dayIndex, setDayIndex] = useState(0);
  const [isProgramFinished, setIsProgramFinished] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showResolvePopup, setShowResolvePopup] = useState(false);
  const [log, setLog] = useState({});
  const [expandedArchive, setExpandedArchive] = useState(null);
  const [viewWeek, setViewWeek] = useState(0);
  const [viewDay, setViewDay] = useState(0);

  // ⏱️ CREATIVE TIMER STATE
  const [timer, setTimer] = useState(0);
  const [totalTimerTime, setTotalTimerTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerStatus, setTimerStatus] = useState("idle");

  // 🔥 TITAN-OS AI INTEGRATION STATE
  const [titanOSActive, setTitanOSActive] = useState(false);
  const [activeAgent, setActiveAgent] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  const [voiceCommands, setVoiceCommands] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [competitionMode, setCompetitionMode] = useState(false);
  const [meetPrepData, setMeetPrepData] = useState(null);

  const currentWeek = program?.weeks?.[weekIndex];
  const currentDay = currentWeek?.days[dayIndex];
  const currentDayWithIds = currentDay ? {
    ...currentDay,
    main_lifts: currentDay.main_lifts?.map((lift, idx) => ({
      ...lift,
      stableId: lift.id || `${weekIndex}_${dayIndex}_main_${idx}`
    })) || [],
    accessories: currentDay.accessories?.map((acc, idx) => ({
      ...acc,
      stableId: acc.id || `${weekIndex}_${dayIndex}_acc_${idx}`
    })) || []
  } : null;

  const dayKey = `W${weekIndex + 1}D${dayIndex + 1}`;

  const calculateTonnage = (filterStr = "") => {
    return Object.keys(log)
      .filter(key => key.startsWith(filterStr))
      .reduce((sum, key) => {
        const entry = log[key];
        return sum + ((parseFloat(entry.weight) || 0) * (parseFloat(entry.reps) || 0));
      }, 0);
  };

  // TITAN-OS Integration Functions
  const toggleTitanOS = useCallback(() => {
    setTitanOSActive(!titanOSActive);
    if (!titanOSActive) {
      addAIInsight("TITAN-OS AI agents activated and monitoring your training session", "system");
      addSystemAlert("All AI systems online and operational", "success");
    } else {
      addAIInsight("TITAN-OS AI agents deactivated", "system");
    }
  }, [titanOSActive]);

  const activateAgent = useCallback((agentKey) => {
    setActiveAgent(agentKey);
    const agent = TITANOS_AGENTS[agentKey];
    addAIInsight(`${agent.name} activated for enhanced training support`, "system");
  }, []);

  const addAIInsight = useCallback((message, type = "info") => {
    const newInsight = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    setAiInsights(prev => [newInsight, ...prev.slice(0, 4)]);
  }, []);

  const addSystemAlert = useCallback((message, type = "info") => {
    const newAlert = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    setSystemAlerts(prev => [newAlert, ...prev.slice(0, 2)]);
  }, []);

  const processVoiceCommand = useCallback((command) => {
    addAIInsight(`Voice command processed: "${command}"`, "voice");
  }, []);

  useEffect(() => {
    let interval;
    if (timerActive && timer > 0) {
      setTimerStatus("active");
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && timerActive) {
      setTimerStatus("finished");
      setTimeout(() => {
        setTimerActive(false);
        setTimerStatus("idle");
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const startTimer = (seconds) => {
    setTotalTimerTime(seconds);
    setTimer(seconds);
    setTimerActive(true);
    setTimerStatus("active");
  };

  useEffect(() => {
    const load = async () => {
      if (!athleteId) return;
      try {
        setLoading(true);
        
        const apiUrl = import.meta.env.PROD 
          ? 'https://powerlift-ai-backend.onrender.com'
          : 'http://localhost:5001';
        
        const res = await fetch(`${apiUrl}/api/programs/demo-user`);
        const loadedProgram = await res.json();

        if (!loadedProgram || !loadedProgram.weeks) {
          console.error("❌ Invalid program structure:", loadedProgram);
          setProgram(null);
        } else {
          setProgram(loadedProgram);
          console.log("✅ Program set successfully");
        }

        const logRes = await fetch(`${apiUrl}/api/logs/demo-user`);
        let restored = {};
        if (logRes.ok) {
          try {
            const savedLogs = await logRes.json();
            restored = migrateLogs(loadedProgram, savedLogs);
          } catch (e) {
            console.warn("❌ Failed to parse logs:", e);
            restored = {};
          }
        }

        setLog(restored);

        const unresolved = getNextUnresolvedDay(loadedProgram, restored);
        if (unresolved) {
          setWeekIndex(unresolved.weekIndex);
          setDayIndex(unresolved.dayIndex);
          setIsProgramFinished(false);
        } else {
          setIsProgramFinished(true);
        }
      } catch (err) {
        console.error("❌ LOAD ERROR:", err);
        setIsProgramFinished(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Mock athleteId for demo
  const athleteId = "demo-user";

  const saveSession = async () => {
    const entries = {};
    let valid = true;
    currentDayWithIds?.main_lifts.forEach((lift, idx) => {
      const logKey = `${dayKey}_${lift.stableId}`;
      const entry = log[logKey];
      if (!entry?.weight || !entry?.reps) valid = false;
      entries[logKey] = entry;
      entries[`${dayKey}_${lift.lift}`] = entry;
    });

    if (!valid) {
      addSystemAlert("Complete all sets before saving", "warning");
      return;
    }

    try {
      const entriesForBackend = {};
      currentDayWithIds?.main_lifts.forEach((lift, idx) => {
        const logKey = `${dayKey}_${lift.stableId}`;
        const entry = log[logKey];
        entriesForBackend[lift.lift] = entry;
      });

      const response = await fetch("http://localhost:5001/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId: "demo-user", dayId: dayKey, entries: entriesForBackend })
      });

      if (response.ok) {
        addSystemAlert("Training session saved successfully", "success");
        addAIInsight("Session data analyzed and stored for future optimization", "system");
      } else {
        addSystemAlert("Failed to save session", "error");
      }
    } catch (err) {
      addSystemAlert("Network error while saving", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-slate-400">Loading TITAN-OS Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Powerlift-AI Pro</h1>
                <p className="text-slate-400 text-sm">TITAN-OS Enhanced Training</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* TITAN-OS Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTitanOS}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  titanOSActive
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  {titanOSActive ? 'AI Active' : 'Activate AI'}
                </div>
              </motion.button>

              {/* Timer */}
              {timerActive && (
                <div className="px-3 py-2 bg-slate-800 rounded-lg">
                  <div className="text-xs text-slate-400">Session Time</div>
                  <div className="text-lg font-mono text-white">
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              )}

              {/* System Status */}
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${titanOSActive ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
                <span className="text-sm text-slate-300">
                  {titanOSActive ? 'AI Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Training Area */}
          <div className="xl:col-span-3 space-y-6">
            {/* Current Training Day */}
            <ModernCard
              title={`Week ${weekIndex + 1}, Day ${dayIndex + 1}`}
              icon={<Calendar className="w-5 h-5 text-blue-400" />}
              gradient="from-slate-800 to-slate-900"
              headerActions={
                <div className="flex items-center gap-2">
                  <StatusIndicator status="operational" label="Training Mode" />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => startTimer(15 * 60)}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
                  >
                    <Timer className="w-4 h-4 inline mr-1" />
                    Start Timer
                  </motion.button>
                </div>
              }
            >
              <div className="space-y-6">
                {/* Main Lifts */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-400" />
                    Main Lifts
                  </h4>
                  <div className="space-y-4">
                    {currentDayWithIds?.main_lifts?.map((lift, idx) => (
                      <motion.div
                        key={lift.stableId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-white">{lift.lift}</h5>
                          <div className="text-sm text-slate-400">
                            {lift.sets} sets × {lift.reps} reps @ {lift.percent}%
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <input
                            type="number"
                            placeholder="Weight"
                            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                            onChange={(e) => {
                              const logKey = `${dayKey}_${lift.stableId}`;
                              setLog(prev => ({
                                ...prev,
                                [logKey]: { ...prev[logKey], weight: e.target.value }
                              }));
                            }}
                          />
                          <input
                            type="number"
                            placeholder="Reps"
                            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                            onChange={(e) => {
                              const logKey = `${dayKey}_${lift.stableId}`;
                              setLog(prev => ({
                                ...prev,
                                [logKey]: { ...prev[logKey], reps: e.target.value }
                              }));
                            }}
                          />
                          <input
                            type="number"
                            placeholder="RPE"
                            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                            onChange={(e) => {
                              const logKey = `${dayKey}_${lift.stableId}`;
                              setLog(prev => ({
                                ...prev,
                                [logKey]: { ...prev[logKey], rpe: e.target.value }
                              }));
                            }}
                          />
                        </div>

                        {/* AI Suggestion */}
                        {titanOSActive && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-purple-900/30 border border-purple-700/50 rounded text-sm text-purple-300"
                          >
                            <div className="flex items-start gap-2">
                              <Brain className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>AI: Focus on bar path stability. Keep elbows tucked for optimal power transfer.</span>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Session Controls */}
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={saveSession}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Save className="w-5 h-5" />
                      Save Training Session
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTab("progress")}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </ModernCard>

            {/* Progress Overview */}
            <ModernCard
              title="Training Progress"
              icon={<BarChart3 className="w-5 h-5 text-green-400" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {calculateTonnage(dayKey).toFixed(0)}kg
                  </div>
                  <div className="text-sm text-slate-400">Today's Volume</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {calculateTonnage(`W${weekIndex + 1}`).toFixed(0)}kg
                  </div>
                  <div className="text-sm text-slate-400">Weekly Volume</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400 mb-1">
                    {Object.keys(log).length}
                  </div>
                  <div className="text-sm text-slate-400">Sessions Logged</div>
                </div>
              </div>
            </ModernCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* TITAN-OS AI Agents */}
            {titanOSActive && (
              <ModernCard
                title="TITAN-OS Agents"
                icon={<Shield className="w-5 h-5 text-purple-400" />}
                gradient="from-purple-900/20 to-blue-900/20"
              >
                <div className="space-y-3">
                  {Object.entries(TITANOS_AGENTS).map(([key, agent]) => (
                    <AgentStatus
                      key={key}
                      agent={agent}
                      active={activeAgent === key}
                      onClick={() => activateAgent(key)}
                      metrics={agent.metrics}
                    />
                  ))}
                </div>
              </ModernCard>
            )}

            {/* AI Insights Feed */}
            {titanOSActive && aiInsights.length > 0 && (
              <ModernCard
                title="AI Insights"
                icon={<Sparkles className="w-5 h-5 text-purple-400" />}
              >
                <div className="space-y-3">
                  {aiInsights.slice(0, 3).map((insight) => (
                    <AIInsight
                      key={insight.id}
                      type={insight.type}
                      message={insight.message}
                      timestamp={insight.timestamp}
                    />
                  ))}
                </div>
              </ModernCard>
            )}

            {/* Competition Mode */}
            <ModernCard
              title="Competition Mode"
              icon={<Trophy className="w-5 h-5 text-orange-400" />}
              gradient="from-orange-900/20 to-red-900/20"
            >
              <div className="text-center space-y-4">
                <div>
                  <div className="text-3xl font-bold text-orange-400 mb-1">42</div>
                  <div className="text-sm text-slate-400">Days to Platform</div>
                </div>

                <ProgressBar
                  value={75}
                  max={100}
                  color="bg-orange-500"
                  label="Peak Week Progress"
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-lg font-medium shadow-lg shadow-orange-500/25"
                >
                  Lock-In Competition Program
                </motion.button>
              </div>
            </ModernCard>

            {/* Voice Commands */}
            {titanOSActive && (
              <ModernCard
                title="Voice Commands"
                icon={<Mic className="w-5 h-5 text-purple-400" />}
              >
                <div className="space-y-2">
                  <button
                    onClick={() => processVoiceCommand("Start workout session")}
                    className="w-full text-left p-2 bg-slate-800 hover:bg-slate-700 rounded text-sm transition-colors"
                  >
                    "Start workout session"
                  </button>
                  <button
                    onClick={() => processVoiceCommand("Analyze my form")}
                    className="w-full text-left p-2 bg-slate-800 hover:bg-slate-700 rounded text-sm transition-colors"
                  >
                    "Analyze my form"
                  </button>
                  <button
                    onClick={() => processVoiceCommand("Recovery protocol")}
                    className="w-full text-left p-2 bg-slate-800 hover:bg-slate-700 rounded text-sm transition-colors"
                  >
                    "Recovery protocol"
                  </button>
                </div>
              </ModernCard>
            )}

            {/* System Alerts */}
            {systemAlerts.length > 0 && (
              <ModernCard
                title="System Alerts"
                icon={<AlertTriangle className="w-5 h-5 text-yellow-400" />}
              >
                <div className="space-y-3">
                  {systemAlerts.map((alert) => (
                    <AIInsight
                      key={alert.id}
                      type={alert.type}
                      message={alert.message}
                      timestamp={alert.timestamp}
                    />
                  ))}
                </div>
              </ModernCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
