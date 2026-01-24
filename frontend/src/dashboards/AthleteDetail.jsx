import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import ProgressCharts from "../components/ProgressCharts";
import AutoregulationPanel from "../components/AutoregulationPanel";
import ProgramHistoryList from "../components/ProgramHistory";

export default function AthleteDetail() {
  const { athleteId } = useParams();

  const [program, setProgram] = useState(null);
  const [progress, setProgress] = useState(null);

  // ✅ Fetch Data
  const fetchData = () => {
    api.get(`/coach/athlete/${athleteId}/program`)
      .then((res) => setProgram(res.data))
      .catch(() => setProgram(null));

    api.get(`/progress/${athleteId}`)
      .then((res) => setProgress(res.data))
      .catch(() => setProgress(null));
  };

  useEffect(() => {
    fetchData();
  }, [athleteId]);

  // ✅ Handle Deload Logic
  const handleDeload = async () => {
    if (!window.confirm("Are you sure you want to force an immediate deload week?")) return;
    
    try {
await api.post(`/coach/athlete/${athleteId}/deload`);
      alert("Deload applied successfully!");
      fetchData(); // Refresh data to show new version/program state
    } catch (err) {
      alert("Failed to apply deload. Check console for details.");
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Athlete Profile</h1>
          <p className="text-gray-500 mt-1">
            Managing records for ID:{" "}
            <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {athleteId}
            </span>
          </p>
        </div>
        
        {progress && (
          <div className="mb-1">
            <span className="px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-bold text-gray-700 uppercase tracking-wide">
              Status: <span className="text-indigo-600">{progress.status}</span>
            </span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Progress Charts */}
          {progress ? (
            <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm ring-1 ring-gray-900/5">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">📈</span>
                Program Performance
              </h2>
              <ProgressCharts
                e1RMTrend={[
                  ...progress.squat.map((s, i) => ({
                    week: i + 1,
                    squat: s.e1rm,
                    bench: progress.bench[i]?.e1rm,
                    deadlift: progress.deadlift[i]?.e1rm,
                  })),
                ]}
                fatigueTrend={progress.fatigue.map((f, i) => ({
                  week: i + 1,
                  fatigue: f.fatigue,
                }))}
              />
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-2xl">
              <p className="text-gray-400 italic text-sm text-center">No progress data found.</p>
            </div>
          )}

          {/* Autoregulation Hub */}
          <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm ring-1 ring-gray-900/5">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-2xl font-bold text-gray-900">Autoregulation Hub</h2>
              <p className="text-sm text-gray-500">Generate and review AI-driven adjustments.</p>
            </div>
            <div className="p-6">
              <AutoregulationPanel athleteId={athleteId} />
              
              {/* ✅ ADDED: DELOAD BUTTON */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight mb-2">Manual Interventions</h4>
                <button
                  onClick={handleDeload}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  <span className="mr-2">📉</span>
                  Apply Immediate Deload
                </button>
                <p className="mt-2 text-xs text-gray-400 italic">
                  This will override the current block and schedule a recovery week.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column / Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="sticky top-6">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                <span className="text-xl">📜</span>
                Program History
              </h3>
              <ProgramHistoryList
                athleteId={athleteId}
                activeVersion={program?.activeVersion}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}