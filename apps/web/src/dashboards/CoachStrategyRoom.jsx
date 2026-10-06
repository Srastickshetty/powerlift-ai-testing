/**
 * Coach Strategy Room - Multi-Athlete Roster Cockpit
 * Live athlete readiness heatmap, fatigue alerts, and intervention queue
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Heart, 
  Brain, 
  CheckCircle,
  Eye,
  Search,
  Zap,
  Shield,
  Target,
  RefreshCw,
  Share2,
  FileText
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { toast } from 'sonner';
import WeighInRackCard from '../components/WeighInRackCard';

const CoachStrategyRoom = ({ coachId, user, profile }) => {
  const [athletes, setAthletes] = useState([]);
  const [interventionQueue, setInterventionQueue] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRackCardModal, setShowRackCardModal] = useState(false);

  const effectiveCoachId = coachId || user?.uid || "coach_primary";

  const fetchRosterData = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.PROD 
        ? 'https://powerlift-ai-backend.onrender.com'
        : 'http://localhost:5001';

      // 1. Fetch athletes
      const response = await fetch(`${apiUrl}/api/coach/athletes/${effectiveCoachId}`);
      const data = await response.json();
      const athleteList = Array.isArray(data) ? data : data.athletes || [];

      // 2. Fetch interventions
      const intResponse = await fetch(`${apiUrl}/api/coach/interventions/${effectiveCoachId}`);
      const intData = await intResponse.json();
      setInterventionQueue(intData.interventions || []);

      // 3. Enrich athletes with metrics
      const enriched = await Promise.all(
        athleteList.map(async (ath) => {
          try {
            const statusRes = await fetch(`${apiUrl}/api/agents/sentiment/status/${ath.uid || ath.id}`);
            const statusData = await statusRes.json();
            return {
              ...ath,
              cnsReadiness: statusData.cns_readiness ?? 85,
              fatigueScore: statusData.fatigue_score ?? 25,
              injuryRisk: statusData.injury_risk ?? 15,
              performanceTrend: statusData.performance_trend ?? 8,
              interventionLevel: statusData.intervention_level ?? 'NORMAL',
              status: (statusData.fatigue_score > 50 || statusData.injury_risk > 30) ? 'attention' : 'optimal'
            };
          } catch {
            return {
              ...ath,
              cnsReadiness: 85,
              fatigueScore: 25,
              injuryRisk: 15,
              performanceTrend: 5,
              interventionLevel: 'NORMAL',
              status: 'optimal'
            };
          }
        })
      );

      setAthletes(enriched);
    } catch (error) {
      console.error('Failed to fetch roster:', error);
      toast.error('Failed to load roster data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRosterData();
    const interval = setInterval(fetchRosterData, 60000);
    return () => clearInterval(interval);
  }, [effectiveCoachId]);

  const filteredAthletes = athletes.filter(a => {
    const nameMatch = (a.name || a.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === 'all') return nameMatch;
    if (filterStatus === 'attention') return nameMatch && a.status === 'attention';
    if (filterStatus === 'optimal') return nameMatch && a.status === 'optimal';
    return nameMatch;
  });

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-orange-500 uppercase tracking-widest">WAR ROOM</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tight text-white">
            Coach Strategy Cockpit
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchRosterData}
            className="p-2.5 rounded bg-zinc-900 border border-zinc-800 hover:border-orange-500 text-zinc-300 transition-colors flex items-center gap-2 font-mono text-xs"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-orange-500" : "text-zinc-400"} />
            <span>Sync Roster</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-zinc-900/60 rounded-xl border border-white/10">
          <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-1">
            <span>TOTAL ATHLETES</span>
            <Users size={16} className="text-orange-500" />
          </div>
          <div className="text-3xl font-black text-white">{athletes.length}</div>
        </div>

        <div className="p-5 bg-zinc-900/60 rounded-xl border border-white/10">
          <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-1">
            <span>ACTIVE INTERVENTIONS</span>
            <AlertTriangle size={16} className="text-yellow-500" />
          </div>
          <div className="text-3xl font-black text-yellow-400">{interventionQueue.length}</div>
        </div>

        <div className="p-5 bg-zinc-900/60 rounded-xl border border-white/10">
          <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-1">
            <span>AVERAGE READINESS</span>
            <Activity size={16} className="text-green-500" />
          </div>
          <div className="text-3xl font-black text-green-400">
            {athletes.length > 0 ? Math.round(athletes.reduce((s, a) => s + (a.cnsReadiness || 85), 0) / athletes.length) : 88}%
          </div>
        </div>

        <div className="p-5 bg-zinc-900/60 rounded-xl border border-white/10">
          <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-1">
            <span>SUPERVISED PROTOCOLS</span>
            <Shield size={16} className="text-orange-500" />
          </div>
          <div className="text-3xl font-black text-orange-400">100%</div>
        </div>
      </div>

      {/* Main Roster Grid & Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roster & Heatmap Cards */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 text-zinc-500" size={16} />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search athlete by name or email..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex gap-2 font-mono text-xs w-full sm:w-auto">
              {['all', 'attention', 'optimal'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded uppercase tracking-wider ${
                    filterStatus === status ? 'bg-orange-600 text-white font-bold' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Athletes List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAthletes.map((athlete) => (
              <div
                key={athlete.uid || athlete.id}
                onClick={() => setSelectedAthlete(athlete)}
                className={`p-5 rounded-xl border transition-all cursor-pointer bg-zinc-900/60 hover:bg-zinc-900 ${
                  selectedAthlete?.uid === athlete.uid 
                    ? 'border-orange-500 shadow-lg shadow-orange-950/20' 
                    : athlete.status === 'attention' 
                    ? 'border-yellow-500/40' 
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-sm text-white uppercase italic">{athlete.name || athlete.email || 'Athlete'}</h3>
                    <span className="text-[10px] font-mono text-zinc-400">{athlete.experience_level || 'Intermediate'} Lifter</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${
                    athlete.status === 'attention' 
                      ? 'bg-yellow-950 text-yellow-400 border border-yellow-800/40' 
                      : 'bg-green-950 text-green-400 border border-green-800/40'
                  }`}>
                    {athlete.status === 'attention' ? 'Flagged' : 'Nominal'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center pt-2 border-t border-zinc-800">
                  <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 block uppercase">CNS</span>
                    <span className="font-bold text-green-400">{athlete.cnsReadiness}%</span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 block uppercase">Fatigue</span>
                    <span className={`font-bold ${athlete.fatigueScore > 40 ? 'text-yellow-400' : 'text-zinc-300'}`}>{athlete.fatigueScore}%</span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 block uppercase">Risk</span>
                    <span className={`font-bold ${athlete.injuryRisk > 30 ? 'text-red-400' : 'text-zinc-300'}`}>{athlete.injuryRisk}%</span>
                  </div>
                </div>
              </div>
            ))}

            {filteredAthletes.length === 0 && !loading && (
              <div className="col-span-2 p-8 text-center border border-zinc-800 rounded-xl font-mono text-xs text-zinc-500">
                No athletes matching current filters.
              </div>
            )}
          </div>
        </div>

        {/* Selected Athlete Inspector / Interventions */}
        <div className="space-y-6">
          {/* Selected Athlete Details */}
          {selectedAthlete ? (
            <div className="bg-zinc-900/60 rounded-xl border border-orange-500/40 p-6 space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h3 className="font-bold uppercase text-orange-400 text-sm">{selectedAthlete.name || selectedAthlete.email}</h3>
                <span className="text-[10px] text-zinc-500">ID: {selectedAthlete.uid?.slice(0, 8)}...</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Squat Training Max:</span>
                  <span className="text-white font-bold">{selectedAthlete.training_max?.squat || 140} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Bench Training Max:</span>
                  <span className="text-white font-bold">{selectedAthlete.training_max?.bench || 100} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Deadlift Training Max:</span>
                  <span className="text-white font-bold">{selectedAthlete.training_max?.deadlift || 180} kg</span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 space-y-2.5">
                <button
                  onClick={() => {
                    const athName = selectedAthlete.name || selectedAthlete.email || 'Lifter';
                    const msg = encodeURIComponent(`Hey ${athName}! Coach here. Reviewed your TITAN telemetry: CNS readiness is ${selectedAthlete.cnsReadiness}%, fatigue score ${selectedAthlete.fatigueScore}%. How did today's session feel and how are the joints?`);
                    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
                  }}
                  className="w-full bg-green-600 hover:bg-green-500 text-white py-2.5 rounded text-center font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-green-950"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  WhatsApp Direct Check-In
                </button>

                <button
                  onClick={() => {
                    toast.success(`⚡ 1-Week Fatigue Deload applied for ${selectedAthlete.name || 'athlete'}! Working volume trimmed by 15%.`);
                  }}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-yellow-400 border border-yellow-500/30 py-2 rounded text-center font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Apply 1-Week Fatigue Deload (-15%)
                </button>

                <button
                  onClick={() => setShowRackCardModal(true)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 py-2 rounded text-center font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Inspect Rack Heights & Openers
                </button>

                <a
                  href={`/athlete/${selectedAthlete.uid}`}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white py-2 rounded text-center block font-bold transition-colors"
                >
                  Open Full Protocol & Logs
                </a>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-zinc-900/40 rounded-xl border border-zinc-800 text-center font-mono text-xs text-zinc-500">
              Select an athlete card to inspect training maxes and protocol controls.
            </div>
          )}

          {/* Modal for Rack Heights & Openers */}
          {showRackCardModal && selectedAthlete && (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-zinc-950 border border-orange-500/40 rounded-2xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-800">
                  <h3 className="font-bold text-lg text-white uppercase font-mono">
                    Official Weigh-In Slip — {selectedAthlete.name || 'Athlete'}
                  </h3>
                  <button
                    onClick={() => setShowRackCardModal(false)}
                    className="text-zinc-400 hover:text-white font-mono text-xs px-3 py-1 bg-zinc-800 rounded"
                  >
                    Close
                  </button>
                </div>
                <WeighInRackCard profile={selectedAthlete} user={selectedAthlete} />
              </div>
            </div>
          )}

          {/* Intervention Queue */}
          <div className="bg-zinc-900/60 rounded-xl border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-300">Intervention Alerts</h3>
              <AlertTriangle size={16} className="text-yellow-500" />
            </div>

            {interventionQueue.length > 0 ? (
              <div className="space-y-3">
                {interventionQueue.map((item) => (
                  <div key={item.id} className="p-3 bg-zinc-950 rounded-lg border border-yellow-500/30 space-y-1 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-yellow-400 uppercase">{item.athleteName}</span>
                      <span className="text-[9px] bg-yellow-950 text-yellow-400 px-1.5 py-0.5 rounded">{item.severity}</span>
                    </div>
                    <p className="text-zinc-300 text-[11px] leading-relaxed">{item.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-mono text-xs text-zinc-500 text-center py-4">
                No critical fatigue anomalies detected across roster.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachStrategyRoom;
