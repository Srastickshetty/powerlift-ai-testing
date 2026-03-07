/**
 * TITAN-OS Integrated Client Dashboard
 * Combines existing functionality with new TITAN-OS features
 */

import { useEffect, useState, useRef } from "react";
import { useAuth } from "../auth/authContext";
import EvolutionMatrix from "../components/EvolutionMatrix";
import TitanDashboard from "../components/TitanDashboard";
import BiomechanicsLab from "../components/BiomechanicsLab";
import VoiceProcessor from "../components/VoiceProcessor";
import MeetLogistics from "../components/MeetLogistics";

// Neural Link Background (existing)
const NeuralLink = ({ active }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];
    let frame;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * (active ? 3 : 0.5);
        this.vy = (Math.random() - 0.5) * (active ? 3 : 0.5);
        this.r = Math.random() * 1.5;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
    }
    const init = () => {
      particles = [];
      for (let i = 0; i < (active ? 160 : 80); i++) particles.push(new Particle());
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = active ? "rgba(234,88,12,0.9)" : "rgba(234,88,12,0.4)";
      ctx.strokeStyle = active ? "rgba(234,88,12,0.4)" : "rgba(234,88,12,0.1)";
      ctx.lineWidth = 0.5;
      particles.forEach((p, i) => {
        p.update();
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const d = Math.hypot(p.x - particles[j].x, p.y - particles[j].y);
          if (d < 140) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
          }
        }
      });
      frame = requestAnimationFrame(draw);
    };
    resize(); init(); draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, [active]);
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

