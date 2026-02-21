import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";

// Pages
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProfileSetup from "../pages/ProfileSetup";

// Dashboards
import ClientDashboard from "../dashboards/ClientDashboard";
import CoachDashboard from "../dashboards/CoachDashboard";
import AthleteDetail from "../pages/AthleteDetail";

// Components
import AIChatBot from "../components/AIChatBot";

export default function App() {
  const { user, profile, logout } = useAuth();

  // 🔒 HARD BLOCK — WAIT FOR AUTH + PROFILE
  if (user === undefined || profile === undefined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono text-xs tracking-[0.5em] text-orange-500">
        INITIALIZING_SYSTEM…
      </div>
    );
  }

  // Helper to determine if user is fully onboarded
  const isFullyAuthenticated = user && user.emailVerified && profile;

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* TOP BAR (only when logged in) */}
      {user && (
        <div className="p-4 flex justify-between border-b border-white/10 sticky top-0 bg-black z-40">
          <span className="font-mono text-xs">
            {user.email} {profile && `| ${profile.role.toUpperCase()}`}
          </span>
          <button
            onClick={logout}
            className="text-xs border border-white/20 px-3 py-1 hover:bg-white hover:text-black transition-colors"
          >
            Logout
          </button>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="pb-20"> {/* pb-20 gives space so the bot doesn't cover content */}
        <Routes>
          {/* ───────── PUBLIC ───────── */}
          {!user && (
            <>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}

          {/* ───────── EMAIL NOT VERIFIED ───────── */}
          {user && user.emailVerified === false && (
            <Route
              path="*"
              element={
                <div className="min-h-[80vh] flex items-center justify-center text-orange-500 font-mono text-center p-6">
                  VERIFICATION_REQUIRED: Check your email to activate your neural link.
                </div>
              }
            />
          )}

          {/* ───────── PROFILE SETUP ───────── */}
          {user && user.emailVerified && profile === null && (
            <>
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="*" element={<Navigate to="/profile-setup" replace />} />
            </>
          )}

          {/* ───────── CLIENT ───────── */}
          {user && profile?.role === "client" && (
            <>
              <Route path="/dashboard" element={<ClientDashboard />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}

          {/* ───────── COACH & ADMIN ───────── */}
          {user && (profile?.role === "coach" || profile?.role === "admin") && (
            <>
              <Route path="/dashboard" element={<CoachDashboard />} />
              <Route path="/athlete/:athleteId" element={<AthleteDetail />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}

          {/* ───────── FINAL FALLBACK ───────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* ───────── GLOBAL AI BOT ───────── */}
      {/* This only renders if the user is logged in, verified, and has a profile */}
      {isFullyAuthenticated && <AIChatBot />}
    </div>
  );
}