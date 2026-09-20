import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import { LogOut, LayoutDashboard, ShieldAlert, Dumbbell, Flame, ArrowUpRight } from 'lucide-react';
import CoachStrategyRoom from "./CoachStrategyRoom";
import GlobalBroadcastBanner from "../components/GlobalBroadcastBanner";

export default function CoachDashboard() {
  const [viewMode, setViewMode] = useState("queue"); // 'queue' | 'strategy'
  const [athletes, setAthletes] = useState([]);
  const [managedPrograms, setManagedPrograms] = useState([]);
  const [editingProgram, setEditingProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [competitionRequests, setCompetitionRequests] = useState([]);
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const adminUid = user?.uid || "coach_primary";

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.PROD 
        ? 'https://powerlift-ai-backend.onrender.com'
        : 'http://localhost:5001';
      
      const athRes = await fetch(`${apiUrl}/api/coach/athletes/${adminUid}`);
      const athData = await athRes.json();
      setAthletes(athData || []);

      const [pendingRes, controlledRes, compRequestsRes] = await Promise.all([
        fetch(`${apiUrl}/api/coach/pending-programs`),
        fetch(`${apiUrl}/api/coach/controlled-programs/${adminUid}`),
        fetch(`${apiUrl}/api/coach/competition-requests/${adminUid}`)
      ]);

      const pendingData = await pendingRes.json();
      const controlledData = await controlledRes.json();
      const compRequestsData = await compRequestsRes.json();

      // We only want to show programs that are still in 'draft' or 'pending' status in this queue
      const combined = [...pendingData, ...controlledData].filter(p => p.status !== "active");
      setManagedPrograms(combined);
      setCompetitionRequests(compRequestsData || []);

    } catch (err) {
      console.error("❌ FETCH_ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [adminUid]);

  const handleApproveProgram = async (programId) => {
    try {
      const apiUrl = import.meta.env.PROD 
        ? 'https://powerlift-ai-backend.onrender.com'
        : 'http://localhost:5001';
      
      const res = await fetch(`${apiUrl}/api/coach/approve-program/${programId}`, {
        method: "POST",
      });

      if (res.ok) {
        // OPTIMISTIC UI UPDATE: 
        // Remove the program from the managedPrograms list immediately in the UI
        setManagedPrograms(prev => prev.filter(p => p.id !== programId));
        
        alert("✅ PROGRAM_DEPLOYED_TO_ATHLETE");
        
        // Refresh data from server to ensure sync
        fetchData();
      } else {
        alert("❌ DEPLOYMENT_FAILED: Server returned error");
      }
    } catch (err) {
      console.error("Approval failed", err);
      alert("❌ NETWORK_ERROR: Could not reach server");
    }
  };

  const handleApproveCompetition = async (requestId) => {
    try {
      const apiUrl = import.meta.env.PROD 
        ? 'https://powerlift-ai-backend.onrender.com'
        : 'http://localhost:5001';
      
      const res = await fetch(`${apiUrl}/api/coach/approve-competition/${requestId}`, {
        method: "POST",
      });
      if (res.ok) {
        setCompetitionRequests(prev => prev.filter(r => r.id !== requestId));
        alert("✅ COMPETITION APPROVED. New program is being generated for athlete.");
      } else {
        alert("❌ APPROVAL_FAILED: Server returned an error.");
      }
    } catch (err) {
      console.error("Competition approval failed", err);
      alert("❌ NETWORK_ERROR: Could not reach server for competition approval.");
    }
  };

  const handleDenyCompetition = async (requestId) => {
    try {
      const apiUrl = import.meta.env.PROD 
        ? 'https://powerlift-ai-backend.onrender.com'
        : 'http://localhost:5001';
      
      const res = await fetch(`${apiUrl}/api/coach/deny-competition/${requestId}`, {
        method: "POST",
      });
      if (res.ok) {
        setCompetitionRequests(prev => prev.filter(r => r.id !== requestId));
        alert("✅ COMPETITION DENIED. The athlete has been notified.");
      } else {
        alert("❌ DENIAL_FAILED: Server returned an error.");
      }
    } catch (err) {
      console.error("Competition denial failed", err);
      alert("❌ NETWORK_ERROR: Could not reach server for competition denial.");
    }
  };

  const handleSaveEdits = async () => {
    try {
      const apiUrl = import.meta.env.PROD 
        ? 'https://powerlift-ai-backend.onrender.com'
        : 'http://localhost:5001';
      
      const res = await fetch(`${apiUrl}/api/coach/edit-program/${editingProgram.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updatedWeeks: editingProgram.weeks }),
      });
      if (res.ok) {
        alert("💾 CHANGES_SAVED");
        setEditingProgram(null);
        fetchData(); // Refresh list without full page reload
      }
    } catch (err) {
      alert("Save failed");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const approvedAthletes = athletes.filter(a => a.coach_request_status === "approved");

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-orange-500 animate-pulse">SYNCHRONIZING_SYSTEM...</div>;

  return (
    <div className="min-h-screen bg-[#020202] text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* GLOBAL BROADCAST BANNER */}
        <GlobalBroadcastBanner targetAudience="all" />

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 border-b border-white/10 pb-6">
          <div>
            <div className="text-[10px] font-mono text-orange-500 uppercase tracking-widest mb-1">
              SUPERVISION & ATHLETE ROSTER
            </div>
            <h1 className="text-4xl sm:text-5xl font-[1000] italic uppercase tracking-tighter">
              Coach_<span className="text-orange-600">Command</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap font-mono text-xs">
            <button
              onClick={() => navigate('/admin')}
              className="px-3 py-1.5 rounded border border-red-500/50 bg-red-950/60 text-red-300 hover:bg-red-900/80 hover:text-white transition-all flex items-center gap-1.5 font-bold"
              title="Open Super-Admin Console"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>ADMIN CONSOLE</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>

            <button
              onClick={() => navigate('/powerlifting-dashboard')}
              className="px-2.5 py-1.5 rounded border border-orange-500/40 bg-orange-950/30 text-orange-300 hover:bg-orange-900/50 hover:text-white transition-all flex items-center gap-1.5 font-bold text-xs"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>POWERLIFTING</span>
            </button>

            <button
              onClick={() => navigate('/fitness-dashboard')}
              className="px-2.5 py-1.5 rounded border border-purple-500/40 bg-purple-950/30 text-purple-300 hover:bg-purple-900/50 hover:text-white transition-all flex items-center gap-1.5 font-bold text-xs"
            >
              <Dumbbell className="w-3.5 h-3.5 text-purple-400" />
              <span>FITNESS</span>
            </button>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600/10 border border-red-500/30 text-red-500 hover:bg-red-600 hover:text-white transition-all rounded text-xs uppercase"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* VIEW SELECTOR TABS */}
        <div className="flex gap-2 mb-8 border-b border-zinc-800 pb-3">
          <button
            onClick={() => setViewMode("queue")}
            className={`px-5 py-2 rounded font-mono text-xs uppercase tracking-wider transition-all ${
              viewMode === "queue"
                ? "bg-orange-600 text-white font-bold"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            Approvals & Active Roster
          </button>
          <button
            onClick={() => setViewMode("strategy")}
            className={`px-5 py-2 rounded font-mono text-xs uppercase tracking-wider transition-all ${
              viewMode === "strategy"
                ? "bg-orange-600 text-white font-bold"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            Strategy Cockpit & Readiness Heatmap
          </button>
        </div>

        {viewMode === "strategy" ? (
          <CoachStrategyRoom coachId={adminUid} user={user} profile={profile} />
        ) : (
          <>
            {/* SECTION 1: PROGRAM QUEUE */}
            <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-black italic text-blue-500 uppercase">Program_Queue</h2>
            <span className="bg-blue-500/10 text-blue-500 text-[10px] font-mono px-2 py-0.5 border border-blue-500/20">
              {managedPrograms.length} PENDING
            </span>
          </div>

          {managedPrograms.length === 0 ? (
             <div className="border border-white/5 bg-zinc-900/10 p-10 text-center">
                <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest">No_Pending_Drafts_In_Queue</p>
             </div>
          ) : (
            <div className="grid gap-4">
              {managedPrograms.map((p) => (
                <div key={p.id} className="bg-zinc-900/40 border border-blue-500/20 p-6 flex justify-between items-center group hover:bg-zinc-900/60 transition-all">
                  <div>
                    <div className="flex gap-2 items-center mb-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        <p className="text-blue-500 font-mono text-[10px] uppercase tracking-widest">{p.status}</p>
                    </div>
                    <h3 className="text-xl font-bold uppercase italic">
                      ID: {p.id.substring(0, 8)} <span className="text-zinc-600 mx-2">/</span> Athlete: {p.athlete_id.substring(0, 5)}
                    </h3>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setEditingProgram(p)}
                      className="border border-white/10 px-4 py-2 text-[10px] uppercase font-black hover:bg-white hover:text-black transition-all"
                    >
                      Inspect_Blueprint
                    </button>
                    <button 
                      onClick={() => handleApproveProgram(p.id)}
                      className="bg-blue-600 px-6 py-2 text-[10px] uppercase font-black hover:bg-blue-400 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                    >
                      Deploy_Active
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 1.5: COMPETITION REQUESTS */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-black italic text-red-500 uppercase">Competition_Requests</h2>
            <span className="bg-red-500/10 text-red-500 text-[10px] font-mono px-2 py-0.5 border border-red-500/20">
              {competitionRequests.length} PENDING
            </span>
          </div>

          {competitionRequests.length === 0 ? (
             <div className="border border-white/5 bg-zinc-900/10 p-10 text-center">
                <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest">No_Pending_Competition_Requests</p>
             </div>
          ) : (
            <div className="grid gap-4">
              {competitionRequests.map((req) => (
                <div key={req.id} className="bg-zinc-900/40 border border-red-500/20 p-6 flex justify-between items-center group hover:bg-zinc-900/60 transition-all">
                  <div>
                    <div className="flex gap-2 items-center mb-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        <p className="text-red-500 font-mono text-[10px] uppercase tracking-widest">{req.status}</p>
                    </div>
                    <h3 className="text-xl font-bold uppercase italic">
                      {req.competitionName} - {new Date(req.competitionDate.toDate()).toLocaleDateString()}
                      <span className="text-zinc-600 mx-2">/</span> Athlete: {req.athleteId.substring(0, 5)}
                    </h3>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleApproveCompetition(req.id)}
                      className="bg-red-600 px-6 py-2 text-[10px] uppercase font-black hover:bg-red-400 transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                    >
                      Approve & Generate Program
                    </button>
                    <button 
                      onClick={() => handleDenyCompetition(req.id)}
                      className="bg-zinc-700 text-white px-4 py-2 text-[10px] uppercase font-black hover:bg-zinc-600 transition-all"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: ATHLETES */}
        <div>
          <h2 className="text-2xl font-black italic text-green-500 mb-6 uppercase">Operational_Units</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedAthletes.map(a => (
              <div 
                key={a.uid} 
                onClick={() => navigate(`/athlete/${a.uid}`)} 
                className="p-6 bg-zinc-900/20 border border-white/5 hover:border-green-500/50 hover:bg-green-500/5 cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold uppercase italic group-hover:text-green-500 transition-colors">{a.name || "Unknown"}</h3>
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                        {a.name?.substring(0, 1)}
                    </div>
                </div>
                <p className="text-zinc-500 text-[10px] font-mono truncate mb-4">{a.email}</p>
                
                {/* AI Agent Status */}
                <div className="mb-4 p-3 bg-black/40 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono uppercase text-purple-400">AI_AGENTS</span>
                    <span className="text-[8px] font-mono px-2 py-0.5 border border-green-500/40 text-green-400">
                      ACTIVE
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[8px]">
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Performance:</span>
                      <span className="text-green-400">✓</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Recovery:</span>
                      <span className="text-green-400">✓</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/athlete/${a.uid}`);
                    }}
                    className="w-full text-left p-3 bg-black/40 border border-white/10 hover:border-green-500/50 hover:bg-green-500/10 transition-all group"
                  >
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase group-hover:text-green-400 transition-colors">View_Athlete_Details</span>
                        <span className="text-green-500 text-lg group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
        )}

        {/* --- BLUEPRINT INSPECTOR MODAL --- */}
        {editingProgram && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 p-10 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                <div>
                    <p className="text-orange-500 font-mono text-[10px] uppercase mb-1">Editing_Mode</p>
                    <h2 className="text-3xl font-[1000] italic uppercase text-white">Blueprint_Editor</h2>
                </div>
                <div className="flex gap-4">
                   <button onClick={() => setEditingProgram(null)} className="px-4 py-2 text-zinc-500 uppercase text-[10px] font-bold hover:text-white">Discard</button>
                   <button onClick={handleSaveEdits} className="bg-orange-600 px-8 py-3 text-xs font-black uppercase shadow-[0_0_20px_rgba(234,88,12,0.2)]">Commit_Changes</button>
                </div>
              </div>

              <div className="space-y-8">
                {editingProgram.weeks.map((week, wIdx) => (
                  <div key={wIdx} className="border-l-2 border-orange-500/30 pl-6">
                    <h4 className="text-orange-500 font-mono text-sm mb-4 font-bold">WEEK_{week.week}</h4>
                    <div className="grid gap-6">
                      {week.days.map((day, dIdx) => (
                        <div key={dIdx} className="bg-zinc-900/50 p-6 rounded border border-white/5">
                          <p className="text-[10px] font-mono mb-4 text-zinc-500 uppercase tracking-widest">Day_{day.day}</p>
                          {day.main_lifts.map((lift, lIdx) => (
                            <div key={lIdx} className="grid grid-cols-4 gap-4 mb-3">
                              <span className="text-xs font-bold self-center text-zinc-300 uppercase italic">{lift.lift}</span>
                              <div className="flex flex-col">
                                <label className="text-[8px] text-zinc-600 uppercase mb-1 font-mono">Sets</label>
                                <input 
                                    type="number" 
                                    className="bg-black border border-white/10 p-2 text-xs focus:border-orange-500 outline-none transition-colors" 
                                    value={lift.sets}
                                    onChange={(e) => {
                                      const up = {...editingProgram};
                                      up.weeks[wIdx].days[dIdx].main_lifts[lIdx].sets = e.target.value;
                                      setEditingProgram({...up});
                                    }}
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-[8px] text-zinc-600 uppercase mb-1 font-mono">Reps</label>
                                <input 
                                    type="text" 
                                    className="bg-black border border-white/10 p-2 text-xs focus:border-orange-500 outline-none" 
                                    value={lift.reps}
                                    onChange={(e) => {
                                      const up = {...editingProgram};
                                      up.weeks[wIdx].days[dIdx].main_lifts[lIdx].reps = e.target.value;
                                      setEditingProgram({...up});
                                    }}
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-[8px] text-zinc-600 uppercase mb-1 font-mono">Load (kg/%)</label>
                                <input 
                                    type="text" 
                                    className="bg-black border border-white/10 p-2 text-xs focus:border-orange-500 outline-none" 
                                    value={lift.load}
                                    onChange={(e) => {
                                      const up = {...editingProgram};
                                      up.weeks[wIdx].days[dIdx].main_lifts[lIdx].load = e.target.value;
                                      setEditingProgram({...up});
                                    }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}