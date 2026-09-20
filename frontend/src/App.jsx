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
  const isCoach =
    profile?.email?.toLowerCase().includes("coach") ||
    profile?.email?.toLowerCase().includes("admin") ||
    profile?.role === "coach" ||
    profile?.role === "admin";
  const activeDiscipline = localStorage.getItem('active_world_discipline');
  const isFitness = activeDiscipline === "fitness" || profile?.pathway === "fitness";

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

  const demoAthlete = {
    uid: 'athlete_demo',
    email: 'lifter@titan-ai.in',
    displayName: 'Srastick Shetty',
    role: 'client',
    profile_complete: true,
    pathway: 'powerlifting',
    bodyweight: 74,
    gender: 'male',
    training_max: { squat: 195, bench: 130, deadlift: 235 }
  };

  const demoFitnessAthlete = {
    ...demoAthlete,
    pathway: 'fitness',
    primaryGoal: 'hypertrophy',
    splitPreference: 'ppl'
  };

  return (
    <Suspense fallback={<CockpitFallback />}>
      <Routes>
        {/* Landing page - default route */}
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
          element={<ProfileSetup />}
        />

        {/* Modern Super-App Dashboard route */}
        <Route
          path="/dashboard"
          element={
            isCoach ? (
              <CoachDashboard />
            ) : (
              <TitanAppShell defaultPathway={isFitness ? 'fitness' : 'powerlifting'} />
            )
          }
        />

        {/* Direct pathway shortcut routes */}
        <Route
          path="/fitness-dashboard"
          element={<TitanAppShell defaultPathway="fitness" />}
        />
        <Route
          path="/powerlifting-dashboard"
          element={<TitanAppShell defaultPathway="powerlifting" />}
        />

        {/* Legacy Cockpit Views (Preserved for backwards compatibility) */}
        <Route
          path="/cockpit-powerlifting"
          element={
            <AthleteCommandCenter 
              user={user || { uid: 'athlete_demo', email: 'lifter@titan-ai.in' }} 
              profile={profile || demoAthlete} 
              athleteId={user?.uid || 'athlete_demo'} 
            />
          }
        />
        <Route
          path="/cockpit-fitness"
          element={
            <FitnessCommandCenter 
              user={user || { uid: 'athlete_demo', email: 'lifter@titan-ai.in' }} 
              profile={profile || demoFitnessAthlete} 
              athleteId={user?.uid || 'athlete_demo'} 
            />
          }
        />

        {/* Super-Admin Command Center */}
        <Route
          path="/admin"
          element={<AdminCommandCenter />}
        />

        {/* Coach Dashboard */}
        <Route
          path="/coach"
          element={<CoachDashboard />}
        />

        {/* Legacy dashboard route */}
        <Route
          path="/classic-log"
          element={requireProfileComplete(<ClientDashboard />)}
        />

        {/* Catch-all for 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
