import { Routes, Route } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import ClientDashboard from "../dashboards/ClientDashboard";
import CoachDashboard from "../dashboards/CoachDashboard";
import AthleteDetail from "../dashboards/AthleteDetail";

export default function App() {
  const auth = useAuth();

  if (!auth || !auth.user) {
    return <div className="p-6">Loading user...</div>;
  }

  const { user, logout } = auth;

  return (
    <>
      <div className="p-4 flex justify-between items-center border-b">
        <p className="font-medium">
          {user.email} ({user.role})
        </p>
        <button onClick={logout} className="text-sm underline">
          Logout
        </button>
      </div>

      <Routes>
        {user.role === "client" && (
          <Route path="*" element={<ClientDashboard />} />
        )}

        {user.role === "coach" && (
          <>
            <Route path="/" element={<CoachDashboard />} />
            <Route path="/athlete/:athleteId" element={<AthleteDetail />} />
          </>
        )}
      </Routes>
    </>
  );
}
