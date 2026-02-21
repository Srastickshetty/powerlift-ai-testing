import { memo } from "react";

export default memo(function RecentSessionsTable({ sessions }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="mt-6 p-8 border border-dashed border-white/5 bg-white/[0.01] rounded-lg text-center">
        <p className="text-zinc-600 font-mono text-xs uppercase tracking-[0.2em]">
          NO_LOGS_FOUND_FOR_UNIT
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto border border-white/5 rounded-lg bg-black/20 backdrop-blur-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5">
          <tr>
            <th className="px-6 py-4">Session_ID</th>
            <th className="px-6 py-4 text-center">Cycle</th>
            <th className="px-6 py-4">Logged_Performance</th>
            <th className="px-6 py-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sessions.map((s, i) => (
            <tr key={i} className="hover:bg-white/[0.02] group transition-all">
              {/* SESSION ID / DATE */}
              <td className="px-6 py-4">
                <p className="text-sm font-bold text-white uppercase tracking-tighter">
                  {s.day_id}
                </p>
                <p className="text-[10px] text-zinc-600 font-mono uppercase">
                  {s.date || "SYNC_PENDING"}
                </p>
              </td>

              {/* CYCLE (WEEK/DAY) */}
              <td className="px-6 py-4 text-center">
                <span className="text-xs font-mono text-orange-500 bg-orange-500/5 px-2 py-1 rounded border border-orange-500/10">
                  W{s.week} D{s.day}
                </span>
              </td>

              {/* LOGGED LIFTS */}
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  {s.lifts && typeof s.lifts === "object" ? (
                    Object.entries(s.lifts).map(([liftName, data], idx) => (
                      <div 
                        key={idx} 
                        className="bg-zinc-900/80 border border-white/5 px-3 py-1.5 rounded flex items-center gap-2 group-hover:border-orange-500/30 transition-colors"
                      >
                        <span className="text-[10px] font-bold text-zinc-200 uppercase italic">
                          {liftName}
                        </span>
                        <span className="h-3 w-[1px] bg-white/10" />
                        <span className="text-[10px] font-mono text-orange-500">
                          {data.weight}kg × {data.reps} 
                          {data.rpe && <span className="text-zinc-500 ml-1">@RPE{data.rpe}</span>}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-zinc-700 font-mono text-[10px]">DATA_CORRUPT</span>
                  )}
                </div>
              </td>

              {/* STATUS */}
              <td className="px-6 py-4 text-right">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black uppercase text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                    Verified_Log
                  </span>
                  <span className="text-[8px] text-zinc-600 font-mono mt-1 uppercase">
                    Committed_Live
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});