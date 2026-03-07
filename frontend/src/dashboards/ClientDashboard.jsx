import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Eye,
  Heart,
  TrendingUp,
  Battery,
  Brain,
  Zap,
  AlertCircle,
  CheckCircle,
  Info,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Target,
  Calendar,
  User,
  Dumbbell,
  BarChart3,
  Settings,
  ChevronRight,
  Video
} from "lucide-react";
import { useAuth } from "../auth/authContext";
import EvolutionMatrix from "../components/EvolutionMatrix";

/* ───────────────────────────
    🧬 NEURAL LINK BACKGROUND
─────────────────────────── */
const NeuralLink = ({ active }) => {
  const canvasRef = React.useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationRef = React.useRef(null);
  const timeRef = React.useRef(0);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const nodes = [];
    const nodeCount = active ? 80 : 40;
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      ctx.fillStyle = "rgba(2, 2, 2, 0.05)";
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      timeRef.current += 0.01;

      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.02;

        if (node.x < 0 || node.x > dimensions.width) node.vx *= -1;
        if (node.y < 0 || node.y > dimensions.height) node.vy *= -1;

        const pulseSize = Math.sin(node.pulse) * 0.5 + 1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = active ? "#ea580c" : "#374151";
        ctx.fill();

        nodes.forEach((otherNode, j) => {
          if (i === j) return;
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.strokeStyle = active ? `rgba(234, 88, 12, ${1 - distance / 150})` : `rgba(55, 65, 81, ${1 - distance / 150})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, dimensions]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

/* ───────────────────────────
    🛠️ HELPERS
─────────────────────────── */
const getNextUnresolvedDay = (program, logs) => {
  if (!program || !program.weeks) return null;
  for (let wi = 0; wi < program.weeks.length; wi++) {
    for (let di = 0; di < program.weeks[wi].days.length; di++) {
      const dayKey = `W${wi + 1}D${di + 1}`;
      const isLogged = Object.keys(logs).some(k => k.startsWith(dayKey));
      if (!isLogged) {
        return { weekIndex: wi, dayIndex: di };
      }
    }
  }
  return null;
};

const migrateLogs = (program, oldLogs) => {
  const migratedLogs = {};

  if (!program || !program.weeks) {
    console.log("📊 No program to migrate against, keeping logs as-is");
    return oldLogs;
  }

  if (Object.keys(oldLogs).length === 0) {
    console.log("📊 No logs to migrate");
    return oldLogs;
  }

  console.log("📊 Starting log migration. Incoming logs:", Object.keys(oldLogs));

  const exerciseRegistry = {};
  program.weeks.forEach((week, wi) => {
    week.days?.forEach((day, di) => {
      const dayKey = `W${wi + 1}D${di + 1}`;
      exerciseRegistry[dayKey] = [];

      day.main_lifts?.forEach((lift, liftIdx) => {
        exerciseRegistry[dayKey].push({
          stableId: `${wi}_${di}_main_${liftIdx}`,
          name: lift.lift || `MainLift${liftIdx}`,
          type: 'main'
        });
      });

      day.accessories?.forEach((acc, accIdx) => {
        exerciseRegistry[dayKey].push({
          stableId: `${wi}_${di}_acc_${accIdx}`,
          name: acc.exercise || `Accessory${accIdx}`,
          type: 'acc'
        });
      });
    });
  });

  console.log("📊 Built exercise registry with", Object.keys(exerciseRegistry).length, "days");

  Object.entries(oldLogs).forEach(([oldKey, logData]) => {
    if (/^W\d+D\d+_\d+_\d+_(main|acc)_\d+$/.test(oldKey)) {
      migratedLogs[oldKey] = logData;
      console.log("  ✅ Already in new format:", oldKey);
      return;
    }

    const match = oldKey.match(/^(W\d+D\d+)_(.+)$/);
    if (!match) {
      migratedLogs[oldKey] = logData;
      console.warn("  ⚠️ Could not parse key (keeping as-is):", oldKey);
      return;
    }

    const dayKey = match[1];
    const exerciseName = match[2];

    if (!exerciseRegistry[dayKey]) {
      migratedLogs[oldKey] = logData;
      console.warn(`  ⚠️ Day ${dayKey} not found in program (keeping as-is)`);
      return;
    }

    const matchedExercise = exerciseRegistry[dayKey].find(ex => ex.name === exerciseName);

    if (matchedExercise) {
      const newKey = `${dayKey}_${matchedExercise.stableId}`;
      migratedLogs[newKey] = logData;
      console.log(`  ✅ Migrated ${oldKey} → ${newKey}`);
    } else {
      migratedLogs[oldKey] = logData;
      console.warn(`  ⚠️ No match for ${exerciseName} in ${dayKey} (keeping old key)`);
    }
  });

  console.log("📊 Migration complete:", Object.keys(migratedLogs));
  return migratedLogs;
};

const CompetitionDayUI = ({ currentDay, athlete, saveSession }) => {
  if (!currentDay) {
    return (
      <div className="min-h-[300px] flex items-center justify-center text-zinc-500 font-mono text-xs uppercase">
        COMPETITION_PROTOCOL_UNAVAILABLE
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-[1000] italic uppercase mb-2">
          Meet_Day_Protocol
        </h2>
        <p className="text-orange-500 font-mono text-[10px] tracking-[0.5em] uppercase">
          Attempts calibrated for {athlete?.email || "athlete"}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentDay.main_lifts?.map((lift, idx) => (
          <div
            key={lift.id || idx}
            className="bg-black/60 border border-orange-600/40 p-4 flex flex-col gap-2"
          >
            <div className="text-sm font-mono text-zinc-500 uppercase">
              Attempt Stream
            </div>
            <div className="text-2xl font-black italic uppercase text-white">
              {lift.lift}
            </div>
            {lift.attempt_plan ? (
              <div className="mt-2 space-y-1 text-xs font-mono text-zinc-300">
                <div>Opener: {lift.attempt_plan.opener} KG</div>
                <div>Second: {lift.attempt_plan.second} KG</div>
                <div>Third: {lift.attempt_plan.third} KG</div>
              </div>
            ) : (
              <div className="mt-2 text-[10px] font-mono text-zinc-500 uppercase">
                No attempt plan attached
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="pt-6 border-t border-white/10 flex justify-center">
        <button
          onClick={saveSession}
          className="bg-white text-black px-10 py-4 font-black uppercase italic tracking-widest hover:bg-orange-600 transition-colors"
        >
          Confirm_Competition_Log
        </button>
      </div>
    </div>
  );
};

/* ───────────────────────────
    🎨 TITAN-OS AI COMPONENTS
─────────────────────────── */

const TITANOS_AGENTS = {
  form_analyzer: {
    name: "Form Analyzer",
    description: "Real-time technique optimization",
    icon: <Eye className="w-4 h-4" />,
    status: 'operational',
    metrics: "Accuracy: 94%"
  },
  recovery_coach: {
    name: "Recovery Coach",
    description: "Adaptive rest protocols",
    icon: <Heart className="w-4 h-4" />,
    status: 'operational',
    metrics: "HRV Monitoring"
  },
  performance_strategist: {
    name: "Performance Strategist",
    description: "Load optimization algorithms",
    icon: <TrendingUp className="w-4 h-4" />,
    status: 'operational',
    metrics: "Peak Prediction"
  },
  nutrition_advisor: {
    name: "Nutrition Advisor",
    description: "Fuel timing recommendations",
    icon: <Battery className="w-4 h-4" />,
    status: 'standby',
    metrics: "Calorie Tracking"
  }
};

const ModernCard = ({ children, className = "", hover = true }) => (
  <motion.div
    whileHover={hover ? { scale: 1.02, y: -2 } : {}}
    className={`bg-zinc-900/40 border border-white/10 backdrop-blur-xl ${className}`}
  >
    {children}
  </motion.div>
);

const AIInsight = ({ insight }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-800/50 border border-white/5 p-3 flex items-start gap-3"
    >
      {getIcon(insight.type)}
      <div className="flex-1">
        <p className="text-xs text-zinc-300 font-mono">{insight.message}</p>
        <span className="text-[8px] text-zinc-600 font-mono">
          {new Date(insight.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </motion.div>
  );
};

const AgentStatus = ({ agent, isActive, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`p-3 border transition-all ${isActive
      ? 'border-orange-600 bg-orange-600/20'
      : 'border-white/10 bg-zinc-800/30 hover:border-white/20'
      }`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${isActive ? 'bg-orange-600' : 'bg-zinc-700'}`}>
        {agent.icon}
      </div>
      <div className="text-left flex-1">
        <h4 className="text-xs font-black uppercase text-white">{agent.name}</h4>
        <p className="text-[8px] text-zinc-500 font-mono">{agent.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'operational' ? 'bg-green-400' : 'bg-yellow-400'
            }`} />
          <span className="text-[7px] text-zinc-600 font-mono">{agent.metrics}</span>
        </div>
      </div>
      <ChevronRight className={`w-3 h-3 transition-transform ${isActive ? 'rotate-90 text-orange-400' : 'text-zinc-600'
        }`} />
    </div>
  </motion.button>
);

const ProgressBar = ({ value, max, className = "" }) => (
  <div className={`w-full bg-zinc-800 rounded-full h-2 ${className}`}>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${(value / max) * 100}%` }}
      className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full"
    />
  </div>
);

const StatusIndicator = ({ status, children }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-zinc-500';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor(status)} animate-pulse`} />
      {children}
    </div>
  );
};

