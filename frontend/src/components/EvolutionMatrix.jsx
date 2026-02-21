import React, { useMemo, useState, useEffect } from "react";
import {
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ComposedChart, Area, Line
} from "recharts";

// --- MATH UTILS ---
const getProjectedMax = (w, r, rpe = 8) => {
  if (!w || !r) return 0;
  const intensity = (10.5 - rpe + (r - 1)) * 0.03;
  return Math.round(w / (1 - intensity));
};

// --- LIFT IDENTIFICATION ---
const identifyLift = (name = "") => {
  if (typeof name !== 'string') return "other";
  const n = name.toLowerCase();
  if (n.includes("squat") || n.includes("sq") || n.endsWith("_0") || n.includes("bs")) return "squat";
  if (n.includes("bench") || n.includes("bp") || n.endsWith("_1") || n.includes("press")) {
    if (n.includes("overhead") || n.includes("ohp")) return "other";
    return "bench";
  }
  if (n.includes("deadlift") || n.includes("dl") || n.endsWith("_2") || n.includes("sumo") || n.includes("pull")) return "deadlift";
  return "other";
};

export default function EvolutionMatrix({ logs = {} }) {
  const [focusLift, setFocusLift] = useState("all");

  useEffect(() => {
    console.log("📊 ANALYTICS DATA SOURCE:", logs);
  }, [logs]);

  const analytics = useMemo(() => {
    const weekMap = {};
    
    // RECURSIVE SEARCH: Grabs every set from the program structure
    const findSets = (obj, currentLiftType = "other") => {
      let sets = [];
      if (!obj || typeof obj !== 'object') return sets;

      if (Array.isArray(obj)) {
        obj.forEach(item => {
          sets = [...sets, ...findSets(item, currentLiftType)];
        });
        return sets;
      }

      const w = obj.weight ?? obj.load ?? obj.Weight ?? obj.Load ?? obj.w;
      const r = obj.reps ?? obj.Reps ?? obj.r;
      const rpe = obj.rpe ?? obj.RPE ?? 8;
      
      if (w !== undefined && r !== undefined && !isNaN(parseFloat(w))) {
        const liftName = obj.name || obj.exercise || obj.lift || currentLiftType;
        const type = identifyLift(liftName);
        
        sets.push({ 
          weight: parseFloat(w), 
          reps: parseInt(r), 
          rpe: parseFloat(rpe), 
          type: type !== "other" ? type : currentLiftType 
        });
      } else {
        Object.entries(obj).forEach(([key, value]) => {
          const potentialType = identifyLift(key);
          const inferredType = potentialType !== "other" ? potentialType : currentLiftType;
          sets = [...sets, ...findSets(value, inferredType)];
        });
      }
      return sets;
    };

    // --- UPDATED PROCESS ALL LOGS ---
    const logsArray = Array.isArray(logs) ? logs : Object.values(logs);

    logsArray.forEach((logEntry, index) => {
      // 1. Precise Week Extraction
      // Prioritize explicit property, then regex on date/key, finally index fallback
      const wNum = logEntry.week || 
                   (typeof logEntry.date === 'string' && logEntry.date.match(/W(\d+)/i)?.[1]) || 
                   Math.ceil((index + 1) / 3);

      const weekId = `Week ${wNum}`;

      if (!weekMap[weekId]) {
        weekMap[weekId] = {
          week: weekId, wNum: parseInt(wNum),
          squat: { e1rm: 0, p1rm: 0, vol: 0 },
          bench: { e1rm: 0, p1rm: 0, vol: 0 },
          deadlift: { e1rm: 0, p1rm: 0, vol: 0 },
          totalVol: 0
        };
      }

      // 2. Identify and aggregate all sets
      const sets = findSets(logEntry);

      sets.forEach(set => {
        if (weekMap[weekId][set.type]) {
          // Unified formula for tracking performance
          const currentE1RM = getProjectedMax(set.weight, set.reps, set.rpe || 8);
          
          // Max performance for the week (The "Peak")
          weekMap[weekId][set.type].e1rm = Math.max(weekMap[weekId][set.type].e1rm, currentE1RM);
          weekMap[weekId][set.type].p1rm = Math.max(weekMap[weekId][set.type].p1rm, currentE1RM);
          
          // Accumulate volume
          const setVol = set.weight * set.reps;
          weekMap[weekId][set.type].vol += setVol;
          weekMap[weekId].totalVol += setVol;
        }
      });
    });

    return Object.values(weekMap).sort((a, b) => a.wNum - b.wNum);
  }, [logs]);

  if (!analytics.length || analytics.every(w => w.totalVol === 0)) {
    return (
      <div className="p-20 text-center bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">
          No program data detected.
        </p>
      </div>
    );
  }

  const current = analytics[analytics.length - 1];
  const totalSBD = current.squat.e1rm + current.bench.e1rm + current.deadlift.e1rm;

  return (
    <div className="space-y-6 text-zinc-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Current SBD Total" value={totalSBD} unit="kg" />
        <MetricCard 
          title="Neural Readiness" 
          value={current.squat.p1rm + current.bench.p1rm + current.deadlift.p1rm} 
          unit="kg" 
          color="text-orange-500" 
        />
        <MetricCard 
          title="Block Volume" 
          value={(analytics.reduce((s, w) => s + w.totalVol, 0) / 1000).toFixed(1)} 
          unit="Tons" 
          color="text-purple-400" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/40 border border-white/5 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-mono uppercase text-zinc-500 tracking-widest">Performance Evolution</h3>
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
               {['all', 'squat', 'bench', 'deadlift'].map(l => (
                 <button 
                   key={l} 
                   onClick={() => setFocusLift(l)} 
                   className={`px-4 py-1.5 text-[9px] font-mono rounded-lg transition-all ${focusLift === l ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                 >
                   {l.toUpperCase()}
                 </button>
               ))}
            </div>
          </div>
          
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="week" stroke="#444" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#444" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                
                {(focusLift === 'all' || focusLift === 'squat') && (
                  <Line type="monotone" dataKey="squat.e1rm" name="SQ" stroke="#f97316" strokeWidth={3} dot={{r: 4, fill: '#f97316'}} />
                )}
                {(focusLift === 'all' || focusLift === 'bench') && (
                  <Line type="monotone" dataKey="bench.e1rm" name="BP" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} />
                )}
                {(focusLift === 'all' || focusLift === 'deadlift') && (
                  <Line type="monotone" dataKey="deadlift.e1rm" name="DL" stroke="#ef4444" strokeWidth={3} dot={{r: 4, fill: '#ef4444'}} />
                )}
                
                <Area type="monotone" dataKey="totalVol" fill="#8b5cf6" fillOpacity={0.03} stroke="none" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl">
            <h3 className="text-xs font-mono uppercase text-zinc-500 mb-6 tracking-widest">Strength Reserve</h3>
            <div className="space-y-5">
              {['squat', 'bench', 'deadlift'].map(lift => (
                <div key={lift}>
                  <div className="flex justify-between text-[10px] font-mono mb-2">
                    <span className="uppercase text-zinc-400">{lift}</span>
                    <span className="text-emerald-500">Peak: {current[lift].e1rm}kg</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${lift === 'squat' ? 'bg-orange-500' : lift === 'bench' ? 'bg-blue-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, (current[lift].e1rm / (current[lift].p1rm || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6 bg-orange-500/5 border border-orange-500/10 rounded-3xl">
             <p className="text-[10px] font-mono text-orange-500 mb-2 uppercase tracking-tighter">Block Analysis</p>
             <p className="text-xs text-zinc-400 leading-relaxed italic">
               The program shows a total realized increase of <span className="text-white font-bold">
               {Math.max(0, totalSBD - (analytics[0].squat.e1rm + analytics[0].bench.e1rm + analytics[0].deadlift.e1rm))}kg
               </span> since Week 1.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const MetricCard = ({ title, value, unit, color = "text-white" }) => (
  <div className="bg-zinc-900/60 border border-white/5 p-6 rounded-3xl shadow-xl">
    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{title}</p>
    <p className={`text-4xl font-black ${color} mt-2 tabular-nums`}>
      {value} <span className="text-xs font-normal text-zinc-600 italic uppercase">{unit}</span>
    </p>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] font-mono text-zinc-500 mb-3 uppercase tracking-widest border-b border-white/5 pb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((p, i) => (
            <div key={i} className="flex items-center justify-between gap-8">
              <span className="text-[11px] text-zinc-400 flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}
              </span>
              <span className="text-xs font-bold font-mono text-white">{p.value}kg</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};