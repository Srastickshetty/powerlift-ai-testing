import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/authContext";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSetup from "./pages/ProfileSetup";

// Dashboards
import ClientDashboard from "./dashboards/ClientDashboard";
import CoachDashboard from "./dashboards/CoachDashboard";

export default function App() {
  const { user, profile } = useAuth();

  // Loading state
  if (user === undefined || profile === undefined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono text-xs tracking-[0.5em] text-orange-500">
        INITIALIZING_SYSTEM…
      </div>
    );
  }

  const isProfileComplete = !!profile?.profile_complete;
  const isCoach =
    profile?.email?.toLowerCase().includes("coach") ||
    profile?.email?.toLowerCase().includes("admin") ||
    profile?.role === "coach" ||
    profile?.role === "admin";

  const requireProfileComplete = (element) => {
    if (!user) return <Navigate to="/login" replace />;
    if (!isProfileComplete) return <Navigate to="/profile-setup" replace />;
    return element;
  };

  const requireAuthButIncompleteProfile = (element) => {
    if (!user) return <Navigate to="/login" replace />;
    if (isProfileComplete) return <Navigate to="/dashboard" replace />;
    return element;
  };

  return (
    <Routes>
      {/* Landing page - default route */}
      <Route
        path="/"
        element={
          user
            ? isProfileComplete
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/profile-setup" replace />
            : <Landing />
        }
      />

      {/* Authentication routes */}
      <Route
        path="/login"
        element={
          user
            ? isProfileComplete
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/profile-setup" replace />
            : <Login />
        }
      />
      <Route
        path="/register"
        element={
          user
            ? isProfileComplete
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/profile-setup" replace />
            : <Register />
        }
      />
      <Route
        path="/profile-setup"
        element={requireAuthButIncompleteProfile(<ProfileSetup />)}
      />

      {/* Protected dashboard route */}
      <Route
        path="/dashboard"
        element={requireProfileComplete(
          isCoach ? <CoachDashboard /> : <ClientDashboard />
        )}
      />

      {/* Catch-all for 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
