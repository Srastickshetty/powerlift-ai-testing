import { useEffect, useState, useRef } from "react";
import { useAuth } from "../auth/authContext";
import EvolutionMatrix from "../components/EvolutionMatrix";

/* ───────────────────────────
    🧠 NEURAL LINK (Background)
─────────────────────────── */
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

/* ───────────────────────────
    🛠️ HELPERS
─────────────────────────── */
const getNextUnresolvedDay = (program, logs) => {
  if (!program || !program.weeks) return null;
  for (let wi = 0; wi < program.weeks.length; wi++) {
    for (let di = 0; di < program.weeks[wi].days.length; di++) {
      const dayKey = `W${wi + 1}D${di + 1}`;
      const isLogged = Object.keys(logs).some(k => k.startsWith(dayKey));
      if (!isLogged) {
        return { weekIndex: wi, dayIndex: di };
      }
    }
  }
  return null;
};

/**
 * Migrate old-format logs to new stable ID format
 * Old: W1D1: { Squat: {...}, Bench: {...} } from API
 * New: W1D1_0_0_main_0: {...}, W1D1_0_0_main_1: {...} in frontend state
 */
const migrateLogs = (program, oldLogs) => {
  const migratedLogs = {};
  
  if (!program || !program.weeks) {
    console.log("📊 No program to migrate against, keeping logs as-is");
    return oldLogs;
  }
  
  if (Object.keys(oldLogs).length === 0) {
    console.log("📊 No logs to migrate");
    return oldLogs;
  }
  
  console.log("📊 Starting log migration. Incoming logs:", Object.keys(oldLogs));
  
  // Build a map of exercises per day: {W1D1: [exercise1, exercise2, ...]}
  const exerciseRegistry = {};
  program.weeks.forEach((week, wi) => {
    week.days?.forEach((day, di) => {
      const dayKey = `W${wi + 1}D${di + 1}`;
      exerciseRegistry[dayKey] = [];
      
      day.main_lifts?.forEach((lift, liftIdx) => {
        exerciseRegistry[dayKey].push({
          stableId: `${wi}_${di}_main_${liftIdx}`,
          name: lift.lift || `MainLift${liftIdx}`,
          type: 'main'
        });
      });
      
      day.accessories?.forEach((acc, accIdx) => {
        exerciseRegistry[dayKey].push({
          stableId: `${wi}_${di}_acc_${accIdx}`,
          name: acc.exercise || `Accessory${accIdx}`,
          type: 'acc'
        });
      });
    });
  });
  
  console.log("📊 Built exercise registry with", Object.keys(exerciseRegistry).length, "days");
  
  // Process each log entry
  Object.entries(oldLogs).forEach(([oldKey, logData]) => {
    // Check if already in new format: "W1D1_0_0_main_0"
    if (/^W\d+D\d+_\d+_\d+_(main|acc)_\d+$/.test(oldKey)) {
      // Already migrated, keep as-is
      migratedLogs[oldKey] = logData;
      console.log("  ✅ Already in new format:", oldKey);
      return;
    }
    
    // Parse old format: "W1D1_ExerciseName"
    const match = oldKey.match(/^(W\d+D\d+)_(.+)$/);
    if (!match) {
      // Can't parse, keep as-is
      migratedLogs[oldKey] = logData;
      console.warn("  ⚠️ Could not parse key (keeping as-is):", oldKey);
      return;
    }
    
    const dayKey = match[1];
    const exerciseName = match[2];
    
    if (!exerciseRegistry[dayKey]) {
      // Day not in program, keep old key
      migratedLogs[oldKey] = logData;
      console.warn(`  ⚠️ Day ${dayKey} not found in program (keeping as-is)`);
      return;
    }
    
    // Find matching exercise
    const matchedExercise = exerciseRegistry[dayKey].find(ex => ex.name === exerciseName);
    
    if (matchedExercise) {
      const newKey = `${dayKey}_${matchedExercise.stableId}`;
      migratedLogs[newKey] = logData;
      console.log(`  ✅ Migrated ${oldKey} → ${newKey}`);
    } else {
      // No match found, keep old key
      migratedLogs[oldKey] = logData;
      console.warn(`  ⚠️ No match for ${exerciseName} in ${dayKey} (keeping old key)`);
    }
  });
  
  console.log("📊 Migration complete:", Object.keys(migratedLogs));
  return migratedLogs;
};

