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

// Modular Track Dashboards
const PlDashboard = lazy(() => import("./tracks/powerlifting/PlDashboard"));
const BbDashboard = lazy(() => import("./tracks/bodybuilding/BbDashboard"));

import ErrorBoundary from "./ui/ErrorBoundary";
import LoadingState from "./ui/LoadingState";
import SessionExpiredModal from "./ui/SessionExpiredModal";
import PermissionDenied from "./ui/PermissionDenied";
import NoInternetPage from "./ui/NoInternetPage";

const FallbackLoader = () => (
  <LoadingState fullScreen message="Loading Training View..." subtext="Syncing program routines and metrics" />
);

export default function App() {
  const { user, profile } = useAuth();
  const [sessionExpired, setSessionExpired] = React.useState(false);

  React.useEffect(() => {
    const handleExpired = () => setSessionExpired(true);
    window.addEventListener("powerlift:session-expired", handleExpired);
    return () => window.removeEventListener("powerlift:session-expired", handleExpired);
  }, []);

  // Loading state
  if (user === undefined || profile === undefined) {
    return (
      <LoadingState fullScreen message="Starting PowerLift AI..." subtext="Initializing secure athlete profile" />
    );
  }

  const isProfileComplete = !!profile?.profile_complete || sessionStorage.getItem('profileSetupComplete') === 'true';
  const isAdmin = profile?.role === "admin" || profile?.email?.toLowerCase().includes("admin");
  const isCoach = profile?.role === "coach" || profile?.email?.toLowerCase().includes("coach");
  const userTrack = (profile?.track === "bb" || profile?.track === "bodybuilding" || profile?.track === "BODYBUILDING") ? "bb" : "pl";

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
    if (!isCoach && !isAdmin) {
      return (
        <PermissionDenied
          requiredRole="Coach"
          title="Coach Portal Access Restricted"
          message="This portal is reserved for certified coaches managing rosters and reviews."
          onBack={() => window.location.href = `/${userTrack}/today`}
        />
      );
    }
    return element;
  };

  const requireAdmin = (element) => {
    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) {
      return (
        <PermissionDenied
          requiredRole="System Administrator"
          title="Admin Clearance Required"
          message="Administrative controls are restricted to system owners and staff."
          onBack={() => window.location.href = `/${userTrack}/today`}
        />
      );
    }
    return element;
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={<FallbackLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/ui-lab" element={<UiLab />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/offline" element={<NoInternetPage />} />
          <Route path="/403" element={<PermissionDenied />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile-setup" element={requireAuth(<ProfileSetup />)} />

          {/* Dedicated Full-Screen Gym Workout Mode (Outside AppShell) */}
          <Route path="/workout/:id" element={requireAuth(<WorkoutMode />)} />

          {/* Core Athlete 5-Tab App Shell - Powerlifting & Bodybuilding Routes */}
          <Route element={requireAthlete(<AppShell />)}>
            {/* Powerlifting Domain Routes */}
            <Route path="/pl/today" element={<Today />} />
            <Route path="/pl/dashboard" element={<PlDashboard profile={profile} user={user} />} />
            <Route path="/pl/program" element={<Program />} />
            <Route path="/pl/progress" element={<Progress />} />
            <Route path="/pl/coach" element={<CoachTab />} />
            <Route path="/pl/me" element={<Me />} />

            {/* Bodybuilding Domain Routes */}
            <Route path="/bb/today" element={<Today />} />
            <Route path="/bb/dashboard" element={<BbDashboard profile={profile} user={user} />} />
            <Route path="/bb/program" element={<Program />} />
            <Route path="/bb/progress" element={<Progress />} />
            <Route path="/bb/coach" element={<CoachTab />} />
            <Route path="/bb/me" element={<Me />} />

            {/* Unprefixed Default Aliases -> Redirect to Active Track */}
            <Route path="/today" element={<Navigate to={`/${userTrack}/today`} replace />} />
            <Route path="/dashboard" element={<Navigate to={`/${userTrack}/dashboard`} replace />} />
            <Route path="/program" element={<Navigate to={`/${userTrack}/program`} replace />} />
            <Route path="/progress" element={<Navigate to={`/${userTrack}/progress`} replace />} />
            <Route path="/coach" element={<Navigate to={`/${userTrack}/coach`} replace />} />
            <Route path="/me" element={<Navigate to={`/${userTrack}/me`} replace />} />
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

          {/* Legacy Dashboard Route Aliases (Smooth Transition to Track Hubs) */}
          <Route path="/fitness-dashboard" element={<Navigate to="/bb/dashboard" replace />} />
          <Route path="/cockpit-fitness" element={<Navigate to="/bb/dashboard" replace />} />
          <Route path="/powerlifting-dashboard" element={<Navigate to="/pl/dashboard" replace />} />
          <Route path="/cockpit-powerlifting" element={<Navigate to="/pl/dashboard" replace />} />
          <Route path="/classic-log" element={<Navigate to="/today" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Non-Destructive Session Expired Modal */}
        <SessionExpiredModal
          isOpen={sessionExpired}
          onSuccess={() => setSessionExpired(false)}
          onDismiss={() => setSessionExpired(false)}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