export default function ClientDashboardIntegrated() {
  const { user, profile } = useAuth();
  const athleteId = profile?.uid || user?.uid;

  // TITAN-OS Mode Management
  const [titanMode, setTitanMode] = useState('dashboard'); // 'dashboard', 'biomechanics', 'voice', 'meet_logistics'
  const [neuralActive, setNeuralActive] = useState(true);

  // Existing Dashboard States
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

  // Timer State
  const [timer, setTimer] = useState(0);
  const [totalTimerTime, setTotalTimerTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerStatus, setTimerStatus] = useState("idle");

  // TITAN-OS System Status
  const [systemStatus, setSystemStatus] = useState('operational');
  const [agentStatus, setAgentStatus] = useState({});

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

  // Load existing dashboard data
  useEffect(() => {
    const load = async () => {
      if (!athleteId) return;
      try {
        setLoading(true);
        
        const apiUrl = import.meta.env.PROD 
          ? 'https://powerlift-ai-backend.onrender.com'
          : 'http://localhost:5001';
        
        const res = await fetch(`${apiUrl}/api/programs/${athleteId}`);
        const loadedProgram = await res.json();
        console.log("📥 PROGRAM LOADED:", loadedProgram?.status, "weeks:", loadedProgram?.weeks?.length);
        
        if (!loadedProgram || !loadedProgram.weeks) {
          console.error("❌ Invalid program structure:", loadedProgram);
          setProgram(null);
        } else {
          setProgram(loadedProgram);
          console.log("✅ Program set successfully");
        }

        const logRes = await fetch(`${apiUrl}/api/logs/${athleteId}`);
        if (logRes.ok) {
          const savedLogs = await logRes.json();
          console.log("📥 LOGS LOADED:", savedLogs);
        }

        setLoading(false);
      } catch (error) {
        console.error("❌ Dashboard load failed:", error);
        setLoading(false);
      }
    };
    load();
  }, [athleteId]);

  // Check TITAN-OS system status
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/agents/capabilities');
        const data = await response.json();
        
        if (data.success) {
          setSystemStatus('operational');
          setAgentStatus(data.capabilities);
        } else {
          setSystemStatus('degraded');
        }
      } catch (error) {
        setSystemStatus('offline');
        console.error('System status check failed:', error);
      }
    };
    
    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const renderNavigation = () => (
    <div className="bg-zinc-900 border-b border-zinc-700 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-orange-500">
            TITAN<span className="text-white">-OS</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              systemStatus === 'operational' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
            }`}>
              {systemStatus.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTitanMode('dashboard')}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              titanMode === 'dashboard' 
                ? 'bg-blue-600 text-white' 
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setTitanMode('biomechanics')}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              titanMode === 'biomechanics' 
                ? 'bg-purple-600 text-white' 
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            Biomechanics
          </button>
          <button
            onClick={() => setTitanMode('voice')}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              titanMode === 'voice' 
                ? 'bg-green-600 text-white' 
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            Voice
          </button>
          <button
            onClick={() => setTitanMode('meet_logistics')}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              titanMode === 'meet_logistics' 
                ? 'bg-red-600 text-white' 
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            Meet Logistics
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (titanMode) {
      case 'biomechanics':
        return <BiomechanicsLab />;
      case 'voice':
        return <VoiceProcessor />;
      case 'meet_logistics':
        return <MeetLogistics />;
      default:
        // Original dashboard content with TITAN-OS enhancements
        return (
          <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Enhanced Today Tab with TITAN-OS Integration */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-zinc-800 rounded border border-zinc-700 p-6">
                  <h2 className="text-xl font-semibold text-orange-400 mb-4">Today's Training</h2>
                  {program && program.weeks && program.weeks[weekIndex] && program.weeks[weekIndex].days && program.weeks[weekIndex].days[dayIndex] ? (
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">
                        Week {weekIndex + 1}, Day {dayIndex + 1}
                      </h3>
                      <div className="space-y-4">
                        {program.weeks[weekIndex].days[dayIndex].main_lifts?.map((lift, idx) => (
                          <div key={idx} className="bg-zinc-700 rounded p-4">
                            <h4 className="text-sm font-medium text-blue-400">{lift.lift}</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-zinc-400">Sets:</span>
                                <span className="text-white">{lift.sets}</span>
                              </div>
                              <div>
                                <span className="text-zinc-400">Reps:</span>
                                <span className="text-white">{lift.reps}</span>
                              </div>
                              <div>
                                <span className="text-zinc-400">Weight:</span>
                                <span className="text-white">{lift.weight}kg</span>
                              </div>
                              <div>
                                <span className="text-zinc-400">RPE:</span>
                                <span className="text-white">{lift.rpe}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-zinc-400">
                      No training scheduled for today
                    </div>
                  )}
                </div>

                {/* TITAN-OS Evolution Matrix */}
                <div className="bg-zinc-800 rounded border border-zinc-700 p-6">
                  <h2 className="text-xl font-semibold text-purple-400 mb-4">Evolution Matrix</h2>
                  <EvolutionMatrix />
                </div>
              </div>

              {/* TITAN-OS Status Panel */}
              <div className="space-y-6">
                <div className="bg-zinc-800 rounded border border-zinc-700 p-4">
                  <h3 className="text-lg font-semibold text-green-400 mb-4">System Status</h3>
                  <div className="space-y-3">
                    {Object.entries(agentStatus).map(([agent, status]) => (
                      <div key={agent} className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300 capitalize">{agent}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          status.priority === 'high' || status.priority === 'critical' 
                            ? 'bg-red-900 text-red-400' 
                            : 'bg-green-900 text-green-400'
                        }`}>
                          {status.priority?.toUpperCase() || 'ACTIVE'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-zinc-800 rounded border border-zinc-700 p-4">
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setTitanMode('biomechanics')}
                      className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                      🎥 Analyze Technique
                    </button>
                    <button
                      onClick={() => setTitanMode('voice')}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      🎤 Voice Commands
                    </button>
                    <button
                      onClick={() => setTitanMode('meet_logistics')}
                      className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      🏆 Meet Prep
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-orange-500 text-2xl font-mono mb-4">INITIALIZING TITAN-OS</div>
          <div className="text-zinc-400 text-sm">Loading ecosystem components...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <NeuralLink active={neuralActive} />
      
      {renderNavigation()}
      
      <div className="relative z-10">
        {renderContent()}
      </div>
    </div>
  );
}
