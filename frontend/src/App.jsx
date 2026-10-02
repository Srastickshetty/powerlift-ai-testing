import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/authContext";

// Immediate core pages & layout
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSetup from "./pages/ProfileSetup";
import AppShell from "./components/layout/AppShell";
import TitanAppShell from "./components/layout/TitanAppShell";

// Lazy-loaded Athlete Screens
const Today = lazy(() => import("./pages/athlete/Today"));
const Program = lazy(() => import("./pages/athlete/Program"));
const Progress = lazy(() => import("./pages/athlete/Progress"));
const CoachTab = lazy(() => import("./pages/athlete/CoachTab"));
const Me = lazy(() => import("./pages/athlete/Me"));
const WorkoutMode = lazy(() => import("./pages/WorkoutMode"));

// Lazy-loaded Coach Screens
const CoachDashboard = lazy(() => import("./dashboards/CoachDashboard"));
const CoachInbox = lazy(() => import("./pages/coach/CoachInbox"));
const CoachPrograms = lazy(() => import("./pages/coach/CoachPrograms"));
const CoachLibrary = lazy(() => import("./pages/coach/CoachLibrary"));
const CoachBilling = lazy(() => import("./pages/coach/CoachBilling"));

// Lazy-loaded Admin & Utility Screens
const AdminCommandCenter = lazy(() => import("./dashboards/AdminCommandCenter"));
const UiLab = lazy(() => import("./pages/UiLab"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));

// Legacy Dashboards (Retained for backwards compatibility)
const ClientDashboard = lazy(() => import("./dashboards/ClientDashboard"));
const AthleteCommandCenter = lazy(() => import("./dashboards/AthleteCommandCenter"));
const FitnessCommandCenter = lazy(() => import("./dashboards/FitnessCommandCenter"));

const FallbackLoader = () => (
  <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-xs tracking-[0.3em] text-accent">
    LOADING_POWERLIFT_AI…
  </div>
);

export default function App() {
  const { user, profile } = useAuth();

  // Loading state
  if (user === undefined || profile === undefined) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-xs tracking-[0.5em] text-accent">
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

  const requireAthlete = (element) => {
    if (!user) return <Navigate to="/login" replace />;
    if (isAdmin) return <Navigate to="/admin" replace />;
    if (isCoach) return <Navigate to="/roster" replace />;
    if (!isProfileComplete) return <Navigate to="/profile-setup" replace />;
    return element;
  };

  const requireCoach = (element) => {
    if (!user) return <Navigate to="/login" replace />;
    if (!isCoach && !isAdmin) return <Navigate to="/today" replace />;
    return element;
  };

  const requireAdmin = (element) => {
    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;
    return element;
  };

  return (
    <Suspense fallback={<FallbackLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/ui-lab" element={<UiLab />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile-setup" element={requireAuth(<ProfileSetup />)} />

        {/* Dedicated Full-Screen Gym Workout Mode (Outside AppShell) */}
        <Route path="/workout/:id" element={requireAuth(<WorkoutMode />)} />

        {/* Core Athlete 5-Tab App Shell */}
        <Route element={requireAthlete(<AppShell />)}>
          <Route path="/today" element={<Today />} />
          <Route path="/program" element={<Program />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/coach" element={<CoachTab />} />
          <Route path="/me" element={<Me />} />
        </Route>

        {/* Coach 5-Tab App Shell */}
        <Route element={requireCoach(<AppShell />)}>
          <Route path="/roster" element={<CoachDashboard />} />
          <Route path="/inbox" element={<CoachInbox />} />
          <Route path="/coach-programs" element={<CoachPrograms />} />
          <Route path="/library" element={<CoachLibrary />} />
          <Route path="/billing" element={<CoachBilling />} />
        </Route>

        {/* Super-Admin Command Center */}
        <Route path="/admin" element={requireAdmin(<AdminCommandCenter />)} />

        {/* Legacy Dashboard Route Aliases (Smooth Transition) */}
        <Route path="/dashboard" element={<Navigate to="/today" replace />} />
        <Route path="/fitness-dashboard" element={<Navigate to="/today" replace />} />
        <Route path="/powerlifting-dashboard" element={<Navigate to="/today" replace />} />
        <Route path="/cockpit-powerlifting" element={requireAthlete(<AthleteCommandCenter user={user} profile={profile} athleteId={user?.uid} />)} />
        <Route path="/cockpit-fitness" element={requireAthlete(<FitnessCommandCenter user={user} profile={profile} athleteId={user?.uid} />)} />
        <Route path="/classic-log" element={requireAthlete(<ClientDashboard />)} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
