import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";
import PerformanceCharts from "../components/PerformanceCharts";
import RecentSessionsTable from "../components/RecentSessionsTable";
import CoachControls from "../components/CoachControls";
import ProgramHistory from "../components/ProgramHistory";

export default function AthleteDetail() {
  const { athleteId } = useParams();
const [progress, setProgress] = useState(null);
const [sessions, setSessions] = useState([]);

useEffect(() => {
  api.get(`/progress/${athleteId}`).then((res) => {
    setProgress(res.data);
  });
}, [athleteId]);

useEffect(() => {
  api
    .get(`/logs?athlete_id=${athleteId}`)
    .then((res) => {
      // show latest first, limit to 8
      setSessions(res.data.slice(-8).reverse());
    });
}, [athleteId]);

  // Dummy data for now
  const athlete = {
    name: "Rahul Shetty",
    athlete_id: athleteId,
    status: "on_track",
    fatigue_rate: 0.18,
    miss_rate: 0.05,
    phase: "Normal",
    last_session: "2026-02-12",
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{athlete.name}</h1>
        <p className="text-gray-500">Athlete ID: {athlete.athlete_id}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card title="Status" value={athlete.status} />
        <Card title="Fatigue Rate" value={athlete.fatigue_rate} />
        <Card title="Miss Rate" value={`${athlete.miss_rate * 100}%`} />
        <Card title="Phase" value={athlete.phase} />
      </div>

      {/* Sections */}
      <Section title="📈 Performance Progress">
        <div className="text-gray-500">
         <h2 className="text-xl font-semibold mt-6 mb-3">
  📈 Performance Progress
</h2>

{progress ? (
  <PerformanceCharts progress={progress} />
) : (
  <p className="text-gray-500">Loading performance data...</p>
)}

        </div>
      </Section>

      <Section title="📋 Recent Sessions">
        <div className="text-gray-500">
<h2 className="text-xl font-semibold mt-8 mb-2">
  📋 Recent Sessions
</h2>

<RecentSessionsTable sessions={sessions} />        </div>
      </Section>

      <Section title="🧠 Coach Controls">
        <CoachControls athleteId={athleteId} />

      </Section>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
<ProgramHistory athleteId={athleteId} />

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        {children}
      </div>
    </div>
  );
}
