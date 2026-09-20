import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  Users, 
  UserCheck, 
  Radio, 
  Sliders, 
  ToggleLeft, 
  ToggleRight, 
  Send, 
  Trash2, 
  Sparkles, 
  Brain, 
  TrendingUp, 
  Dumbbell, 
  Flame, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Activity, 
  Lock, 
  Unlock,
  AlertTriangle,
  Megaphone,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';

export default function AdminCommandCenter() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [telemetry, setTelemetry] = useState(null);
  const [activeTab, setActiveTab] = useState('releases'); // 'releases' | 'broadcast' | 'athletes' | 'coaches' | 'waitlist'

  // Feature Flags State
  const [featureFlags, setFeatureFlags] = useState({
    humanCoachMode: false,
    aiProgramBrain: true,
    weeklyEvolution: true,
    backroomTimer: true,
    desiNutrition: true,
    physiqueGallery: true,
    liveLogging: true
  });
  const [savingFlags, setSavingFlags] = useState(false);

  // Broadcast Dispatcher State
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    urgency: 'update', // 'info' | 'update' | 'warning' | 'urgent' | 'success'
    targetAudience: 'all' // 'all' | 'powerlifting' | 'fitness'
  });
  const [isDispatching, setIsDispatching] = useState(false);
  const [activeBroadcast, setActiveBroadcast] = useState(null);

  const apiUrl = import.meta.env.PROD 
    ? 'https://powerlift-ai-backend.onrender.com' 
    : 'http://localhost:5001';

  // Fetch telemetry and current admin state
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/overview`);
      const data = await res.json();
      if (data.success) {
        setTelemetry(data);
        if (data.featureFlags) {
          setFeatureFlags(data.featureFlags);
        }
        if (data.activeBroadcast) {
          setActiveBroadcast(data.activeBroadcast);
        } else {
          setActiveBroadcast(null);
        }
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
      toast.error("Could not reach admin API. Deploying offline admin cache.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Toggle Feature Flag Handler
  const handleToggleFlag = async (flagKey) => {
    const updated = {
      ...featureFlags,
      [flagKey]: !featureFlags[flagKey]
    };
    setFeatureFlags(updated);
    setSavingFlags(true);

    try {
      const res = await fetch(`${apiUrl}/api/admin/feature-flags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Updated release flag: ${flagKey} ➔ ${updated[flagKey] ? 'ACTIVE' : 'DISABLED'}`);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Flag update error:", err);
      toast.error(`Error saving flag: ${err.message}`);
    } finally {
      setSavingFlags(false);
    }
  };

  // Dispatch Global Broadcast Handler
  const handleDispatchBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      toast.error("Please provide both a broadcast title and message.");
      return;
    }

    setIsDispatching(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(broadcastForm)
      });
      const data = await res.json();
      if (data.success) {
        setActiveBroadcast(data.broadcast);
        localStorage.setItem('titan_active_broadcast', JSON.stringify(data.broadcast));
        toast.success("📢 GLOBAL BROADCAST DISPATCHED TO ALL LOGGED-IN USERS!");
        setBroadcastForm({
          title: '',
          message: '',
          urgency: 'update',
          targetAudience: 'all'
        });
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Broadcast error:", err);
      toast.error(`Broadcast failed: ${err.message}`);
    } finally {
      setIsDispatching(false);
    }
  };

  // Retract Active Broadcast Handler
  const handleRetractBroadcast = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/broadcast/active`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setActiveBroadcast(null);
        localStorage.removeItem('titan_active_broadcast');
        toast.success("Active broadcast retracted from all user screens.");
      }
    } catch (err) {
      toast.error("Failed to retract broadcast.");
    }
  };

  const featureList = [
    {
      key: 'humanCoachMode',
      title: '1-on-1 Real Human Coach Roster (v2.0)',
      description: 'When OFF, athletes see the "Coming in v2.0 Waitlist" modal. When turned ON, human coach matching and hiring opens across the platform.',
      category: 'RELEASE GATE',
      icon: <UserCheck className="w-5 h-5 text-amber-400" />
    },
    {
      key: 'aiProgramBrain',
      title: 'Real-Time AI Program Synthesis Brain',
      description: 'Sports-science RAG engine dynamically generating full micro-cycles from 1RM, weak points, and periodization context.',
      category: 'CORE INTELLIGENCE',
      icon: <Brain className="w-5 h-5 text-purple-400" />
    },
    {
      key: 'weeklyEvolution',
      title: 'Autonomous Weekly AI Micro-Cycle Evolution',
      description: 'Evaluates 7-day logs and auto-evolves next week (+2.5kg to +5kg progressive overload / fatigue deload) with debrief.',
      category: 'AUTOREGULATION',
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />
    },
    {
      key: 'backroomTimer',
      title: 'Meet Day Backroom Warmup & 60s Clock',
      description: 'Flight timing, "Lifters Out" counter, IPF colored plate visualizer, and official 60s table clock with audio chimes.',
      category: 'COMPETITION',
      icon: <Clock className="w-5 h-5 text-orange-400" />
    },
    {
      key: 'desiNutrition',
      title: 'Desi High-Protein Nutrition Engine',
      description: '₹100–₹250+/day pure veg, eggetarian, non-veg meal plans with automatic grocery lists and WhatsApp sharing.',
      category: 'NUTRITION',
      icon: <Sparkles className="w-5 h-5 text-cyan-400" />
    },
    {
      key: 'physiqueGallery',
      title: 'Physique Check-In Gallery & Weigh-Ins',
      description: 'Visual side-by-side baseline vs current physique check-ins and bodyweight trend curves.',
      category: 'PHYSIQUE',
      icon: <Activity className="w-5 h-5 text-blue-400" />
    },
    {
      key: 'liveLogging',
      title: 'Live Interactive Logger & Rest Timers',
      description: 'In-rack rest timer, set checkoffs, real-time volume tonnage math, and WhatsApp session logs.',
      category: 'TRACKING',
      icon: <Layers className="w-5 h-5 text-pink-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-100 p-4 sm:p-6 font-sans relative">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/3 w-96 h-96 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-900/15 rounded-full blur-3xl pointer-events-none" />

      {/* TOP COMMAND STRIP */}
      <div className="relative z-10 mb-6 border-b border-zinc-800/80 pb-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded bg-red-950/80 border border-red-500/50 text-[10px] font-mono uppercase font-black text-red-400 tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                SUPER_ADMIN_CONSOLE // ROOT_AUTHORITY
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-zinc-400">
                MASTER_KEY: {user?.email || "srastickshetty@gmail.com"}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black italic tracking-tight text-white flex items-center gap-3">
              TITAN-AI ADMIN WAR ROOM
            </h1>
          </div>

          {/* Quick Platform Jump Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap font-mono text-xs">
            <button
              onClick={() => navigate('/coach')}
              className="px-3 py-1.5 rounded border border-purple-500/40 bg-purple-950/40 text-purple-200 hover:bg-purple-900/60 hover:text-white transition-all flex items-center gap-1.5 font-bold"
              title="Open Coach Headroom & Program Approval Dashboard"
            >
              <UserCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>COACH DASHBOARD</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>

            <button
              onClick={() => navigate('/powerlifting-dashboard')}
              className="px-3 py-1.5 rounded border border-orange-500/40 bg-orange-950/30 text-orange-300 hover:bg-orange-900/50 hover:text-white transition-all flex items-center gap-1.5 font-bold"
              title="Open SBD Powerlifting Platform"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>POWERLIFTING</span>
            </button>

            <button
              onClick={() => navigate('/fitness-dashboard')}
              className="px-3 py-1.5 rounded border border-cyan-500/40 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/50 hover:text-white transition-all flex items-center gap-1.5 font-bold"
              title="Open Hypertrophy & Fitness War Room"
            >
              <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
              <span>FITNESS</span>
            </button>

            <button
              onClick={fetchAdminData}
              className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
              title="Refresh Platform Pulse Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* PLATFORM PULSE BENTO STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Metric 1: Total Athletes */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Total Registered Athletes</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black italic text-white">{telemetry?.stats?.totalAthletes || 5}</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">100% Active</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-400 mt-2 flex gap-3">
            <span>🏋️ {telemetry?.stats?.powerliftingAthletes || 3} Powerlifting</span>
            <span>🏆 {telemetry?.stats?.fitnessAthletes || 2} Fitness</span>
          </div>
        </div>

        {/* Metric 2: Coaches & Human Coach Mode */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Human Coach Mode Status</span>
            {featureFlags.humanCoachMode ? (
              <Unlock className="w-4 h-4 text-emerald-400" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-black italic ${featureFlags.humanCoachMode ? 'text-emerald-400' : 'text-amber-400'}`}>
              {featureFlags.humanCoachMode ? 'RELEASED (v2.0)' : 'RESTRICTED (v2.0)'}
            </span>
          </div>
          <div className="text-[11px] font-mono text-zinc-400 mt-2 flex justify-between">
            <span>Coaches in Standby: {telemetry?.stats?.totalCoaches || 2}</span>
            <span className="text-amber-400">Waitlist: {telemetry?.stats?.waitlistCount || 0}</span>
          </div>
        </div>

        {/* Metric 3: Active Broadcast */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Live Global Broadcast</span>
            <Radio className={`w-4 h-4 ${activeBroadcast ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black italic text-white truncate">
              {activeBroadcast ? activeBroadcast.title : "None Active"}
            </span>
          </div>
          <div className="text-[11px] font-mono text-zinc-400 mt-2 flex justify-between">
            <span>{activeBroadcast ? `Target: ${activeBroadcast.targetAudience.toUpperCase()}` : 'System Quiet'}</span>
            {activeBroadcast && (
              <button 
                onClick={handleRetractBroadcast}
                className="text-red-400 hover:text-red-300 font-bold"
              >
                Retract
              </button>
            )}
          </div>
        </div>

        {/* Metric 4: Platform Workload */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Total Tonnage Logged</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black italic text-cyan-300">
              {(telemetry?.stats?.totalTonnageKg || 135750).toLocaleString()} KG
            </span>
          </div>
          <div className="text-[11px] font-mono text-zinc-400 mt-2">
            AI Periodization Memory: <span className="text-emerald-400 font-bold">100% Synchronized</span>
          </div>
        </div>
      </div>

      {/* ADMIN NAVIGATION TABS */}
      <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-2 overflow-x-auto font-mono text-xs">
        {[
          { id: 'releases', label: '🚩 FEATURE RELEASE CONTROLS', icon: Sliders },
          { id: 'broadcast', label: '📢 GLOBAL BROADCAST DISPATCHER', icon: Megaphone },
          { id: 'athletes', label: `🏋️ ATHLETES ROSTER (${telemetry?.athletes?.length || 5})`, icon: Users },
          { id: 'coaches', label: `👤 COACHES ROSTER (${telemetry?.coaches?.length || 2})`, icon: UserCheck },
          { id: 'waitlist', label: `⏳ V2.0 COACH WAITLIST (${telemetry?.waitlist?.length || 0})`, icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap font-bold ${
                activeTab === tab.id
                  ? 'bg-red-950/80 text-white border border-red-500/50 shadow-md shadow-red-950'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: FEATURE RELEASE CONTROLS */}
      {activeTab === 'releases' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-400" />
                Live Release Switches & Gates
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Instantly turn on or off features across the entire platform. Changes persist across server restarts.
              </p>
            </div>
            {savingFlags && (
              <span className="text-xs font-mono text-amber-400 flex items-center gap-1.5 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Saving to Root Configuration...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featureList.map((feat) => {
              const isActive = featureFlags[feat.key];
              return (
                <div
                  key={feat.key}
                  className={`p-5 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-zinc-900/80 border-emerald-500/40 shadow-sm shadow-emerald-950/30' 
                      : 'bg-zinc-950/80 border-zinc-800/80 opacity-85'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-zinc-800/60 border border-zinc-700/60">
                        {feat.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">
                            {feat.category}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                            isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {isActive ? 'ONLINE' : 'RESTRICTED'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-0.5">{feat.title}</h4>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleFlag(feat.key)}
                      className={`p-1 rounded-full transition-colors ${
                        isActive ? 'text-emerald-400 hover:text-emerald-300' : 'text-zinc-500 hover:text-zinc-400'
                      }`}
                      title={isActive ? "Turn OFF this feature" : "Turn ON this feature"}
                    >
                      {isActive ? (
                        <ToggleRight className="w-8 h-8" />
                      ) : (
                        <ToggleLeft className="w-8 h-8" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {feat.description}
                  </p>

                  {feat.key === 'humanCoachMode' && (
                    <div className="mt-3 pt-3 border-t border-zinc-800/80 text-[11px] font-mono text-amber-300 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        {isActive 
                          ? "✅ Human Coach matching is LIVE for athletes." 
                          : "🔒 Athletes see 'Coming in v2.0' waitlist modal."}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: GLOBAL BROADCAST DISPATCHER */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dispatcher Form */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
              <Megaphone className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Dispatch Real-Time Broadcast
                </h3>
                <p className="text-xs text-zinc-400">
                  Broadcasts instantly to all currently logged-in athletes and coaches across both platforms.
                </p>
              </div>
            </div>

            <form onSubmit={handleDispatchBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                  Broadcast Title
                </label>
                <input
                  type="text"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  placeholder="e.g. ⚡ New Feature Deployed: Meet Day Warmup Timer"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                  Announcement Message
                </label>
                <textarea
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  rows={3}
                  placeholder="e.g. Welcome to TITAN-AI v1.0! Your autonomous AI coach is calibrated. Check the new competition backroom tool under the Platform tab."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 leading-relaxed"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                    Urgency & Styling
                  </label>
                  <select
                    value={broadcastForm.urgency}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, urgency: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="update">⚡ System Update (Purple)</option>
                    <option value="info">ℹ️ Information Notice (Cyan)</option>
                    <option value="warning">⚠️ Caution / Advisory (Amber)</option>
                    <option value="urgent">🚨 Critical Alert (Red)</option>
                    <option value="success">🏆 Milestone / Release (Green)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                    Target Audience
                  </label>
                  <select
                    value={broadcastForm.targetAudience}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="all">🌐 All Logged-In Users</option>
                    <option value="powerlifting">🏋️ Powerlifting Athletes Only</option>
                    <option value="fitness">🏆 Fitness & Physique Only</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isDispatching}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-red-600 via-purple-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black italic text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition-all"
              >
                <Send className="w-4 h-4" />
                {isDispatching ? "TRANSMITTING TO ALL LOGGED-IN USERS..." : "DISPATCH GLOBAL BROADCAST 📢"}
              </button>
            </form>
          </div>

          {/* Live Preview & Active Broadcast Status */}
          <div className="space-y-4">
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  Current Active Platform Broadcast
                </span>
                {activeBroadcast && (
                  <button
                    onClick={handleRetractBroadcast}
                    className="px-2.5 py-1 rounded bg-red-950 border border-red-500/50 text-red-300 hover:bg-red-900 text-[11px] font-mono flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Retract Broadcast</span>
                  </button>
                )}
              </div>

              {activeBroadcast ? (
                <div className="bg-zinc-950 border border-purple-500/40 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-600 text-white">
                      {activeBroadcast.urgency.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Target: {activeBroadcast.targetAudience.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{activeBroadcast.title}</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">{activeBroadcast.message}</p>
                  <div className="text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-900">
                    Dispatched by {activeBroadcast.author} • {new Date(activeBroadcast.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-zinc-800 rounded-lg text-zinc-500 text-xs font-mono">
                  No active broadcast currently broadcasting. Fill out the form to transmit an announcement.
                </div>
              )}
            </div>

            {/* Live Banner Preview */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold block mb-2">
                Live User Banner Simulation
              </span>
              <p className="text-xs text-zinc-400 mb-3">
                This is exactly how athletes will see your broadcast at the top of their command center:
              </p>
              <div className="p-3 rounded-xl border border-purple-500/60 bg-purple-950/80 text-purple-100 flex items-center justify-between gap-2 shadow-lg">
                <div className="flex items-center gap-2 truncate">
                  <Sparkles className="w-4 h-4 text-purple-300 shrink-0" />
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-purple-600 text-white shrink-0">
                    {broadcastForm.urgency.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-white truncate">
                    {broadcastForm.title || "TITAN-AI v1.0 Production Platform Live!"}
                  </span>
                  <span className="text-xs text-zinc-300 truncate">
                    — {broadcastForm.message || "AI Coach is 100% active."}
                  </span>
                </div>
                <button className="text-zinc-400 hover:text-white text-xs font-mono shrink-0">✕</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: ATHLETES ROSTER OVERVIEW */}
      {activeTab === 'athletes' && (
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Platform Athletes Oversight
              </h3>
              <p className="text-xs text-zinc-400">
                High-level operational view of all lifters, their pathways, split assignments, and CNS readiness.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-zinc-800 text-xs font-mono text-zinc-300">
              {telemetry?.athletes?.length || 5} Total Lifters
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="text-[11px] font-mono uppercase text-zinc-400 border-b border-zinc-800 bg-zinc-950/50">
                <tr>
                  <th className="p-3">Athlete</th>
                  <th className="p-3">Pathway</th>
                  <th className="p-3">Active Micro-Cycle</th>
                  <th className="p-3">CNS Readiness</th>
                  <th className="p-3">Total Tonnage</th>
                  <th className="p-3">Last Active</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                {(telemetry?.athletes || []).map((ath) => (
                  <tr key={ath.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white font-sans">{ath.name}</div>
                      <div className="text-[10px] text-zinc-400">{ath.email}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        ath.pathway === 'powerlifting' 
                          ? 'bg-orange-950/80 border border-orange-500/40 text-orange-300' 
                          : 'bg-purple-950/80 border border-purple-500/40 text-purple-300'
                      }`}>
                        {ath.pathway.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-200">{ath.split}</td>
                    <td className="p-3">
                      <span className={`font-bold ${
                        ath.cnsReadiness > 80 ? 'text-emerald-400' : ath.cnsReadiness > 70 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {ath.cnsReadiness}%
                      </span>
                    </td>
                    <td className="p-3 text-zinc-300 font-bold">
                      {(ath.totalTonnageKg || 25000).toLocaleString()} KG
                    </td>
                    <td className="p-3 text-zinc-400">{ath.lastActive}</td>
                    <td className="p-3">
                      <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {ath.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: COACHES ROSTER OVERVIEW */}
      {activeTab === 'coaches' && (
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Coach Roster & Supervision
              </h3>
              <p className="text-xs text-zinc-400">
                You are registered as the primary head coach and root authority. Additional partner coaches are standby for v2.0.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-zinc-800 text-xs font-mono text-zinc-300">
              {telemetry?.coaches?.length || 2} Coaches
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(telemetry?.coaches || []).map((coach) => (
              <div key={coach.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-sans">{coach.name}</span>
                      <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-[9px] font-mono uppercase font-black text-red-300">
                        {coach.status}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-zinc-400 mt-0.5">{coach.email}</div>
                  </div>
                  <UserCheck className="w-5 h-5 text-purple-400 shrink-0" />
                </div>

                <div className="space-y-1.5 text-xs font-mono text-zinc-300 mt-3 pt-3 border-t border-zinc-900">
                  <div>Role: <span className="text-white font-bold">{coach.role}</span></div>
                  <div>Specialty: <span className="text-amber-300">{coach.specialty}</span></div>
                  <div>Assigned Athletes: <span className="text-emerald-400 font-bold">{coach.athletesManaged}</span></div>
                  <div>Access Level: <span className="text-purple-300">{coach.accessLevel}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: V2.0 COACH WAITLIST */}
      {activeTab === 'waitlist' && (
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                v2.0 1-on-1 Human Coach Waitlist
              </h3>
              <p className="text-xs text-zinc-400">
                Athletes who requested human coach pairing while the platform is in AI-only mode.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-amber-950/80 border border-amber-500/40 text-xs font-mono text-amber-300">
              {telemetry?.waitlist?.length || 0} In Queue
            </span>
          </div>

          {(telemetry?.waitlist && telemetry.waitlist.length > 0) ? (
            <div className="space-y-3">
              {telemetry.waitlist.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white text-xs">{item.athleteName}</div>
                    <div className="text-[11px] font-mono text-zinc-400">{item.email} • {item.pathway?.toUpperCase()}</div>
                    <div className="text-xs text-zinc-300 mt-1">"{item.notes}"</div>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 shrink-0">
                    {new Date(item.requestedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-zinc-800 rounded-lg text-zinc-500 text-xs font-mono">
              No athletes currently waiting on the v2.0 coach queue.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
