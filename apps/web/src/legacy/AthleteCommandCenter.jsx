/**
 * Athlete Command Center - Production-Grade Client Dashboard
 * High-performance Bento-Grid layout with real-time athletic monitoring
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Activity, 
  Target, 
  Heart, 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  Eye,
  Dumbbell,
  Share2,
  Copy,
  Check,
  Flame,
  Award,
  ShieldCheck,
  ExternalLink,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import BiomechanicsLab from '../components/BiomechanicsLab';
import CompetitionTab from '../components/CompetitionTab';
import IndianNutritionEngine from '../components/IndianNutritionEngine';
import CompetitionCommandTrainer from '../components/CompetitionCommandTrainer';
import IndianStandardsRadar from '../components/IndianStandardsRadar';
import TierBadge from '../components/TierBadge';
import OfflineSyncBadge from '../components/OfflineSyncBadge';
import PowerliftingCalculators from '../components/PowerliftingCalculators';
import MeetDayPrepKit from '../components/MeetDayPrepKit';
import InRackRestTimer from '../components/InRackRestTimer';
import AttemptStrategistBoard from '../components/AttemptStrategistBoard';
import WeighInRackCard from '../components/WeighInRackCard';
import AIChatBot from '../components/AIChatBot';
import AthletePRShowcase from '../components/AthletePRShowcase';
import WarmupLadderDrawer from '../components/WarmupLadderDrawer';
import AIProgramGeneratorModal from '../components/AIProgramGeneratorModal';
import AIBrainTrainingModal from '../components/AIBrainTrainingModal';
import WeeklyCheckInModal from '../components/WeeklyCheckInModal';
import MeetBackroomStrategist from '../components/MeetBackroomStrategist';
import GlobalBroadcastBanner from '../components/GlobalBroadcastBanner';
import HumanCoachComingSoonModal from '../components/HumanCoachComingSoonModal';
import JointTweakEngine from '../components/JointTweakEngine';
import PodiumAttemptBattleSolver from '../components/PodiumAttemptBattleSolver';
import TempoAudioCoach from '../components/TempoAudioCoach';
import HypertrophyIntelligence from '../components/HypertrophyIntelligence';
import PrecisionDietEngine from '../components/PrecisionDietEngine';

const AthleteCommandCenter = ({ athleteId, user, profile }) => {
  const navigate = useNavigate();
  const { updateProfileData } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [tonnageCopied, setTonnageCopied] = useState(false);
  const [readinessNudge, setReadinessNudge] = useState(1.0); // 0.95 | 1.0 | 1.025
  const [activeWarmupModal, setActiveWarmupModal] = useState(null); // { name, weight }
  const [showAiGenModal, setShowAiGenModal] = useState(false);
  const [showAiTrainModal, setShowAiTrainModal] = useState(false);
  const [showWeeklyCheckInModal, setShowWeeklyCheckInModal] = useState(false);
  const [showCoachModal, setShowCoachModal] = useState(false);

  const isAdmin = 
    profile?.role === 'admin' || 
    user?.email?.toLowerCase().includes('admin') || 
    user?.email?.toLowerCase().includes('srastick') ||
    profile?.role === 'coach';
  const [activeAiProgramTitle, setActiveAiProgramTitle] = useState(null);
  const [currentWeekNumber, setCurrentWeekNumber] = useState(1);
  const [systemData, setSystemData] = useState({
    cnsReadiness: 88,
    fatigueScore: 24,
    injuryRisk: 12,
    performanceTrend: 15
  });
  const [trainingBlock, setTrainingBlock] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [isMeetPrep, setIsMeetPrep] = useState(false);
  const [daysToPlatform, setDaysToPlatform] = useState(null);

  const effectiveAthleteId = athleteId || user?.uid || "athlete_demo";

  // Fetch real-time data
  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const apiUrl = import.meta.env.PROD 
          ? 'https://powerlift-ai-backend.onrender.com'
          : 'http://localhost:5001';
        
        const response = await fetch(`${apiUrl}/api/agents/sentiment/status/${effectiveAthleteId}`);
        const data = await response.json();
        
        if (data.success) {
          setSystemData({
            cnsReadiness: data.cns_readiness ?? 85,
            fatigueScore: data.fatigue_score ?? 25,
            injuryRisk: data.injury_risk ?? 12,
            performanceTrend: data.performance_trend ?? 12
          });
        }
      } catch (error) {
        console.error('Failed to fetch system data:', error);
      }
    };

    const fetchTrainingBlock = async () => {
      try {
        const apiUrl = import.meta.env.PROD 
          ? 'https://powerlift-ai-backend.onrender.com'
          : 'http://localhost:5001';
        
        const response = await fetch(`${apiUrl}/api/programs/${effectiveAthleteId}`);
        const data = await response.json();
        
        if (data && data.weeks) {
          setTrainingBlock(data);
          generateTodayTasks(data);
        }
      } catch (error) {
        console.error('Failed to fetch training block:', error);
      }
    };

    fetchSystemData();
    fetchTrainingBlock();

    // Check for real-time synthesized AI program in localStorage
    try {
      const savedAi = localStorage.getItem(`active_ai_program_${effectiveAthleteId}`);
      if (savedAi) {
        const parsed = JSON.parse(savedAi);
        if (parsed.days && parsed.days.length > 0) {
          applyAiProgramToTasks(parsed);
        }
      }
    } catch (e) {}
    
    const interval = setInterval(fetchSystemData, 45000);
    return () => clearInterval(interval);
  }, [effectiveAthleteId]);

  // Apply real-time synthesized AI program to today's active tasks
  const applyAiProgramToTasks = (aiProgram) => {
    if (!aiProgram || !aiProgram.days || aiProgram.days.length === 0) return;
    const day1 = aiProgram.days[0];
    const newTasks = [];

    if (day1.warmupPrimer) {
      newTasks.push({
        id: 'ai-primer',
        type: 'warmup',
        title: `AI Pre-Lift Primer: ${day1.focus || 'CNS Activation'}`,
        subtitle: day1.warmupPrimer,
        cue: "Mobilize joint capsules & activate core before heavy loading",
        completed: false,
        priority: 'high'
      });
    }

    day1.exercises?.forEach((ex, idx) => {
      newTasks.push({
        id: `ai-ex-${idx}`,
        type: idx === 0 ? 'top_single' : 'lift',
        title: ex.name,
        sets: ex.sets || 4,
        reps: ex.reps || '5',
        weight: ex.loadKg || 100,
        rpe: ex.intensityTarget ? parseFloat(ex.intensityTarget.replace(/[^0-9.]/g, '')) || 8 : 8,
        cue: ex.cue || "Maintain tight brace and bar control.",
        completed: false,
        priority: 'high'
      });
    });

    setTodayTasks(newTasks);
    setActiveAiProgramTitle(aiProgram.programTitle || 'AI-Synthesized Protocol');
    toast.success(`⚡ Live Protocol Loaded: ${aiProgram.programTitle || day1.dayName}`);
  };

  // Generate today's tasks from training block
  const generateTodayTasks = (program) => {
    const tasks = [];
    const currentWeek = 1;
    const currentDay = 1;
    
    if (program.weeks && program.weeks[currentWeek - 1] && program.weeks[currentWeek - 1].days && program.weeks[currentWeek - 1].days[currentDay - 1]) {
      const dayData = program.weeks[currentWeek - 1].days[currentDay - 1];
      
      // 1. Warmup Mobility Primer
      if (dayData.warmup_primer) {
        tasks.push({
          id: 'primer',
          type: 'warmup',
          title: `Pre-Lift Primer: ${dayData.warmup_primer.focus}`,
          subtitle: dayData.warmup_primer.drills?.map(d => `${d.name} (${d.prescription || d.duration})`).join(' • '),
          cue: "Mobilize joint capsules & activate core before loading the spine",
          completed: false,
          priority: 'high'
        });
      }

      // 2. Main Lifts & Top Singles
      dayData.main_lifts?.forEach((lift, index) => {
        if (lift.has_top_single && lift.top_single) {
          tasks.push({
            id: `top_${index}`,
            type: 'top_single',
            title: `${lift.lift} — Top Single @ RPE 8`,
            sets: 1,
            reps: '1',
            weight: lift.top_single.load || Math.round((lift.load || 140) * 1.1),
            rpe: 8,
            cue: lift.top_single.cue || lift.coaching_cue,
            completed: false,
            priority: 'high'
          });
        }

        tasks.push({
          id: `main_${index}`,
          type: 'lift',
          title: `${lift.lift} — ${lift.has_top_single ? 'Volume Back-offs' : 'Working Sets'}`,
          sets: lift.backoff_sets?.sets || lift.sets,
          reps: lift.backoff_sets?.reps || lift.reps,
          weight: lift.backoff_sets?.load || lift.load || 100,
          rpe: lift.backoff_sets?.target_rpe || lift.rpe || 8,
          cue: lift.coaching_cue,
          completed: false,
          priority: 'high'
        });
      });
      
      // 3. Accessories
      dayData.accessories?.forEach((acc, index) => {
        tasks.push({
          id: `acc_${index}`,
          type: 'accessory',
          category: acc.category || 'Accessory',
          title: acc.exercise,
          sets: acc.sets,
          reps: acc.reps,
          weight: acc.weight || 'RPE 7.5-8',
          cue: acc.cue,
          completed: false,
          priority: 'medium'
        });
      });
      
      // 4. Post-Lift Recovery
      tasks.push({
        id: 'mobility',
        type: 'recovery',
        title: 'Post-Lift Decompression & Thoracic Reset',
        duration: '10 min',
        completed: false,
        priority: 'medium'
      });
    } else {
      // Fallback today's workout
      tasks.push(
        { id: 'p1', type: 'warmup', title: 'Pre-Lift Primer: Hip & Ankle Flow', subtitle: '90/90 Hip Flow • Goblet Squat Hold', completed: false, priority: 'high' },
        { id: 'm1', type: 'top_single', title: 'Competition Squat — Top Single @ RPE 8', sets: 1, reps: '1', weight: 195, rpe: 8, cue: 'IPF Command simulation: 1-second motionless pause below parallel.', completed: false, priority: 'high' },
        { id: 'm2', type: 'lift', title: 'Competition Squat — Volume Back-offs', sets: 3, reps: '4', weight: 165, rpe: 7.5, cue: 'Drive upper back into the barbell.', completed: false, priority: 'high' },
        { id: 'm3', type: 'lift', title: 'Competition Bench Press', sets: 4, reps: '5', weight: 130, rpe: 8, cue: 'Full leg drive before unrack.', completed: false, priority: 'high' },
        { id: 'a1', type: 'accessory', category: 'Primary Builder', title: 'Bulgarian Split Squats', sets: 3, reps: '8-10', weight: 30, rpe: 8, cue: 'Load lead quad smoothly.', completed: false, priority: 'medium' },
        { id: 'a2', type: 'accessory', category: 'Core & Prehab', title: 'Ab Wheel Rollouts', sets: 3, reps: '10', weight: 0, rpe: 8, cue: 'Maintain posterior pelvic tilt.', completed: false, priority: 'medium' }
      );
    }
    
    setTodayTasks(tasks);
  };

  const toggleTask = (taskId) => {
    setTodayTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleApplyJointSwap = (swapInfo) => {
    setTodayTasks(prev => prev.map(task => {
      if (task.type === 'lift' || task.type === 'top_single') {
        const adjustedWeight = task.weight ? Math.round((task.weight * swapInfo.loadModifier) / 2.5) * 2.5 : task.weight;
        return {
          ...task,
          title: `[SWAPPED] ${swapInfo.swappedExercise}`,
          weight: adjustedWeight,
          rpe: swapInfo.rpeCap || task.rpe,
          cue: swapInfo.cue || task.cue
        };
      }
      return task;
    }));
    setActiveTab('overview');
    toast.success(`⚡ Today's session updated with ${swapInfo.swappedExercise}!`);
  };

  // Live in-session completed tonnage calculation (sets * reps * load)
  const completedTonnage = useMemo(() => {
    return todayTasks.reduce((acc, task) => {
      if (task.completed && task.weight && task.sets) {
        const repsNum = typeof task.reps === 'string' ? (parseInt(task.reps.split('-')[0]) || 1) : (Number(task.reps) || 1);
        const weightNum = typeof task.weight === 'string' ? (parseFloat(task.weight) || 0) : (Number(task.weight) || 0);
        const setsNum = Number(task.sets) || 1;
        return acc + (setsNum * repsNum * weightNum);
      }
      return acc;
    }, 0);
  }, [todayTasks]);

  const totalPossibleTonnage = useMemo(() => {
    return todayTasks.reduce((acc, task) => {
      if (task.weight && task.sets) {
        const repsNum = typeof task.reps === 'string' ? (parseInt(task.reps.split('-')[0]) || 1) : (Number(task.reps) || 1);
        const weightNum = typeof task.weight === 'string' ? (parseFloat(task.weight) || 0) : (Number(task.weight) || 0);
        const setsNum = Number(task.sets) || 1;
        return acc + (setsNum * repsNum * weightNum);
      }
      return acc;
    }, 0);
  }, [todayTasks]);

  const tonnagePercentage = totalPossibleTonnage > 0 
    ? Math.min(100, Math.round((completedTonnage / totalPossibleTonnage) * 100))
    : 0;

  // Generate WhatsApp Share Message for Workout Session
  const generateSessionSummaryText = () => {
    const completedList = todayTasks.filter(t => t.completed);
    return `🏋️ *TITAN-AI TRAINING LOG* 🏋️
👤 *Athlete:* ${profile?.displayName || user?.displayName || 'Powerlifter'}
📅 *Date:* ${new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}

⚡ *Completed Lifts:*
${completedList.length > 0 
  ? completedList.map(t => `  ✅ *${t.title}*${t.weight ? ` — ${t.sets}x${t.reps} @ ${t.weight}kg` : ''}${t.rpe ? ` (RPE ${t.rpe})` : ''}`).join('\n')
  : '  ⏳ Workout session in progress...'}

📊 *Live Volume Lifted:* *${completedTonnage.toLocaleString()} KG* (${tonnagePercentage}% completed)
🎯 *Session Tasks:* ${completedList.length} of ${todayTasks.length} Done
🧠 *CNS Readiness:* ${systemData.cnsReadiness}%

Generated via TITAN-AI Platform War Room`;
  };

  const shareWorkoutToWhatsApp = () => {
    const text = encodeURIComponent(generateSessionSummaryText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const copySessionSummary = () => {
    const text = generateSessionSummaryText();
    navigator.clipboard.writeText(text);
    setTonnageCopied(true);
    toast.success("Workout session summary copied to clipboard!");
    setTimeout(() => setTonnageCopied(false), 2500);
  };

  const cnsData = [
    { name: 'CNS', value: systemData.cnsReadiness, fill: systemData.cnsReadiness > 70 ? '#22c55e' : systemData.cnsReadiness > 40 ? '#eab308' : '#ef4444' }
  ];

  const performanceData = [
    { day: 'Mon', readiness: 82, fatigue: 25 },
    { day: 'Tue', readiness: 78, fatigue: 32 },
    { day: 'Wed', readiness: 85, fatigue: 28 },
    { day: 'Thu', readiness: 80, fatigue: 35 },
    { day: 'Fri', readiness: 88, fatigue: 22 },
    { day: 'Sat', readiness: 92, fatigue: 18 },
    { day: 'Sun', readiness: systemData.cnsReadiness, fatigue: systemData.fatigueScore }
  ];

  return (
    <div className={`min-h-screen ${isMeetPrep ? 'bg-zinc-950' : 'bg-black'} text-white p-4 sm:p-6 relative`}>
      {/* Global Broadcast Notification Banner */}
      <GlobalBroadcastBanner targetAudience="powerlifting" />

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-mono tracking-widest text-orange-500 uppercase">TITAN-AI PROTOCOL</span>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase">POWERLIFTING INDIA / IPF</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black italic uppercase tracking-tight text-white flex items-center gap-3">
              ATHLETE COMMAND CENTER
            </h1>
          </div>
          
          <div className="flex items-center gap-2.5 font-mono text-xs flex-wrap">
            <TierBadge />
            <OfflineSyncBadge />

            {/* AI Real-time Protocol Synthesis */}
            <button
              onClick={() => setShowAiGenModal(true)}
              className="px-3 py-1.5 rounded border border-indigo-500/50 bg-indigo-950/50 text-indigo-200 hover:bg-indigo-900/60 hover:text-white transition-all flex items-center gap-1.5 font-bold shadow-md shadow-indigo-950"
              title="Synthesize 100% Real-Time AI Program tailored to your 1RM, weak points, and sports science periodization"
            >
              <Brain className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>AI PROTOCOL SYNTHESIS 🧠</span>
            </button>

            {/* Weekly AI Micro-Cycle Evolution */}
            <button
              onClick={() => setShowWeeklyCheckInModal(true)}
              className="px-3 py-1.5 rounded border border-emerald-500/50 bg-emerald-950/50 text-emerald-200 hover:bg-emerald-900/60 hover:text-white transition-all flex items-center gap-1.5 font-bold shadow-md shadow-emerald-950"
              title="Weekly Athlete Check-In: Evolve next week's loads (+2.5kg overload / fatigue deload) with AI Brain"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>WEEKLY AI EVOLUTION ⚡</span>
            </button>

            {/* Request Human Coach (v2.0 Waitlist Gate) */}
            <button
              onClick={() => setShowCoachModal(true)}
              className="px-2.5 py-1.5 rounded border border-amber-500/40 bg-amber-950/30 text-amber-300 hover:bg-amber-900/50 hover:text-white transition-all flex items-center gap-1.5 font-bold"
              title="1-on-1 Human Coach Roster (v2.0 Release)"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>HUMAN COACH (v2.0) 🔒</span>
            </button>

            {/* Admin Console Direct Link (if admin/owner) */}
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="px-2.5 py-1.5 rounded border border-red-500/50 bg-red-950/60 text-red-300 hover:bg-red-900/80 hover:text-white transition-all flex items-center gap-1.5 font-bold"
                title="Open Super-Admin Command Center"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>ADMIN CONSOLE</span>
              </button>
            )}

            {/* Switch to Fitness & Recomp Mode */}
            <button
              onClick={() => {
                updateProfileData?.({ pathway: 'fitness' });
                toast.success("Switching to Fitness & Physique Dashboard...");
                setTimeout(() => {
                  navigate('/dashboard');
                  window.location.reload();
                }, 400);
              }}
              className="px-3 py-1.5 rounded border border-purple-500/40 bg-purple-950/30 text-purple-300 hover:bg-purple-900/50 hover:text-white transition-all flex items-center gap-1.5 font-bold"
              title="Switch to Hypertrophy, PPL splits, Muscle Radar, and Desi Nutrition"
            >
              <Dumbbell className="w-3.5 h-3.5 text-purple-400" />
              <span>FITNESS & RECOMP MODE 🏆</span>
            </button>

            {/* Re-calibrate Profile */}
            <button
              onClick={() => navigate('/profile-setup')}
              className="px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
              title="Edit Onboarding Survey Answers"
            >
              ⚙️
            </button>

            <div className={`px-3 py-1.5 rounded border ${systemData.cnsReadiness > 70 ? 'border-green-500/30 bg-green-950/40 text-green-400' : 'border-yellow-500/30 bg-yellow-950/40 text-yellow-400'}`}>
              CNS READINESS: <span className="font-bold">{systemData.cnsReadiness}%</span>
            </div>
            <div className={`px-3 py-1.5 rounded border ${systemData.injuryRisk > 30 ? 'border-red-500/30 bg-red-950/40 text-red-400' : 'border-zinc-700 bg-zinc-900 text-zinc-300'}`}>
              INJURY RISK: <span className="font-bold">{systemData.injuryRisk}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Athlete PR Showcase & Milestone Target */}
      <div className="mb-6">
        <AthletePRShowcase 
          profile={profile} 
          bodyweight={profile?.bodyweight || 74} 
          gender={profile?.gender || 'male'} 
        />
      </div>

      {/* Bento Grid Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* CNS Readiness Gauge */}
        <div className="bg-zinc-900/60 rounded-xl border border-white/10 p-5 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">CNS Readiness</h3>
            <Brain className="w-4 h-4 text-orange-500" />
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="95%" data={cnsData} startAngle={180} endAngle={0}>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar background dataKey="value" cornerRadius={8} fill="#ea580c" />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="text-center -mt-7">
            <div className={`text-3xl font-black italic ${systemData.cnsReadiness > 70 ? 'text-green-400' : systemData.cnsReadiness > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
              {systemData.cnsReadiness}%
            </div>
            <div className="text-[10px] font-mono uppercase text-zinc-500 mt-0.5">Ready for Heavy CNS Loading</div>
          </div>
        </div>

        {/* Fatigue & Injury Risk */}
        <div className="bg-zinc-900/60 rounded-xl border border-white/10 p-5 backdrop-blur">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">Fatigue & Strain Index</h3>
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-zinc-400">Accumulated Fatigue</span>
                <span className={systemData.fatigueScore > 50 ? 'text-red-400' : 'text-green-400'}>{systemData.fatigueScore}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${systemData.fatigueScore > 50 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${systemData.fatigueScore}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-zinc-400">Injury Risk Index</span>
                <span className={systemData.injuryRisk > 30 ? 'text-red-400' : 'text-green-400'}>{systemData.injuryRisk}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${systemData.injuryRisk > 30 ? 'bg-red-500' : 'bg-orange-500'}`}
                  style={{ width: `${systemData.injuryRisk}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Trend */}
        <div className="bg-zinc-900/60 rounded-xl border border-white/10 p-5 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">Weekly Readiness Trend</h3>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="day" stroke="#71717a" tick={{ fontSize: 10 }} />
              <YAxis stroke="#71717a" domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
              <Line type="monotone" dataKey="readiness" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="fatigue" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-2 overflow-x-auto scrollbar-thin">
        {[
          { id: 'overview', label: 'Workout Execution & Tonnage' },
          { id: 'platform_war_room', label: '9-for-9 & Weigh-In Slip' },
          { id: 'podium_solver', label: '🏆 Podium Battle Solver' },
          { id: 'joint_tweak', label: '🩹 Joint Tweak & Swap' },
          { id: 'tempo_coach', label: '⏱️ Tempo Metronome' },
          { id: 'precision_diet', label: '🥗 Precision Macros & TDEE' },
          { id: 'hypertrophy_engine', label: '⚡ Hypertrophy & Volume Engine' },
          { id: 'backroom_timer', label: 'Backroom Warmup & 60s Clock ⏱️' },
          { id: 'toolbox', label: 'Calculators & 1RM Wheel' },
          { id: 'prep_kit', label: 'Meet Prep & Water Cut' },
          { id: 'competition', label: 'Olympic Plate Sleeve' },
          { id: 'desi_nutrition', label: 'Desi Nutrition Engine' },
          { id: 'referee_standards', label: 'IPF Commands & Standards' },
          { id: 'biomechanics', label: 'CV Biomechanics Lab' },
          { id: 'sentiment', label: 'Recovery & Telemetry' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2.5 rounded font-mono text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-950' 
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* TAB 1: WORKOUT EXECUTION & TONNAGE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Live Tonnage Meter & WhatsApp Share Header Card */}
              <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-black border border-orange-500/30 rounded-xl p-5 shadow-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                      <span className="text-[11px] font-mono uppercase text-orange-400 font-bold tracking-wider">
                        Live Session Tonnage Meter
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300">
                        {completedTonnage > 10000 ? '🔥 High Volume' : '⚡ Optimal CNS Workload'}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black italic font-mono text-white">
                        {completedTonnage.toLocaleString()}
                      </span>
                      <span className="text-sm font-mono text-zinc-400">/ {totalPossibleTonnage.toLocaleString()} KG Lifted</span>
                      <span className="text-xs font-mono font-bold text-orange-400">({tonnagePercentage}%)</span>
                    </div>

                    <div className="w-full bg-zinc-800/80 rounded-full h-2.5 mt-2 overflow-hidden border border-zinc-700/50">
                      <div 
                        className="bg-gradient-to-r from-orange-600 to-amber-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${tonnagePercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto flex-wrap sm:flex-nowrap">
                    <button
                      onClick={() => setShowAiTrainModal(true)}
                      className="bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 font-mono text-xs uppercase font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-purple-950"
                      title="Train the AI Brain on how this session felt (RPE, joint status, fatigue)"
                    >
                      <Brain className="w-4 h-4 text-purple-400" />
                      Train AI Brain
                    </button>
                    <button
                      onClick={shareWorkoutToWhatsApp}
                      className="flex-1 md:flex-initial bg-green-600 hover:bg-green-500 text-white font-mono text-xs uppercase font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-950"
                    >
                      <Share2 className="w-4 h-4" />
                      Send to Coach on WhatsApp
                    </button>
                    <button
                      onClick={copySessionSummary}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs uppercase py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-zinc-700"
                    >
                      {tonnageCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      {tonnageCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Bar-Feel / Auto-Regulation Dial */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800 gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-mono uppercase text-zinc-300 font-bold">
                    Bar-Feel Today:
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    (Auto-nudges working loads)
                  </span>
                </div>
                <div className="flex gap-1.5 font-mono text-[11px] w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setReadinessNudge(0.95);
                      toast.info("Auto-Deload: Loads trimmed -5% for joint & CNS recovery.");
                    }}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg border transition-all ${
                      readinessNudge === 0.95
                        ? 'bg-yellow-950 border-yellow-500 text-yellow-400 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    😴 Heavy / Stiff (-5%)
                  </button>
                  <button
                    onClick={() => {
                      setReadinessNudge(1.0);
                      toast.success("Standard Target Plan active.");
                    }}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg border transition-all ${
                      readinessNudge === 1.0
                        ? 'bg-orange-600 border-orange-500 text-white font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    ⚡ Nominal (100%)
                  </button>
                  <button
                    onClick={() => {
                      setReadinessNudge(1.025);
                      toast.success("High Velocity: Working loads bumped +2.5%!");
                    }}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg border transition-all ${
                      readinessNudge === 1.025
                        ? 'bg-green-950 border-green-500 text-green-400 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    🔥 Exploding (+2.5%)
                  </button>
                </div>
              </div>

              {/* Workout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Task Checklist */}
                <div className="lg:col-span-2 bg-zinc-900/60 rounded-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-black italic uppercase text-white">Today's Session Lifts</h3>
                      <p className="text-xs font-mono text-zinc-400 mt-0.5">Check off sets as you complete them in the rack</p>
                    </div>
                    <Dumbbell className="w-5 h-5 text-orange-500" />
                  </div>
                  
                  <div className="space-y-3">
                    {todayTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`bg-zinc-950 rounded-lg p-4 border transition-colors ${
                          task.completed 
                            ? 'border-green-600/40 bg-green-950/10' 
                            : task.type === 'top_single'
                            ? 'border-orange-500/40 bg-orange-950/10'
                            : task.type === 'warmup'
                            ? 'border-blue-500/30 bg-blue-950/10'
                            : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className={`w-6 h-6 mt-0.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                task.completed 
                                  ? 'bg-green-600 border-green-600' 
                                  : 'border-zinc-600 hover:border-orange-500'
                              }`}
                            >
                              {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className={`font-bold uppercase italic text-sm ${task.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>
                                  {task.title}
                                </h4>
                                {task.category && (
                                  <span className="text-[9px] font-mono px-2 py-0.2 rounded bg-zinc-800 text-zinc-300">
                                    {task.category}
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-xs font-mono text-zinc-400 mt-1">
                                {task.type === 'warmup' && task.subtitle}
                                {task.type === 'top_single' && `${task.sets} Set × 1 Rep @ ${task.weight ? Math.round((Number(task.weight) * readinessNudge) / 2.5) * 2.5 : 140}kg (Target RPE 8.0)`}
                                {task.type === 'lift' && `${task.sets} Sets × ${task.reps} Reps @ ${task.weight ? Math.round((Number(task.weight) * readinessNudge) / 2.5) * 2.5 : 100}kg (RPE ${task.rpe})`}
                                {task.type === 'accessory' && `${task.sets} Sets × ${task.reps} Reps (${task.weight ? `${Math.round((Number(task.weight) * readinessNudge) / 2.5) * 2.5}kg` : 'RPE 8'})`}
                                {task.type === 'recovery' && task.duration}
                              </p>

                              {task.cue && (
                                <p className="text-[11px] font-mono text-orange-400/90 mt-1 italic">
                                  💡 {task.cue}
                                </p>
                              )}

                              {task.weight && (
                                <button
                                  type="button"
                                  onClick={() => setActiveWarmupModal({
                                    name: task.title,
                                    weight: Math.round((Number(task.weight) * readinessNudge) / 2.5) * 2.5
                                  })}
                                  className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded bg-zinc-900 hover:bg-orange-600/20 border border-zinc-700 hover:border-orange-500 text-orange-400 font-bold transition-all"
                                >
                                  <Flame className="w-3 h-3" />
                                  <span>1-Tap Warmup Ladder & Plate Math</span>
                                </button>
                              )}
                            </div>
                          </div>

                          <span className={`text-[10px] font-mono px-2.5 py-1 rounded uppercase shrink-0 font-bold ${
                            task.type === 'top_single' ? 'bg-orange-600 text-white shadow-sm' :
                            task.type === 'warmup' ? 'bg-blue-950 text-blue-400 border border-blue-800/40' :
                            task.type === 'lift' ? 'bg-orange-950 text-orange-400 border border-orange-800/40' : 
                            'bg-zinc-800 text-zinc-400'
                          }`}>
                            {task.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-between items-center pt-4 border-t border-zinc-800 font-mono text-xs">
                    <span className="text-zinc-400">
                      {todayTasks.filter(t => t.completed).length} of {todayTasks.length} Completed
                    </span>
                    <div className="w-40 bg-zinc-800 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full transition-all"
                        style={{ width: `${(todayTasks.filter(t => t.completed).length / Math.max(1, todayTasks.length)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Coaching Directives & Quick Links */}
                <div className="space-y-6">
                  <div className="bg-zinc-900/60 rounded-xl border border-white/10 p-6">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400 mb-4">Coaching Directives</h3>
                    <div className="space-y-3 font-mono text-xs">
                      <div className="p-3 bg-zinc-950 rounded border border-zinc-800">
                        <span className="text-orange-400 font-bold block mb-1">Squat Cue:</span>
                        <p className="text-zinc-300">Drive upper back into bar out of the hole. Maintain knee track over toes.</p>
                      </div>
                      <div className="p-3 bg-zinc-950 rounded border border-zinc-800">
                        <span className="text-orange-400 font-bold block mb-1">Bench Cue:</span>
                        <p className="text-zinc-300">Leg drive starts before unrack. Constant lat engagement through touchpoint.</p>
                      </div>
                      <div className="p-3 bg-zinc-950 rounded border border-zinc-800">
                        <span className="text-orange-400 font-bold block mb-1">Deadlift Cue:</span>
                        <p className="text-zinc-300">Pull slack completely out of the barbell until clicking before initiating leg press into floor.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/60 rounded-xl border border-white/10 p-6">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400 mb-4">Quick Tools & Workarounds</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs uppercase">
                      <button 
                        onClick={() => setActiveTab('joint_tweak')}
                        className="p-2.5 bg-red-950/40 border border-red-500/40 rounded hover:bg-red-900/50 text-red-300 text-center transition-colors font-bold"
                      >
                        🩹 Joint Tweak Swap
                      </button>
                      <button 
                        onClick={() => setActiveTab('tempo_coach')}
                        className="p-2.5 bg-cyan-950/40 border border-cyan-500/40 rounded hover:bg-cyan-900/50 text-cyan-300 text-center transition-colors font-bold"
                      >
                        ⏱️ Tempo Pacer
                      </button>
                      <button 
                        onClick={() => setActiveTab('podium_solver')}
                        className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded hover:bg-amber-900/50 text-amber-300 text-center transition-colors font-bold"
                      >
                        🏆 Podium Solver
                      </button>
                      <button 
                        onClick={() => setActiveTab('biomechanics')}
                        className="p-2.5 bg-orange-600/20 border border-orange-600/40 rounded hover:bg-orange-600/30 text-orange-400 text-center transition-colors"
                      >
                        Bar-Path Lab
                      </button>
                      <button 
                        onClick={() => setActiveTab('platform_war_room')}
                        className="p-2.5 bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700 text-zinc-300 text-center transition-colors"
                      >
                        9-for-9 Slip
                      </button>
                      <button 
                        onClick={() => setActiveTab('toolbox')}
                        className="p-2.5 bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700 text-zinc-300 text-center transition-colors"
                      >
                        Plate & 1RM
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 9-FOR-9 PLATFORM STRATEGIST & WEIGH-IN SLIP */}
          {activeTab === 'platform_war_room' && (
            <div className="space-y-8">
              <AttemptStrategistBoard 
                athleteBodyweight={profile?.bodyweight || 74}
                gender={profile?.gender || 'male'}
                defaultOpenerSQ={profile?.training_max?.squat ? Math.round(profile.training_max.squat * 0.9 / 2.5) * 2.5 : 180}
                defaultOpenerBP={profile?.training_max?.bench ? Math.round(profile.training_max.bench * 0.9 / 2.5) * 2.5 : 120}
                defaultOpenerDL={profile?.training_max?.deadlift ? Math.round(profile.training_max.deadlift * 0.9 / 2.5) * 2.5 : 220}
              />
              <div className="pt-6 border-t border-zinc-800">
                <WeighInRackCard profile={profile} user={user} />
              </div>
            </div>
          )}

          {/* TAB: PODIUM BATTLE & 3RD ATTEMPT SOLVER */}
          {activeTab === 'podium_solver' && (
            <PodiumAttemptBattleSolver athleteProfile={profile} />
          )}

          {/* TAB: JOINT TWEAK & BIOMECHANICAL SWAP */}
          {activeTab === 'joint_tweak' && (
            <JointTweakEngine onApplySwap={handleApplyJointSwap} />
          )}

          {/* TAB: TEMPO METRONOME & PAUSE PACER */}
          {activeTab === 'tempo_coach' && (
            <TempoAudioCoach />
          )}

          {/* TAB: PRECISION DIET & MACROS */}
          {activeTab === 'precision_diet' && (
            <PrecisionDietEngine athleteWeight={profile?.bodyweight || 74} athleteGoal="strength" />
          )}

          {/* TAB: HYPERTROPHY & VOLUME ENGINE */}
          {activeTab === 'hypertrophy_engine' && (
            <HypertrophyIntelligence />
          )}

          {/* TAB: MEET BACKROOM STRATEGIST & 60S TABLE CLOCK */}
          {activeTab === 'backroom_timer' && (
            <MeetBackroomStrategist 
              athleteName={profile?.displayName || user?.displayName || 'Lifter'}
              defaultOpenerKg={profile?.training_max?.squat ? Math.round(profile.training_max.squat * 0.9 / 2.5) * 2.5 : 180}
            />
          )}

          {/* TAB 3: CALCULATORS & 1RM WHEEL */}
          {activeTab === 'toolbox' && (
            <PowerliftingCalculators />
          )}

          {/* TAB 4: MEET DAY PREP & WATER CUT */}
          {activeTab === 'prep_kit' && (
            <MeetDayPrepKit />
          )}

          {/* TAB 5: OLYMPIC PLATE WAR ROOM */}
          {activeTab === 'competition' && (
            <CompetitionTab 
              athleteId={effectiveAthleteId} 
              user={user} 
              profile={profile}
              onLockIn={(data) => {
                setIsMeetPrep(true);
                setDaysToPlatform(data.daysToPlatform);
              }}
            />
          )}

          {/* TAB 6: DESI NUTRITION ENGINE */}
          {activeTab === 'desi_nutrition' && (
            <IndianNutritionEngine athleteWeight={profile?.bodyweight || 75} />
          )}

          {/* TAB 7: IPF REFEREE COMMANDS & STANDARDS */}
          {activeTab === 'referee_standards' && (
            <div className="space-y-6">
              <CompetitionCommandTrainer />
              <IndianStandardsRadar 
                athleteTotal={(profile?.training_max?.squat || 180) + (profile?.training_max?.bench || 120) + (profile?.training_max?.deadlift || 220)} 
                athleteWeight={profile?.bodyweight || 74}
              />
            </div>
          )}

          {/* TAB 8: CV BIOMECHANICS LAB */}
          {activeTab === 'biomechanics' && (
            <BiomechanicsLab />
          )}

          {/* TAB 9: RECOVERY & TELEMETRY */}
          {activeTab === 'sentiment' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zinc-900/60 rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-black italic uppercase text-white mb-4">Autonomic Recovery Indicators</h3>
                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-zinc-400">HRV Readiness Baseline</span>
                      <span className="text-green-400">78 ms (Optimal)</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-zinc-400">Resting Heart Rate</span>
                      <span className="text-green-400">56 BPM (Resting Normal)</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-zinc-400">Sleep Quality & Duration</span>
                      <span className="text-yellow-400">7.2 hrs (Good)</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '72%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/60 rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-black italic uppercase text-white mb-4">Autoregulation Status</h3>
                <div className="p-4 bg-zinc-950 rounded border border-zinc-800 font-mono text-xs space-y-2 text-zinc-300">
                  <div className="text-green-400 font-bold uppercase">● System Nominal — Target RPE Active</div>
                  <p>All recovery signals are green. Proceed with programmed load progressions for this block.</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Floating In-Rack Rest Timer */}
      <InRackRestTimer />

      {/* Floating AI Coach Chatbot with BYOK Keys */}
      <AIChatBot />

      {/* 1-Tap Barbell Warmup Ladder Modal */}
      <WarmupLadderDrawer
        isOpen={!!activeWarmupModal}
        onClose={() => setActiveWarmupModal(null)}
        liftName={activeWarmupModal?.name}
        targetWeight={activeWarmupModal?.weight}
      />

      {/* Real-Time AI Program Generator Modal */}
      <AIProgramGeneratorModal
        isOpen={showAiGenModal}
        onClose={() => setShowAiGenModal(false)}
        pathway="powerlifting"
        profile={profile}
        athleteId={effectiveAthleteId}
        onProgramGenerated={applyAiProgramToTasks}
      />

      {/* AI Brain Reinforcement Training Modal */}
      <AIBrainTrainingModal
        isOpen={showAiTrainModal}
        onClose={() => setShowAiTrainModal(false)}
        athleteId={effectiveAthleteId}
        currentExercises={todayTasks}
      />

      {/* Weekly AI Micro-Cycle Evolution Modal */}
      <WeeklyCheckInModal
        isOpen={showWeeklyCheckInModal}
        onClose={() => setShowWeeklyCheckInModal(false)}
        athleteId={effectiveAthleteId}
        currentProgram={trainingBlock}
        currentWeekNumber={currentWeekNumber}
        onWeekEvolved={(evolvedProg) => {
          setCurrentWeekNumber(evolvedProg.weekNumber || (currentWeekNumber + 1));
          applyAiProgramToTasks(evolvedProg);
        }}
      />

      {/* Human Coach Mode v2.0 Waitlist Gate Modal */}
      <HumanCoachComingSoonModal
        isOpen={showCoachModal}
        onClose={() => setShowCoachModal(false)}
        user={user}
        profile={profile}
        pathway="powerlifting"
      />
    </div>
  );
};

export default AthleteCommandCenter;
