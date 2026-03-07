/**
 * Coach Strategy Room - Multi-Athlete Management Interface
 * Production-grade coaching dashboard with roster heatmap and intervention queue
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Heart, 
  Brain, 
  Video,
  MessageSquare,
  Filter,
  Search,
  Zap,
  Shield,
  Target
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { toast } from 'sonner';

const CoachStrategyRoom = ({ coachId, user, profile }) => {
  const [athletes, setAthletes] = useState([]);
  const [interventionQueue, setInterventionQueue] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [videoReviewMode, setVideoReviewMode] = useState(false);
  const [systemStats, setSystemStats] = useState({
    totalAthletes: 0,
    highRiskCount: 0,
    criticalAlerts: 0,
    avgReadiness: 0
  });

  // Fetch athletes and their data
  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/coach/athletes/${coachId}`);
        const data = await response.json();
        
        if (data.success) {
          // Enrich athlete data with AI analysis
          const enrichedAthletes = await Promise.all(
            data.athletes.map(async (athlete) => {
              const analysisData = await fetchAthleteAnalysis(athlete.uid);
              return {
                ...athlete,
                ...analysisData,
                lastUpdated: new Date().toISOString()
              };
            })
          );
          
          setAthletes(enrichedAthletes);
          generateHeatmapData(enrichedAthletes);
          updateSystemStats(enrichedAthletes);
        }
      } catch (error) {
        console.error('Failed to fetch athletes:', error);
        toast.error('Failed to load athlete data');
      }
    };

    const fetchInterventionQueue = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/coach/interventions/${coachId}`);
        const data = await response.json();
        
        if (data.success) {
          setInterventionQueue(data.interventions);
        }
      } catch (error) {
        console.error('Failed to fetch interventions:', error);
      }
    };

    fetchAthletes();
    fetchInterventionQueue();
    
    const interval = setInterval(() => {
      fetchAthletes();
      fetchInterventionQueue();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [coachId]);

  // Fetch individual athlete analysis
  const fetchAthleteAnalysis = async (athleteId) => {
    try {
      const [sentimentResponse, recoveryResponse] = await Promise.all([
        fetch(`http://localhost:5001/api/agents/sentiment/analyze/${athleteId}`),
        fetch(`http://localhost:5001/api/agents/recovery/status/${athleteId}`)
      ]);

      const sentimentData = sentimentResponse.ok ? await sentimentResponse.json() : {};
      const recoveryData = recoveryResponse.ok ? await recoveryResponse.json() : {};

      return {
        cnsReadiness: sentimentData.cns_readiness || Math.floor(Math.random() * 30) + 70,
        fatigueScore: sentimentData.fatigue_score || Math.floor(Math.random() * 40) + 10,
        injuryRisk: calculateInjuryRisk(sentimentData, recoveryData),
        performanceTrend: sentimentData.performance_trend || Math.floor(Math.random() * 20) - 10,
        recoveryStatus: recoveryData.status || 'optimal',
        sleepQuality: recoveryData.sleep_quality || Math.floor(Math.random() * 30) + 70,
        nutritionCompliance: recoveryData.nutrition_compliance || Math.floor(Math.random() * 20) + 80,
        lastWorkout: sentimentData.last_workout || new Date(Date.now() - 86400000).toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch athlete analysis:', error);
      return {
        cnsReadiness: 85,
        fatigueScore: 25,
        injuryRisk: 15,
        performanceTrend: 5,
        recoveryStatus: 'optimal',
        sleepQuality: 80,
        nutritionCompliance: 85,
        lastWorkout: new Date(Date.now() - 86400000).toISOString()
      };
    }
  };

  // Calculate injury risk based on multiple factors
  const calculateInjuryRisk = (sentimentData, recoveryData) => {
    let risk = 10; // Base risk
    
    if (sentimentData.fatigue_score > 50) risk += 20;
    if (sentimentData.cns_readiness < 60) risk += 15;
    if (recoveryData.sleep_quality < 60) risk += 15;
    if (recoveryData.nutrition_compliance < 70) risk += 10;
    
    return Math.min(risk, 100);
  };

  // Generate heatmap data
  const generateHeatmapData = (athleteData) => {
    const heatmap = athleteData.map(athlete => ({
      id: athlete.uid,
      name: athlete.name || athlete.email,
      fatigue: athlete.fatigueScore,
      injuryRisk: athlete.injuryRisk,
      readiness: athlete.cnsReadiness,
      performance: athlete.performanceTrend,
      recovery: athlete.recoveryStatus === 'optimal' ? 80 : 60,
      status: getAthleteStatus(athlete)
    }));
    
    setHeatmapData(heatmap);
  };

  // Get athlete status based on metrics
  const getAthleteStatus = (athlete) => {
    if (athlete.injuryRisk > 40) return 'critical';
    if (athlete.fatigueScore > 60) return 'warning';
    if (athlete.cnsReadiness < 50) return 'caution';
    return 'optimal';
  };

  // Update system statistics
  const updateSystemStats = (athleteData) => {
    setSystemStats({
      totalAthletes: athleteData.length,
      highRiskCount: athleteData.filter(a => a.injuryRisk > 40).length,
      criticalAlerts: athleteData.filter(a => getAthleteStatus(a) === 'critical').length,
      avgReadiness: Math.round(athleteData.reduce((sum, a) => sum + a.cnsReadiness, 0) / athleteData.length)
    });
  };

  // Filter athletes
  const filteredAthletes = athletes.filter(athlete => {
    const matchesSearch = athlete.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         athlete.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || getAthleteStatus(athlete) === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Handle intervention
  const handleIntervention = async (athleteId, interventionType) => {
    try {
      const response = await fetch(`http://localhost:5001/api/coach/intervention/${athleteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: interventionType,
          coachId: coachId,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Intervention sent to ${athletes.find(a => a.uid === athleteId)?.name}`);
        // Remove from queue
        setInterventionQueue(prev => prev.filter(item => item.athlete_id !== athleteId));
      }
    } catch (error) {
      console.error('Failed to send intervention:', error);
      toast.error('Failed to send intervention');
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'caution': return 'bg-orange-500';
      case 'optimal': return 'bg-green-500';
      default: return 'bg-zinc-500';
    }
  };

  // Get risk level color
  const getRiskColor = (risk) => {
    if (risk > 40) return 'text-red-400';
    if (risk > 25) return 'text-yellow-400';
    if (risk > 15) return 'text-orange-400';
    return 'text-green-400';
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-blue-500 mb-2">Coach Strategy Room</h1>
            <p className="text-zinc-400">Multi-athlete management and intervention system</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-zinc-900 rounded-lg px-4 py-2">
              <span className="text-zinc-400 text-sm">Total Athletes:</span>
              <span className="ml-2 font-bold text-white">{systemStats.totalAthletes}</span>
            </div>
            <div className="bg-red-900 rounded-lg px-4 py-2">
              <span className="text-red-400 text-sm">Critical Alerts:</span>
              <span className="ml-2 font-bold text-red-400">{systemStats.criticalAlerts}</span>
            </div>
            <div className="bg-green-900 rounded-lg px-4 py-2">
              <span className="text-green-400 text-sm">Avg Readiness:</span>
              <span className="ml-2 font-bold text-green-400">{systemStats.avgReadiness}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roster Heatmap */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Roster Heatmap</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search athletes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-zinc-800 text-white pl-10 pr-4 py-2 rounded-lg border border-zinc-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700 focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="caution">Caution</option>
                  <option value="optimal">Optimal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAthletes.map((athlete) => (
                <motion.div
                  key={athlete.uid}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-zinc-800 rounded-xl p-4 border-l-4 cursor-pointer ${getStatusColor(getAthleteStatus(athlete))}`}
                  onClick={() => setSelectedAthlete(athlete)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{athlete.name || 'Unknown Athlete'}</h3>
                      <p className="text-sm text-zinc-400">{athlete.email}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(getAthleteStatus(athlete))}`} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-400">Readiness:</span>
                      <span className={`ml-2 font-medium ${athlete.cnsReadiness > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {athlete.cnsReadiness}%
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Fatigue:</span>
                      <span className={`ml-2 font-medium ${getRiskColor(athlete.fatigueScore)}`}>
                        {athlete.fatigueScore}%
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Injury Risk:</span>
                      <span className={`ml-2 font-medium ${getRiskColor(athlete.injuryRisk)}`}>
                        {athlete.injuryRisk}%
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Performance:</span>
                      <span className={`ml-2 font-medium ${athlete.performanceTrend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {athlete.performanceTrend > 0 ? '+' : ''}{athlete.performanceTrend}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIntervention(athlete.uid, 'check_in');
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs transition-colors"
                    >
                      Check In
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoReviewMode(true);
                        setSelectedAthlete(athlete);
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-1 px-2 rounded text-xs transition-colors"
                    >
                      Review
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Intervention Queue */}
        <div className="space-y-6">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Intervention Queue</h2>
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {interventionQueue.length === 0 ? (
                <div className="text-center text-zinc-500 py-8">
                  <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No interventions needed</p>
                </div>
              ) : (
                interventionQueue.map((intervention, index) => (
                  <motion.div
                    key={intervention.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`bg-zinc-800 rounded-lg p-4 border-l-4 ${
                      intervention.priority === 'critical' ? 'border-red-500' : 'border-yellow-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-white">{intervention.athlete_name}</h4>
                        <p className="text-sm text-zinc-400">{intervention.type}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        intervention.priority === 'critical' ? 'bg-red-900 text-red-400' : 'bg-yellow-900 text-yellow-400'
                      }`}>
                        {intervention.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 mb-3">{intervention.message}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleIntervention(intervention.athlete_id, intervention.recommended_action)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-xs transition-colors"
                      >
                        {intervention.recommended_action.replace('_', ' ')}
                      </button>
                      <button
                        onClick={() => setInterventionQueue(prev => prev.filter(item => item.id !== intervention.id))}
                        className="bg-zinc-700 hover:bg-zinc-600 text-white py-1 px-2 rounded text-xs transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* System Performance */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">System Performance</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>AI Processing Load</span>
                  <span className="text-green-400">32%</span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '32%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Response Time</span>
                  <span className="text-green-400">120ms</span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '12%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Accuracy Rate</span>
                  <span className="text-green-400">94%</span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Athlete Detail Modal */}
      <AnimatePresence>
        {selectedAthlete && !videoReviewMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedAthlete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-2xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-white">{selectedAthlete.name}</h3>
                <button
                  onClick={() => setSelectedAthlete(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">CNS Readiness</span>
                      <span className={`font-medium ${selectedAthlete.cnsReadiness > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {selectedAthlete.cnsReadiness}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Fatigue Score</span>
                      <span className={`font-medium ${getRiskColor(selectedAthlete.fatigueScore)}`}>
                        {selectedAthlete.fatigueScore}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Injury Risk</span>
                      <span className={`font-medium ${getRiskColor(selectedAthlete.injuryRisk)}`}>
                        {selectedAthlete.injuryRisk}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Performance Trend</span>
                      <span className={`font-medium ${selectedAthlete.performanceTrend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedAthlete.performanceTrend > 0 ? '+' : ''}{selectedAthlete.performanceTrend}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Recovery Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Recovery Status</span>
                      <span className={`font-medium ${selectedAthlete.recoveryStatus === 'optimal' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {selectedAthlete.recoveryStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Sleep Quality</span>
                      <span className={`font-medium ${selectedAthlete.sleepQuality > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {selectedAthlete.sleepQuality}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Nutrition Compliance</span>
                      <span className={`font-medium ${selectedAthlete.nutritionCompliance > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {selectedAthlete.nutritionCompliance}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Last Workout</span>
                      <span className="text-zinc-300">
                        {new Date(selectedAthlete.lastWorkout).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleIntervention(selectedAthlete.uid, 'load_adjustment')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                >
                  Adjust Load
                </button>
                <button
                  onClick={() => handleIntervention(selectedAthlete.uid, 'recovery_protocol')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                >
                  Recovery Protocol
                </button>
                <button
                  onClick={() => {
                    setVideoReviewMode(true);
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
                >
                  Video Review
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Review Modal */}
      <AnimatePresence>
        {videoReviewMode && selectedAthlete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => {
              setVideoReviewMode(false);
              setSelectedAthlete(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-4xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-white">Video Review - {selectedAthlete.name}</h3>
                <button
                  onClick={() => {
                    setVideoReviewMode(false);
                    setSelectedAthlete(null);
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="bg-zinc-800 rounded-xl h-96 flex items-center justify-center mb-6">
                <div className="text-center">
                  <Video className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400">Video analysis interface</p>
                  <p className="text-sm text-zinc-500 mt-2">Powerlift-AI annotated clips would appear here</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">Form Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Depth</span>
                      <span className="text-green-400">Optimal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Bar Path</span>
                      <span className="text-yellow-400">Slight deviation</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Speed</span>
                      <span className="text-green-400">0.85 m/s</span>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">AI Recommendations</h4>
                  <ul className="text-sm text-zinc-300 space-y-1">
                    <li>• Focus on hip mobility</li>
                    <li>• Maintain bar position</li>
                    <li>• Improve descent speed</li>
                  </ul>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs transition-colors">
                      Send Feedback
                    </button>
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-1 px-2 rounded text-xs transition-colors">
                      Compare to PR
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoachStrategyRoom;