export default function ClientDashboard() {
  const { user, profile } = useAuth();
  const athleteId = profile?.uid || user?.uid;

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

  // ⏱️ CREATIVE TIMER STATE
  const [timer, setTimer] = useState(0);
  const [totalTimerTime, setTotalTimerTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerStatus, setTimerStatus] = useState("idle"); // idle, active, finished

  useEffect(() => {
    let interval;
    if (timerActive && timer > 0) {
      setTimerStatus("active");
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && timerActive) {
      setTimerStatus("finished");
      // Keep "FINISHED" state for 3 seconds then hide
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

  useEffect(() => {
    const load = async () => {
      if (!athleteId) return;
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/programs/${athleteId}`);
        const loadedProgram = await res.json();
        console.log("📥 PROGRAM LOADED:", loadedProgram?.status, "weeks:", loadedProgram?.weeks?.length);
        
        if (!loadedProgram || !loadedProgram.weeks) {
          console.error("❌ Invalid program structure:", loadedProgram);
          setProgram(null);
        } else {
          setProgram(loadedProgram);
          console.log("✅ Program set successfully");
        }

        const logRes = await fetch(`http://localhost:5000/api/logs/${athleteId}`);
        let restored = {};
        if (logRes.ok) {
          try {
            const savedLogs = await logRes.json();
            console.log("📥 RAW LOGS FROM BACKEND:", savedLogs);
            console.log("   Type:", Array.isArray(savedLogs) ? "ARRAY" : typeof savedLogs);
            console.log("   Keys:", Object.keys(savedLogs || {}).slice(0, 5));
            
            // Validate backend response format
            if (!savedLogs || typeof savedLogs !== 'object') {
              console.warn("❌ Invalid backend response format");
              restored = {};
            } else if (Array.isArray(savedLogs)) {
              console.warn("❌ Backend returned array instead of object - converting");
              // Convert array to object by creating day keys
              savedLogs.forEach((log, idx) => {
                if (log.lift && log.load) {
                  // Old format individual log - create a day placeholder
                  const dayKey = log.day_id || "W1D1"; // Use provided day_id or default
                  if (!restored[dayKey]) {
                    restored[dayKey] = {};
                  }
                  restored[dayKey][log.lift] = {
                    weight: log.load,
                    reps: log.reps,
                    rpe: log.rpe,
                    date: log.date
                  };
                  console.log(`   Converted log ${idx}: ${dayKey}_${log.lift}`);
                }
              });
            } else {
              // Expected format: object with dayIds as keys
              Object.entries(savedLogs).forEach(([dayId, lifts]) => {
                if (typeof lifts === 'object' && lifts !== null) {
                  console.log(`   Day ${dayId}:`, Object.keys(lifts || {}).join(", "));
                  Object.entries(lifts).forEach(([lift, data]) => {
                    const key = `${dayId}_${lift}`;
                    restored[key] = data;
                  });
                } else {
                  console.warn(`   ⚠️ Day ${dayId} has invalid lifts format:`, typeof lifts);
                }
              });
            }
            
            console.log("📄 RESTORED LOGS BEFORE MIGRATION:", Object.keys(restored));
            
            // Migrate old-format logs to new stable ID format
            restored = migrateLogs(loadedProgram, restored);
            console.log("🔄 RESTORED LOGS AFTER MIGRATION:", Object.keys(restored));
          } catch (e) {
            console.warn("❌ Failed to parse logs:", e);
            restored = {};
          }
        } else {
          console.warn("⚠️ No logs found (status:", logRes.status, ")");
        }
        
        setLog(restored);

        // Find next unresolved day based on migrated logs
        const unresolved = getNextUnresolvedDay(loadedProgram, restored);
        console.log("🎯 Next unresolved day:", unresolved);
        
        if (!loadedProgram || !loadedProgram.weeks) {
          console.warn("⚠️ Program failed to load or has no weeks");
          setIsProgramFinished(true);
          setWeekIndex(0);
          setDayIndex(0);
        } else if (unresolved) {
          setWeekIndex(unresolved.weekIndex);
          setDayIndex(unresolved.dayIndex);
          setIsProgramFinished(false);
        } else {
          setIsProgramFinished(true);
          setWeekIndex(loadedProgram.weeks.length - 1);
          setDayIndex((loadedProgram.weeks[loadedProgram.weeks.length - 1]?.days.length || 1) - 1);
        }
      } catch (err) { 
        console.error("❌ LOAD ERROR:", err);
        setWeekIndex(0);
        setDayIndex(0);
        setIsProgramFinished(true);
      } finally { 
        setLoading(false); 
      }
    };
    load();
  }, [athleteId]);

  const currentWeek = program?.weeks?.[weekIndex];
  const isCompetitionMode = program?.metadata?.type === "competition_block";
  const competitionDate = program?.metadata?.competitionDate;
  const currentPhase = currentWeek?.phase || "normal";

  const currentDay = currentWeek?.days[dayIndex];
  // Create a version of currentDay with stable unique IDs for each lift (week_day_index)
  const currentDayWithIds = currentDay ? {
    ...currentDay,
    main_lifts: currentDay.main_lifts?.map((lift, idx) => ({
      ...lift,
      stableId: lift.id || `${weekIndex}_${dayIndex}_main_${idx}` // Stable unique ID
    })) || [],
    accessories: currentDay.accessories?.map((acc, idx) => ({
      ...acc,
      stableId: acc.id || `${weekIndex}_${dayIndex}_acc_${idx}` // Stable unique ID
    })) || []
  } : null;

  const dayKey = `W${weekIndex + 1}D${dayIndex + 1}`;

  const previousDayKey = dayIndex === 0 ? null : `W${weekIndex + 1}D${dayIndex}`;
  const hasUnresolved = previousDayKey && !Object.keys(log).some(k => k.startsWith(previousDayKey));

  const calculateTonnage = (filterStr = "") => {
    return Object.keys(log)
      .filter(key => key.startsWith(filterStr))
      .reduce((sum, key) => {
        const entry = log[key];
        return sum + ((parseFloat(entry.weight) || 0) * (parseFloat(entry.reps) || 0));
      }, 0);
  };

  const getLiftVolumeData = (liftType) => {
    if (!program) return [];
    return program.weeks.flatMap((w, wi) => w.days.map((d, di) => {
      const entry = log[`W${wi+1}D${di+1}_${liftType}`];
      return entry ? (parseFloat(entry.weight) * parseFloat(entry.reps)) : 0;
    }));
  };

  const saveSession = async () => {
    const entries = {};
    let valid = true;
    currentDayWithIds?.main_lifts.forEach((lift, idx) => {
      const logKey = `${dayKey}_${lift.stableId}`;
      const entry = log[logKey];
      if (!entry?.weight || !entry?.reps) valid = false;
      // Save with both stableId AND readable name for backend compatibility
      entries[logKey] = entry;
      entries[`${dayKey}_${lift.lift}`] = entry; // Also save with readable name
    });
    if (!valid) { alert("⚠️ Complete all sets."); return; }
    
    try {
      // Transform entries back to day structure for backend
      const entriesForBackend = {};
      currentDayWithIds?.main_lifts.forEach((lift, idx) => {
        const logKey = `${dayKey}_${lift.stableId}`;
        const entry = log[logKey];
        entriesForBackend[lift.lift] = entry; // Save with readable lift name
      });

      console.log("💾 SAVING SESSION:");
      console.log("   dayId:", dayKey);
      console.log("   entriesForBackend:", entriesForBackend);
      console.log("   entries (both formats):", entries);

      const response = await fetch("http://localhost:5000/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId, dayId: dayKey, entries: entriesForBackend })
      });
      
      console.log("✅ Save response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Save error:", errorText);
        alert(`⚠️ Save failed: ${response.status}`);
        return;
      }
      
      // Merge new entries into log state (entries already has correct keys)
      const newLogState = { ...log, ...entries };
      setLog(newLogState);
      console.log("📝 Updated log state:", Object.keys(newLogState));

      const isLastDayOfWeek = dayIndex === currentWeek.days.length - 1;
      
      if (isLastDayOfWeek && !isCompetitionMode) {
        setShowCelebration(true);
        setSessionActive(false);
      } else {
        const unresolved = getNextUnresolvedDay(program, newLogState);
        if (unresolved) {
          setWeekIndex(unresolved.weekIndex); 
          setDayIndex(unresolved.dayIndex);
        }
        setSessionActive(false);
      }
    } catch (error) { 
      console.error("❌ SAVE ERROR:", error);
      alert("⚠️ DATA_FAILURE"); 
    }
  };

  if (loading || !program) return <div className="min-h-screen bg-black flex items-center justify-center text-orange-500 font-mono animate-pulse uppercase">INITIALIZING_INTERFACE...</div>;
if (program.status === "pending_approval") {
    return (
      <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center text-orange-500 font-mono uppercase p-10 text-center">
        <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent animate-spin mb-8 skew-x-[-15deg]"></div>
        <h2 className="text-3xl font-black italic mb-4">Awaiting_Coach_Approval</h2>
        <p className="text-zinc-500 tracking-widest text-xs max-w-md">
          The neural protocol has been generated. Your coach must verify the load parameters before the terminal is unlocked.
        </p>
        <div className="mt-8 pt-8 border-t border-white/10 w-full max-w-xs">
           <span className="text-[10px] text-zinc-600">STATUS: HOLD_PENDING_VERIFICATION</span>
        </div>
      </div>
    );
  }

  // Safety check: program must have valid weeks structure
  if (!program.weeks || !Array.isArray(program.weeks) || program.weeks.length === 0) {
    return (
      <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center text-red-500 font-mono uppercase p-10 text-center">
        <h2 className="text-3xl font-black italic mb-4">CRITICAL_ERROR</h2>
        <p className="text-zinc-500 tracking-widest text-xs max-w-md">
          Program structure invalid. Program has {program?.weeks?.length || 0} weeks.
        </p>
        <p className="text-zinc-600 text-xs mt-4">Program status: {program?.status || 'unknown'}</p>
      </div>
    );
  }

  const points = program.weeks.flatMap((w, wi) => w.days.map((d, di) => `W${wi+1}D${di+1}`)).map((dId, i, arr) => {
    const x = (i / (arr.length - 1 || 1)) * 100;
    const vol = calculateTonnage(dId);
    const y = 100 - (vol / (Math.max(...arr.map(id => calculateTonnage(id))) || 1000)) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="min-h-screen bg-[#020202] text-white font-black overflow-x-hidden relative">
      <NeuralLink active={sessionActive || showCelebration || timerActive} />

      {showResolvePopup && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] backdrop-blur-md">
            <div className="bg-zinc-900 p-8 border-2 border-orange-600 max-w-md skew-x-[-5deg]">
                <div className="skew-x-[5deg]">
                    <h3 className="text-2xl font-black italic uppercase text-orange-500 leading-tight">
                        UNLOGGED_SESSION_DETECTED
                    </h3>
                    <p className="text-zinc-400 font-mono text-sm mt-4 uppercase tracking-tighter">
                        Protocol mismatch: Previous day {previousDayKey} has no data. 
                        Choose an action to proceed.
                    </p>
                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={() => {
                                setShowResolvePopup(false);
                                setSessionActive(true);
                            }}
                            className="flex-1 bg-white text-black py-4 font-black uppercase italic hover:bg-zinc-300 transition-colors"
                        >
                            Log Now
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    await fetch("http://localhost:5000/api/logs", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            athleteId,
                                            dayId: previousDayKey,
                                            entry_type: "skipped",
                                            entries: {}
                                        })
                                    });
                                    setLog(prev => ({...prev, [`${previousDayKey}_SKIPPED`]: {weight: 0, reps: 0}}));
                                    setShowResolvePopup(false);
                                } catch (e) { alert("NETWORK_ERROR"); }
                            }}
                            className="flex-1 bg-orange-600 text-black py-4 font-black uppercase italic hover:bg-orange-500 transition-colors"
                        >
                            Skip & Notify
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* 🕒 CREATIVE REST PROTOCOL OVERLAY */}
      {timerActive && (
        <div className={`fixed bottom-10 right-10 z-50 transition-all duration-500 transform ${timerStatus === 'finished' ? 'scale-110' : 'scale-100'}`}>
          <div className={`relative p-8 skew-x-[-15deg] border-2 transition-colors duration-500 ${timerStatus === 'finished' ? 'bg-white border-orange-600' : 'bg-black/80 border-white/20'}`}>
            <div className="skew-x-[15deg] flex flex-col items-center">
              
              {/* Progress Circle background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="60" stroke="white" strokeWidth="2" fill="transparent" />
                  <circle 
                    cx="64" cy="64" r="60" stroke="#ea580c" strokeWidth="6" fill="transparent"
                    strokeDasharray={377}
                    strokeDashoffset={377 - (377 * (timer / totalTimerTime))}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
              </div>

              <span className={`font-mono text-[10px] uppercase tracking-widest mb-1 ${timerStatus === 'finished' ? 'text-orange-600 animate-pulse' : 'text-zinc-500'}`}>
                {timerStatus === 'finished' ? "▶_READY_TO_LIFT" : "REST_PROTOCOL_ACTIVE"}
              </span>
              
              <div className="relative">
                <span className={`text-6xl font-[1000] italic leading-none transition-colors ${timerStatus === 'finished' ? 'text-black' : 'text-white'}`}>
                  {timerStatus === 'finished' ? "GO!!" : `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`}
                </span>
                {timerStatus === 'active' && <div className="absolute -inset-1 bg-orange-600/20 blur-xl animate-pulse -z-10" />}
              </div>

              <div className={`mt-2 w-full h-1 bg-zinc-800 overflow-hidden`}>
                <div 
                   className="h-full bg-orange-600 transition-all duration-1000 ease-linear"
                   style={{ width: `${(timer/totalTimerTime) * 100}%` }}
                />
              </div>
              
              <span className={`mt-2 font-mono text-[8px] uppercase ${timerStatus === 'finished' ? 'text-black' : 'text-zinc-500'}`}>
                System_Status: <span className={timerStatus === 'finished' ? 'font-bold' : 'animate-pulse'}>{timerStatus === 'finished' ? "STABILIZED" : "RECOVERING..."}</span>
              </span>
            </div>
          </div>
          
          {/* Glitch artifacts when timer ends */}
          {timerStatus === 'finished' && (
            <>
              <div className="absolute -top-4 -left-4 w-8 h-px bg-orange-600 animate-ping" />
              <div className="absolute -bottom-4 -right-4 w-12 h-px bg-orange-600 animate-ping" />
            </>
          )}
        </div>
      )}

     <div className="relative z-10 max-w-[1600px] mx-auto p-4 md:p-10">
  <header className="flex justify-between items-center mb-12 border-b-2 border-white/10 pb-4">
    <div className="flex items-center gap-4">
      <div className={`w-4 h-4 bg-orange-600 skew-x-[-20deg] ${showCelebration || timerActive ? 'animate-ping' : 'animate-pulse'}`} />
      <span className="font-mono text-xs tracking-[0.5em] text-orange-500 uppercase">
        {timerStatus === 'active' 
          ? "RECOVERY_IN_PROGRESS" 
          : timerStatus === 'finished' 
          ? "NEURAL_SYNC_COMPLETE" 
          : showCelebration 
          ? "PHASE_COMPLETE_STABILIZING" 
          : "SYSTEM_ACTIVE"}
      </span>
    </div>

    {/* Updated Right Side Block */}
    <div className="hidden md:flex items-center gap-4 font-mono text-[10px] uppercase">
      <span className="text-zinc-500">
        LOAD_INDEX: <span className="text-white">{(calculateTonnage() / 1000).toFixed(1)}T</span>
      </span>

      {isCompetitionMode ? (
        <span className="bg-red-600 text-black px-3 py-1 font-bold tracking-widest">
          COMP_MODE_ACTIVE
        </span>
      ) : (
        <span className="bg-green-600 text-black px-3 py-1 font-bold tracking-widest">
          BASE_TRAINING
        </span>
      )}
    </div>
  </header>
{isCompetitionMode && competitionDate && (
  <div className="relative mb-12 group overflow-hidden">
    {/* HAZARD STRIPE BACKGROUND ACCENT */}
    <div className="absolute top-0 left-0 w-full h-1 bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_10px,#000_10px,#000_20px)] opacity-60" />
    
    <div className="bg-zinc-950 border-x border-b border-white/10 relative">
      <div className="flex flex-col md:flex-row">
        
        {/* SECTION 1: THE MISSION CALLSIGN */}
        <div className="p-6 border-b md:border-b-0 md:border-r border-white/5 flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 border-2 border-red-600 flex items-center justify-center rotate-45 group-hover:rotate-90 transition-transform duration-500">
              <div className="w-6 h-6 bg-red-600 flex items-center justify-center -rotate-45 group-hover:-rotate-90 transition-transform">
                <span className="text-black font-black text-xs">!</span>
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] text-red-600 font-bold uppercase tracking-[0.3em]">Operational_Target</p>
              <h3 className="text-white font-black text-xs font-mono uppercase">Phase: Final_Peak_Voltage</h3>
            </div>
          </div>

          <div className="relative">
            <span className="absolute -top-4 -left-2 text-[60px] font-black text-white/5 select-none uppercase italic">OBJECTIVE</span>
            <h2 className="relative text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
              {new Date(competitionDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
              <span className="text-red-600">.</span>
              {new Date(competitionDate).getFullYear()}
            </h2>
          </div>
        </div>

        {/* SECTION 2: THE KILL CLOCK (COUNTDOWN) */}
        <div className="relative bg-white/[0.02] p-6 flex flex-col items-center justify-center min-w-[280px] border-t-4 border-red-600">
          <div className="absolute top-2 right-2 flex gap-1">
            <div className="w-1 h-1 bg-red-600 animate-pulse" />
            <div className="w-1 h-1 bg-red-600 animate-pulse delay-75" />
            <div className="w-1 h-1 bg-red-600 animate-pulse delay-150" />
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block font-mono text-[10px] text-zinc-500 uppercase leading-tight text-right">T-Minus</span>
              <span className="block font-mono text-[10px] text-red-600 font-bold uppercase leading-tight text-right">Execution</span>
            </div>
            
            <div className="relative">
              <span className="text-7xl md:text-8xl font-black text-white tracking-[0.1em] drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                {Math.max(0, Math.ceil((new Date(competitionDate) - new Date()) / (1000 * 60 * 60 * 24)))}
              </span>
              <span className="absolute -right-8 bottom-4 font-mono text-sm text-zinc-500 font-black uppercase [writing-mode:vertical-lr]">
                Days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER: LOAD METRICS & SYSTEM STATUS */}
      <div className="bg-red-600 flex flex-wrap items-center justify-between px-4 py-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-black font-mono text-[9px] font-black uppercase">Status:</span>
            <span className="bg-black text-red-600 px-2 py-0.5 text-[9px] font-mono font-black uppercase animate-pulse">
              Heavy_Payload_Imminent
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
             <span className="text-black font-mono text-[9px] font-black uppercase italic tracking-tighter">
               "Strength is the only currency."
             </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 font-mono text-[10px] text-black font-black">
          <span className="opacity-50">SYNC_ID:</span>
          <span>{Math.random().toString(16).slice(2, 8).toUpperCase()}</span>
        </div>
      </div>
    </div>

    {/* DATA BIT DECORATION */}
    <div className="mt-2 flex justify-between">
       <div className="flex gap-1">
         {[...Array(20)].map((_, i) => (
           <div key={i} className={`w-1 h-1 ${i % 3 === 0 ? 'bg-red-600' : 'bg-zinc-800'}`} />
         ))}
       </div>
       <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Neural_Max_Calibration_Complete</span>
    </div>
  </div>
)}


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <nav className="lg:col-span-3 flex flex-col gap-4">
            {[{id:"today",label:"TERMINAL",icon:"⚡"},{id:"week",label:"STRATEGY",icon:"📡"},{id:"history",label:"ARCHIVE",icon:"💾"},{id:"progress",label:"EVOLUTION",icon:"🧬"},{id:"profile",label:"IDENTITY",icon:"🧾"}].map((t) => (
              <button key={t.id} onClick={() => { setTab(t.id); setSessionActive(false); setShowCelebration(false); }}
                className={`relative p-6 transition-all skew-x-[-15deg] origin-left ${tab === t.id ? "bg-orange-600 translate-x-4" : "bg-zinc-900/40"}`}>
                <div className="skew-x-[15deg] flex justify-between uppercase">
                  <span className="text-xl italic">{t.label}</span>
                  <span>{t.icon}</span>
                </div>
              </button>
            ))}
          </nav>

        <main className="lg:col-span-9 relative bg-zinc-900/10 border-t-2 border-r-2 border-white/5 backdrop-blur-xl min-h-[650px] p-6 md:p-12">
  {tab === "today" && (
    <div className="animate-in fade-in duration-500">
      
      {/* NEW: Competition Day Check */}
      {currentDay?.phase === "competition_day" ? (
        <CompetitionDayUI
          attempts={currentDay.main_lifts}
          competitionDate={program.metadata?.competitionDate}
        />
      ) : (
        <>
          {/* 1. CHECK FOR COMPETITION DAY FIRST (Existing logic) */}
          {currentPhase === "competition_day" ? (
            <CompetitionDayUI 
              currentDay={currentDay}
              athlete={profile} 
              saveSession={saveSession}
            />
          ) : (
            /* 2. ELSE: RENDER NORMAL CELEBRATION OR TRAINING UI */
            <>
              {showCelebration ? (
                <div className="text-center py-10 flex flex-col items-center">
                  <h2 className="text-7xl font-[1000] italic uppercase leading-none mb-6">
                    WEEK_0{weekIndex + 1}<br />
                    <span className="text-orange-600">CONCLUDED</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl mb-10">
                    <div className="bg-white/5 p-8 border-l-2 border-white">
                      <span className="block font-mono text-[10px] text-zinc-500 uppercase mb-2">Weekly Volume</span>
                      <span className="text-4xl italic text-white font-black">{calculateTonnage(`W${weekIndex + 1}`).toLocaleString()} KG</span>
                    </div>
                    <div className="bg-white/5 p-8 border-l-2 border-orange-600">
                      <span className="block font-mono text-[10px] text-zinc-500 uppercase mb-2">Total Program Tonnage</span>
                      <span className="text-4xl italic text-orange-500 font-black">{calculateTonnage().toLocaleString()} KG</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { 
                      const unresolved = getNextUnresolvedDay(program, log);
                      if (unresolved) {
                        setWeekIndex(unresolved.weekIndex); 
                        setDayIndex(unresolved.dayIndex);
                        setIsProgramFinished(false);
                      } else {
                        setIsProgramFinished(true);
                      }
                      setShowCelebration(false);
                    }} 
                    className="bg-white text-black px-16 py-6 font-black uppercase italic hover:bg-orange-600 transition-colors"
                  >
                    Initialize Next Week
                  </button>
                </div>
              ) : !sessionActive ? (
                <div className="text-center py-20">
                  {/* PHASE INDICATOR SECTION */}
                  <div className="mb-6 text-center font-mono uppercase tracking-widest text-sm">
                    {currentPhase === "peak" && (
                      <span className="text-orange-500">PEAK_PHASE_ACTIVE</span>
                    )}
                    {currentPhase === "taper" && (
                      <span className="text-yellow-400">TAPER_PHASE</span>
                    )}
                    {currentPhase === "post_comp_deload" && (
                      <span className="text-blue-400">POST_COMP_DELOAD</span>
                    )}
                  </div>

                  <h2 className="text-6xl font-[1000] italic uppercase mb-2 leading-none">
                    {calculateTonnage(dayKey) > 0 ? "Protocol_Sync_Ok" : "Protocol_Pending"}
                  </h2>
                  <p className="text-orange-500 font-mono text-[10px] tracking-[0.5em] mb-12 uppercase">
                    Queue: Week {weekIndex + 1} // Day {dayIndex + 1}
                  </p>
                  
                  <button 
                    disabled={calculateTonnage(dayKey) > 0} 
                    onClick={() => {
                      if (hasUnresolved) {
                        setShowResolvePopup(true);
                      } else {
                        setSessionActive(true);
                      }
                    }} 
                    className="px-16 py-8 font-black uppercase italic text-2xl bg-orange-600 text-black hover:bg-white shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {calculateTonnage(dayKey) > 0 ? "Day Completed" : "Initialize Session"}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-orange-600/30 pb-4">
                    <h2 className="text-3xl italic uppercase">Active_Session</h2>
                    <div className="flex gap-2">
                      <button onClick={() => startTimer(90)} className="text-[10px] font-mono border border-white/20 px-3 py-1 hover:bg-white hover:text-black transition-all">REST_90S</button>
                      <button onClick={() => startTimer(180)} className="text-[10px] font-mono border border-white/20 px-3 py-1 hover:bg-white hover:text-black transition-all">REST_180S</button>
                    </div>
                  </div>
                  {currentDayWithIds?.main_lifts.map((lift, i) => (
                    <div key={lift.stableId || i} className="border border-white/10 bg-black/60 p-6 flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <h4 className="text-xl font-black uppercase text-orange-500 italic">{lift.lift}</h4>
                        <p className="text-[10px] font-mono text-zinc-500">
                          TARGET: {lift.sets}×{lift.reps} @ {lift.intensity_pct ? `${Math.round(lift.intensity_pct * 100)}%` : `RPE ${lift.target_rpe || '?'}`}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-1">
                        <div className="relative w-full">
                          <span className="absolute top-1 left-2 text-[8px] text-zinc-500 font-mono uppercase">Weight (KG)</span>
                          <input 
                            value={log[`${dayKey}_${lift.stableId}`]?.weight || ''} 
                            onChange={(e) => setLog({...log, [`${dayKey}_${lift.stableId}`]: {...log[`${dayKey}_${lift.stableId}`], weight: e.target.value}})} 
                            className="w-full bg-black/40 border border-white/10 p-4 pt-6 text-xl focus:border-orange-600 outline-none font-mono" 
                          />
                        </div>
                        <div className="relative w-full">
                          <span className="absolute top-1 left-2 text-[8px] text-zinc-500 font-mono uppercase">Reps</span>
                          <input 
                            value={log[`${dayKey}_${lift.stableId}`]?.reps || ''} 
                            onChange={(e) => setLog({...log, [`${dayKey}_${lift.stableId}`]: {...log[`${dayKey}_${lift.stableId}`], reps: e.target.value}})} 
                            className="w-full bg-black/40 border border-white/10 p-4 pt-6 text-xl focus:border-orange-600 outline-none font-mono" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={saveSession} className="w-full bg-white text-black py-6 mt-10 font-black uppercase italic text-xl hover:bg-orange-600 transition-colors">
                    Commit to Data Stream
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )}


            {/* --- STRATEGY --- */}
            {tab === "week" && (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-4xl font-black italic uppercase text-orange-600 mb-10">Tactical_Plan</h2>
                <div className="flex bg-zinc-900/50 p-1 mb-8 overflow-x-auto">
                  {program.weeks.map((_, i) => (
                    <button key={i} onClick={() => {setViewWeek(i); setViewDay(0);}} className={`px-4 py-2 text-[10px] font-mono ${viewWeek === i ? 'bg-orange-600 text-black' : 'text-zinc-500'}`}>W0{i + 1}</button>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div className="flex flex-col gap-2">
                    {program.weeks[viewWeek].days.map((d, i) => (
                      <button key={i} onClick={() => setViewDay(i)} className={`p-4 text-left border-l-4 ${viewDay === i ? 'bg-white text-black border-orange-600' : 'bg-zinc-900/30 border-white/10'}`}>
                        <div className="italic uppercase font-bold text-xs">Protocol_{d.day}</div>
                      </button>
                    ))}
                  </div>
                  <div className="lg:col-span-3 bg-black/40 border border-white/10 p-8">
                      <h3 className="text-2xl font-black italic uppercase text-orange-500 mb-8">{program.weeks[viewWeek].days[viewDay].day_name || `Stream_Day_${viewDay+1}`}</h3>
                      <div className="space-y-2">
                       {program.weeks[viewWeek].days[viewDay].main_lifts.map((l, i) => (
  <div key={i} className="flex justify-between items-center bg-white/5 p-4 border-l border-white/20 uppercase font-bold">
    
    <span>{l.lift}</span>

    <span className="font-mono text-xs text-orange-400 text-right">
      
      {/* Normal Training Days */}
      {l.sets && l.reps && (
        <>
          {l.sets}×{l.reps}
          {l.load ? ` @ ${l.load}KG` : ""}
        </>
      )}

      {/* Competition Day */}
      {l.attempt_plan && (
        <>
          OP: {l.attempt_plan.opener}KG  
          • 2nd: {l.attempt_plan.second}KG  
          • 3rd: {l.attempt_plan.third}KG
        </>
      )}

    </span>

  </div>
))}

                      </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- ARCHIVE --- */}
            {tab === "history" && (
              <div className="animate-in fade-in duration-500 flex flex-col h-full max-h-[70vh]">
                <h2 className="text-4xl font-black italic uppercase text-orange-600 mb-8 flex-shrink-0">Secure_Archive</h2>
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {program.weeks.map((w, wi) => w.days.map((d, di) => {
                      const dId = `W${wi+1}D${di+1}`;
                      const isLogged = Object.keys(log).some(k => k.startsWith(dId));
                      return (
                        <div key={dId} className={`border border-white/10 bg-zinc-900/20 transition-all duration-300 ${isLogged ? 'opacity-100' : 'opacity-30'}`}>
                          <div onClick={() => isLogged && setExpandedArchive(expandedArchive === dId ? null : dId)} 
                            className={`p-4 flex justify-between items-center ${isLogged ? 'cursor-pointer hover:bg-white/5' : 'cursor-not-allowed'}`}>
                            <div>
                              <span className="text-[8px] font-mono text-zinc-500">{dId}</span>
                              <h4 className="text-lg italic uppercase font-black tracking-tighter">{d.day_name || `Day ${d.day}`}</h4>
                            </div>
                            <div className="text-right">
                              {isLogged ? (
                                <span className="text-orange-500 font-black italic">{calculateTonnage(dId).toLocaleString()} KG</span>
                              ) : (
                                <span className="text-[10px] font-mono text-zinc-700 uppercase italic">No_Data</span>
                              )}
                            </div>
                          </div>
                          {expandedArchive === dId && (
                            <div className="p-6 bg-black/60 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                              {d.main_lifts.map((l, li) => {
                                // Use stable ID based on position to avoid collisions
                                const stableId = l.id || `${wi}_${di}_main_${li}`;
                                const entry = log[`${dId}_${stableId}`];
                                return entry && (
                                  <div key={stableId} className="bg-white/5 p-4 border-l-2 border-orange-600">
                                    <span className="block text-[9px] text-zinc-500 uppercase font-mono">{l.lift}</span>
                                    <div className="italic font-black text-xl text-white">{entry.weight} KG × {entry.reps}</div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                  }))}
                </div>
                <style>{`
                  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                  .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
                  .custom-scrollbar::-webkit-scrollbar-thumb { background: #ea580c; border-radius: 10px; }
                `}</style>
              </div>
            )}

            {/* --- EVOLUTION --- */}
            {tab === "progress" && (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-4xl font-black italic uppercase text-orange-600 mb-8">Evolution_Matrix</h2>
                <EvolutionMatrix logs={log} program={program} />
              </div>
            )}

           {/* --- IDENTITY --- */}
{tab === "profile" && (
  <div className="animate-in fade-in duration-500">
    <h2 className="text-4xl font-black italic uppercase text-orange-600 mb-8">Identity_Profile</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Core Biometrics Panel */}
      <div className="bg-black/40 border border-white/10 p-6">
        <h4 className="font-mono text-[10px] tracking-widest text-orange-500 mb-4 uppercase">Core_Biometrics</h4>
        <div className="space-y-4 font-mono text-sm uppercase">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span>Email</span>
            <span className="text-orange-400">{profile?.email || user?.email}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span>Age</span>
            <span className="text-orange-400">{profile?.age || "—"}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span>Bodyweight</span>
            <span className="text-orange-400">{profile?.bodyweight} KG</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span>Experience</span>
            <span className="text-orange-400">{profile?.experience_level}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span>Schedule</span>
            <span className="text-orange-400">{profile?.days_available} DAYS/WK</span>
          </div>
          {/* Training Mode Display */}
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span>Mode</span>
            <span className="text-orange-400">
              {profile?.training_mode === "coach" ? "Coach_Linked" : "Self_Autonomous"}
            </span>
          </div>
        </div>
      </div>

      {/* Calibration Maxes Panel */}
      <div className="bg-black/40 border border-white/10 p-6">
        <h4 className="font-mono text-[10px] tracking-widest text-orange-500 mb-4 uppercase">Calibration_Maxes</h4>
        <div className="space-y-4">
          {['squat', 'bench', 'deadlift'].map(lift => (
            <div key={lift} className="bg-white/5 p-4 flex justify-between items-center border-l-2 border-orange-600">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">{lift}</span>
              <span className="text-2xl italic font-black text-white">
                {profile?.training_max?.[lift] || profile?.[lift] || 0} KG
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* 🔗 COACH REQUEST INTERFACE */}
    <div className="mt-8 pt-8 border-t border-white/5">
      {profile?.training_mode === "self" || !profile?.training_mode ? (
        <div className="flex flex-col items-start gap-4">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
            Neural link not established. Upgrade to coached protocol?
          </p>
          <button
            onClick={async () => {
              try {
                // Using profile.uid or user.uid depending on your variable setup
                const athleteId = profile?.uid || user?.uid; 
                const res = await fetch(`http://localhost:5000/api/coach/request-coach/${athleteId}`, {
                  method: "POST"
                });
                
                if (res.ok) {
                  alert("COACH_REQUEST_TRANSMITTED: Awaiting synchronization.");
                  window.location.reload(); // Refresh to update status
                }
              } catch (err) {
                console.error("LINK_FAILURE:", err);
              }
            }}
            className="bg-orange-600 px-8 py-4 font-black uppercase italic hover:bg-white hover:text-black transition-all shadow-[4px_4px_0_0_rgba(255,255,255,0.1)] active:translate-y-1"
          >
            Establish_Coach_Link
          </button>
        </div>
      ) : (
        <div className="bg-orange-600/10 border border-orange-600/20 p-4 inline-block">
           <span className="font-mono text-xs text-orange-500 uppercase animate-pulse">
             System Status: Linked to Head Coach [ADMIN]
           </span>
        </div>
      )}
    </div>
  </div>
)}
 </main>

        </div>

      </div>

    </div>

  );

}