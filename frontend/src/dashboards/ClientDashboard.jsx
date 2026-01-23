import { useState } from "react";
import { useAuth } from "../auth/authContext";

import TodayWorkout from "./client/TodayWorkout";
import WeeklyPlan from "./client/WeeklyPlan";
import WorkoutHistory from "./client/WorkoutHistory";
import ClientProgress from "../components/ClientProgress";

export default function ClientDashboard() {
  const { user } = useAuth(); // ✅ correct source of athlete_id
  const athleteId = user?.athlete_id || "athlete_001"; // safe fallback

  const [tab, setTab] = useState("today");

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        {["today", "week", "history", "progress"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 capitalize ${
              tab === t
                ? "border-b-2 border-black font-semibold"
                : "text-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Views */}
      {tab === "today" && <TodayWorkout />}
      {tab === "week" && <WeeklyPlan />}
      {tab === "history" && <WorkoutHistory />}
      {tab === "progress" && (
        <ClientProgress athleteId={athleteId} />
      )}
    </div>
  );
}
