import { useEffect, useState } from "react";
import api from "../api/api";

export default function DraftReviewPanel({ athleteId }) {
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDraft();
  }, [athleteId]);

  const fetchDraft = async () => {
    try {
      const res = await api.get(
        `/coach/athlete/${athleteId}/program-draft`
      );
      setDraft(res.data || null);
    } catch (err) {
      console.error("Failed to load draft", err);
      setDraft(null);
    } finally {
      setLoading(false);
    }
  };

  const approveDraft = async () => {
    if (!window.confirm("Approve this program draft?")) return;
    try {
      await api.post(
        `/coach/athlete/${athleteId}/approve-draft`
      );
      alert("✅ Draft approved and activated");
      setDraft(null);
    } catch {
      alert("❌ Failed to approve draft");
    }
  };

  const rejectDraft = async () => {
    if (!window.confirm("Reject and discard this draft?")) return;
    try {
      await api.post(
        `/coach/athlete/${athleteId}/reject-draft`
      );
      alert("Draft rejected");
      setDraft(null);
    } catch {
      alert("❌ Failed to reject draft");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-500 text-center">
        Loading program draft…
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="mt-6 border border-dashed rounded-lg p-8 text-center bg-white">
        <p className="text-gray-400 italic">
          No program draft available.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 border rounded-lg bg-gray-50 shadow-sm">
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b bg-white">
        <div>
          <h3 className="text-xl font-bold">
            📄 Program Draft
          </h3>
          <p className="text-sm text-gray-500">
            Version {draft.version}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={rejectDraft}
            className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded hover:bg-red-50"
          >
            Reject
          </button>
          <button
            onClick={approveDraft}
            className="px-4 py-2 text-sm font-semibold text-white bg-black rounded hover:bg-gray-800"
          >
            Approve & Activate
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="p-4 space-y-6">
        {draft.weeks.map((week) => (
          <div key={week.week} className="bg-white rounded-lg border">
            <div className="px-4 py-2 border-b bg-gray-100 font-semibold">
              Week {week.week}
            </div>

            <div className="p-4 space-y-4">
              {week.days.map((day) => (
                <div key={day.day} className="border rounded-md">
                  <div className="px-3 py-2 bg-gray-50 border-b font-medium">
                    Day {day.day}
                  </div>

                  <div className="p-3 space-y-2 text-sm">
                    {day.main_lifts.map((lift, i) => (
                      <div
                        key={i}
                        className="flex justify-between font-medium"
                      >
                        <span>{lift.lift}</span>
                        <span>
                          {lift.sets}×{lift.reps}
                          {lift.target_rpe
                            ? ` @ RPE ${lift.target_rpe}`
                            : lift.intensity_pct
                            ? ` @ ${Math.round(
                                lift.intensity_pct * 100
                              )}%`
                            : ""}
                        </span>
                      </div>
                    ))}

                    {day.accessories && (
                      <div className="pt-2 text-gray-500">
                        Accessories:
                        <ul className="list-disc ml-5">
                          {day.accessories.map((a, idx) => (
                            <li key={idx}>
                              {a.exercise} — {a.sets}×{a.reps}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
