import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/authContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Brain, Flame, Dumbbell, ArrowRight, Shield, Zap, AlertCircle } from "lucide-react";

export default function Register() {
  const { register, user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const trackParam = searchParams.get("track") || searchParams.get("world");
  const roleParam = searchParams.get("role");

  const initialWorld = (trackParam === "bb" || trackParam === "bodybuilding" || trackParam === "fitness")
    ? "fitness"
    : (trackParam === "pl" || trackParam === "powerlifting")
    ? "powerlifting"
    : localStorage.getItem("active_world_discipline") || "powerlifting";

  const [selectedWorld, setSelectedWorld] = useState(initialWorld);

  const [formData, setFormData] = useState({
    email: searchParams.get("email") || "",
    password: "",
    confirmPassword: "",
    role: roleParam === "coach" ? "coach" : "client"
  });
  const [error, setError] = useState("");
  const [isEmailInUse, setIsEmailInUse] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged in and profile is complete, send to dashboard
  useEffect(() => {
    if (user && profile?.profile_complete) {
      if (profile.role === "admin") navigate("/admin");
      else if (profile.role === "coach") navigate("/coach");
      else navigate(profile.pathway === "fitness" ? "/fitness-dashboard" : "/powerlifting-dashboard");
    }
  }, [user, profile, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError("");
    setIsEmailInUse(false);
  };

  const handleWorldToggle = (world) => {
    setSelectedWorld(world);
    localStorage.setItem("active_world_discipline", world);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsEmailInUse(false);

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password confirmation does not match");
      return;
    }

    setLoading(true);

    try {
      localStorage.setItem("active_world_discipline", selectedWorld);
      await register(formData.email, formData.password, formData.role, selectedWorld);
      // Direct immediately to profile calibration
      navigate(`/profile-setup?world=${selectedWorld}`);
    } catch (err) {
      const msg = err?.message || "";
      if (msg.includes("auth/email-already-in-use")) {
        setError("An account with this email already exists.");
        setIsEmailInUse(true);
      } else if (msg.includes("auth/weak-password")) {
        setError("Password is too weak. Minimum 6 characters required.");
      } else {
        setError(msg.replace("Firebase: ", "") || "Registration failed. Please verify connection.");
      }
      console.error("REGISTRATION_FAILURE:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white font-sans relative overflow-hidden p-4">
      {/* 🧬 BACKGROUND DECOR */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 border-l border-t border-orange-600/30" />
        <div className="absolute bottom-10 right-10 w-32 h-32 border-r border-b border-orange-600/30" />
        <div className="h-full w-full bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-amber-500 uppercase tracking-widest mb-3">
            <Zap className="w-3 h-3" />
            <span>ATHLETE RECRUITMENT PHASE 01</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-[1000] italic uppercase tracking-tighter">
            CREATE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">PROFILE</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-2 font-mono">
            Register to calibrate your custom training program & diet
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            {/* REALM SELECTION BADGE TOGGLE */}
            <div className="mb-6">
              <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block mb-2">
                Selected Training Realm
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleWorldToggle("powerlifting")}
                  className={`p-3 rounded-xl border text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                    selectedWorld === "powerlifting"
                      ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10"
                      : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Powerlifting</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleWorldToggle("fitness")}
                  className={`p-3 rounded-xl border text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                    selectedWorld === "fitness"
                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-500/10"
                      : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Dumbbell className="w-4 h-4 text-indigo-400" />
                  <span>Bodybuilding</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* EMAIL INPUT */}
              <div>
                <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block mb-1">
                  Athlete Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  placeholder="lifter@domain.com"
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 font-mono text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-white placeholder:text-zinc-600"
                />
              </div>

              {/* PASSWORD INPUT */}
              <div>
                <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block mb-1">
                  Security Passkey (min. 6 characters)
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  placeholder="••••••••"
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 font-mono text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-white placeholder:text-zinc-600"
                />
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block mb-1">
                  Confirm Security Passkey
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  placeholder="••••••••"
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 font-mono text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-white placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* ERROR DISPLAY */}
            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono text-center flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
                {isEmailInUse && (
                  <button
                    type="button"
                    onClick={() => navigate(`/login?world=${selectedWorld}&email=${encodeURIComponent(formData.email)}`)}
                    className="mt-1 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-black font-bold uppercase tracking-wider text-[10px] transition-colors"
                  >
                    Proceed to Login with this Email →
                  </button>
                )}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button 
              type="submit"
              disabled={loading}
              className={`w-full mt-6 py-4 rounded-xl font-black uppercase italic text-sm tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                loading 
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                  : "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-orange-600/20"
              }`}
            >
              <span>{loading ? "INITIALIZING NEURAL LINK..." : "CREATE ACCOUNT & ONBOARD"}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-center text-xs text-zinc-400 font-mono mt-4">
            Already registered?{" "}
            <button
              type="button"
              onClick={() => navigate(`/login?world=${selectedWorld}`)}
              className="text-amber-400 hover:text-white transition-colors underline underline-offset-4"
            >
              Log In
            </button>
          </p>

          <p className="text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-[10px] uppercase tracking-widest text-zinc-600 hover:text-zinc-400 font-mono transition-colors"
            >
              ← Back to World Selection
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}