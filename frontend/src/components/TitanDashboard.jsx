/**
 * TITAN-OS: Unified War Room Interface
 * Complete ecosystem control with dual-mode operation
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Activity, Shield, AlertTriangle, Target, Zap, Eye, Mic, Video, Trophy, Calendar, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../auth/authContext';

const TitanDashboard = () => {
  const { user, profile } = useAuth();
  const [mode, setMode] = useState('standard'); // 'standard' | 'meet_prep'
  const [systemStatus, setSystemStatus] = useState('operational');
  const [activeWorkflows, setActiveWorkflows] = useState([]);
  const [tarsOrb, setTarsOrb] = useState(null);
  const [biomechanicsData, setBiomechanicsData] = useState(null);
  const [meetLogistics, setMeetLogistics] = useState(null);
  const [recoveryCouncil, setRecoveryCouncil] = useState(null);
  const [sentimentEngine, setSentimentEngine] = useState(null);

  // TARS-D Orb animation
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let frame;
    
    const resize = () => { 
      canvas.width = window.innerWidth; 
      canvas.height = window.innerHeight; 
    };
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.r = Math.random() * 2;
        this.opacity = Math.random() * 0.5 + 0.5;
      }
      
      update() {
        this.x += this.vx; 
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        this.opacity *= 0.99;
      }
      
      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = mode === 'meet_prep' ? '#ff4444' : '#00ff41';
        ctx.shadowBlur = 10;
        ctx.shadowColor = mode === 'meet_prep' ? '#ff0000' : '#00ff41';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    
    const init = () => {
      resize();
      particles = Array.from({ length: 50 }, () => new Particle());
      frame = 0;
    };
    
    const animate = () => {
      if (!canvas) return;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });
      
      frame++;
      requestAnimationFrame(animate);
    };
    
    init();
    animate();
    
    window.addEventListener('resize', resize);
    
    return () => <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
  }, [mode]);

  // System status monitoring
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/agents/capabilities');
        const data = await response.json();
        
        if (data.success) {
          setSystemStatus('operational');
          
          // Update all agent statuses
          setSentimentEngine(data.capabilities?.sentiment);
          setRecoveryCouncil(data.capabilities?.recovery);
          setMeetLogistics(data.capabilities?.meet_logistics);
        } else {
          setSystemStatus('degraded');
        }
      } catch (error) {
        setSystemStatus('offline');
        console.error('System status check failed:', error);
      }
    };
    
    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    // Trigger UI theme change
    document.body.className = newMode === 'meet_prep' ? 'meet-prep-theme' : 'standard-theme';
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* TARS-D Orb Background */}
      {mode === 'meet_prep' && <TarsOrb />}
      
      {/* Main Control Interface */}
      <div className="relative z-10 h-full flex">
        
        {/* Left Panel - System Status */}
        <div className="w-80 bg-zinc-900 border-r border-zinc-700 p-4 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-orange-500 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              TITAN-OS CONTROL
            </h2>
            
            {/* Mode Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Operation Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleModeSwitch('standard')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
                    mode === 'standard' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Standard
                </button>
                <button
                  onClick={() => handleModeSwitch('meet_prep')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
                    mode === 'meet_prep' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  Meet Prep
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-zinc-300 mb-3">System Status</h3>
              <div className={`px-3 py-2 rounded text-sm font-medium ${
                systemStatus === 'operational' ? 'bg-green-900 text-green-400' :
                systemStatus === 'degraded' ? 'bg-yellow-900 text-yellow-400' :
                'bg-red-900 text-red-400'
              }`}>
                <div className="flex items-center gap-2">
                  {systemStatus === 'operational' ? <Shield className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{systemStatus.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Active Workflows */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-zinc-300 mb-3">Active Workflows</h3>
              <div className="space-y-2">
                {activeWorkflows.map(workflow => (
                  <div key={workflow.id} className="flex items-center justify-between p-2 bg-zinc-800 rounded">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        workflow.status === 'processing' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
                      }`} />
                      <span className="text-sm text-zinc-300">{workflow.dataType}</span>
                    </div>
                    <span className="text-xs text-zinc-500">{workflow.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Status Cards */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-300 mb-3">Agent Systems</h3>
              
              {/* Sentiment Engine */}
              {sentimentEngine && (
                <div className="p-3 bg-zinc-800 rounded border border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-blue-400">Sentiment Engine</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      sentimentEngine.priority === 'high' ? 'bg-red-900 text-red-400' : 'bg-green-900 text-green-400'
                    }`}>
                      {sentimentEngine.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 space-y-1">
                    {sentimentEngine.capabilities?.map(cap => (
                      <div key={cap} className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-green-400" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recovery Council */}
              {recoveryCouncil && (
                <div className="p-3 bg-zinc-800 rounded border border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-green-400">Recovery Council</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      recoveryCouncil.priority === 'high' ? 'bg-red-900 text-red-400' : 'bg-green-900 text-green-400'
                    }`}>
                      {recoveryCouncil.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 space-y-1">
                    {recoveryCouncil.capabilities?.map(cap => (
                      <div key={cap} className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-green-400" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meet Logistics */}
              {meetLogistics && (
                <div className="p-3 bg-zinc-800 rounded border border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-red-400">Meet Logistics</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      meetLogistics.priority === 'critical' ? 'bg-red-900 text-red-400' : 'bg-green-900 text-green-400'
                    }`}>
                      {meetLogistics.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 space-y-1">
                    {meetLogistics.capabilities?.map(cap => (
                      <div key={cap} className="flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-yellow-400" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* Right Panel - Main Content Area */}
        <div className="flex-1 relative">
          {/* Header */}
          <div className="bg-zinc-900 border-b border-zinc-700 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">
                TITAN<span className="text-orange-500">-OS</span>
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-400">System: </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  systemStatus === 'operational' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
                }`}>
                  {systemStatus}
                </span>
                <span className="text-sm text-zinc-400 ml-4">| User: {user?.email}</span>
              </div>
            </div>

          {/* Dynamic Content Area */}
          <div className="p-6">
            {mode === 'standard' ? (
              /* Standard Mode - Jira Lite & Recovery Council Stats */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Jira Lite Tasks */}
                <div className="bg-zinc-800 rounded border border-zinc-700 p-4">
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">Jira Lite Tasks</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-zinc-700 rounded">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      <div>
                        <h4 className="text-sm font-medium">Weekly Performance Review</h4>
                        <p className="text-xs text-zinc-400">Auto-generated from training sessions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-zinc-700 rounded">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <div>
                        <h4 className="text-sm font-medium">Recovery Council Summary</h4>
                        <p className="text-xs text-zinc-400">Nutrition + Sleep + Training recommendations</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Biomechanics Lab */}
                <div className="bg-zinc-800 rounded border border-zinc-700 p-4">
                  <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Biomechanics Lab
                  </h3>
                  {biomechanicsData ? (
                    <div className="mt-4 p-4 bg-zinc-900 rounded border border-zinc-600">
                      <h4 className="text-sm font-medium text-purple-300 mb-2">Analysis Results</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-zinc-500">Forward Lean:</span>
                          <span className={biomechanicsData.forwardLean > 10 ? 'text-red-400' : 'text-green-400'}>
                            {biomechanicsData.forwardLean}°
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Moment Arm:</span>
                          <span className={biomechanicsData.momentArm > 15 ? 'text-red-400' : 'text-green-400'}>
                            {biomechanicsData.momentArm}cm
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Power Leakage:</span>
                          <span className={biomechanicsData.powerLeakage > 20 ? 'text-red-400' : 'text-green-400'}>
                            {biomechanicsData.powerLeakage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 text-center text-zinc-500">
                      <Eye className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Upload video for analysis</p>
                      <input 
                        type="file" 
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            // Here you would upload to biomechanics analysis
                            console.log('Video uploaded for analysis:', file.name);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Meet Prep Mode - Competition Interface */
              <div className="space-y-6">
                {/* Lock-In Interface */}
                <div className="bg-red-900 border border-red-700 p-6 rounded text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">COMPETITION LOCK-IN</h3>
                  <div className="space-y-4">
                    <p className="text-red-400 mb-4">Meet: Bangalore Powerlifting Championship</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-red-300">Weight Class:</span>
                        <span className="text-white font-mono">83kg</span>
                      </div>
                      <div>
                        <span className="text-red-300">Platform:</span>
                        <span className="text-white font-mono">Platform A</span>
                      </div>
                      <div>
                        <span className="text-red-300">Flight:</span>
                        <span className="text-white font-mono">Flight C - 10:00 AM</span>
                      </div>
                    </div>
                    <button className="w-full bg-red-600 text-white py-3 px-4 rounded font-medium hover:bg-red-700 transition-colors">
                      LOCK IN FOR COMPETITION
                    </button>
                  </div>
                </div>

                {/* Meet Logistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Flight Sync */}
                  <div className="bg-zinc-800 rounded border border-zinc-700 p-4">
                    <h4 className="text-sm font-medium text-yellow-400 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Flight Sync
                    </h4>
                    <div className="space-y-2 text-xs text-zinc-400">
                      <div>Current: 12 athletes registered</div>
                      <div>Platform: 3 active flights</div>
                      <div>Last sync: 2 minutes ago</div>
                    </div>
                  </div>

                  {/* Powerlift-AI Refereeing */}
                  <div className="bg-zinc-800 rounded border border-zinc-700 p-4">
                    <h4 className="text-sm font-medium text-yellow-400 mb-2 flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Powerlift-AI Refereeing
                    </h4>
                    <div className="space-y-2 text-xs text-zinc-400">
                      <div>Auto-judge system: ACTIVE</div>
                      <div>Dispute resolution: 0.2s average</div>
                      <div>Technical foul detection: 95% accuracy</div>
                    </div>
                  </div>

                  {/* Live Scoring */}
                  <div className="bg-zinc-800 rounded border border-zinc-700 p-4">
                    <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Live Scoring
                    </h4>
                    <div className="space-y-2 text-xs text-zinc-400">
                      <div>Current lift: Squat 250kg - GOOD LIFT</div>
                      <div>Rank: 3rd / 12 lifters</div>
                      <div>Next attempt: 265kg (85% 1RM)</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default TitanDashboard;
