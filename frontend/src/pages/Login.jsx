import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/authContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Brain, Zap, Shield, Key, AlertCircle, ArrowRight, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const { login, user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const worldParam = searchParams.get("world") || localStorage.getItem("active_world_discipline");
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [switchModal, setSwitchModal] = useState({
    isOpen: false,
    currentPathway: "",
    requestedWorld: ""
  });

  // Handle post-login redirection based on role and pathway
  useEffect(() => {
    if (user && profile) {
      // 1. ADMIN
      if (profile.role === "admin") {
        navigate("/admin", { replace: true });
        return;
      }

      // 2. COACH
      if (profile.role === "coach") {
        navigate("/coach", { replace: true });
        return;
      }

      // 3. INCOMPLETE PROFILE
      if (!profile.profile_complete) {
        navigate(`/profile-setup?world=${worldParam || profile.pathway || "powerlifting"}`, { replace: true });
        return;
      }

      // 4. ATHLETE WITH COMPLETE PROFILE
      const userDiscipline = profile.pathway || "powerlifting";
      if (worldParam && worldParam !== userDiscipline) {
        // Mismatch detected: User chose e.g. bodybuilding on landing, but profile is powerlifting
        setSwitchModal({
          isOpen: true,
          currentPathway: userDiscipline,
          requestedWorld: worldParam
        });
      } else {
        navigate(userDiscipline === "fitness" ? "/fitness-dashboard" : "/powerlifting-dashboard", { replace: true });
      }
    }
  }, [user, profile, navigate, worldParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // Navigation will be resolved by the useEffect above once profile loads
    } catch (err) {
      console.error("LOGIN_ERROR:", err);
      const code = err?.code || "";
      if (code === "auth/user-not-found") {
        setError("NO ACCOUNT FOUND WITH THIS EMAIL");
      } else if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("ACCESS DENIED: INCORRECT EMAIL OR PASSWORD");
      } else {
        setError(err.message?.replace("Firebase: ", "").toUpperCase() || "AUTHENTICATION FAILED");
      }
      setLoading(false);
    }
  };

  const fillCredentials = (role) => {
    if (role === "admin") {
      setEmail("admin@titan-ai.in");
      setPassword("AdminPassword@2026");
    } else if (role === "coach") {
      setEmail("coach@titan-ai.in");
      setPassword("CoachPassword@2026");
    }
    setError("");
  };

  const handleConfirmSwitch = () => {
    const target = switchModal.requestedWorld;
    localStorage.setItem("active_world_discipline", target);
    setSwitchModal({ isOpen: false, currentPathway: "", requestedWorld: "" });
    navigate(`/profile-setup?world=${target}&switching=true`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-black to-indigo-950/20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(249,115,22,0.08)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* TITAN-AI Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-amber-400 uppercase tracking-widest mb-3">
            <Key className="w-3 h-3" />
            <span>SECURE ACCESS TERMINAL</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-[1000] italic uppercase tracking-tighter">
            IDENTIFY <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">YOURSELF</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-2 font-mono">
            Enter credentials to open your command dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <div className="space-y-4">
              {/* USER IDENTIFIER */}
              <div>
                <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block mb-1">
                  User Identifier (Email)
                </label>
                <input
                  type="email"
                  placeholder="athlete@titan-ai.in"
                  className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 font-mono text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-white placeholder:text-zinc-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* ACCESS KEY */}
              <div>
                <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block mb-1">
                  Access Key (Password)
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 font-mono text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-white placeholder:text-zinc-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* ERROR DISPLAY */}
            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono text-center flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button 
              type="submit"
              disabled={loading}
              className={`w-full mt-6 py-4 rounded-xl font-black uppercase italic text-sm tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                loading 
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                  : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-zinc-950 font-bold shadow-amber-600/20"
              }`}
            >
              <span>{loading ? "VERIFYING CREDENTIALS..." : "INITIATE LINK"}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            {/* OFFICIAL ACCOUNTS SEED CARD */}
            <div className="mt-6 pt-5 border-t border-white/5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2 text-center">
                🔑 Master System Roles (Click to autofill)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials("admin")}
                  className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-amber-600/20 border border-zinc-800 hover:border-amber-500/40 text-left transition-all group"
                >
                  <div className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>Super Admin</span>
                  </div>
                  <div className="text-[9px] font-mono text-zinc-500 truncate mt-0.5">
                    admin@titan-ai.in
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials("coach")}
                  className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-indigo-600/20 border border-zinc-800 hover:border-indigo-500/40 text-left transition-all group"
                >
                  <div className="text-[11px] font-mono font-bold text-indigo-400 flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    <span>Master Coach</span>
                  </div>
                  <div className="text-[9px] font-mono text-zinc-500 truncate mt-0.5">
                    coach@titan-ai.in
                  </div>
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-zinc-400 font-mono mt-4">
            Don't have an athlete account?{" "}
            <button
              type="button"
              onClick={() => navigate(`/register?world=${worldParam || "powerlifting"}`)}
              className="text-amber-400 hover:text-white transition-colors underline underline-offset-4"
            >
              Register Now
            </button>
          </p>

          <p className="text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-[10px] uppercase tracking-widest text-zinc-600 hover:text-zinc-400 font-mono transition-colors"
            >
              ← Return to Main Gate
            </button>
          </p>
        </form>
      </div>

      {/* ⚠️ DISCIPLINE SWITCH WARNING MODAL (AFTER LOGIN IF USER CHOSE DIFFERENT REALM) */}
      <AnimatePresence>
        {switchModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0e1017] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">
                    Discipline Mismatch
                  </h3>
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                    REGISTERED IN {switchModal.currentPathway.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-zinc-300 mb-6 bg-zinc-900/60 p-4 rounded-2xl border border-white/5">
                <p>
                  You logged in with a profile registered for{" "}
                  <strong className="text-amber-400 uppercase">
                    {switchModal.currentPathway === "powerlifting" ? "Powerlifting (SBD/IPF)" : "Bodybuilding (Hypertrophy)"}
                  </strong>
                  , but you selected{" "}
                  <strong className="text-indigo-400 uppercase">
                    {switchModal.requestedWorld === "powerlifting" ? "Powerlifting World" : "Bodybuilding World"}
                  </strong>
                  .
                </p>
                <p>
                  Do you want to switch your training realm to{" "}
                  <strong className="text-indigo-400 uppercase">
                    {switchModal.requestedWorld === "powerlifting" ? "Powerlifting" : "Bodybuilding"}
                  </strong>
                  ?
                </p>
                <div className="pt-2 text-[11px] text-zinc-400 border-t border-white/5 font-mono">
                  ✨ Your biological baseline & diet details are saved. You will only provide the remaining metrics needed for {switchModal.requestedWorld}.
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleConfirmSwitch}
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-bold text-xs uppercase transition-colors"
                >
                  Yes, Switch Realm
                </button>
                <button
                  onClick={() => {
                    setSwitchModal({ isOpen: false, currentPathway: "", requestedWorld: "" });
                    navigate(switchModal.currentPathway === "fitness" ? "/fitness-dashboard" : "/powerlifting-dashboard", { replace: true });
                  }}
                  className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs uppercase transition-colors"
                >
                  Open {switchModal.currentPathway === "fitness" ? "Bodybuilding" : "Powerlifting"} Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}