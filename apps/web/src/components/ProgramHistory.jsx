import { useEffect, useState, useCallback, memo } from "react";
import api from "../api/api";

export default memo(function ProgramHistory({ athleteId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api
      .get(`/coach/athlete/${athleteId}/program-history`)
      .then((res) => {
        const sorted = (res.data || []).sort((a, b) => {
          const aTime = a.created_at?._seconds || 0;
          const bTime = b.created_at?._seconds || 0;
          return bTime - aTime;
        });
        setHistory(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [athleteId]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading)
    return (
      <p className="text-gray-400 p-4 text-sm italic animate-pulse">
        Loading history...
      </p>
    );

  if (history.length === 0)
    return (
      <p className="text-gray-400 p-4 text-sm italic text-center">
        No program history available.
      </p>
    );

  return (
    <div className="flow-root mt-4 px-2">
      <ul role="list" className="-mb-8">
        {history.map((program, idx) => {
          const isExpanded = expandedId === program.id;

          return (
            <li key={program.id}>
              <div className="relative pb-8">
                {idx !== history.length - 1 && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}

                <div
                  className={`relative flex space-x-3 cursor-pointer transition-all duration-200 rounded-xl p-3 ${
                    isExpanded
                      ? "bg-gray-50 ring-1 ring-gray-200 shadow-sm"
                      : "hover:bg-gray-50/50"
                  }`}
                  onClick={() => toggleExpand(program.id)}
                >
                  {/* Status Bubble */}
                  <div className="flex-shrink-0">
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                        program.status === "active"
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      <span className="text-[9px] font-bold uppercase">
                        {program.status === "active" ? "Live" : "Arch"}
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-col flex-1 pt-1">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-bold text-gray-900">
                        {program.name || "Unnamed Program"}
                      </p>

                      <span className="text-[10px] text-gray-400">
                        {program.created_at?._seconds
                          ? new Date(
                              program.created_at._seconds * 1000
                            ).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>

                    {/* Expanded View */}
                    {isExpanded && (
                      <div className="mt-4 text-xs text-gray-600 space-y-2 border-t pt-3">
                        <div>
                          <span className="font-semibold">Program ID:</span>{" "}
                          {program.id}
                        </div>

                        <div>
                          <span className="font-semibold">Status:</span>{" "}
                          {program.status}
                        </div>

                        <div>
                          <span className="font-semibold">Type:</span>{" "}
                          {program.metadata?.type || "base_program"}
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
});
