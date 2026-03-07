/**
 * Athlete Command Center - Production-Grade Client Dashboard
 * Bento-Grid layout with TARS-D integration and real-time monitoring
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Activity, 
  Target, 
  Heart, 
  TrendingUp, 
  Calendar,
  Video,
  Mic,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { toast } from 'sonner';
import TARSVoiceAssistant from '../components/TARSVoiceAssistant';
import BiomechanicsLab from '../components/BiomechanicsLab';
import VoiceProcessor from '../components/VoiceProcessor';

const AthleteCommandCenter = ({ athleteId, user, profile }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemData, setSystemData] = useState({
    cnsReadiness: 85,
    fatigueScore: 32,
    injuryRisk: 15,
    performanceTrend: 12
  });
  const [trainingBlock, setTrainingBlock] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [biomechanicsData, setBiomechanicsData] = useState(null);
  const [voiceCommand, setVoiceCommand] = useState(null);
  const [isMeetPrep, setIsMeetPrep] = useState(false);
  const [daysToPlatform, setDaysToPlatform] = useState(null);

  // Fetch real-time data
  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/agents/sentiment/status/${athleteId}`);
        const data = await response.json();
        
        if (data.success) {
          setSystemData({
            cnsReadiness: data.cns_readiness || 85,
            fatigueScore: data.fatigue_score || 32,
            injuryRisk: data.injury_risk || 15,
            performanceTrend: data.performance_trend || 12
          });
        }
      } catch (error) {
        console.error('Failed to fetch system data:', error);
      }
    };

    const fetchTrainingBlock = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/programs/${athleteId}`);
        const data = await response.json();
        
        if (data && data.weeks) {
          setTrainingBlock(data);
          generateTodayTasks(data);
        }
      } catch (error) {
        console.error('Failed to fetch training block:', error);
      }
    };

    const checkMeetPrep = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/users/${athleteId}/mode`);
        const data = await response.json();
        
        if (data.mode === 'MEET_PREP') {
          setIsMeetPrep(true);
          setDaysToPlatform(data.days_to_platform);
        }
      } catch (error) {
        console.error('Failed to check meet prep mode:', error);
      }
    };

    fetchSystemData();
    fetchTrainingBlock();
    checkMeetPrep();
    
    const interval = setInterval(fetchSystemData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [athleteId]);

  // Generate today's tasks from training block
  const generateTodayTasks = (program) => {
    const tasks = [];
    const currentWeek = program.current_week || 1;
    const currentDay = program.current_day || 1;
    
    if (program.weeks && program.weeks[currentWeek - 1] && program.weeks[currentWeek - 1].days && program.weeks[currentWeek - 1].days[currentDay - 1]) {
      const dayData = program.weeks[currentWeek - 1].days[currentDay - 1];
      
      // Add main lifts
      dayData.main_lifts?.forEach((lift, index) => {
        tasks.push({
          id: `main_${index}`,
          type: 'lift',
          title: lift.lift,
          sets: lift.sets,
          reps: lift.reps,
          weight: lift.weight,
          rpe: lift.rpe,
          completed: false,
          priority: 'high'
        });
      });
      
      // Add accessories
      dayData.accessories?.forEach((acc, index) => {
        tasks.push({
          id: `acc_${index}`,
          type: 'accessory',
          title: acc.exercise,
          sets: acc.sets,
          reps: acc.reps,
          weight: acc.weight,
          completed: false,
          priority: 'medium'
        });
      });
      
      // Add recovery tasks
      tasks.push({
        id: 'mobility',
        type: 'recovery',
        title: 'Mobility Work',
        duration: '15 min',
        completed: false,
        priority: 'medium'
      });
      
      tasks.push({
        id: 'nutrition',
        type: 'recovery',
        title: 'Post-Workout Nutrition',
        completed: false,
        priority: 'high'
      });
    }
    
    setTodayTasks(tasks);
  };

  // Handle voice commands
  const handleVoiceCommand = useCallback((command) => {
    setVoiceCommand(command);
    
    switch (command.type) {
      case 'system_status':
        toast.success(`CNS Readiness: ${systemData.cnsReadiness}% | Fatigue: ${systemData.fatigueScore}%`);
        break;
      case 'optimize_program':
        toast.success('Program optimization initiated based on current metrics');
        break;
      case 'start_workout':
        setActiveTab('jira');
        toast.success('Workout session started - Good luck!');
        break;
      case 'analyze_form':
        setActiveTab('biomechanics');
        toast.success('Form analysis mode activated');
        break;
      case 'recovery_mode':
        toast.success('Recovery protocol activated - Reducing intensity');
        break;
      case 'emergency_stop':
        toast.error('Emergency stop activated - All systems paused');
        break;
      default:
        console.log('Unknown command:', command);
    }
  }, [systemData]);

  // Toggle task completion
  const toggleTask = (taskId) => {
    setTodayTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // CNS Readiness Gauge Data
  const cnsData = [
    { name: 'CNS', value: systemData.cnsReadiness, fill: systemData.cnsReadiness > 70 ? '#22c55e' : systemData.cnsReadiness > 40 ? '#eab308' : '#ef4444' }
  ];

  // Performance trend data
  const performanceData = [
    { day: 'Mon', readiness: 82, fatigue: 25 },
    { day: 'Tue', readiness: 78, fatigue: 32 },
    { day: 'Wed', readiness: 85, fatigue: 28 },
    { day: 'Thu', readiness: 80, fatigue: 35 },
    { day: 'Fri', readiness: 88, fatigue: 22 },
    { day: 'Sat', readiness: 92, fatigue: 18 },
    { day: 'Sun', readiness: systemData.cnsReadiness, fatigue: systemData.fatigueScore }
  ];

  const bentoGrid = isMeetPrep ? 'grid-cols-4' : 'grid-cols-3';

  return (
    <div className={`min-h-screen ${isMeetPrep ? 'bg-red-950' : 'bg-black'} text-white p-6`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-bold ${isMeetPrep ? 'text-red-500' : 'text-orange-500'} mb-2`}>
              TITAN-OS {isMeetPrep ? 'MEET PREP' : 'COMMAND CENTER'}
            </h1>
            {isMeetPrep && (
              <div className="flex items-center gap-4">
                <div className="bg-red-900 text-red-400 px-4 py-2 rounded-lg">
                  <Clock className="w-4 h-4 inline mr-2" />
                  {daysToPlatform} Days to Platform
                </div>
                <div className="text-red-400 font-mono text-sm">
                  PEAKING PROTOCOL ACTIVE
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg ${systemData.cnsReadiness > 70 ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>
              CNS Readiness: {systemData.cnsReadiness}%
            </div>
            <div className={`px-4 py-2 rounded-lg ${systemData.injuryRisk > 30 ? 'bg-red-900 text-red-400' : 'bg-green-900 text-green-400'}`}>
              Injury Risk: {systemData.injuryRisk}%
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className={`grid ${bentoGrid} gap-6 mb-8`}>
        {/* TARS-D Voice Assistant */}
        <div className="col-span-1 row-span-2">
          <TARSVoiceAssistant onCommand={handleVoiceCommand} isActive={true} />
        </div>

        {/* CNS Readiness Gauge */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">CNS Readiness</h3>
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={cnsData}>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar background dataKey="value" cornerRadius={10} fill="#8884d8" />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="text-center mt-4">
            <div className={`text-3xl font-bold ${systemData.cnsReadiness > 70 ? 'text-green-400' : systemData.cnsReadiness > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
              {systemData.cnsReadiness}%
            </div>
            <div className="text-sm text-zinc-400">Ready to Train</div>
          </div>
        </div>

        {/* Fatigue & Injury Risk */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Risk Assessment</h3>
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Fatigue Score</span>
                <span className={systemData.fatigueScore > 50 ? 'text-red-400' : 'text-green-400'}>{systemData.fatigueScore}%</span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${systemData.fatigueScore > 50 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${systemData.fatigueScore}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Injury Risk</span>
                <span className={systemData.injuryRisk > 30 ? 'text-red-400' : 'text-green-400'}>{systemData.injuryRisk}%</span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${systemData.injuryRisk > 30 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${systemData.injuryRisk}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Trend */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Weekly Trend</h3>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
              <Line type="monotone" dataKey="readiness" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="fatigue" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Meet Prep Countdown (only in meet prep mode) */}
        {isMeetPrep && (
          <div className="bg-red-900 rounded-2xl border border-red-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-400">Platform Countdown</h3>
              <Target className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-red-400 mb-2">{daysToPlatform}</div>
              <div className="text-sm text-red-300">Days Until Competition</div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Peak Week</span>
                  <span className="text-red-400">Week 3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Volume Reduction</span>
                  <span className="text-red-400">60%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Intensity</span>
                  <span className="text-red-400">95%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        {['overview', 'jira', 'biomechanics', 'sentiment'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === tab 
                ? isMeetPrep 
                  ? 'bg-red-600 text-white' 
                  : 'bg-orange-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Today's Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Training Readiness</span>
                    <span className={`font-bold ${systemData.cnsReadiness > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {systemData.cnsReadiness > 70 ? 'GO' : 'CAUTION'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Recovery Status</span>
                    <span className={`font-bold ${systemData.fatigueScore < 30 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {systemData.fatigueScore < 30 ? 'OPTIMAL' : 'NEEDS REST'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Injury Risk</span>
                    <span className={`font-bold ${systemData.injuryRisk < 20 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {systemData.injuryRisk < 20 ? 'LOW' : 'MODERATE'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-colors">
                    Start Workout
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors">
                    Analyze Form
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors">
                    Recovery Mode
                  </button>
                  <button className="bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg transition-colors">
                    View Progress
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jira' && (
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Today's Training Tasks</h3>
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`bg-zinc-800 rounded-lg p-4 border-l-4 ${
                      task.priority === 'high' ? 'border-red-500' : 'border-blue-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            task.completed 
                              ? 'bg-green-600 border-green-600' 
                              : 'border-zinc-600 hover:border-zinc-500'
                          }`}
                        >
                          {task.completed && <CheckCircle className="w-3 h-3 text-white" />}
                        </button>
                        <div>
                          <h4 className={`font-medium ${task.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>
                            {task.title}
                          </h4>
                          <p className="text-sm text-zinc-400">
                            {task.type === 'lift' && `${task.sets}x${task.reps} @ ${task.weight}kg (RPE ${task.rpe})`}
                            {task.type === 'accessory' && `${task.sets}x${task.reps} @ ${task.weight}kg`}
                            {task.type === 'recovery' && task.duration}
                          </p>
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        task.priority === 'high' ? 'bg-red-900 text-red-400' : 'bg-blue-900 text-blue-400'
                      }`}>
                        {task.priority.toUpperCase()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-zinc-400">
                  {todayTasks.filter(t => t.completed).length} of {todayTasks.length} completed
                </div>
                <div className="w-48 bg-zinc-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(todayTasks.filter(t => t.completed).length / todayTasks.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'biomechanics' && (
            <BiomechanicsLab />
          )}

          {activeTab === 'sentiment' && (
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Sentiment Analysis</h3>
                <Heart className="w-5 h-5 text-red-400" />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Emotional State</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Motivation</span>
                        <span className="text-green-400">85%</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Energy</span>
                        <span className="text-yellow-400">62%</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '62%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Stress</span>
                        <span className="text-red-400">28%</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '28%' }} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">AI Recommendations</h4>
                  <div className="space-y-3">
                    <div className="bg-zinc-800 rounded-lg p-3">
                      <p className="text-sm text-zinc-300">
                        "Your stress levels are elevated. Consider reducing training intensity today and focusing on recovery."
                      </p>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-3">
                      <p className="text-sm text-zinc-300">
                        "High motivation detected - good time for technical skill work or accessory training."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AthleteCommandCenter;
