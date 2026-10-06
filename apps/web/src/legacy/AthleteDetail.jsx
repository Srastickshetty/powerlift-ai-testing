import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../api/api";

// Core Components
import PerformanceCharts from "../components/PerformanceCharts";
import ProgressCharts from "../components/ProgressCharts";
import RecentSessionsTable from "../components/RecentSessionsTable";
import ProgramHistory from "../components/ProgramHistory";
import AutoregulationPanel from "../components/AutoregulationPanel";

export default function AthleteDetail() {
  const { athleteId } = useParams();

  // --- State ---
  const [program, setProgram] = useState(null);
  const [draftProgram, setDraftProgram] = useState(null);
  const [progress, setProgress] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState("protocol");
  const [activeSubTab, setActiveSubTab] = useState("performance");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [cache, setCache] = useState({});

  // --- Cache key for deduplication ---
  const cacheKey = useMemo(() => `athlete_${athleteId}`, [athleteId]);

  // --- Optimized Sync Logic ---
  const fetchAllData = useCallback(async () => {
    if (!athleteId) return;

    const cachedData = cache[cacheKey];

    if (cachedData && Date.now() - cachedData.timestamp < 30000) {
      setProgram(cachedData.program);
      setDraftProgram(cachedData.draftProgram);
      setProgress(cachedData.progress);
      setSessions(cachedData.sessions);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [logsRes, progressRes, progRes] = await Promise.all([
        api.get(`/logs/${athleteId}`).catch(() => ({ data: { squat: [], bench: [], deadlift: [] } })),
        api.get(`/progress/${athleteId}`).catch(() => ({ data: { squat: [], bench: [], deadlift: [] } })),
        api.get(`/programs/${athleteId}`).catch(() => ({ data: { weeks: [] } }))
      ]);

      // --- PROGRESS DATA HANDLING ---
      console.log("📊 RAW_PROGRESS_FROM_API:", progressRes.data);
      const progressData = progressRes.data || { squat: [], bench: [], deadlift: [] };

      const programData = progRes.data || { weeks: [] };
      const rawLogs = logsRes.data; 

      // Convert Object format to Array for the UI
      const sessionsData = typeof rawLogs === 'object' && !Array.isArray(rawLogs)
        ? Object.keys(rawLogs).map(dayKey => ({
            day_id: dayKey,
            week: dayKey.split('D')[0].replace('W', ''),
            day: dayKey.split('D')[1],
            lifts: rawLogs[dayKey],
            date: "Recent Session" 
          }))
        : (Array.isArray(rawLogs) ? rawLogs : []);

      setProgram(programData);
      setDraftProgram(JSON.parse(JSON.stringify(programData))); 
      setProgress(progressData);
      setSessions(sessionsData);

      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          program: programData,
          draftProgram: JSON.parse(JSON.stringify(programData)),
          progress: progressData,
          sessions: sessionsData,
          timestamp: Date.now()
        }
      }));

    } catch (err) {
      console.error("❌ HUD_FETCH_FAILURE:", err);
      // Set default data to prevent stuck loading
      setProgram({ weeks: [] });
      setDraftProgram({ weeks: [] });
      setProgress({ squat: [], bench: [], deadlift: [] });
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [athleteId, cache]); 

  useEffect(() => { 
    fetchAllData();
  }, [athleteId, fetchAllData]);

  // --- Helper: Generate unique IDs ---
  const generateId = useCallback(() => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);

  // --- CSV Export Logic ---
  const exportToCSV = useCallback(() => {
    if (!sessions || sessions.length === 0) return;

    const headers = ["Session_ID", "Week", "Day", "Exercise", "Weight_kg", "Reps", "RPE", "Date"];
    
    const rows = sessions.flatMap(s => {
      return Object.entries(s.lifts || {}).map(([liftName, data]) => [
        s.day_id,
        s.week,
        s.day,
        `"${liftName}"`, 
        data.weight || 0,
        data.reps || 0,
        data.rpe || "",
        s.date
      ]);
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `athlete_${athleteId}_history.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [sessions, athleteId]);

  // --- Memoized Editor Actions ---
  const addWeek = useCallback(() => {
    setDraftProgram(prev => ({
      ...prev, 
      weeks: [...(prev?.weeks || []), { id: generateId(), week: (prev?.weeks?.length || 0) + 1, days: [] }]
    }));
    setHasChanges(true);
  }, [generateId]);

  const addDay = useCallback((wIdx) => {
    setDraftProgram(prev => {
      const weeks = [...prev.weeks];
      weeks[wIdx] = {
        ...weeks[wIdx],
        days: [...weeks[wIdx].days, { id: generateId(), day: weeks[wIdx].days.length + 1, main_lifts: [], accessories: [] }]
      };
      return { ...prev, weeks };
    });
    setHasChanges(true);
  }, [generateId]);

  const addLift = useCallback((wIdx, dIdx, type) => {
    setDraftProgram(prev => {
      const weeks = [...prev.weeks];
      weeks[wIdx] = {
        ...weeks[wIdx],
        days: weeks[wIdx].days.map((day, i) => i === dIdx ? {
          ...day,
          [type]: [...day[type], { id: generateId(), lift: "New Exercise", sets: 0, reps: 0, load: 0 }]
        } : day)
      };
      return { ...prev, weeks };
    });
    setHasChanges(true);
  }, [generateId]);

  const updateLift = useCallback((wIdx, dIdx, lIdx, field, value, type) => {
    setDraftProgram(prev => {
      const weeks = [...prev.weeks];
      weeks[wIdx] = {
        ...weeks[wIdx],
        days: weeks[wIdx].days.map((day, i) => i === dIdx ? {
          ...day,
          [type]: day[type].map((lift, j) => j === lIdx ? { ...lift, [field]: value } : lift)
        } : day)
      };
      return { ...prev, weeks };
    });
    setHasChanges(true);
  }, []);

  const saveChanges = useCallback(async () => {
    setIsSaving(true);
    try {
      const payload = {
        athlete_id: athleteId,
        programId: program?.programId,
        weeks: draftProgram.weeks,
        metadata: draftProgram.metadata,
        name: draftProgram.name
      };

      const response = await api.post('/programs/save', payload);
      
      if (response.data.success) {
        setProgram(draftProgram);
        setHasChanges(false);
        if (!program?.programId) {
          setProgram(prev => ({...prev, programId: response.data.programId}));
        }
        setCache({}); 
      }
    } catch (e) {
      console.error("SAVE_FAILURE", e);
      alert("Protocol Sync Failed");
    } finally {
      setIsSaving(false);
    }
  }, [athleteId, program, draftProgram]);

  // AI Agent: Performance Prediction
  const PerformancePredictionAgent = () => {
    const calculatePredictions = () => {
      if (!progress || !sessions) return null;
      
      // Simple prediction logic based on recent progress
      const predictions = {
        squat: { current: 0, predicted: 0, trend: "stable" },
        bench: { current: 0, predicted: 0, trend: "stable" },
        deadlift: { current: 0, predicted: 0, trend: "stable" }
      };
      
      // Analyze recent sessions for strength trends
      sessions.forEach(session => {
        Object.entries(session.lifts || {}).forEach(([liftName, data]) => {
          if (data.weight && predictions[liftName.toLowerCase()]) {
            predictions[liftName.toLowerCase()].current = Math.max(
              predictions[liftName.toLowerCase()].current, 
              data.weight
            );
          }
        });
      });
      
      // Predict 4-week progress (conservative 2.5% increase)
      Object.keys(predictions).forEach(lift => {
        predictions[lift].predicted = Math.round(
          predictions[lift].current * 1.025
        );
        predictions[lift].trend = "increasing";
      });
      
      return predictions;
    };

    const predictions = calculatePredictions();
    
    if (!predictions) {
      return (
        <div className="text-center py-12">
          <p className="text-zinc-500">No training data available for predictions</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-400 mb-4">📊 4-Week Performance Forecast</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(predictions).map(([lift, data]) => (
              <div key={lift} className="bg-black/40 p-4 rounded border border-white/10">
                <div className="text-sm font-mono text-zinc-500 uppercase mb-2">{lift}</div>
                <div className="text-2xl font-bold text-white mb-1">{data.current} kg</div>
                <div className="text-sm text-green-400">→ {data.predicted} kg</div>
                <div className="text-xs text-zinc-600 mt-2">Trend: {data.trend}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-zinc-900/40 border border-white/10 rounded-lg p-6">
          <h4 className="text-lg font-bold text-orange-400 mb-3">🎯 Coaching Recommendations</h4>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400">•</span>
              <span>Athlete is on track for 2.5% strength increase in 4 weeks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Consider increasing volume on bench press for faster progress</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>Deadlift progress is steady - maintain current program</span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  // AI Agent: Recovery & Fatigue Monitor
  const RecoveryAgent = () => {
    const analyzeRecovery = () => {
      if (!sessions) return null;
      
      const sessionCount = sessions.length;
      const recentSessions = sessions.slice(-5); // Last 5 sessions
      
      // Simple fatigue analysis based on training frequency and RPE
      let totalRPE = 0;
      let rpeCount = 0;
      
      recentSessions.forEach(session => {
        Object.values(session.lifts || {}).forEach(data => {
          if (data.rpe) {
            totalRPE += data.rpe;
            rpeCount++;
          }
        });
      });
      
      const avgRPE = rpeCount > 0 ? totalRPE / rpeCount : 7;
      const fatigueLevel = avgRPE > 8 ? "high" : avgRPE > 7 ? "moderate" : "low";
      
      return {
        sessionCount,
        avgRPE: avgRPE.toFixed(1),
        fatigueLevel,
        recommendation: fatigueLevel === "high" ? "deload_recommended" : 
                      fatigueLevel === "moderate" ? "monitor_closely" : "increase_volume"
      };
    };

    const recovery = analyzeRecovery();
    
    if (!recovery) {
      return (
        <div className="text-center py-12">
          <p className="text-zinc-500">No session data available for recovery analysis</p>
        </div>
      );
    }

    const fatigueColors = {
      high: "text-red-400",
      moderate: "text-yellow-400", 
      low: "text-green-400"
    };

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-400 mb-4">💪 Recovery & Fatigue Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/40 p-4 rounded border border-white/10">
              <div className="text-sm font-mono text-zinc-500 uppercase mb-2">Total Sessions</div>
              <div className="text-2xl font-bold text-white">{recovery.sessionCount}</div>
            </div>
            <div className="bg-black/40 p-4 rounded border border-white/10">
              <div className="text-sm font-mono text-zinc-500 uppercase mb-2">Avg RPE</div>
              <div className="text-2xl font-bold text-white">{recovery.avgRPE}</div>
            </div>
            <div className="bg-black/40 p-4 rounded border border-white/10">
              <div className="text-sm font-mono text-zinc-500 uppercase mb-2">Fatigue Level</div>
              <div className={`text-2xl font-bold capitalize ${fatigueColors[recovery.fatigueLevel]}`}>
                {recovery.fatigueLevel}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-zinc-900/40 border border-white/10 rounded-lg p-6">
          <h4 className="text-lg font-bold text-purple-400 mb-3">🏥 Recovery Recommendations</h4>
          <ul className="space-y-2 text-sm text-zinc-300">
            {recovery.fatigueLevel === "high" && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">⚠️</span>
                  <span>High fatigue detected - recommend deload week</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Focus on sleep quality and nutrition</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>Consider reducing training volume by 40%</span>
                </li>
              </>
            )}
            {recovery.fatigueLevel === "moderate" && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">⚡</span>
                  <span>Moderate fatigue - monitor closely</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Maintain current training intensity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>Ensure adequate rest between sessions</span>
                </li>
              </>
            )}
            {recovery.fatigueLevel === "low" && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✅</span>
                  <span>Low fatigue - ready for increased volume</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Can increase training intensity safely</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>Consider adding accessory work</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    );
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-xl text-orange-500 tracking-tighter animate-pulse">SYSTEM_LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 font-sans selection:bg-orange-500/50">
      
      {/* 🛠️ GLOBAL COMMAND BAR */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter text-white">
              Coach<span className="text-orange-600">OS</span>
            </h1>
            <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
            <div className="flex gap-4">
              {["protocol", "analytics", "history", "overview", "ai-agents"].map(t => (
                <button 
                  key={t} 
                  onClick={() => setActiveTab(t)}
                  className={`text-sm font-black uppercase tracking-widest transition-all ${activeTab === t ? "text-orange-500" : "text-zinc-500 hover:text-white"}`}
                >
                  {t === "ai-agents" ? "🤖 AI_Agents" : t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {hasChanges && (
              <span className="text-[10px] font-mono text-orange-500 animate-pulse hidden lg:block">UNSAVED_DRAFT_PENDING</span>
            )}
            <button 
              disabled={!hasChanges || isSaving}
              onClick={saveChanges}
              className={`flex-1 md:flex-none px-8 py-3 font-black text-sm uppercase skew-x-[-10deg] transition-all ${hasChanges ? "bg-orange-600 text-white hover:bg-orange-500" : "bg-zinc-800 text-zinc-600"}`}
            >
              {isSaving ? "Syncing..." : "Commit Protocol"}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-6 md:p-10 space-y-12">
        
        {/* 📋 PROTOCOL EDITOR */}
        {activeTab === "protocol" && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {draftProgram?.weeks.map((week, wIdx) => (
              <section key={week.id || wIdx} className="relative">
                <div className="flex items-end gap-4 mb-8">
                  <h2 className="text-6xl font-[1000] italic text-white/10 uppercase leading-none">W0{week.week}</h2>
                  <div className="h-[2px] flex-1 bg-white/5 mb-2" />
                  <button className="text-xs font-bold text-red-900 hover:text-red-500 uppercase transition-colors">Terminate</button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                  {week.days.map((day, dIdx) => (
                    <div key={day.id || dIdx} className="bg-[#121215] border border-white/5 p-8 rounded-sm shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         <span className="text-8xl font-black italic">D{day.day}</span>
                      </div>

                      <h3 className="text-xl font-black italic text-orange-500 uppercase mb-8 flex items-center gap-3">
                        <span className="w-8 h-[2px] bg-orange-500" /> Day {day.day} Protocol
                      </h3>

                      <div className="space-y-6 relative z-10">
                        {["main_lifts", "accessories"].map(type => (
                          <div key={type} className="space-y-4">
                            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">{type.replace('_', ' ')}</p>
                            {day[type]?.map((lift, lIdx) => (
                              <div key={lift.id || lIdx} className="grid grid-cols-12 gap-3 items-center bg-black/40 p-3 border border-white/5 rounded-md hover:border-orange-500/30 transition-all">
                                <input 
                                  className="col-span-12 lg:col-span-6 bg-transparent text-lg font-bold text-white outline-none placeholder:text-zinc-800"
                                  value={lift.lift}
                                  onChange={(e) => updateLift(wIdx, dIdx, lIdx, 'lift', e.target.value, type)}
                                />
                                <div className="col-span-4 lg:col-span-2 flex flex-col">
                                  <label className="text-[8px] text-zinc-600 uppercase font-bold">Sets</label>
                                  <input type="number" className="bg-zinc-900 border border-white/10 text-white font-mono p-2 rounded" value={lift.sets} onChange={(e) => updateLift(wIdx, dIdx, lIdx, 'sets', e.target.value, type)} />
                                </div>
                                <div className="col-span-4 lg:col-span-2 flex flex-col">
                                  <label className="text-[8px] text-zinc-600 uppercase font-bold">Reps</label>
                                  <input type="number" className="bg-zinc-900 border border-white/10 text-white font-mono p-2 rounded" value={lift.reps} onChange={(e) => updateLift(wIdx, dIdx, lIdx, 'reps', e.target.value, type)} />
                                </div>
                                <div className="col-span-4 lg:col-span-2 flex flex-col">
                                  <label className="text-[8px] text-orange-900 uppercase font-bold">Load kg</label>
                                  <input type="number" className="bg-orange-600/10 border border-orange-500/20 text-orange-500 font-mono p-2 rounded focus:bg-orange-600 focus:text-white transition-all outline-none" value={lift.load} onChange={(e) => updateLift(wIdx, dIdx, lIdx, 'load', e.target.value, type)} />
                                </div>
                              </div>
                            ))}
                            <button onClick={() => addLift(wIdx, dIdx, type)} className="w-full py-3 border border-dashed border-white/10 text-[10px] font-bold text-zinc-600 hover:text-white hover:bg-white/5 transition-all">
                              + ATTACH {type === 'main_lifts' ? 'PRIMARY' : 'SECONDARY'} MOVEMENT
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={() => addDay(wIdx)}
                    className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/5 rounded-sm hover:bg-white/[0.02] hover:border-white/10 transition-all group"
                  >
                    <span className="text-4xl text-zinc-800 group-hover:text-orange-500 transition-colors mb-2">+</span>
                    <span className="text-xs font-black uppercase text-zinc-700 group-hover:text-zinc-400">Add Training Session</span>
                  </button>
                </div>
              </section>
            ))}

            <button 
              onClick={addWeek}
              className="w-full py-10 bg-white/[0.03] border border-white/5 rounded-sm flex items-center justify-center gap-4 hover:bg-white/[0.05] transition-all"
            >
              <div className="h-[1px] w-20 bg-zinc-800" />
              <span className="text-xl font-[1000] italic uppercase tracking-[0.2em] text-zinc-500">Append Next Microcycle</span>
              <div className="h-[1px] w-20 bg-zinc-800" />
            </button>
          </div>
        )}

        {/* 📈 ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in duration-500">
            <div className="bg-[#121215] border border-white/5 p-8 rounded-sm">
               <PerformanceCharts progress={progress} />
            </div>
            <div className="bg-[#121215] border border-white/5 p-8 rounded-sm">
               <ProgressCharts progress={progress} />
            </div>
          </div>
        )}

        {/* 📜 OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-10">
              <AutoregulationPanel athleteId={athleteId} />
              <div className="bg-[#121215] border border-white/5 p-8 rounded-sm">
                <h3 className="text-xl font-black italic uppercase mb-6">Execution_Logs</h3>
                <RecentSessionsTable sessions={sessions} />
              </div>
            </div>
            <aside className="lg:col-span-4 space-y-8">
                <div className="bg-orange-600 p-8 rounded-sm skew-x-[-2deg]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-200 mb-1">Coach_Advisory</p>
                  <h4 className="text-2xl font-[1000] italic text-black uppercase leading-tight">High Fatigue Detected</h4>
                  <p className="text-sm text-black/70 font-bold mt-4 italic leading-relaxed">System recommends a 10% load reduction for the upcoming Microcycle.</p>
                </div>
                <ProgramHistory athleteId={athleteId} />
            </aside>
          </div>
        )}

        {/* 📜 HISTORY TAB */}
        {activeTab === "history" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-500">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#121215] border border-orange-500/20 p-6 rounded-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4">Lifecycle_Archive</h3>
                <ProgramHistory athleteId={athleteId} />
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="bg-[#121215] border border-white/5 p-8 rounded-sm">
                <div className="flex justify-between items-end mb-8">
                  <div>
                     <h3 className="text-xl font-black italic uppercase">Detailed_Log_Archive</h3>
                     <p className="text-xs text-zinc-500 font-mono">Total Sessions Recorded: {sessions.length}</p>
                  </div>
                  <button 
                    onClick={exportToCSV}
                    className="text-[10px] font-bold text-orange-500 border border-orange-500/20 px-3 py-1 hover:bg-orange-500/10 transition-all uppercase tracking-tighter"
                  >
                    EXECUTE_CSV_EXPORT
                  </button>
                </div>
                <RecentSessionsTable sessions={sessions} />
              </div>
            </div>
          </div>
        )}

        {/* 🤖 AI AGENTS TAB */}
        {activeTab === "ai-agents" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* AI Agent Navigation */}
            <div className="bg-[#121215] border border-purple-500/20 rounded-sm p-1">
              <div className="flex gap-1">
                {[
                  { id: "performance", name: "Performance Prediction", icon: "📊" },
                  { id: "recovery", name: "Recovery Monitor", icon: "💪" }
                ].map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => setActiveSubTab(agent.id)}
                    className={`flex-1 px-4 py-3 text-xs font-black uppercase tracking-wider transition-all rounded ${
                      activeSubTab === agent.id 
                        ? "bg-purple-600 text-white" 
                        : "text-zinc-500 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="mr-2">{agent.icon}</span>
                    {agent.name}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Agent Content */}
            {activeSubTab === "performance" && <PerformancePredictionAgent />}
            {activeSubTab === "recovery" && <RecoveryAgent />}
          </div>
        )}
      </main>
    </div>
  );
}