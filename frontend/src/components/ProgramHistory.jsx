import { useEffect, useState } from "react";
import api from "../api/api";

export default function ProgramHistory({ athleteId, activeVersion }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedVersion, setExpandedVersion] = useState(null);

  useEffect(() => {
    api
      .get(`/coach/athlete/${athleteId}/program-history`)
      .then((res) => {
        // Sort history by version descending so newest is at the top
        const sorted = (res.data || []).sort((a, b) => b.version - a.version);
        setHistory(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [athleteId]);

  const toggleExpand = (version) => {
    setExpandedVersion(expandedVersion === version ? null : version);
  };

  if (loading) return <p className="text-gray-400 p-4 text-sm italic animate-pulse">Loading history...</p>;
  if (history.length === 0) return <p className="text-gray-400 p-4 text-sm italic text-center">No history available.</p>;

  return (
    <div className="flow-root mt-4 px-2">
      <ul role="list" className="-mb-8">
        {history.map((v, idx) => {
          const isActive = v.version === activeVersion;
          const isExpanded = expandedVersion === v.version;

          return (
            <li key={v.version}>
              <div className="relative pb-8">
                {/* Connector Line */}
                {idx !== history.length - 1 ? (
                  <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                ) : null}

                <div 
                  className={`relative flex space-x-3 cursor-pointer group transition-all duration-200 rounded-xl p-2 ${
                    isExpanded ? 'bg-gray-50 ring-1 ring-gray-200 shadow-sm' : 'hover:bg-gray-50/50'
                  }`} 
                  onClick={() => toggleExpand(v.version)}
                >
                  {/* Version Indicator Bubble */}
                  <div className="flex-shrink-0">
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white transition-all ${
                      isActive ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                    }`}>
                      <span className="text-[10px] font-bold">v{v.version}</span>
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-col pt-1.5 flex-1">
                    {/* Header Row */}
                    <div className="flex justify-between items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">
                        {v.weeks} Week Block
                        {isActive && (
                          <span className="ml-2 inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 uppercase tracking-tighter">
                            Active
                          </span>
                        )}
                      </p>
                      <span className="whitespace-nowrap text-[10px] font-medium text-gray-400 uppercase">
                        {new Date(v.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Quick Preview (Visible when collapsed) */}
                    {!isExpanded && (
                      <p className="mt-1 text-xs text-gray-500 italic truncate max-w-[200px]">
                        "{v.reason}"
                      </p>
                    )}

                    {/* Detailed Content (Visible when expanded) */}
                    {isExpanded && (
                      <div className="mt-4 text-[11px] text-gray-600 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        
                        {/* 1. Reason Box */}
                        <div className="p-3 bg-white border border-gray-100 rounded-lg shadow-inner">
                           <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Coach Note / Reason</p>
                           <p className="text-gray-800 italic leading-relaxed text-xs">"{v.reason}"</p>
                        </div>

                        {/* 2. Program Metadata Grid */}
                        <div className="grid grid-cols-2 gap-3 px-1">
                          <div className="space-y-1">
                             <p className="text-gray-400 font-bold uppercase text-[9px]">Approved By</p>
                             <p className="text-gray-900 font-medium">{v.approved_by || 'System Auto'}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-gray-400 font-bold uppercase text-[9px]">Timestamp</p>
                             <p className="text-gray-900 font-medium">{new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-gray-400 font-bold uppercase text-[9px]">Block Length</p>
                             <p className="text-gray-900 font-medium">{v.weeks} Weeks Total</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-gray-400 font-bold uppercase text-[9px]">Status at Time</p>
                             <p className="text-gray-900 font-medium capitalize">Archived Program</p>
                          </div>
                        </div>

                        {/* 3. Footer Action/Collapse Info */}
                        <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-[10px]">
                           <span className="text-indigo-600 font-bold cursor-pointer hover:underline">
                             Click to collapse
                           </span>
                           <span className="text-gray-300 font-mono">ID: {athleteId}_v{v.version}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}