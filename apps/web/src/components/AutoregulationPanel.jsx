import { useEffect, useState, useCallback, memo } from "react";
import api from "../api/api";

export default memo(function AutoregulationPanel({ athleteId }) {
  const [proposal, setProposal] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autosaveTimeout, setAutosaveTimeout] = useState(null);

  // Fetch proposal on load or when athleteId changes
  useEffect(() => {
    fetchProposal();
  }, [athleteId]);

  // 🛠️ OPTIMIZED AUTOSAVE LOGIC: Debounced with ref tracking
  useEffect(() => {
    if (!draft) return;

    // Clear previous timeout
    if (autosaveTimeout) clearTimeout(autosaveTimeout);

    // Set new timeout
    const timeout = setTimeout(() => {
      api.post(`/coach/athlete/${athleteId}/save-draft`, {
        proposedWeek: draft.proposedWeek,
      });
      console.log("Autosaved draft...");
    }, 2000); 

    setAutosaveTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [draft, athleteId]);

  const fetchProposal = useCallback(() => {
    setLoading(true);
    api
      .get(`/coach/athlete/${athleteId}/proposal`)
      .then((res) => {
        if (res.data) {
          setProposal(res.data);
          setDraft({ ...res.data }); // Shallow copy instead of deep clone
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [athleteId]);

  // Optimized change handler - only update the specific field
  const handleChange = useCallback((dayIndex, liftIndex, field, value) => {
    setDraft(prev => ({
      ...prev,
      proposedWeek: {
        ...prev.proposedWeek,
        days: prev.proposedWeek.days.map((day, dIdx) => 
          dIdx === dayIndex ? {
            ...day,
            main_lifts: day.main_lifts.map((lift, lIdx) =>
              lIdx === liftIndex ? { ...lift, [field]: Number(value) } : lift
            )
          } : day
        )
      }
    }));
  }, []);

  const handleSaveDraft = useCallback(async () => {
    try {
      await api.post(`/coach/athlete/${athleteId}/save-draft`, {
        proposedWeek: draft.proposedWeek
      });
      alert("💾 Draft saved successfully");
    } catch {
      alert("❌ Failed to save draft");
    }
  }, [athleteId, draft]);

  const handleApprove = useCallback(async () => {
    try {
      await api.post(`/coach/athlete/${athleteId}/approve-proposal`, {
        proposedWeek: draft.proposedWeek,
        reason: "Coach modified autoregulation"
      });
      alert("✅ Program updated successfully!");
      setProposal(null);
      setDraft(null);
    } catch (err) {
      alert("❌ Failed to approve proposal");
    }
  }, [athleteId, draft]);

  const handleReject = useCallback(async () => {
    if (!window.confirm("Are you sure you want to discard this proposal?")) return;
    try {
      await api.post(`/coach/athlete/${athleteId}/reject-proposal`);
      alert("Proposal discarded");
      setProposal(null);
      setDraft(null);
    } catch (err) {
      alert("❌ Failed to reject proposal");
    }
  }, [athleteId]);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading AI proposal...</div>;
  
  if (!proposal) return (
    <div className="mt-6 border border-dashed rounded-lg p-10 text-center bg-white">
      <p className="text-gray-400 italic">No pending autoregulation proposal found for this athlete.</p>
    </div>
  );

  return (
    <div className="mt-6 border rounded-lg p-6 bg-gray-50 shadow-sm">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🧠 Autoregulation Proposal 
          </h3>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            Editable Draft
          </span>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleReject}
            className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
          >
            Discard
          </button>
          {/* New Save Draft Button */}
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 text-sm font-semibold text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
          >
            Save Draft
          </button>
          <button 
            onClick={handleApprove}
            className="px-4 py-2 text-sm font-semibold text-white bg-black rounded-md hover:bg-gray-800 transition-colors shadow-lg"
          >
            Approve & Apply
          </button>
        </div>
      </div>

      {/* Week View */}
      {draft.proposedWeek.days.map((day, dIdx) => (
        <div key={dIdx} className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b">
            <h4 className="font-bold text-gray-700">Day {day.day}</h4>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left border-b">
                <th className="p-3 font-medium">Exercise</th>
                <th className="p-3 font-medium text-center">Sets</th>
                <th className="p-3 font-medium text-center">Reps</th>
                <th className="p-3 font-medium text-center">Load (kg)</th>
              </tr>
            </thead>

            <tbody>
              {day.main_lifts.map((lift, lIdx) => (
                <tr key={lIdx} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-bold text-gray-900">{lift.lift}</td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      value={lift.sets}
                      onChange={(e) => handleChange(dIdx, lIdx, "sets", e.target.value)}
                      className="w-14 border rounded px-1 py-1 text-center focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      value={lift.reps}
                      onChange={(e) => handleChange(dIdx, lIdx, "reps", e.target.value)}
                      className="w-14 border rounded px-1 py-1 text-center focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      value={lift.load}
                      onChange={(e) => handleChange(dIdx, lIdx, "load", e.target.value)}
                      className="w-20 border rounded px-1 py-1 text-center font-mono font-bold text-blue-700 focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Advanced AI Rationale Table */}
      <details className="mt-8 rounded-xl border bg-white shadow-sm">
        <summary className="cursor-pointer px-5 py-4 font-semibold text-gray-700 hover:bg-gray-50 rounded-xl">
          🧠 Advanced: AI Rationale & Adjustments
        </summary>
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-3">Lift</th>
                <th className="px-3">Change</th>
                <th className="px-3">Before</th>
                <th className="px-3">After</th>
                <th className="px-3">Δ</th>
                <th className="px-3">AI Reason</th>
                <th className="px-3">Signals</th>
              </tr>
            </thead>
            <tbody>
              {proposal.adjustments.map((adj, i) => {
                const positive = adj.delta > 0;
                return (
                  <tr key={i} className="bg-gray-50 hover:bg-gray-100 transition rounded-lg">
                    <td className="px-3 py-3 font-semibold text-gray-800">{adj.lift}</td>
                    <td className="px-3 py-3 capitalize text-gray-600">{adj.type}</td>
                    <td className="px-3 py-3 text-gray-500">{adj.from}</td>
                    <td className="px-3 py-3 font-medium text-gray-800">{adj.to}</td>
                    <td className={`px-3 py-3 font-bold ${positive ? "text-green-600" : "text-red-600"}`}>
                      {positive ? "▲ +" : "▼ "}{Math.abs(adj.delta)}
                    </td>
                    <td className="px-3 py-3 text-gray-700 max-w-xs">{adj.reason}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">RPE {adj.signals.avgRPE}</span>
                        <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs">Miss {adj.signals.missRate}</span>
                        <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs">Fatigue {adj.signals.fatigueRate}</span>
                        <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-700 text-xs">{adj.signals.phase}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );}
);