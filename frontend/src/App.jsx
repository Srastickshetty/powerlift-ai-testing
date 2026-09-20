import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/authContext";

// Immediate core pages & shell
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSetup from "./pages/ProfileSetup";
import TitanAppShell from "./components/layout/TitanAppShell";

// Lazy-loaded heavy dashboards
const ClientDashboard = lazy(() => import("./dashboards/ClientDashboard"));
const AthleteCommandCenter = lazy(() => import("./dashboards/AthleteCommandCenter"));
const FitnessCommandCenter = lazy(() => import("./dashboards/FitnessCommandCenter"));
const CoachDashboard = lazy(() => import("./dashboards/CoachDashboard"));
const AdminCommandCenter = lazy(() => import("./dashboards/AdminCommandCenter"));

const CockpitFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center font-mono text-xs tracking-[0.3em] text-orange-500">
    INITIALIZING_WAR_ROOM…
  </div>
);

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

  const isProfileComplete = !!profile?.profile_complete || sessionStorage.getItem('profileSetupComplete') === 'true';
  const isAdmin = profile?.role === "admin" || profile?.email?.toLowerCase().includes("admin");
  const isCoach = profile?.role === "coach" || profile?.email?.toLowerCase().includes("coach");
  const activeDiscipline = localStorage.getItem('active_world_discipline');
  const isFitness = activeDiscipline === "fitness" || profile?.pathway === "fitness";

  const requireAuth = (element) => {
    if (!user) return <Navigate to="/login" replace />;
    return element;
  };

  const requireProfileComplete = (element) => {
    if (!user) return <Navigate to="/login" replace />;
    if (isAdmin) return <Navigate to="/admin" replace />;
    if (isCoach) return <Navigate to="/coach" replace />;
    if (!isProfileComplete) return <Navigate to="/profile-setup" replace />;
    return element;
  };

  const requireAdmin = (element) => {
    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;
    return element;
  };

  const requireCoach = (element) => {
    if (!user) return <Navigate to="/login" replace />;
    if (!isCoach && !isAdmin) return <Navigate to="/" replace />;
    return element;
  };

  return (
    <Suspense fallback={<CockpitFallback />}>
      <Routes>
        {/* Public Landing page */}
        <Route
          path="/"
          element={<Landing />}
        />

        {/* Authentication routes */}
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/register"
          element={<Register />}
        />
        <Route
          path="/profile-setup"
          element={requireAuth(<ProfileSetup />)}
        />

        {/* Calibrated Super-App Dashboard routes (Strictly Authenticated & Profile Complete) */}
        <Route
          path="/dashboard"
          element={
            requireProfileComplete(
              <TitanAppShell defaultPathway={isFitness ? 'fitness' : 'powerlifting'} />
            )
          }
        />

        {/* Direct pathway shortcut routes */}
        <Route
          path="/fitness-dashboard"
          element={requireProfileComplete(<TitanAppShell defaultPathway="fitness" />)}
        />
        <Route
          path="/powerlifting-dashboard"
          element={requireProfileComplete(<TitanAppShell defaultPathway="powerlifting" />)}
        />

        {/* Tactical Cockpit Views */}
        <Route
          path="/cockpit-powerlifting"
          element={
            requireProfileComplete(
              <AthleteCommandCenter 
                user={user} 
                profile={profile} 
                athleteId={user?.uid} 
              />
            )
          }
        />
        <Route
          path="/cockpit-fitness"
          element={
            requireProfileComplete(
              <FitnessCommandCenter 
                user={user} 
                profile={profile} 
                athleteId={user?.uid} 
              />
            )
          }
        />

        {/* Super-Admin Command Center (Restricted to Admins) */}
        <Route
          path="/admin"
          element={requireAdmin(<AdminCommandCenter />)}
        />

        {/* Coach Dashboard (Restricted to Coaches & Admins) */}
        <Route
          path="/coach"
          element={requireCoach(<CoachDashboard />)}
        />

        {/* Legacy dashboard route */}
        <Route
          path="/classic-log"
          element={requireProfileComplete(<ClientDashboard />)}
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
