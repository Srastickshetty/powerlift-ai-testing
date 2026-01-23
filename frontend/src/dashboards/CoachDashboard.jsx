import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function CoachDashboard() {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
 const navigate = useNavigate(); 
  useEffect(() => {
    api
      .get("/coach/dashboard")
      .then((res) => {
        setAthletes(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Coach dashboard error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-6">Loading coach dashboard...</div>;
  }

  if (!athletes || athletes.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Coach Dashboard</h1>
        <p className="text-gray-500">No athletes assigned yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Coach Dashboard</h1>

      <div className="grid gap-4">
        {athletes.map((athlete) => (
  <div
    key={athlete.athlete_id}
    onClick={() => navigate(`/athlete/${athlete.athlete_id}`)}
    className="border rounded-lg p-5 bg-white shadow-sm cursor-pointer hover:bg-gray-50"
  >

            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">{athlete.name}</h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  athlete.status === "needs_intervention"
                    ? "bg-red-100 text-red-800"
                    : athlete.status === "monitor"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {athlete.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
              <div>
                <p className="text-gray-500">Fatigue Rate</p>
                <p className="font-medium">{athlete.fatigue_rate}</p>
              </div>
              <div>
                <p className="text-gray-500">Miss Rate</p>
                <p className="font-medium">{athlete.miss_rate}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Session</p>
                <p className="font-medium">{athlete.last_session}</p>
              </div>
            </div>

            {/* Alerts */}
            {athlete.alerts && (
              <div className="mt-3 space-y-1">
                {athlete.alerts.map((alert, i) => (
                  <p
                    key={i}
                    className={`text-sm ${
                      alert.level === "critical"
                        ? "text-red-600"
                        : alert.level === "warning"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    • {alert.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
