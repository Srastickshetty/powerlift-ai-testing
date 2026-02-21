import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import ProgressCharts from "../components/ProgressCharts";
import AutoregulationPanel from "../components/AutoregulationPanel";
import ProgramHistoryList from "../components/ProgramHistory";
import DraftReviewPanel from "../components/DraftReviewPanel";

export default function AthleteDetail() {
  const { athleteId } = useParams();
  const [program, setProgram] = useState(null);
  const [progress, setProgress] = useState(null);
  const [programStructure, setProgramStructure] = useState(null);

  const fetchData = () => {
    api.get(`/coach/athlete/${athleteId}/program`).then((res) => setProgram(res.data)).catch(() => setProgram(null));
    api.get(`/progress/${athleteId}`).then((res) => setProgress(res.data)).catch(() => setProgress(null));
    api.get(`/coach/athlete/${athleteId}/program-structure`).then((res) => setProgramStructure(res.data)).catch(() => setProgramStructure(null));
  };

  useEffect(() => { fetchData(); }, [athleteId]);

  const handleDeload = async () => {
    if (!window.confirm("FORCE IMMEDIATE RECOVERY PROTOCOL?")) return;
    try {
      await api.post(`/coach/athlete/${athleteId}/deload`);
      fetchData();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30 p-4 md:p-8 overflow-x-hidden">
      {/* 🌌 Atmospheric Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-orange-900/10 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto space-y-8">
        
        {/* 🛰️ TOP HUD HEADER */}
        <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-orange-500 animate-pulse rounded-full shadow-[0_0_10px_#f97316]" />
              <span className="font-mono text-[10px] tracking-[0.5em] text-zinc-500 uppercase">Athlete_Live_Telemetry</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-[1000] italic uppercase tracking-tighter leading-none">
              Athlete <span className="text-zinc-700">Detail</span>
            </h1>
            <p className="font-mono text-xs text-zinc-500">UID: <span className="text-white">{athleteId}</span> // ACCESS_LEVEL: COACH_OVERRIDE</p>
          </div>

          {progress && (
            <div className="flex items-center gap-4 bg-zinc-900/50 border border-white/5 p-4 backdrop-blur-md skew-x-[-12deg]">
              <div className="skew-x-[12deg] text-right">
                <p className="text-[10px] font-mono text-zinc-500 uppercase">Performance_Status</p>
                <p className="text-2xl font-black italic text-orange-500 uppercase tracking-tighter">{progress.status}</p>
              </div>
              <div className="h-12 w-[1px] bg-white/10 skew-x-[12deg]" />
              <div className="skew-x-[12deg] h-10 w-10 bg-orange-500/10 flex items-center justify-center rounded-sm border border-orange-500/20">
                <span className="text-orange-500 animate-pulse">▲</span>
              </div>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ⚡ MAIN FEED */}
          <div className="lg:col-span-9 space-y-10">
            
            {/* PERFORMANCE ANALYSIS SECTION */}
            <section className="relative group">
              <div className="absolute -top-4 -left-4 w-20 h-20 border-t border-l border-white/20 pointer-events-none" />
              <div className="bg-zinc-900/30 border border-white/5 p-8 backdrop-blur-xl transition-all hover:bg-zinc-900/40">
                <div className="flex items-center justify-between mb-10">
                   <h2 className="text-2xl font-black italic uppercase tracking-widest flex items-center gap-3">
                    <span className="h-[2px] w-8 bg-orange-600" /> Performance_Analytics
                   </h2>
                   <div className="font-mono text-[10px] text-zinc-600">SOURCE: AI_SENSORS_V4.2</div>
                </div>

                {progress ? (
                  <div className="space-y-12">
                    <div className="p-4 bg-black/40 border border-white/5">
                      <ProgressCharts
                        e1RMTrend={[...progress.squat.map((s, i) => ({
                            week: i + 1,
                            squat: s.e1rm,
                            bench: progress.bench[i]?.e1rm,
                            deadlift: progress.deadlift[i]?.e1rm,
                        }))]}
                        fatigueTrend={progress.fatigue.map((f, i) => ({
                            week: i + 1,
                            fatigue: f.fatigue,
                        }))}
                      />
                    </div>

                    {/* 🧠 AI INTELLIGENCE GRID */}
                    {programStructure?.programSummary && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                          { label: "Phase", val: programStructure.programSummary.phase, color: "text-white" },
                          { label: "Volume_Trend", val: programStructure.programSummary.volume_trend, color: "text-indigo-400" },
                          { label: "Intensity_Trend", val: programStructure.programSummary.intensity_trend, color: "text-orange-400" },
                          { label: "Deload_Risk", val: programStructure.programSummary.deload_expected ? "HIGH" : "LOW", color: programStructure.programSummary.deload_expected ? "text-red-500" : "text-green-500" },
                          { label: "AI_Confidence", val: `${(programStructure.programSummary.confidence * 100).toFixed(0)}%`, color: "text-white" },
                        ].map((stat, i) => (
                          <div key={i} className="bg-white/[0.02] border border-white/5 p-4 hover:bg-white/[0.05] transition-colors">
                            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-2">{stat.label}</p>
                            <p className={`text-xl font-black italic uppercase ${stat.color}`}>{stat.val}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-sm">
                    <div className="w-12 h-12 border-4 border-t-orange-500 border-white/10 rounded-full animate-spin mb-4" />
                    <p className="font-mono text-[10px] text-zinc-600 animate-pulse">WAITING_FOR_DATA_PACKETS...</p>
                  </div>
                )}
              </div>
            </section>

            {/* AUTOREGULATION HUD */}
            <section className="bg-zinc-900/20 border border-white/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <span className="text-[120px] font-black italic -rotate-12 select-none">AUTO</span>
               </div>
               
               <div className="p-8 relative z-10">
                  <div className="flex items-baseline gap-3 mb-8">
                    <h2 className="text-4xl font-[1000] italic uppercase tracking-tighter text-white">Autoregulation_Hub</h2>
                    <span className="font-mono text-[10px] text-orange-500/50">MANUAL_OVERRIDE_ENABLED</span>
                  </div>
                  
                  <AutoregulationPanel athleteId={athleteId} />
                  
                  <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h4 className="font-mono text-xs text-white tracking-widest mb-1 font-bold">CRITICAL_INTERVENTION</h4>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase italic">Schedule immediate deload block to prevent metabolic failure.</p>
                    </div>
                    <button
                      onClick={handleDeload}
                      className="group relative px-8 py-3 bg-red-600 hover:bg-white transition-all duration-300 overflow-hidden skew-x-[-15deg]"
                    >
                      <div className="skew-x-[15deg] flex items-center gap-3">
                        <span className="font-black italic text-white group-hover:text-black uppercase">Force_Deload_Recovery</span>
                        <span className="text-white group-hover:text-black animate-bounce">▼</span>
                      </div>
                    </button>
                  </div>
               </div>
            </section>

            {/* DRAFT REVIEW MODULE */}
            <div className="p-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent">
              <div className="bg-[#050505] p-8">
                <DraftReviewPanel athleteId={athleteId} />
              </div>
            </div>
          </div>

          {/* 📜 SIDEBAR LOGS */}
          <aside className="lg:col-span-3">
            <div className="sticky top-10 space-y-6">
              <div className="bg-zinc-900/40 border border-white/5 p-6 backdrop-blur-lg">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-[2px] w-4 bg-indigo-500" />
                  <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-400">Recall_Archive</h3>
                </div>
                <ProgramHistoryList
                  athleteId={athleteId}
                  activeVersion={program?.activeVersion}
                />
              </div>

              {/* TACTICAL METADATA */}
              <div className="p-6 border border-white/5 font-mono text-[9px] text-zinc-600 space-y-4">
                <div className="flex justify-between uppercase"><span>System_Health:</span> <span className="text-green-500">Optimum</span></div>
                <div className="flex justify-between uppercase"><span>Neural_Confidence:</span> <span className="text-white">{(programStructure?.programSummary?.confidence * 100 || 0).toFixed(2)}%</span></div>
                <div className="h-[1px] bg-white/5 w-full" />
                <p className="italic leading-relaxed">Generated adjustments are based on multi-variate fatigue analysis including RPE trends and bar speed velocity.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}