import { Routes, Route } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import Login from "../pages/Login";
import ClientDashboard from "../dashboards/ClientDashboard";
import CoachDashboard from "../dashboards/CoachDashboard";
import AthleteDetail from "../dashboards/AthleteDetail";

export default function App() {
  const auth = useAuth();

  if (!auth) {
    return <div className="p-6">Auth loading...</div>;
  }

  const { user, logout } = auth;

  if (!user) {
    return <Login />;
  }

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
