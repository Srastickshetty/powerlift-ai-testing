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
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [cache, setCache] = useState({});

  // --- Cache key for deduplication ---
  const cacheKey = useMemo(() => `athlete_${athleteId}`, [athleteId]);

  // --- Optimized Sync Logic ---
  const fetchAllData = useCallback(async () => {
    if (cache[cacheKey]) {
      const cached = cache[cacheKey];
      setProgram(cached.program);
      setDraftProgram(cached.draftProgram);
      setProgress(cached.progress);
      setSessions(cached.sessions);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [logsRes, progressRes, progRes] = await Promise.all([
        api.get(`/logs/${athleteId}`),
        api.get(`/progress/${athleteId}`),
        api.get(`/programs/${athleteId}`)
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
          draftProgram: programData, 
          progress: progressData, 
          sessions: sessionsData 
        }
      }));
      
      setHasChanges(false);
    } catch (err) {
      console.error("❌ HUD_FETCH_FAILURE:", err);
    } finally {
      setLoading(false);
    }
  }, [athleteId, cacheKey, cache]); 

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
              {["protocol", "analytics", "history", "overview"].map(t => (
                <button 
                  key={t} 
                  onClick={() => setActiveTab(t)}
                  className={`text-sm font-black uppercase tracking-widest transition-all ${activeTab === t ? "text-orange-500" : "text-zinc-500 hover:text-white"}`}
                >
                  {t}
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
      </main>
    </div>
  );
}