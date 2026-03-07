/**
 * CompetitionTab - Lock-In Competition Engine
 * 14-Week Peaking Program with Meet Discovery and Podium Probability
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Calendar, 
  Users, 
  TrendingUp, 
  Lock, 
  Unlock,
  MapPin,
  Clock,
  Zap,
  Medal,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

const CompetitionTab = ({ athleteId, user, profile, onLockIn }) => {
  const [availableMeets, setAvailableMeets] = useState([]);
  const [selectedMeet, setSelectedMeet] = useState(null);
  const [podiumProbability, setPodiumProbability] = useState(0);
  const [isLockedIn, setIsLockedIn] = useState(false);
  const [peakingProgram, setPeakingProgram] = useState(null);
  const [daysToPlatform, setDaysToPlatform] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scoutResults, setScoutResults] = useState(null);

  // Check if already in meet prep mode
  useEffect(() => {
    const checkMeetPrepStatus = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/users/${athleteId}/mode`);
        const data = await response.json();
        
        if (data.mode === 'MEET_PREP') {
          setIsLockedIn(true);
          setDaysToPlatform(data.days_to_platform);
          setSelectedMeet(data.selected_meet);
          loadPeakingProgram();
        }
      } catch (error) {
        console.error('Failed to check meet prep status:', error);
      }
    };

    checkMeetPrepStatus();
  }, [athleteId]);

  // Scout for meets
  const scoutMeets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/agents/meet_scout/discover/${athleteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: profile?.location || 'Bangalore',
          radius: 100, // km
          date_range: 90 // days
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAvailableMeets(data.meets);
        setScoutResults(data);
        toast.success(`Found ${data.meets.length} upcoming competitions`);
      } else {
        toast.error('Failed to scout for meets');
      }
    } catch (error) {
      console.error('Meet scouting failed:', error);
      toast.error('Failed to scout for meets');
    } finally {
      setLoading(false);
    }
  }, [athleteId, profile]);

  // Calculate podium probability
  const calculatePodiumProbability = useCallback(async (meet) => {
    try {
      const response = await fetch(`http://localhost:5001/api/agents/meet_scout/podium_probability/${athleteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          meet_id: meet.id,
          athlete_prs: profile?.training_max || {},
          meet_history: meet.historical_data || []
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setPodiumProbability(data.probability);
        return data.probability;
      }
    } catch (error) {
      console.error('Failed to calculate podium probability:', error);
      return 0;
    }
  }, [athleteId, profile]);

  // Lock-In to competition
  const lockInToCompetition = async () => {
    if (!selectedMeet) {
      toast.error('Please select a competition first');
      return;
    }

    setLoading(true);
    try {
      // Calculate final podium probability
      const finalProbability = await calculatePodiumProbability(selectedMeet);
      
      // Lock-In process
      const response = await fetch(`http://localhost:5001/api/users/${athleteId}/lock_in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          meet_id: selectedMeet.id,
          podium_probability: finalProbability,
          lock_in_timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setIsLockedIn(true);
        setDaysToPlatform(data.days_to_platform);
        
        // Generate 14-week peaking program
        await generatePeakingProgram(selectedMeet);
        
        // Update UI theme and notify parent
        onLockIn?.({
          meet: selectedMeet,
          daysToPlatform: data.days_to_platform,
          podiumProbability: finalProbability
        });
        
        toast.success(`Locked into ${selectedMeet.name}! 14-week peaking program activated.`);
      } else {
        toast.error('Failed to lock into competition');
      }
    } catch (error) {
      console.error('Lock-in failed:', error);
      toast.error('Failed to lock into competition');
    } finally {
      setLoading(false);
    }
  };

  // Generate 14-week peaking program
  const generatePeakingProgram = async (meet) => {
    try {
      const response = await fetch(`http://localhost:5001/api/programs/generate/peaking/${athleteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          meet_date: meet.date,
          current_strength: profile?.training_max || {},
          competition_lifts: meet.lifts || ['squat', 'bench', 'deadlift'],
          weeks_until_meet: 14
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setPeakingProgram(data.program);
        
        // Update user mode in database
        await fetch(`http://localhost:5001/api/users/${athleteId}/mode`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mode: 'MEET_PREP',
            meet_data: meet,
            days_to_platform: 14
          })
        });
      }
    } catch (error) {
      console.error('Failed to generate peaking program:', error);
    }
  };

  // Load existing peaking program
  const loadPeakingProgram = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/programs/${athleteId}`);
      const data = await response.json();
      
      if (data && data.is_peaking_program) {
        setPeakingProgram(data);
      }
    } catch (error) {
      console.error('Failed to load peaking program:', error);
    }
  };

  // Select meet
  const selectMeet = async (meet) => {
    setSelectedMeet(meet);
    await calculatePodiumProbability(meet);
  };

  // Peaking program data for visualization
  const peakingVolumeData = peakingProgram?.weeks?.map((week, index) => ({
    week: `W${index + 1}`,
    volume: week.total_volume || 0,
    intensity: week.avg_intensity || 0,
    rir: week.target_rir || 3
  })) || [];

  const podiumData = [
    { name: 'Win', value: podiumProbability * 0.4, fill: '#fbbf24' },
    { name: '2nd', value: podiumProbability * 0.35, fill: '#9ca3af' },
    { name: '3rd', value: podiumProbability * 0.25, fill: '#cd7c02' },
    { name: 'No Podium', value: 100 - podiumProbability, fill: '#374151' }
  ];

  if (isLockedIn) {
    return (
      <div className="bg-red-950 rounded-2xl border border-red-800 p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-red-500 mb-2">MEET PREP MODE</h2>
            <p className="text-red-300">14-Week Peaking Protocol Active</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-red-900 text-red-400 px-6 py-3 rounded-xl">
              <Clock className="w-5 h-5 inline mr-2" />
              {daysToPlatform} Days to Platform
            </div>
            <div className="bg-red-900 text-red-400 px-6 py-3 rounded-xl">
              <Trophy className="w-5 h-5 inline mr-2" />
              {Math.round(podiumProbability)}% Podium Chance
            </div>
          </div>
        </div>

        {/* Selected Meet Info */}
        {selectedMeet && (
          <div className="bg-red-900 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-red-300">{selectedMeet.name}</h3>
              <Lock className="w-5 h-5 text-red-400" />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <span className="text-red-400 text-sm">Location</span>
                <p className="text-white font-medium">{selectedMeet.location}</p>
              </div>
              <div>
                <span className="text-red-400 text-sm">Date</span>
                <p className="text-white font-medium">{new Date(selectedMeet.date).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-red-400 text-sm">Federation</span>
                <p className="text-white font-medium">{selectedMeet.federation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Peaking Program Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-red-900 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-red-300 mb-4">Volume Progression</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={peakingVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#7f1d1d" />
                <XAxis dataKey="week" stroke="#fca5a5" />
                <YAxis stroke="#fca5a5" />
                <Tooltip contentStyle={{ backgroundColor: '#7f1d1d', border: 'none' }} />
                <Line type="monotone" dataKey="volume" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="intensity" stroke="#fbbf24" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-red-900 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-red-300 mb-4">Podium Probability</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={podiumData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {podiumData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#7f1d1d', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {podiumData.slice(0, 3).map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-red-300">{item.name}</span>
                  <span className="text-white font-medium">{Math.round(item.value)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Week Focus */}
        {peakingProgram && peakingProgram.weeks && (
          <div className="bg-red-900 rounded-xl p-6 mt-6">
            <h3 className="text-xl font-semibold text-red-300 mb-4">Current Week Focus</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <span className="text-red-400 text-sm">Phase</span>
                <p className="text-white font-medium capitalize">
                  {peakingProgram.current_week <= 4 ? 'Accumulation' :
                   peakingProgram.current_week <= 8 ? 'Intensification' :
                   peakingProgram.current_week <= 11 ? 'Realization' : 'Taper'}
                </p>
              </div>
              <div>
                <span className="text-red-400 text-sm">Target RPE</span>
                <p className="text-white font-medium">
                  {peakingProgram.weeks[peakingProgram.current_week - 1]?.target_rpe || 8}
                </p>
              </div>
              <div>
                <span className="text-red-400 text-sm">Volume Reduction</span>
                <p className="text-white font-medium">
                  {peakingProgram.current_week > 11 ? '60%' : '0%'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-orange-500 mb-2">Competition Engine</h2>
          <p className="text-zinc-400">Meet discovery and 14-week peaking program</p>
        </div>
        <button
          onClick={scoutMeets}
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Target className="w-5 h-5" />
          {loading ? 'Scouting...' : 'Scout Meets'}
        </button>
      </div>

      {/* Scout Results */}
      {scoutResults && (
        <div className="bg-zinc-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4 text-sm">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-zinc-300">Scanned {scoutResults.instagram_posts_scanned} Instagram posts</span>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-300">Found {scoutResults.meets_found} competitions</span>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-300">In {scoutResults.locations_scanned.length} locations</span>
          </div>
        </div>
      )}

      {/* Available Meets */}
      {availableMeets.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Available Competitions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableMeets.map((meet) => (
              <motion.div
                key={meet.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => selectMeet(meet)}
                className={`bg-zinc-800 rounded-xl p-6 cursor-pointer border-2 transition-all ${
                  selectedMeet?.id === meet.id ? 'border-orange-500' : 'border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{meet.name}</h4>
                    <p className="text-zinc-400 text-sm">{meet.federation}</p>
                  </div>
                  <MapPin className="w-5 h-5 text-zinc-400" />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Location:</span>
                    <span className="text-white">{meet.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Date:</span>
                    <span className="text-white">{new Date(meet.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Distance:</span>
                    <span className="text-white">{meet.distance_km}km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Est. Lifters:</span>
                    <span className="text-white">{meet.estimated_lifters}</span>
                  </div>
                </div>

                {selectedMeet?.id === meet.id && (
                  <div className="mt-4 pt-4 border-t border-zinc-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-zinc-400">Your Podium Probability:</span>
                      <span className="text-2xl font-bold text-orange-400">{Math.round(podiumProbability)}%</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${podiumProbability}%` }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Lock-In Section */}
      {selectedMeet && !isLockedIn && (
        <div className="bg-gradient-to-r from-orange-900 to-red-900 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Ready to Lock-In?</h3>
              <p className="text-zinc-300">
                Join {selectedMeet.name} with {Math.round(podiumProbability)}% podium probability
              </p>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>14-week peaking program generated</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>UI theme switches to competition mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Daily countdown to platform</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={lockInToCompetition}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 flex items-center gap-3"
            >
              <Lock className="w-6 h-6" />
              {loading ? 'Locking In...' : 'LOCK-IN'}
            </button>
          </div>
        </div>
      )}

      {/* No Meets Found */}
      {availableMeets.length === 0 && scoutResults && (
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Competitions Found</h3>
          <p className="text-zinc-400 mb-4">Try scouting with a larger radius or different location</p>
          <button
            onClick={scoutMeets}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Scout Again
          </button>
        </div>
      )}

      {/* Initial State */}
      {!scoutResults && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Find Your Next Competition</h3>
          <p className="text-zinc-400 mb-6">
            Let our AI scout Instagram and meet databases to find the perfect competition for you
          </p>
          <button
            onClick={scoutMeets}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-700 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto"
          >
            <Target className="w-5 h-5" />
            {loading ? 'Scouting...' : 'Start Scouting'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CompetitionTab;