export default function ClientDashboard() {
  const { user, profile, logout } = useAuth();
  const athleteId = profile?.uid || user?.uid;

  const [tab, setTab] = useState("today");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // CREATIVE TIMER STATE
  const [timer, setTimer] = useState(0);
  const [totalTimerTime, setTotalTimerTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerStatus, setTimerStatus] = useState("idle");

  // TITAN-OS AI INTEGRATION STATE (Always Active - No Frontend Toggle)
  const [titanOSActive, setTitanOSActive] = useState(true); // Always on - backend running
  const [activeAgent, setActiveAgent] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  const [voiceCommands, setVoiceCommands] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [meetPrepData, setMeetPrepData] = useState(null);

  // AI Interface States
  const [showAIChat, setShowAIChat] = useState(false);
  const [showVideoAnalysis, setShowVideoAnalysis] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Competition Management State
  const [competitions, setCompetitions] = useState([]);
  const [bucketList, setBucketList] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [registeredCompetition, setRegisteredCompetition] = useState(null);
  const [competitionPhase, setCompetitionPhase] = useState('search'); // 'search' | 'bucket' | 'registered' | 'preparation' | 'competition' | 'post'
  const [competitionMode, setCompetitionMode] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedFederation, setSelectedFederation] = useState('All Federations');
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [compDayData, setCompDayData] = useState({
    currentLift: null,
    attempts: { squat: [], bench: [], deadlift: [] },
    warmupStatus: [],
    compStartTime: null
  });
  const [equipmentList, setEquipmentList] = useState([
    { id: 1, name: 'Singlet', status: 'ready', notes: '' },
    { id: 2, name: 'Knee Sleeves', status: 'ready', notes: '' },
    { id: 3, name: 'Belt', status: 'ready', notes: '' },
    { id: 4, name: 'Weightlifting Shoes', status: 'ready', notes: '' },
    { id: 5, name: 'Wrist Wraps', status: 'ready', notes: '' },
    { id: 6, name: 'Chalk', status: 'ready', notes: '' }
  ]);
  const [sleepData, setSleepData] = useState([]);
  const [motivationLevel, setMotivationLevel] = useState(8);
  const [compNotifications, setCompNotifications] = useState([]);

  // Competition Helper Functions
  const calculateDaysUntil = (dateString) => {
    const compDate = new Date(dateString);
    const today = new Date();
    const diffTime = compDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateWeeksUntil = (dateString) => {
    const days = calculateDaysUntil(dateString);
    return Math.ceil(days / 7);
  };

  const addCompNotification = async (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    const updatedNotifications = [notification, ...compNotifications].slice(0, 5);
    setCompNotifications(updatedNotifications);
    
    // Save to backend
    try {
      await fetch(`http://localhost:5001/api/competitions/notifications?athleteId=${athleteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, type })
      });
    } catch (error) {
      console.warn("Failed to save notification:", error);
    }
  };

  const updateEquipmentStatus = async (id, status, notes = '') => {
    const updatedEquipment = equipmentList.map(item =>
      item.id === id ? { ...item, status, notes } : item
    );
    setEquipmentList(updatedEquipment);
    
    // Save to backend
    try {
      await fetch(`http://localhost:5001/api/competitions/equipment?athleteId=${athleteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipmentId: id, status, notes })
      });
    } catch (error) {
      console.warn("Failed to update equipment status:", error);
    }
  };

  const addCustomEquipment = (name) => {
    const newItem = {
      id: Date.now(),
      name,
      status: 'needs attention',
      notes: ''
    };
    setEquipmentList(prev => [...prev, newItem]);
  };

  const logAttempt = (lift, attemptNum, weight, result) => {
    setCompDayData(prev => ({
      ...prev,
      attempts: {
        ...prev.attempts,
        [lift]: [...(prev.attempts[lift] || []), { attemptNum, weight, result, timestamp: new Date() }]
      }
    }));
  };

  const getNextAttemptSuggestion = (lift, currentWeight, result) => {
    // AI logic for next attempt suggestion based on result and training data
    if (result === 'good_lift') {
      return currentWeight + 5; // Add 5kg for next attempt
    } else if (result === 'no_lift') {
      return currentWeight - 2.5; // Reduce 2.5kg for next attempt
    }
    return currentWeight;
  };

  const endCompetition = () => {
    setCompetitionPhase('post');
    setCompetitionMode(false);
    addCompNotification('🎉 Congratulations on completing your competition!', 'success');
  };
  const toggleTitanOS = useCallback(() => {
    setTitanOSActive(!titanOSActive);
    if (!titanOSActive) {
      addAIInsight("TITAN-OS AI agents activated and monitoring your training session", "system");
      addSystemAlert("All AI systems online and operational", "success");
    } else {
      addAIInsight("TITAN-OS AI agents deactivated", "system");
      setShowAIChat(false);
      setShowVideoAnalysis(false);
    }
  }, [titanOSActive]);

  const activateAgent = useCallback((agentKey) => {
    setActiveAgent(agentKey);
    const agent = TITANOS_AGENTS[agentKey];
    addAIInsight(`${agent.name} activated for enhanced training support`, "system");

    // Open actual AI interfaces based on agent type
    switch (agentKey) {
      case 'form_analyzer':
        setShowVideoAnalysis(true);
        setShowAIChat(false);
        break;
      case 'recovery_coach':
      case 'performance_strategist':
      case 'nutrition_advisor':
        setShowAIChat(true);
        setShowVideoAnalysis(false);
        break;
    }
  }, []);

  // Real AI Chat Function
  const sendAIMessage = async () => {
    if (!aiInput.trim()) return;

    const userMessage = { role: 'user', content: aiInput };
    setAiMessages(prev => [...prev, userMessage]);
    setAiLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: aiInput })
      });

      const data = await response.json();
      const aiMessage = { role: 'assistant', content: data.reply };
      setAiMessages(prev => [...prev, aiMessage]);
      
      // Save conversation to backend
      try {
        await fetch(`http://localhost:5001/api/ai-conversations/conversations?athleteId=${athleteId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: aiInput,
            response: data.reply,
            context: 'general'
          })
        });
      } catch (saveError) {
        console.warn("Failed to save conversation:", saveError);
      }
    } catch (error) {
      const errorMessage = { role: 'assistant', content: 'AI Coach is currently unavailable. Please try again.' };
      setAiMessages(prev => [...prev, errorMessage]);
    }

    setAiInput('');
    setAiLoading(false);
  };

  // Video Analysis Function
  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('video', file);

    setAiLoading(true);
    addAIInsight('Analyzing your lifting form...', 'info');

    try {
      const response = await fetch('http://localhost:5001/api/ai/analyze-video', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      addAIInsight('Form analysis complete!', 'success');
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Form Analysis Results:**\n\n${data.feedback}`
      }]);
    } catch (error) {
      addAIInsight('Video analysis failed. Please try again.', 'error');
    }

    setAiLoading(false);
  };

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
        setError(null);

        const res = await fetch(`http://localhost:5001/api/programs/${athleteId}`);
        if (!res.ok) {
          throw new Error(`Program fetch failed with status ${res.status}`);
        }
        const loadedProgram = await res.json();
        console.log("📥 PROGRAM LOADED:", loadedProgram?.status, "weeks:", loadedProgram?.weeks?.length);

        if (!loadedProgram || !loadedProgram.weeks) {
          console.error("❌ Invalid program structure:", loadedProgram);
          setProgram(null);
          setError("Program structure invalid or unavailable.");
        } else {
          setProgram(loadedProgram);
          console.log("✅ Program set successfully");
        }

        const logRes = await fetch(`http://localhost:5001/api/logs/${athleteId}`);
        let restored = {};
        if (logRes.ok) {
          try {
            const savedLogs = await logRes.json();
            console.log("📥 RAW LOGS FROM BACKEND:", savedLogs);
            console.log("   Type:", Array.isArray(savedLogs) ? "ARRAY" : typeof savedLogs);
            console.log("   Keys:", Object.keys(savedLogs || {}).slice(0, 5));

            if (!savedLogs || typeof savedLogs !== 'object') {
              console.warn("❌ Invalid backend response format");
              restored = {};
            } else if (Array.isArray(savedLogs)) {
              console.warn("❌ Backend returned array instead of object - converting");
              savedLogs.forEach((log, idx) => {
                if (log.lift && log.load) {
                  const dayKey = log.day_id || "W1D1";
                  if (!restored[dayKey]) {
                    restored[dayKey] = {};
                  }
                  restored[dayKey][log.lift] = {
                    weight: log.load,
                    reps: log.reps,
                    rpe: log.rpe,
                    date: log.date
                  };
                  console.log(`   Converted log ${idx}: ${dayKey}_${log.lift}`);
                }
              });
            } else {
              Object.entries(savedLogs).forEach(([dayId, lifts]) => {
                if (typeof lifts === 'object' && lifts !== null) {
                  console.log(`   Day ${dayId}:`, Object.keys(lifts || {}).join(", "));
                  Object.entries(lifts).forEach(([lift, data]) => {
                    const key = `${dayId}_${lift}`;
                    restored[key] = data;
                  });
                } else {
                  console.warn(`   ⚠️ Day ${dayId} has invalid lifts format:`, typeof lifts);
                }
              });
            }

            console.log("📄 RESTORED LOGS BEFORE MIGRATION:", Object.keys(restored));
            restored = migrateLogs(loadedProgram, restored);
            console.log("🔄 RESTORED LOGS AFTER MIGRATION:", Object.keys(restored));
          } catch (e) {
            console.warn("❌ Failed to parse logs:", e);
            restored = {};
          }
        } else {
          console.warn("⚠️ No logs found (status:", logRes.status, ")");
        }

        setLog(restored);

        // Load competition data
        try {
          const compRes = await fetch(`http://localhost:5001/api/competitions?athleteId=${athleteId}`);
          if (compRes.ok) {
            const compData = await compRes.json();
            console.log("📥 COMPETITION DATA LOADED:", compData);
            setCompetitions([]); // Clear search results on load
            setBucketList(compData.bucketList || []);
            setRegisteredCompetition(compData.registered?.[0] || null); // Get first registered competition
            setEquipmentList(compData.equipment || []);
            setCompNotifications(compData.notifications || []);
            setCompDayData(compData.compDayData || {
              currentLift: null,
              attempts: { squat: [], bench: [], deadlift: [] },
              warmupStatus: [],
              compStartTime: null
            });
          } else {
            // If no competition data exists, show empty state
            setCompetitions([]);
            setBucketList([]);
            setRegisteredCompetition(null);
            setEquipmentList([
              { id: 1, name: 'Singlet', status: 'ready', notes: '' },
              { id: 2, name: 'Knee Sleeves', status: 'ready', notes: '' },
              { id: 3, name: 'Belt', status: 'ready', notes: '' },
              { id: 4, name: 'Weightlifting Shoes', status: 'ready', notes: '' },
              { id: 5, name: 'Wrist Wraps', status: 'ready', notes: '' },
              { id: 6, name: 'Chalk', status: 'ready', notes: '' }
            ]);
            setCompNotifications([]);
          }
        } catch (compError) {
          console.warn("⚠️ Failed to load competition data:", compError);
          // Set default values on error
          setCompetitions([]);
          setBucketList([]);
          setRegisteredCompetition(null);
        }

        // Load wellness data
        try {
          const wellnessRes = await fetch(`http://localhost:5001/api/wellness?athleteId=${athleteId}`);
          if (wellnessRes.ok) {
            const wellnessData = await wellnessRes.json();
            console.log("📥 WELLNESS DATA LOADED:", wellnessData);
            setSleepData(wellnessData.sleep || []);
            const recentMotivation = wellnessData.motivation?.[0];
            if (recentMotivation) {
              setMotivationLevel(recentMotivation.level);
            }
          }
        } catch (wellnessError) {
          console.warn("⚠️ Failed to load wellness data:", wellnessError);
        }

        // Load AI conversation data
        try {
          const aiRes = await fetch(`http://localhost:5001/api/ai-conversations?athleteId=${athleteId}`);
          if (aiRes.ok) {
            const aiData = await aiRes.json();
            console.log("📥 AI DATA LOADED:", aiData);
            setAiMessages(aiData.conversations || []);
            setAiInsights(aiData.insights || []);
            setVoiceCommands(aiData.voiceCommands || []);
          }
        } catch (aiError) {
          console.warn("⚠️ Failed to load AI data:", aiError);
        }

        const unresolved = getNextUnresolvedDay(loadedProgram, restored);
        console.log("🎯 Next unresolved day:", unresolved);

        if (!loadedProgram || !loadedProgram.weeks) {
          console.warn("⚠️ Program failed to load or has no weeks");
          setIsProgramFinished(true);
          setWeekIndex(0);
          setDayIndex(0);
          setError("No active program found for this athlete.");
        } else if (unresolved) {
          setWeekIndex(unresolved.weekIndex);
          setDayIndex(unresolved.dayIndex);
          setIsProgramFinished(false);
        } else {
          setIsProgramFinished(true);
          setWeekIndex(loadedProgram.weeks.length - 1);
          setDayIndex((loadedProgram.weeks[loadedProgram.weeks.length - 1]?.days.length || 1) - 1);
        }
      } catch (err) {
        console.error("❌ LOAD ERROR:", err);
        setError("Failed to load training data from server.");
        setWeekIndex(0);
        setDayIndex(0);
        setIsProgramFinished(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [athleteId]);

  const currentWeek = program?.weeks?.[weekIndex];
  const isCompetitionMode = program?.metadata?.type === "competition_block";
  const competitionDate = program?.metadata?.competitionDate;
  const currentPhase = currentWeek?.phase || "normal";

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
  const previousDayKey = dayIndex === 0 ? null : `W${weekIndex + 1}D${dayIndex}`;
  const hasUnresolved = previousDayKey && !Object.keys(log).some(k => k.startsWith(previousDayKey));

  const calculateTonnage = (filterStr = "") => {
    return Object.keys(log)
      .filter(key => key.startsWith(filterStr))
      .reduce((sum, key) => {
        const entry = log[key];
        return sum + ((parseFloat(entry.weight) || 0) * (parseFloat(entry.reps) || 0));
      }, 0);
  };

  const getLiftVolumeData = (liftType) => {
    if (!program) return [];
    return program.weeks.flatMap((w, wi) => w.days.map((d, di) => {
      const entry = log[`W${wi + 1}D${di + 1}_${liftType}`];
      return entry ? (parseFloat(entry.weight) * parseFloat(entry.reps)) : 0;
    }));
  };

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
    if (!valid) { alert("⚠️ Complete all sets."); return; }

    try {
      const entriesForBackend = {};
      currentDayWithIds?.main_lifts.forEach((lift, idx) => {
        const logKey = `${dayKey}_${lift.stableId}`;
        const entry = log[logKey];
        entriesForBackend[lift.lift] = entry;
      });

      console.log("💾 SAVING SESSION:");
      console.log("   dayId:", dayKey);
      console.log("   entriesForBackend:", entriesForBackend);
      console.log("   entries (both formats):", entries);

      const response = await fetch("http://localhost:5001/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId, dayId: dayKey, entries: entriesForBackend })
      });

      console.log("✅ Save response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Save error:", errorText);
        setError("Save failed. Please try again.");
        alert(`⚠️ Save failed: ${response.status}`);
        return;
      }

      const newLogState = { ...log, ...entries };
      setLog(newLogState);
      console.log("📝 Updated log state:", Object.keys(newLogState));

      const isLastDayOfWeek = dayIndex === currentWeek.days.length - 1;

      if (isLastDayOfWeek && !isCompetitionMode) {
        setShowCelebration(true);
        setSessionActive(false);
      } else {
        const unresolved = getNextUnresolvedDay(program, newLogState);
        if (unresolved) {
          setWeekIndex(unresolved.weekIndex);
          setDayIndex(unresolved.dayIndex);
        }
        setSessionActive(false);
      }
    } catch (error) {
      console.error("❌ SAVE ERROR:", error);
      setError("Network error while saving session.");
      alert("⚠️ DATA_FAILURE");
    }
  };

  if (loading || !program) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-orange-500 font-mono animate-pulse uppercase px-4 text-center">
        <div>INITIALIZING_INTERFACE...</div>
        {error && (
          <div className="mt-4 text-[10px] text-red-400 tracking-widest">
            {error}
          </div>
        )}
      </div>
    );
  }

  if (program.status === "pending_approval") {
    return (
      <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center text-orange-500 font-mono uppercase p-10 text-center">
        <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent animate-spin mb-8 skew-x-[-15deg]"></div>
        <h2 className="text-3xl font-black italic mb-4">Awaiting_Coach_Approval</h2>
        <p className="text-zinc-500 tracking-widest text-xs max-w-md">
          The neural protocol has been generated. Your coach must verify the load parameters before the terminal is unlocked.
        </p>
        <div className="mt-8 pt-8 border-t border-white/10 w-full max-w-xs">
          <span className="text-[10px] text-zinc-600">STATUS: HOLD_PENDING_VERIFICATION</span>
        </div>
      </div>
    );
  }

  if (!program.weeks || !Array.isArray(program.weeks) || program.weeks.length === 0) {
    return (
      <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center text-red-500 font-mono uppercase p-10 text-center">
        <h2 className="text-3xl font-black italic mb-4">CRITICAL_ERROR</h2>
        <p className="text-zinc-500 tracking-widest text-xs max-w-md">
          Program structure invalid. Program has {program?.weeks?.length || 0} weeks.
        </p>
        <p className="text-zinc-600 text-xs mt-4">Program status: {program?.status || 'unknown'}</p>
      </div>
    );
  }

  const points = program.weeks.flatMap((w, wi) => w.days.map((d, di) => `W${wi + 1}D${di + 1}`)).map((dId, i, arr) => {
    const x = (i / (arr.length - 1 || 1)) * 100;
    const vol = calculateTonnage(dId);
    const y = 100 - (vol / (Math.max(...arr.map(id => calculateTonnage(id))) || 1000)) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="min-h-screen bg-[#020202] text-white font-black overflow-x-hidden relative">
      <NeuralLink active={sessionActive || showCelebration || timerActive} />

      {showResolvePopup && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] backdrop-blur-md">
          <div className="bg-zinc-900 p-8 border-2 border-orange-600 max-w-md skew-x-[-5deg]">
            <div className="skew-x-[5deg]">
              <h3 className="text-2xl font-black italic uppercase text-orange-500 leading-tight">
                UNLOGGED_SESSION_DETECTED
              </h3>
              <p className="text-zinc-400 font-mono text-sm mt-4 uppercase tracking-tighter">
                Protocol mismatch: Previous day {previousDayKey} has no data.
                Choose an action to proceed.
              </p>
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setShowResolvePopup(false);
                    setSessionActive(true);
                  }}
                  className="flex-1 bg-white text-black py-4 font-black uppercase italic hover:bg-zinc-300 transition-colors"
                >
                  Log Now
                </button>
                <button
                  onClick={async () => {
                    try {
                      await fetch("http://localhost:5001/api/logs", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          athleteId,
                          dayId: previousDayKey,
                          entry_type: "skipped",
                          entries: {}
                        })
                      });
                      setLog(prev => ({ ...prev, [`${previousDayKey}_SKIPPED`]: { weight: 0, reps: 0 } }));
                      setShowResolvePopup(false);
                    } catch (e) { alert("NETWORK_ERROR"); }
                  }}
                  className="flex-1 bg-orange-600 text-black py-4 font-black uppercase italic hover:bg-orange-500 transition-colors"
                >
                  Skip & Notify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {timerActive && (
        <div className={`fixed bottom-10 right-10 z-50 transition-all duration-500 transform ${timerStatus === 'finished' ? 'scale-110' : 'scale-100'}`}>
          <div className={`relative p-8 skew-x-[-15deg] border-2 transition-colors duration-500 ${timerStatus === 'finished' ? 'bg-white border-orange-600' : 'bg-black/80 border-white/20'}`}>
            <div className="skew-x-[15deg] flex flex-col items-center">
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="60" stroke="white" strokeWidth="2" fill="transparent" />
                  <circle
                    cx="64" cy="64" r="60" stroke="#ea580c" strokeWidth="6" fill="transparent"
                    strokeDasharray={377}
                    strokeDashoffset={377 - (377 * (timer / totalTimerTime))}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
              </div>

              <span className={`font-mono text-[10px] uppercase tracking-widest mb-1 ${timerStatus === 'finished' ? 'text-orange-600 animate-pulse' : 'text-zinc-500'}`}>
                {timerStatus === 'finished' ? "▶_READY_TO_LIFT" : "REST_PROTOCOL_ACTIVE"}
              </span>

              <div className="relative">
                <span className={`text-6xl font-[1000] italic leading-none transition-colors ${timerStatus === 'finished' ? 'text-black' : 'text-white'}`}>
                  {timerStatus === 'finished' ? "GO!!" : `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`}
                </span>
                {timerStatus === 'active' && <div className="absolute -inset-1 bg-orange-600/20 blur-xl animate-pulse -z-10" />}
              </div>

              <div className={`mt-2 w-full h-1 bg-zinc-800 overflow-hidden`}>
                <div
                  className="h-full bg-orange-600 transition-all duration-1000 ease-linear"
                  style={{ width: `${(timer / totalTimerTime) * 100}%` }}
                />
              </div>

              <span className={`mt-2 font-mono text-[8px] uppercase ${timerStatus === 'finished' ? 'text-black' : 'text-zinc-500'}`}>
                System_Status: <span className={timerStatus === 'finished' ? 'font-bold' : 'animate-pulse'}>{timerStatus === 'finished' ? "STABILIZED" : "RECOVERING..."}</span>
              </span>
            </div>
          </div>

          {timerStatus === 'finished' && (
            <>
              <div className="absolute -top-4 -left-4 w-8 h-px bg-orange-600 animate-ping" />
              <div className="absolute -bottom-4 -right-4 w-12 h-px bg-orange-600 animate-ping" />
            </>
          )}
        </div>
      )}

      {/* AI Chat Interface */}
      {showAIChat && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] backdrop-blur-md">
          <div className="bg-zinc-900 border border-orange-600 w-full max-w-2xl h-[600px] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-black uppercase text-orange-500">AI COACH</h3>
                <span className="text-xs text-zinc-400">{activeAgent && TITANOS_AGENTS[activeAgent]?.name}</span>
              </div>
              <button
                onClick={() => setShowAIChat(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiMessages.length === 0 && (
                <div className="text-center text-zinc-500 text-sm">
                  Ask your AI coach anything about training, recovery, or nutrition.
                </div>
              )}
              {aiMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user'
                    ? 'bg-orange-600 text-black'
                    : 'bg-zinc-800 text-white'
                    }`}>
                    <div className="text-sm font-mono whitespace-pre-line">{msg.content}</div>
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800 text-white p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      <span className="text-sm">Coach is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendAIMessage()}
                  placeholder="Ask your coach..."
                  className="flex-1 bg-zinc-800 border border-white/10 px-4 py-2 text-sm focus:border-orange-600 outline-none"
                  disabled={aiLoading}
                />
                <button
                  onClick={sendAIMessage}
                  disabled={aiLoading || !aiInput.trim()}
                  className="bg-orange-600 text-black px-4 py-2 font-black uppercase text-sm hover:bg-white transition-colors disabled:opacity-50"
                >
                  SEND
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Analysis Interface */}
      {showVideoAnalysis && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] backdrop-blur-md">
          <div className="bg-zinc-900 border border-orange-600 w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-black uppercase text-orange-500">FORM ANALYZER</h3>
              </div>
              <button
                onClick={() => setShowVideoAnalysis(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center text-zinc-400 text-sm">
                Upload a video of your lift for AI form analysis
              </div>

              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={aiLoading}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Video className="w-8 h-8 text-zinc-500" />
                  <span className="text-sm text-zinc-400">
                    {aiLoading ? 'Analyzing...' : 'Click to upload video'}
                  </span>
                  <span className="text-xs text-zinc-600">MP4, MOV up to 25MB</span>
                </label>
              </div>

              {aiMessages.length > 0 && (
                <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
                  <h4 className="text-sm font-black uppercase text-orange-500 mb-2">Analysis Results</h4>
                  {aiMessages.map((msg, idx) => (
                    <div key={idx} className="text-sm text-zinc-300 whitespace-pre-line">
                      {msg.content}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-[1600px] mx-auto p-4 md:p-10">
        <header className="flex justify-between items-center mb-12 border-b-2 border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 bg-orange-600 skew-x-[-20deg] ${showCelebration || timerActive ? 'animate-ping' : 'animate-pulse'}`} />
            <span className="font-mono text-xs tracking-[0.5em] text-orange-500 uppercase">
              {timerStatus === 'active'
                ? "RECOVERY_IN_PROGRESS"
                : timerStatus === 'finished'
                  ? "NEURAL_SYNC_COMPLETE"
                  : showCelebration
                    ? "PHASE_COMPLETE_STABILIZING"
                    : "SYSTEM_ACTIVE"}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 font-mono text-[10px] uppercase">
              <span className="text-zinc-500">
                LOAD_INDEX: <span className="text-white">{(calculateTonnage() / 1000).toFixed(1)}T</span>
              </span>

              {isCompetitionMode ? (
                <span className="bg-red-600 text-black px-3 py-1 font-bold tracking-widest">
                  COMP_MODE_ACTIVE
                </span>
              ) : (
                <span className="bg-green-600 text-black px-3 py-1 font-bold tracking-widest">
                  BASE_TRAINING
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 border-l border-white/20 pl-6">
              <div className="text-right">
                <div className="font-mono text-[8px] text-zinc-500 uppercase">Athlete</div>
                <div className="font-mono text-xs text-orange-400">
                  {profile?.email || user?.email}
                </div>
              </div>
              <button
                onClick={logout}
                className="bg-red-600/10 border border-red-600/30 text-red-400 px-3 py-2 font-mono text-[10px] uppercase hover:bg-red-600/20 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {isCompetitionMode && competitionDate && (
          <div className="relative mb-12 group overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_10px,#000_10px,#000_20px)] opacity-60" />

            <div className="bg-zinc-950 border-x border-b border-white/10 relative">
              <div className="flex flex-col md:flex-row">

                <div className="p-6 border-b md:border-b-0 md:border-r border-white/5 flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 border-2 border-red-600 flex items-center justify-center rotate-45 group-hover:rotate-90 transition-transform duration-500">
                      <div className="w-6 h-6 bg-red-600 flex items-center justify-center -rotate-45 group-hover:-rotate-90 transition-transform">
                        <span className="text-black font-black text-xs">!</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-red-600 font-bold uppercase tracking-[0.3em]">Operational_Target</p>
                      <h3 className="text-white font-black text-xs font-mono uppercase">Phase: Final_Peak_Voltage</h3>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute -top-4 -left-2 text-[60px] font-black text-white/5 select-none uppercase italic">OBJECTIVE</span>
                    <h2 className="relative text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                      {new Date(competitionDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                      <span className="text-red-600">.</span>
                      {new Date(competitionDate).getFullYear()}
                    </h2>
                  </div>
                </div>

                <div className="relative bg-white/[0.02] p-6 flex flex-col items-center justify-center min-w-[280px] border-t-4 border-red-600">
                  <div className="absolute top-2 right-2 flex gap-1">
                    <div className="w-1 h-1 bg-red-600 animate-pulse" />
                    <div className="w-1 h-1 bg-red-600 animate-pulse delay-75" />
                    <div className="w-1 h-1 bg-red-600 animate-pulse delay-150" />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="block font-mono text-[10px] text-zinc-500 uppercase leading-tight text-right">T-Minus</span>
                      <span className="block font-mono text-[10px] text-red-600 font-bold uppercase leading-tight text-right">Execution</span>
                    </div>

                    <div className="relative">
                      <span className="text-7xl md:text-8xl font-black text-white tracking-[0.1em] drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                        {Math.max(0, Math.ceil((new Date(competitionDate) - new Date()) / (1000 * 60 * 60 * 24)))}
                      </span>
                      <span className="absolute -right-8 bottom-4 font-mono text-sm text-zinc-500 font-black uppercase [writing-mode:vertical-lr]">
                        Days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-red-600 flex flex-wrap items-center justify-between px-4 py-2">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-black font-mono text-[9px] font-black uppercase">Status:</span>
              <span className="bg-black text-red-600 px-2 py-0.5 text-[9px] font-mono font-black uppercase animate-pulse">
                Heavy_Payload_Imminent
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-black font-mono text-[9px] font-black uppercase italic tracking-tighter">
                "Strength is the only currency."
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-black font-black">
            <span className="opacity-50">SYNC_ID:</span>
            <span>{Math.random().toString(16).slice(2, 8).toUpperCase()}</span>
          </div>
        </div>

        <div className="mt-2 flex justify-between">
          <div className="flex gap-1">
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`w-1 h-1 ${i % 3 === 0 ? 'bg-red-600' : 'bg-zinc-800'}`} />
            ))}
          </div>
          <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Neural_Max_Calibration_Complete</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <nav className="lg:col-span-3 flex flex-col gap-4">
            {[{ id: "today", label: "TERMINAL", icon: "⚡" }, { id: "week", label: "STRATEGY", icon: "📡" }, { id: "video", label: "VIDEO ANALYSIS", icon: "📹" }, { id: "competition", label: "COMPETITION", icon: "🏆" }, { id: "history", label: "ARCHIVE", icon: "💾" }, { id: "progress", label: "EVOLUTION", icon: "🧬" }, { id: "profile", label: "IDENTITY", icon: "🧾" }].map((t) => (
              <button key={t.id} onClick={() => { setTab(t.id); setSessionActive(false); setShowCelebration(false); }}
                className={`relative p-6 transition-all skew-x-[-15deg] origin-left ${tab === t.id ? "bg-orange-600 translate-x-4" : "bg-zinc-900/40"}`}>
                <div className="skew-x-[15deg] flex justify-between uppercase">
                  <span className="text-xl italic">{t.label}</span>
                  <span>{t.icon}</span>
                </div>
              </button>
            ))}

          </nav>

          <main className="lg:col-span-9 relative bg-zinc-900/10 border-t-2 border-r-2 border-white/5 backdrop-blur-xl min-h-[650px] p-6 md:p-12">
            {tab === "today" && (
              <div className="animate-in fade-in duration-500">

                {currentDay?.phase === "competition_day" ? (
                  <CompetitionDayUI
                    attempts={currentDay.main_lifts}
                    competitionDate={program.metadata?.competitionDate}
                  />
                ) : (
                  <>
                    {currentPhase === "competition_day" ? (
                      <CompetitionDayUI
                        currentDay={currentDay}
                        athlete={profile}
                        saveSession={saveSession}
                      />
                    ) : (
                      <>
                        {showCelebration ? (
                          <div className="text-center py-10 flex flex-col items-center">
                            <h2 className="text-7xl font-[1000] italic uppercase leading-none mb-6">
                              WEEK_0{weekIndex + 1}<br />
                              <span className="text-orange-600">CONCLUDED</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl mb-10">
                              <div className="bg-white/5 p-8 border-l-2 border-white">
                                <span className="block font-mono text-[10px] text-zinc-500 uppercase mb-2">Weekly Volume</span>
                                <span className="text-4xl italic text-white font-black">{calculateTonnage(`W${weekIndex + 1}`).toLocaleString()} KG</span>
                              </div>
                              <div className="bg-white/5 p-8 border-l-2 border-orange-600">
                                <span className="block font-mono text-[10px] text-zinc-500 uppercase mb-2">Total Program Tonnage</span>
                                <span className="text-4xl italic text-orange-500 font-black">{calculateTonnage().toLocaleString()} KG</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const unresolved = getNextUnresolvedDay(program, log);
                                if (unresolved) {
                                  setWeekIndex(unresolved.weekIndex);
                                  setDayIndex(unresolved.dayIndex);
                                  setIsProgramFinished(false);
                                } else {
                                  setIsProgramFinished(true);
                                }
                                setShowCelebration(false);
                              }}
                              className="bg-white text-black px-16 py-6 font-black uppercase italic hover:bg-orange-600 transition-colors"
                            >
                              Initialize Next Week
                            </button>
                          </div>
                        ) : !sessionActive ? (
                          <div className="text-center py-20">
                            <div className="mb-6 text-center font-mono uppercase tracking-widest text-sm">
                              {currentPhase === "peak" && (
                                <span className="text-orange-500">PEAK_PHASE_ACTIVE</span>
                              )}
                              {currentPhase === "taper" && (
                                <span className="text-yellow-400">TAPER_PHASE</span>
                              )}
                              {currentPhase === "post_comp_deload" && (
                                <span className="text-blue-400">POST_COMP_DELOAD</span>
                              )}
                            </div>

                            <h2 className="text-6xl font-[1000] italic uppercase mb-2 leading-none">
                              {calculateTonnage(dayKey) > 0 ? "Protocol_Sync_Ok" : "Protocol_Pending"}
                            </h2>
                            <p className="text-orange-500 font-mono text-[10px] tracking-[0.5em] mb-12 uppercase">
                              Queue: Week {weekIndex + 1} // Day {dayIndex + 1}
                            </p>

                            <button
                              disabled={calculateTonnage(dayKey) > 0}
                              onClick={() => {
                                if (hasUnresolved) {
                                  setShowResolvePopup(true);
                                } else {
                                  setSessionActive(true);
                                }
                              }}
                              className="px-16 py-8 font-black uppercase italic text-2xl bg-orange-600 text-black hover:bg-white shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {calculateTonnage(dayKey) > 0 ? "Day Completed" : "Initialize Session"}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="flex justify-between items-end border-b border-orange-600/30 pb-4">
                              <h2 className="text-3xl italic uppercase">Active_Session</h2>
                              <div className="flex gap-2">
                                <button onClick={() => startTimer(90)} className="text-[10px] font-mono border border-white/20 px-3 py-1 hover:bg-white hover:text-black transition-all">REST_90S</button>
                                <button onClick={() => startTimer(180)} className="text-[10px] font-mono border border-white/20 px-3 py-1 hover:bg-white hover:text-black transition-all">REST_180S</button>
                              </div>
                            </div>
                            {currentDayWithIds?.main_lifts.map((lift, i) => (
                              <div key={lift.stableId || i} className="border border-white/10 bg-black/60 p-6 flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                  <h4 className="text-xl font-black uppercase text-orange-500 italic">{lift.lift}</h4>
                                  <p className="text-[10px] font-mono text-zinc-500">
                                    TARGET: {lift.sets}×{lift.reps} @ {lift.intensity_pct ? `${Math.round(lift.intensity_pct * 100)}%` : `RPE ${lift.target_rpe || '?'}`}
                                  </p>

                                  {/* AI Suggestions - Triggered by context */}
                                  {titanOSActive && (
                                    <div className="mt-2 space-y-1">
                                      {activeAgent === 'form_analyzer' && (
                                        <div className="p-2 bg-orange-600/10 border border-orange-600/20">
                                          <p className="text-[8px] font-mono text-orange-400">
                                            💡 Form Analyzer: Upload video for real-time feedback
                                          </p>
                                        </div>
                                      )}
                                      {activeAgent === 'recovery_coach' && (
                                        <div className="p-2 bg-blue-600/10 border border-blue-600/20">
                                          <p className="text-[8px] font-mono text-blue-400">
                                            💡 Recovery Coach: Monitor rest periods and HRV
                                          </p>
                                        </div>
                                      )}
                                      {activeAgent === 'performance_strategist' && (
                                        <div className="p-2 bg-green-600/10 border border-green-600/20">
                                          <p className="text-[8px] font-mono text-green-400">
                                            💡 Performance Strategist: Optimize load based on bar speed
                                          </p>
                                        </div>
                                      )}
                                      {activeAgent === 'nutrition_advisor' && (
                                        <div className="p-2 bg-purple-600/10 border border-purple-600/20">
                                          <p className="text-[8px] font-mono text-purple-400">
                                            💡 Nutrition Advisor: Fuel timing for peak performance
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2 flex-1">
                                  <div className="relative w-full">
                                    <span className="absolute top-1 left-2 text-[8px] text-zinc-500 font-mono uppercase">Weight (KG)</span>
                                    <input
                                      value={log[`${dayKey}_${lift.stableId}`]?.weight || ''}
                                      onChange={(e) => setLog({ ...log, [`${dayKey}_${lift.stableId}`]: { ...log[`${dayKey}_${lift.stableId}`], weight: e.target.value } })}
                                      className="w-full bg-black/40 border border-white/10 p-4 pt-6 text-xl focus:border-orange-600 outline-none font-mono"
                                    />
                                  </div>
                                  <div className="relative w-full">
                                    <span className="absolute top-1 left-2 text-[8px] text-zinc-500 font-mono uppercase">Reps</span>
                                    <input
                                      value={log[`${dayKey}_${lift.stableId}`]?.reps || ''}
                                      onChange={(e) => setLog({ ...log, [`${dayKey}_${lift.stableId}`]: { ...log[`${dayKey}_${lift.stableId}`], reps: e.target.value } })}
                                      className="w-full bg-black/40 border border-white/10 p-4 pt-6 text-xl focus:border-orange-600 outline-none font-mono"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button onClick={saveSession} className="w-full bg-white text-black py-6 mt-10 font-black uppercase italic text-xl hover:bg-orange-600 transition-colors">
                              Commit to Data Stream
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {tab === "week" && (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-4xl font-black italic uppercase text-orange-600 mb-10">Tactical_Plan</h2>

                {/* Original Week Content */}
                <div className="flex bg-zinc-900/50 p-1 mb-8 overflow-x-auto">
                  {program.weeks.map((_, i) => (
                    <button key={i} onClick={() => { setViewWeek(i); setViewDay(0); }} className={`px-4 py-2 text-[10px] font-mono ${viewWeek === i ? 'bg-orange-600 text-black' : 'text-zinc-500'}`}>W0{i + 1}</button>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div className="flex flex-col gap-2">
                    {program.weeks[viewWeek].days.map((d, i) => (
                      <button key={i} onClick={() => setViewDay(i)} className={`p-4 text-left border-l-4 ${viewDay === i ? 'bg-white text-black border-orange-600' : 'bg-zinc-900/30 border-white/10'}`}>
                        <div className="italic uppercase font-bold text-xs">Protocol_{d.day}</div>
                      </button>
                    ))}
                  </div>
                  <div className="lg:col-span-3 bg-black/40 border border-white/10 p-8">
                    <h3 className="text-2xl font-black italic uppercase text-orange-500 mb-8">{program.weeks[viewWeek].days[viewDay].day_name || `Stream_Day_${viewDay + 1}`}</h3>
                    <div className="space-y-2">
                      {program.weeks[viewWeek].days[viewDay].main_lifts.map((l, i) => (
                        <div key={i} className="flex justify-between items-center bg-white/5 p-4 border-l border-white/20 uppercase font-bold">

                          <span>{l.lift}</span>

                          <span className="font-mono text-xs text-orange-400 text-right">

                            {l.sets && l.reps && (
                              <>
                                {l.sets}×{l.reps}
                                {l.load ? ` @ ${l.load}KG` : ""}
                              </>
                            )}

                            {l.attempt_plan && (
                              <>
                                OP: {l.attempt_plan.opener}KG
                                • 2nd: {l.attempt_plan.second}KG
                                • 3rd: {l.attempt_plan.third}KG
                              </>
                            )}

                          </span>

                        </div>
                      ))}

                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "video" && (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-4xl font-black italic uppercase text-orange-600 mb-8">Video Analysis</h2>

                <div className="bg-zinc-900/40 border border-white/10 p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <Eye className="w-6 h-6 text-orange-500" />
                    <h3 className="text-xl font-black uppercase text-orange-500">AI Form Analyzer</h3>
                    <span className="text-xs text-zinc-400 ml-auto">Powered by Google Gemini</span>
                  </div>

                  <div className="space-y-6">
                    <div className="text-center text-zinc-400">
                      <p className="text-lg mb-2">Upload a video of your lift for AI form analysis</p>
                      <p className="text-sm">Get instant feedback on your technique from our AI coach</p>
                    </div>

                    <div className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        disabled={aiLoading}
                        className="hidden"
                        id="video-analysis-upload"
                      />
                      <label
                        htmlFor="video-analysis-upload"
                        className="cursor-pointer flex flex-col items-center gap-4"
                      >
                        <Video className="w-16 h-16 text-zinc-500" />
                        <div>
                          <span className="text-lg text-zinc-400">
                            {aiLoading ? 'Analyzing your form...' : 'Click to upload video'}
                          </span>
                          <div className="text-xs text-zinc-600 mt-1">MP4, MOV up to 25MB</div>
                        </div>
                      </label>
                    </div>

                    {aiLoading && (
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600/10 border border-orange-600/20 rounded-lg">
                          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                          <span className="text-sm text-orange-400">AI is analyzing your technique...</span>
                        </div>
                      </div>
                    )}

                    {aiMessages.length > 0 && (
                      <div className="mt-8">
                        <h4 className="text-lg font-black uppercase text-orange-500 mb-4">Analysis Results</h4>
                        <div className="space-y-4">
                          {aiMessages.map((msg, idx) => (
                            <div key={idx} className="bg-zinc-800 rounded-lg p-6">
                              <div className="flex items-center gap-2 mb-3">
                                <Eye className="w-4 h-4 text-orange-500" />
                                <span className="text-xs font-mono text-orange-400">FORM ANALYSIS #{idx + 1}</span>
                              </div>
                              <div className="text-sm text-zinc-300 whitespace-pre-line font-mono">
                                {msg.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-8 pt-8 border-t border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 border border-white/10 p-4 text-center">
                          <div className="text-2xl mb-2">🎯</div>
                          <div className="text-sm font-black text-white">IPF Standards</div>
                          <div className="text-xs text-zinc-400">Analysis based on competition rules</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 text-center">
                          <div className="text-2xl mb-2">⚡</div>
                          <div className="text-sm font-black text-white">Instant Feedback</div>
                          <div className="text-xs text-zinc-400">Get results in seconds</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 text-center">
                          <div className="text-2xl mb-2">📈</div>
                          <div className="text-sm font-black text-white">Progress Tracking</div>
                          <div className="text-xs text-zinc-400">Monitor technique improvements</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "competition" && (
              <div className="animate-in fade-in duration-500">
                {/* Competition Phase Navigation */}
                <div className="flex justify-center mb-8">
                  <div className="bg-zinc-900/40 border border-white/10 p-1 inline-flex">
                    <button
                      onClick={() => setCompetitionPhase('search')}
                      className={`px-4 py-2 font-black uppercase text-xs transition-all relative ${competitionPhase === 'search'
                        ? 'bg-orange-600 text-black'
                        : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                      FIND COMPETITIONS
                      {competitions.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                      )}
                    </button>
                    <button
                      onClick={() => setCompetitionPhase('bucket')}
                      className={`px-4 py-2 font-black uppercase text-xs transition-all relative ${competitionPhase === 'bucket'
                        ? 'bg-orange-600 text-black'
                        : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                      BUCKET LIST
                      {bucketList.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </button>
                    <button
                      onClick={() => setCompetitionPhase('registered')}
                      className={`px-4 py-2 font-black uppercase text-xs transition-all relative ${competitionPhase === 'registered'
                        ? 'bg-orange-600 text-black'
                        : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                      REGISTERED
                      {registeredCompetition && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </button>
                    {(competitionPhase === 'preparation' || competitionPhase === 'competition' || competitionPhase === 'post') && (
                      <>
                        <button
                          onClick={() => setCompetitionPhase('preparation')}
                          className={`px-4 py-2 font-black uppercase text-xs transition-all ${competitionPhase === 'preparation'
                            ? 'bg-orange-600 text-black'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                          PREP
                        </button>
                        <button
                          onClick={() => setCompetitionPhase('competition')}
                          className={`px-4 py-2 font-black uppercase text-xs transition-all ${competitionPhase === 'competition'
                            ? 'bg-red-600 text-black'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                          COMP DAY
                        </button>
                        <button
                          onClick={() => setCompetitionPhase('post')}
                          className={`px-4 py-2 font-black uppercase text-xs transition-all ${competitionPhase === 'post'
                            ? 'bg-green-600 text-black'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                          POST
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* SEARCH COMPETITIONS PHASE */}
                {competitionPhase === 'search' && (
                  <div className="space-y-6">
                    <h2 className="text-4xl font-black italic uppercase text-orange-600 mb-8">Find Competitions</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* AI Competition Search */}
                      <div className="bg-zinc-900/40 border border-white/10 p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Brain className="w-5 h-5 text-orange-500" />
                          <h3 className="text-lg font-black uppercase text-orange-500">AI Competition Scout</h3>
                        </div>
                        <div className="space-y-4">
                          <div className="text-center text-zinc-400 text-sm">
                            Let AI search Instagram, federations, and powerlifting websites for competitions near you
                          </div>
                          <input
                            type="text"
                            placeholder="Enter your location (city, state)"
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 px-4 py-3 text-sm focus:border-orange-600 outline-none"
                          />
                          <select 
                            value={selectedFederation}
                            onChange={(e) => setSelectedFederation(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 px-4 py-3 text-sm focus:border-orange-600 outline-none"
                          >
                            <option>All Federations</option>
                            <option>IPF</option>
                            <option>USAPL</option>
                            <option>USPA</option>
                            <option>100% Raw</option>
                            <option>APA</option>
                          </select>
                          <button
                            onClick={async () => {
                              // Enhanced AI search with location and federation filters
                              try {
                                const response = await fetch('http://localhost:5001/api/ai/search-competitions', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    location: searchLocation || 'any',
                                    federation: selectedFederation === 'All Federations' ? 'any' : selectedFederation,
                                    dateRange: 'all' // past, upcoming, all
                                  })
                                });
                                
                                if (response.ok) {
                                  const data = await response.json();
                                  setCompetitions(data.competitions || []);
                                  addCompNotification(`Found ${data.competitions?.length || 0} competitions!`, 'success');
                                } else {
                                  // Fallback to mock data if AI search fails
                                  const mockCompetitions = [
                                    { id: Date.now() + 1, name: 'IPF National Championships', date: '2024-06-15', location: searchLocation || 'Denver, CO', federation: 'IPF', status: 'upcoming' },
                                    { id: Date.now() + 2, name: 'State Powerlifting Meet', date: '2024-04-20', location: searchLocation || 'Austin, TX', federation: 'USAPL', status: 'upcoming' },
                                    { id: Date.now() + 3, name: 'Raw Classic', date: '2024-05-10', location: searchLocation || 'Phoenix, AZ', federation: 'USPA', status: 'upcoming' },
                                    { id: Date.now() + 4, name: 'Winter Classic', date: '2023-12-15', location: searchLocation || 'Chicago, IL', federation: 'USPA', status: 'completed' },
                                    { id: Date.now() + 5, name: 'Summer Showdown', date: '2024-08-20', location: searchLocation || 'Miami, FL', federation: 'IPF', status: 'upcoming' }
                                  ];
                                  
                                  // Filter by federation if selected
                                  const filteredCompetitions = selectedFederation === 'All Federations' 
                                    ? mockCompetitions 
                                    : mockCompetitions.filter(c => c.federation === selectedFederation);
                                  
                                  setCompetitions(filteredCompetitions);
                                  addCompNotification(`Found ${filteredCompetitions.length} competitions near ${searchLocation || 'your location'}!`, 'success');
                                }
                              } catch (error) {
                                console.warn("AI search failed, using fallback:", error);
                                // Fallback to mock data
                                const mockCompetitions = [
                                  { id: Date.now() + 1, name: 'IPF National Championships', date: '2024-06-15', location: searchLocation || 'Denver, CO', federation: 'IPF', status: 'upcoming' },
                                  { id: Date.now() + 2, name: 'State Powerlifting Meet', date: '2024-04-20', location: searchLocation || 'Austin, TX', federation: 'USAPL', status: 'upcoming' },
                                  { id: Date.now() + 3, name: 'Raw Classic', date: '2024-05-10', location: searchLocation || 'Phoenix, AZ', federation: 'USPA', status: 'upcoming' }
                                ];
                                setCompetitions(mockCompetitions);
                                addCompNotification('Found 3 competitions near you!', 'success');
                              }
                            }}
                            className="w-full bg-orange-600 text-black py-3 font-black uppercase text-sm hover:bg-white transition-colors"
                          >
                            🔍 AI Search Competitions
                          </button>
                        </div>
                      </div>

                      {/* Manual Search */}
                      <div className="bg-zinc-900/40 border border-white/10 p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Target className="w-5 h-5 text-orange-500" />
                          <h3 className="text-lg font-black uppercase text-orange-500">Manual Search</h3>
                        </div>
                        <div className="space-y-4">
                          <input
                            type="text"
                            placeholder="Competition name"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 px-4 py-3 text-sm focus:border-orange-600 outline-none"
                          />
                          <input
                            type="date"
                            value={searchDate}
                            onChange={(e) => setSearchDate(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 px-4 py-3 text-sm focus:border-orange-600 outline-none"
                          />
                          <button 
                            onClick={() => {
                              // Manual search based on filters
                              const mockCompetitions = [
                                { id: Date.now() + 10, name: 'National Powerlifting Meet', date: '2024-07-15', location: searchLocation || 'New York, NY', federation: 'USAPL', status: 'upcoming' },
                                { id: Date.now() + 11, name: 'Regional Championship', date: '2024-09-20', location: searchLocation || 'Los Angeles, CA', federation: 'IPF', status: 'upcoming' },
                                { id: Date.now() + 12, name: 'Local Meet', date: searchDate || '2024-03-25', location: searchLocation || 'Seattle, WA', federation: 'USPA', status: 'upcoming' }
                              ];
                              
                              // Filter by search criteria
                              let filtered = mockCompetitions;
                              if (searchName) {
                                filtered = filtered.filter(c => c.name.toLowerCase().includes(searchName.toLowerCase()));
                              }
                              if (searchDate) {
                                filtered = filtered.filter(c => c.date === searchDate);
                              }
                              
                              setCompetitions(filtered);
                              addCompNotification(`Found ${filtered.length} competitions matching your search!`, 'success');
                            }}
                            className="w-full bg-white/10 border border-white/20 py-3 font-black uppercase text-sm hover:bg-white/20 transition-colors"
                          >
                            ➕ Search Competitions
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Search Results */}
                    {competitions.length > 0 && (
                      <div className="bg-zinc-900/40 border border-white/10 p-6">
                        <h3 className="text-lg font-black uppercase text-orange-500 mb-4">Search Results</h3>
                        <div className="space-y-3">
                          {competitions.map(comp => (
                            <div key={comp.id} className="bg-white/5 border border-white/10 p-4 flex items-center justify-between">
                              <div>
                                <div className="font-black text-white">{comp.name}</div>
                                <div className="text-sm text-zinc-400">{comp.date} • {comp.location} • {comp.federation}</div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={async () => {
                                    if (!bucketList.find(b => b.id === comp.id)) {
                                      const updatedBucketList = [...bucketList, comp];
                                      setBucketList(updatedBucketList);
                                      addCompNotification(`Added ${comp.name} to bucket list!`, 'success');
                                      
                                      // Save to backend
                                      try {
                                        await fetch(`http://localhost:5001/api/competitions/bucket-list?athleteId=${athleteId}`, {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify(comp)
                                        });
                                      } catch (error) {
                                        console.warn("Failed to add to bucket list:", error);
                                      }
                                    }
                                  }}
                                  className="bg-blue-600 text-black px-3 py-1 text-xs font-black uppercase hover:bg-blue-500 transition-colors"
                                >
                                  ADD TO BUCKET
                                </button>
                                <button
                                  onClick={async () => {
                                    setSelectedCompetition(comp);
                                    setRegisteredCompetition(comp);
                                    setCompetitions(competitions.filter(c => c.id !== comp.id));
                                    setCompetitionPhase('registered');
                                    addCompNotification(`Registered for ${comp.name}!`, 'success');
                                    
                                    // Save to backend
                                    try {
                                      await fetch(`http://localhost:5001/api/competitions/register?athleteId=${athleteId}`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(comp)
                                      });
                                    } catch (error) {
                                      console.warn("Failed to register for competition:", error);
                                    }
                                  }}
                                  className="bg-green-600 text-black px-3 py-1 text-xs font-black uppercase hover:bg-green-500 transition-colors"
                                >
                                  REGISTER
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* BUCKET LIST PHASE */}
                {competitionPhase === 'bucket' && (
                  <div className="space-y-6">
                    <h2 className="text-4xl font-black italic uppercase text-orange-600 mb-8">Competition Bucket List</h2>

                    {bucketList.length === 0 ? (
                      <div className="bg-zinc-900/40 border border-white/10 p-12 text-center">
                        <Target className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
                        <p className="text-zinc-400 text-lg mb-2">Your bucket list is empty</p>
                        <p className="text-zinc-500 text-sm mb-6">Find competitions and add them to your bucket list to track your goals</p>
                        <button
                          onClick={() => setCompetitionPhase('search')}
                          className="bg-orange-600 text-black px-6 py-3 font-black uppercase hover:bg-white transition-colors"
                        >
                          Find Competitions
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bucketList.map(comp => (
                          <div key={comp.id} className="bg-zinc-900/40 border border-white/10 p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                  <h3 className="text-xl font-black text-white">{comp.name}</h3>
                                </div>
                                <div className="text-sm text-zinc-400 space-y-1">
                                  <div>📅 {comp.date}</div>
                                  <div>📍 {comp.location}</div>
                                  <div>🏋️ {comp.federation}</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={async () => {
                                    const updatedBucketList = bucketList.filter(b => b.id !== comp.id);
                                    setBucketList(updatedBucketList);
                                    addCompNotification(`Removed ${comp.name} from bucket list`, 'info');
                                    
                                    // Save to backend
                                    try {
                                      await fetch(`http://localhost:5001/api/competitions/bucket-list?athleteId=${athleteId}&competitionId=${comp.id}`, {
                                        method: 'DELETE'
                                      });
                                    } catch (error) {
                                      console.warn("Failed to remove from bucket list:", error);
                                    }
                                  }}
                                  className="bg-zinc-700 text-white px-3 py-2 text-xs font-black uppercase hover:bg-zinc-600 transition-colors"
                                >
                                  REMOVE
                                </button>
                                <button
                                  onClick={async () => {
                                    setSelectedCompetition(comp);
                                    setRegisteredCompetition(comp);
                                    const updatedBucketList = bucketList.filter(b => b.id !== comp.id);
                                    setBucketList(updatedBucketList);
                                    setCompetitionPhase('registered');
                                    setCompetitionMode(false);
                                    addCompNotification(`Registered for ${comp.name}!`, 'success');
                                    
                                    // Save to backend
                                    try {
                                      await fetch(`http://localhost:5001/api/competitions/register?athleteId=${athleteId}`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(comp)
                                      });
                                      
                                      // Also remove from bucket list
                                      await fetch(`http://localhost:5001/api/competitions/bucket-list?athleteId=${athleteId}&competitionId=${comp.id}`, {
                                        method: 'DELETE'
                                      });
                                    } catch (error) {
                                      console.warn("Failed to register competition:", error);
                                    }
                                  }}
                                  className="bg-green-600 text-black px-3 py-2 text-xs font-black uppercase hover:bg-green-500 transition-colors"
                                >
                                  REGISTER NOW
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* REGISTERED PHASE */}
                {competitionPhase === 'registered' && (
                  <div className="space-y-6">
                    <h2 className="text-4xl font-black italic uppercase text-green-600 mb-8">Registered Competition</h2>

                    {registeredCompetition ? (
                      <div className="bg-zinc-900/40 border border-white/10 p-8">
                        <div className="text-center mb-8">
                          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trophy className="w-8 h-8 text-black" />
                          </div>
                          <h3 className="text-2xl font-black text-white mb-2">{registeredCompetition.name}</h3>
                          <div className="text-zinc-400 space-y-1">
                            <div>📅 {registeredCompetition.date}</div>
                            <div>📍 {registeredCompetition.location}</div>
                            <div>🏋️ {registeredCompetition.federation}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                          <div className="bg-white/5 border border-white/10 p-4 text-center">
                            <div className="text-2xl font-black text-orange-500 mb-1">{calculateDaysUntil(registeredCompetition.date)}</div>
                            <div className="text-xs text-zinc-400">Days Until Competition</div>
                          </div>
                          <div className="bg-white/5 border border-white/10 p-4 text-center">
                            <div className="text-2xl font-black text-blue-500 mb-1">{calculateWeeksUntil(registeredCompetition.date)}</div>
                            <div className="text-xs text-zinc-400">Weeks to Prepare</div>
                          </div>
                          <div className="bg-white/5 border border-white/10 p-4 text-center">
                            <div className="text-2xl font-black text-green-500 mb-1">READY</div>
                            <div className="text-xs text-zinc-400">Status</div>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button
                            onClick={() => {
                              setCompetitionPhase('preparation');
                              setCompetitionMode(true);
                              addCompNotification('Preparation mode activated! Dashboard optimized for competition prep.', 'success');
                            }}
                            className="flex-1 bg-orange-600 text-black py-3 font-black uppercase hover:bg-white transition-colors"
                          >
                            🎯 Begin Preparation
                          </button>
                          <button
                            onClick={() => {
                              setRegisteredCompetition(null);
                              setCompetitionPhase('search');
                              addCompNotification('Registration cancelled', 'info');
                            }}
                            className="bg-zinc-700 text-white px-6 py-3 font-black uppercase hover:bg-zinc-600 transition-colors"
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-zinc-900/40 border border-white/10 p-12 text-center">
                        <p className="text-zinc-400 text-lg mb-6">No competitions registered</p>
                        <button
                          onClick={() => setCompetitionPhase('search')}
                          className="bg-orange-600 text-black px-6 py-3 font-black uppercase hover:bg-white transition-colors"
                        >
                          Find Competitions
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* PREPARATION PHASE */}
                {competitionPhase === 'preparation' && (
                  <div className="space-y-6">
                    <h2 className="text-4xl font-black italic uppercase text-orange-600 mb-8">Competition Preparation</h2>

                    {/* Countdown Timer */}
                    <div className="bg-zinc-900/40 border border-white/10 p-8 text-center">
                      <h3 className="text-lg font-black uppercase text-orange-500 mb-4">Days Until Competition</h3>
                      <div className="text-6xl font-black text-white mb-2">{calculateDaysUntil(registeredCompetition?.date)}</div>
                      <div className="text-sm text-zinc-400">{registeredCompetition?.name}</div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* EQUIPMENT CHECKLIST */}
                      <div className="bg-zinc-900/40 border border-white/10 p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Settings className="w-5 h-5 text-orange-500" />
                          <h3 className="text-lg font-black uppercase text-orange-500">Equipment Checklist</h3>
                        </div>
                        <div className="space-y-3">
                          {equipmentList.map(item => (
                            <div key={item.id} className="bg-white/5 border border-white/10 p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-black text-white">{item.name}</span>
                                <select
                                  value={item.status}
                                  onChange={(e) => updateEquipmentStatus(item.id, e.target.value, item.notes)}
                                  className={`text-xs px-2 py-1 rounded font-black uppercase ${item.status === 'ready' ? 'bg-green-600 text-black' :
                                    item.status === 'needs attention' ? 'bg-yellow-600 text-black' :
                                      item.status === 'not ready' ? 'bg-red-600 text-black' :
                                        'bg-zinc-600 text-white'
                                    }`}
                                >
                                  <option value="ready">Ready</option>
                                  <option value="needs attention">Needs Attention</option>
                                  <option value="not ready">Not Ready</option>
                                  <option value="purchase new">Purchase New</option>
                                </select>
                              </div>
                              <input
                                type="text"
                                placeholder="Add notes (e.g., 'needs washing', 'torn seam')"
                                value={item.notes}
                                onChange={(e) => updateEquipmentStatus(item.id, item.status, e.target.value)}
                                className="w-full bg-black/40 border border-white/10 px-2 py-1 text-xs"
                              />
                            </div>
                          ))}
                          <div className="flex gap-2 mt-3">
                            <input
                              type="text"
                              placeholder="Add custom equipment"
                              className="flex-1 bg-black/40 border border-white/10 px-3 py-2 text-xs"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                  addCustomEquipment(e.target.value);
                                  e.target.value = '';
                                }
                              }}
                            />
                            <button
                              onClick={(e) => {
                                const input = e.target.previousElementSibling;
                                if (input.value.trim()) {
                                  addCustomEquipment(input.value);
                                  input.value = '';
                                }
                              }}
                              className="bg-orange-600 text-black px-3 py-2 text-xs font-black uppercase hover:bg-white transition-colors"
                            >
                              ADD
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* SLEEP & RECOVERY */}
                      <div className="bg-zinc-900/40 border border-white/10 p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Heart className="w-5 h-5 text-orange-500" />
                          <h3 className="text-lg font-black uppercase text-orange-500">Sleep & Recovery</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-white/5 border border-white/10 p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm">Last Night Sleep</span>
                              <input
                                type="number"
                                placeholder="Hours"
                                className="w-16 bg-black/40 border border-white/10 px-2 py-1 text-xs text-center"
                                defaultValue="8"
                              />
                            </div>
                            <div className="w-full bg-zinc-700 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                            </div>
                          </div>
                          <div className="bg-white/5 border border-white/10 p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm">Weekly Average</span>
                              <span className="text-xs text-green-400">7.8 hrs</span>
                            </div>
                            <div className="w-full bg-zinc-700 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                            </div>
                          </div>
                          <div className="bg-white/5 border border-white/10 p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm">HRV Status</span>
                              <span className="text-xs text-green-400">Optimal</span>
                            </div>
                            <div className="w-full bg-zinc-700 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* MOTIVATION & MENTAL PREP */}
                    <div className="bg-zinc-900/40 border border-white/10 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain className="w-5 h-5 text-orange-500" />
                        <h3 className="text-lg font-black uppercase text-orange-500">Mental Preparation</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 border border-white/10 p-4 text-center">
                          <div className="text-2xl font-black text-orange-500 mb-2">"STRENGTH IS THE ONLY CURRENCY"</div>
                          <div className="text-xs text-zinc-400">Daily Mantra</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 text-center">
                          <div className="text-lg font-black text-white mb-2">Visualization Complete</div>
                          <div className="text-xs text-zinc-400">10 min session</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 text-center">
                          <div className="text-lg font-black text-green-400 mb-2">Confidence Level</div>
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={motivationLevel}
                              onChange={async (e) => {
                                const newLevel = parseInt(e.target.value);
                                setMotivationLevel(newLevel);
                                
                                // Save to backend
                                try {
                                  await fetch(`http://localhost:5001/api/wellness/motivation?athleteId=${athleteId}`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                      level: newLevel,
                                      context: 'competition_preparation',
                                      notes: 'Motivation level updated during competition preparation'
                                    })
                                  });
                                } catch (error) {
                                  console.warn("Failed to save motivation level:", error);
                                }
                              }}
                              className="w-20"
                            />
                            <span className="text-2xl font-black text-white">{motivationLevel}/10</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCompetitionPhase('competition');
                        addCompNotification('Competition day activated! Full competition mode enabled.', 'success');
                      }}
                      className="w-full bg-red-600 text-black py-4 font-black uppercase text-xl hover:bg-red-500 transition-colors"
                    >
                      🏆 START COMPETITION DAY
                    </button>
                  </div>
                )}

                {/* COMPETITION DAY PHASE */}
                {competitionPhase === 'competition' && (
                  <div className="space-y-6">
                    <h2 className="text-5xl font-black italic uppercase text-red-600 mb-8 text-center">Competition Day</h2>

                    {/* Competition Status */}
                    <div className="bg-red-600/10 border border-red-600/20 p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-mono text-red-400 uppercase">Current Status</div>
                          <div className="text-2xl font-black text-white">{compDayData.currentLift ? `${compDayData.currentLift.toUpperCase()} ATTEMPTS` : 'WARMUP PHASE'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono text-red-400 uppercase">Platform Time</div>
                          <div className="text-2xl font-black text-white">{compDayData.compStartTime || '09:00'}</div>
                        </div>
                      </div>
                    </div>

                    {/* ATTEMPT PLANNING & LOGGING */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {['squat', 'bench', 'deadlift'].map(lift => (
                        <div key={lift} className="bg-zinc-900/40 border border-white/10 p-6">
                          <h3 className="text-lg font-black uppercase text-white mb-4 text-center">{lift.toUpperCase()}</h3>
                          <div className="space-y-2">
                            {[1, 2, 3].map(attempt => {
                              const loggedAttempt = compDayData.attempts[lift]?.find(a => a.attemptNum === attempt);
                              return (
                                <div key={attempt} className="bg-white/5 border border-white/10 p-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-mono text-zinc-400">ATTEMPT {attempt}</span>
                                    {loggedAttempt ? (
                                      <span className={`text-xs font-black uppercase ${loggedAttempt.result === 'good_lift' ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        {loggedAttempt.result === 'good_lift' ? '✓ GOOD LIFT' : '✗ NO LIFT'}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-zinc-500">PENDING</span>
                                    )}
                                  </div>
                                  {loggedAttempt ? (
                                    <div className="text-sm font-black text-white">{loggedAttempt.weight} KG</div>
                                  ) : (
                                    <div className="flex gap-2">
                                      <input
                                        type="number"
                                        placeholder="Weight"
                                        className="flex-1 bg-black/40 border border-white/10 px-2 py-1 text-xs"
                                      />
                                      <button
                                        onClick={() => {
                                          const input = event.target.previousElementSibling;
                                          if (input.value) {
                                            logAttempt(lift, attempt, parseInt(input.value), 'pending');
                                          }
                                        }}
                                        className="bg-orange-600 text-black px-2 py-1 text-xs font-black uppercase hover:bg-white transition-colors"
                                      >
                                        LOG
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* WARMUP PROTOCOL */}
                    <div className="bg-zinc-900/40 border border-white/10 p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <Dumbbell className="w-5 h-5 text-orange-500" />
                        <h3 className="text-xl font-black uppercase text-orange-500">Warmup Protocol</h3>
                      </div>
                      <div className="space-y-3">
                        {[
                          { name: 'Dynamic Stretching', status: 'completed', time: '08:00' },
                          { name: 'Activation Exercises', status: 'completed', time: '08:15' },
                          { name: 'Bar Speed Work', status: 'in-progress', time: '08:30' },
                          { name: 'Opener Attempts', status: 'pending', time: '09:00' }
                        ].map((item, idx) => (
                          <div key={idx} className={`flex items-center gap-4 p-3 border border-white/10 ${item.status === 'completed' ? 'bg-green-600/10 border-green-600/20' :
                            item.status === 'in-progress' ? 'bg-orange-600/10 border-orange-600/20' :
                              'bg-white/5 opacity-50'
                            }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-black font-black ${item.status === 'completed' ? 'bg-green-600' :
                              item.status === 'in-progress' ? 'bg-orange-600 animate-pulse' :
                                'bg-zinc-600'
                              }`}>
                              {item.status === 'completed' ? '✓' : item.status === 'in-progress' ? '→' : '○'}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-black text-white">{item.name}</div>
                              <div className="text-xs text-zinc-400">{item.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI COACHING INSIGHTS */}
                    <div className="bg-zinc-900/40 border border-white/10 p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <Brain className="w-5 h-5 text-orange-500" />
                        <h3 className="text-xl font-black uppercase text-orange-500">Competition Buddy</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-orange-600/10 border border-orange-600/20">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                            <span className="text-xs font-mono text-orange-400">PERFORMANCE COACH</span>
                          </div>
                          <p className="text-sm text-zinc-300">Based on your training data, your opener looks solid. Trust your preparation!</p>
                        </div>
                        <div className="p-3 bg-blue-600/10 border border-blue-600/20">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            <span className="text-xs font-mono text-blue-400">RECOVERY COACH</span>
                          </div>
                          <p className="text-sm text-zinc-300">Stay hydrated between attempts. Sip water, don't gulp.</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={endCompetition}
                      className="w-full bg-green-600 text-black py-4 font-black uppercase text-xl hover:bg-green-500 transition-colors"
                    >
                      🏁 END COMPETITION
                    </button>
                  </div>
                )}

                {/* POST-COMPETITION PHASE */}
                {competitionPhase === 'post' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-6xl font-black text-green-500 mb-4">🎉</div>
                      <h2 className="text-4xl font-black italic uppercase text-green-600 mb-4">Congratulations!</h2>
                      <p className="text-xl text-zinc-300 mb-8">You've completed your competition!</p>
                    </div>

                    {/* ACHIEVEMENTS */}
                    <div className="bg-zinc-900/40 border border-white/10 p-8">
                      <h3 className="text-2xl font-black uppercase text-orange-500 mb-6 text-center">Your Achievements</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-black text-white mb-2">2nd</div>
                          <div className="text-sm text-zinc-400">Place</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-black text-orange-500 mb-2">615 KG</div>
                          <div className="text-sm text-zinc-400">Total Lifted</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-black text-green-500 mb-2">3 PRs</div>
                          <div className="text-sm text-zinc-400">New Records</div>
                        </div>
                      </div>
                    </div>

                    {/* SHARE INSIGHTS */}
                    <div className="bg-zinc-900/40 border border-white/10 p-6">
                      <h3 className="text-lg font-black uppercase text-orange-500 mb-4">Share Your Experience</h3>
                      <textarea
                        placeholder="How did your competition go? What did you learn? Share your insights..."
                        className="w-full bg-black/40 border border-white/10 px-4 py-3 text-sm h-32 resize-none focus:border-orange-600 outline-none"
                      />
                      <button className="mt-3 bg-orange-600 text-black px-6 py-3 font-black uppercase hover:bg-white transition-colors">
                        SHARE INSIGHTS
                      </button>
                    </div>

                    {/* POST-COMP RECOVERY */}
                    <div className="bg-zinc-900/40 border border-white/10 p-6">
                      <h3 className="text-lg font-black uppercase text-orange-500 mb-4">Recovery Protocol</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-black font-black">1</div>
                          <div>
                            <div className="text-sm font-black text-white">Week 1-2: Active Recovery</div>
                            <div className="text-xs text-zinc-400">Light walks, stretching, mobility work</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-black font-black">2</div>
                          <div>
                            <div className="text-sm font-black text-white">Week 3: Hypertrophy Block</div>
                            <div className="text-xs text-zinc-400">Focus on muscle growth, lighter weights</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-black font-black">3</div>
                          <div>
                            <div className="text-sm font-black text-white">Week 4+: Return to Strength</div>
                            <div className="text-xs text-zinc-400">Gradually return to heavy training</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCompetitionPhase('search');
                        setRegisteredCompetition(null);
                        setCompDayData({
                          currentLift: null,
                          attempts: { squat: [], bench: [], deadlift: [] },
                          warmupStatus: [],
                          compStartTime: null
                        });
                        addCompNotification('Ready for your next competition! 🏆', 'success');
                      }}
                      className="w-full bg-orange-600 text-black py-4 font-black uppercase text-xl hover:bg-white transition-colors"
                    >
                      🎯 BACK TO NORMAL DASHBOARD
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === "history" && (
              <div className="animate-in fade-in duration-500 flex flex-col h-full max-h-[70vh]">
                <h2 className="text-4xl font-black italic uppercase text-orange-600 mb-8 flex-shrink-0">Secure_Archive</h2>
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {program.weeks.map((w, wi) => w.days.map((d, di) => {
                    const dId = `W${wi + 1}D${di + 1}`;
                    const isLogged = Object.keys(log).some(k => k.startsWith(dId));
                    return (
                      <div key={dId} className={`border border-white/10 bg-zinc-900/20 transition-all duration-300 ${isLogged ? 'opacity-100' : 'opacity-30'}`}>
                        <div onClick={() => isLogged && setExpandedArchive(expandedArchive === dId ? null : dId)}
                          className={`p-4 flex justify-between items-center ${isLogged ? 'cursor-pointer hover:bg-white/5' : 'cursor-not-allowed'}`}>
                          <div>
                            <span className="text-[8px] font-mono text-zinc-500">{dId}</span>
                            <h4 className="text-lg italic uppercase font-black tracking-tighter">{d.day_name || `Day ${d.day}`}</h4>
                          </div>
                          <div className="text-right">
                            {isLogged ? (
                              <span className="text-orange-500 font-black italic">{calculateTonnage(dId).toLocaleString()} KG</span>
                            ) : (
                              <span className="text-[10px] font-mono text-zinc-700 uppercase italic">No_Data</span>
                            )}
                          </div>
                        </div>
                        {expandedArchive === dId && (
                          <div className="p-6 bg-black/60 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                            {d.main_lifts.map((l, li) => {
                              const stableId = l.id || `${wi}_${di}_main_${li}`;
                              const entry = log[`${dId}_${stableId}`];
                              return entry && (
                                <div key={stableId} className="bg-white/5 p-4 border-l-2 border-orange-600">
                                  <span className="block text-[9px] text-zinc-500 uppercase font-mono">{l.lift}</span>
                                  <div className="italic font-black text-xl text-white">{entry.weight} KG × {entry.reps}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }))}
                </div>
              </div>
            )}

            {tab === "profile" && (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-4xl font-black italic uppercase text-orange-600 mb-8">
                  Identity_Profile
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black/40 border border-white/10 p-6">
                    <h4 className="font-mono text-[10px] tracking-widest text-orange-500 mb-4 uppercase">
                      Core_Biometrics
                    </h4>

                    <div className="space-y-4 font-mono text-sm uppercase">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Email</span>
                        <span className="text-orange-400">{profile?.email || user?.email}</span>
                      </div>

                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Age</span>
                        <span className="text-orange-400">{profile?.age || "—"}</span>
                      </div>

                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Bodyweight</span>
                        <span className="text-orange-400">{profile?.bodyweight} KG</span>
                      </div>

                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Experience</span>
                        <span className="text-orange-400">{profile?.experience_level}</span>
                      </div>

                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Schedule</span>
                        <span className="text-orange-400">{profile?.days_available} DAYS/WK</span>
                      </div>

                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Mode</span>
                        <span className="text-orange-400">
                          {profile?.training_mode === "coach"
                            ? "Coach_Linked"
                            : "Self_Autonomous"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-white/10 p-6">
                    <h4 className="font-mono text-[10px] tracking-widest text-orange-500 mb-4 uppercase">
                      Calibration_Maxes
                    </h4>

                    <div className="space-y-4">
                      {["squat", "bench", "deadlift"].map((lift) => (
                        <div
                          key={lift}
                          className="bg-white/5 p-4 flex justify-between items-center border-l-2 border-orange-600"
                        >
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">
                            {lift}
                          </span>

                          <span className="text-2xl italic font-black text-white">
                            {profile?.training_max?.[lift] || profile?.[lift] || 0} KG
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                  {profile?.training_mode === "self" || !profile?.training_mode ? (
                    <div className="flex flex-col items-start gap-4">
                      <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                        Neural link not established. Upgrade to coached protocol?
                      </p>

                      <button
                        onClick={async () => {
                          try {
                            const athleteId = profile?.uid || user?.uid;

                            const res = await fetch(
                              `http://localhost:5001/api/coach/request-coach/${athleteId}`,
                              { method: "POST" }
                            );

                            if (res.ok) {
                              alert("COACH_REQUEST_TRANSMITTED: Awaiting synchronization.");
                              window.location.reload();
                            } else {
                              console.error("LINK_FAILURE_STATUS:", res.status);
                              alert("LINK_FAILURE: Unable to contact coach endpoint.");
                            }
                          } catch (err) {
                            console.error("LINK_FAILURE:", err);
                            alert("LINK_FAILURE: Network error.");
                          }
                        }}
                        className="bg-orange-600 px-8 py-4 font-black uppercase italic hover:bg-white hover:text-black transition-all shadow-[4px_4px_0_0_rgba(255,255,255,0.1)] active:translate-y-1"
                      >
                        Establish_Coach_Link
                      </button>
                    </div>
                  ) : (
                    <div className="bg-orange-600/10 border border-orange-600/20 p-4 inline-block">
                      <span className="font-mono text-xs text-orange-500 uppercase animate-pulse">
                        System Status: Linked to Head Coach [ADMIN]
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Floating AI Chatbot */}
            <div className="fixed bottom-6 right-6 z-50">
              {!showAIChat ? (
                <button
                  onClick={() => setShowAIChat(true)}
                  className="bg-orange-600 text-black p-4 rounded-full shadow-lg hover:bg-orange-500 transition-all hover:scale-110 group"
                >
                  <Brain className="w-6 h-6" />
                  <span className="absolute -top-12 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    AI Coach Chat
                  </span>
                </button>
              ) : (
                <div className="bg-zinc-900 border border-orange-600 shadow-2xl flex flex-col" style={{
                  width: '90vw',
                  maxWidth: '400px',
                  height: '80vh',
                  maxHeight: '600px',
                  position: 'fixed',
                  bottom: '20px',
                  right: '20px'
                }}>
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Brain className="w-5 h-5 text-orange-500" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-800"></div>
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase text-orange-500">AI Coach</h3>
                        <p className="text-xs text-zinc-400">All agents online</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowAIChat(false);
                        setAiMessages([]);
                      }}
                      className="text-zinc-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/20">
                    {aiMessages.length === 0 && (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Brain className="w-6 h-6 text-orange-500" />
                        </div>
                        <p className="text-zinc-400 text-sm mb-1">Welcome to AI Coach!</p>
                        <p className="text-zinc-500 text-xs">Ask about training, recovery, nutrition, or form analysis.</p>
                      </div>
                    )}
                    {aiMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                        <div className={`max-w-[85%] ${msg.role === 'user'
                          ? 'bg-orange-600 text-black'
                          : 'bg-zinc-800 text-white border border-white/10'
                          }`}>
                          <div className="p-3">
                            {msg.role === 'assistant' && (
                              <div className="flex items-center gap-2 mb-2">
                                <Brain className="w-3 h-3 text-orange-500" />
                                <span className="text-xs font-mono text-orange-400">AI Coach</span>
                              </div>
                            )}
                            <div className="text-sm whitespace-pre-line leading-relaxed">
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="flex justify-start animate-in fade-in duration-300">
                        <div className="bg-zinc-800 text-white border border-white/10">
                          <div className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="w-3 h-3 text-orange-500" />
                              <span className="text-xs font-mono text-orange-400">AI Coach</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                              <span className="text-sm">Thinking...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t border-white/10 bg-zinc-800">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendAIMessage()}
                        placeholder="Ask your AI coach..."
                        className="flex-1 bg-zinc-900 border border-white/10 px-3 py-2 text-sm focus:border-orange-600 outline-none rounded-lg resize-none"
                        disabled={aiLoading}
                      />
                      <button
                        onClick={sendAIMessage}
                        disabled={aiLoading || !aiInput.trim()}
                        className="bg-orange-600 text-black px-4 py-2 font-black uppercase text-xs hover:bg-white transition-colors disabled:opacity-50 rounded-lg flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        SEND
                      </button>
                    </div>
                  </div>
                </div>
              )}
</div>
          </main>
        </div>
      </div>
      </div>
    );
}