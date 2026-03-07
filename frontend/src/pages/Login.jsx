import { useState, useEffect } from "react";
import { useAuth } from "../auth/authContext";
import { useNavigate } from "react-router-dom";
import { Brain, Zap, Shield, Target, Activity } from 'lucide-react';

export default function Login() {
  const { login, user, profile } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  // Handle redirect after login based on role
  useEffect(() => {
    if (user && profile) {
      if (!profile.profile_complete) {
        navigate("/profile-setup");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // Navigation will be handled by useEffect above
    } catch (err) {
      const code = err?.code || "";
      if (code === "auth/user-not-found") {
        setError("EMAIL NOT FOUND IN SYSTEM");
        setShowSignupPrompt(true);
      } else if (code === "auth/invalid-credential") {
        setError("ACCESS DENIED: INVALID CREDENTIALS");
        setShowSignupPrompt(true);
      } else {
        const errorMessage = err.message?.toUpperCase?.() || "LOGIN FAILED";
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* TITAN-OS Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-black to-purple-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(249,115,22,0.1)_0%,_transparent_70%)]" />
      </div>

      {/* TITAN-OS Branding Header */}
      <div className="absolute top-8 left-8 z-20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-orange-500">TITAN-OS</h1>
            <p className="text-xs text-zinc-400">God-Level Powerlifting Platform</p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative bg-black border border-white/10 p-8 shadow-[0_0_50px_rgba(0,0,0,1)]"
      >
        {/* Industrial Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-orange-600 -translate-x-1 -translate-y-1" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-orange-600 translate-x-1 translate-y-1" />

        <h1 className="text-4xl font-[1000] italic uppercase tracking-tighter mb-8 text-center">
            Identify <span className="text-orange-600">Yourself</span>
          </h1>

          <div className="space-y-6">
            <div className="relative group">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 mb-1 block ml-1 font-mono">User Identifier</label>
              <input
                type="email"
                placeholder="EMAIL_ADDRESS"
                className="bg-zinc-900/50 border border-white/10 w-full p-4 text-sm font-mono focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-all placeholder:text-zinc-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative group">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 mb-1 block ml-1 font-mono">Access Key</label>
              <input
                type="password"
                placeholder="••••••••"
                className="bg-zinc-900/50 border border-white/10 w-full p-4 text-sm font-mono focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-all placeholder:text-zinc-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="mt-6 p-3 border border-red-900/50 bg-red-900/10 text-red-500 text-[10px] font-mono text-center tracking-tighter animate-pulse">
              [ERROR] {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className={`group relative w-full mt-8 py-4 font-black uppercase italic text-xl transition-all 
              ${loading ? 'bg-zinc-800 text-zinc-500' : 'bg-white text-black hover:bg-orange-600 hover:text-white'}`}
            style={{ clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)' }}
          >
            <span className="relative z-10">{loading ? "Verifying..." : "Initiate Link"}</span>
          </button>

          <button 
            type="button"
            onClick={() => navigate("/")}
            className="w-full mt-4 text-[10px] uppercase tracking-[0.3em] text-gray-600 hover:text-white transition-colors font-mono"
          >
            ← Abort Session
          </button>
        </form>

        {/* FOOTER DATA */}
        <div className="mt-10 flex justify-between items-start opacity-20 select-none">
            <div className="text-[8px] font-mono leading-tight">
                STATUS: {loading ? 'SYNCING' : 'ENCRYPTED'}<br/>
                LOCATION: 40.7128° N
            </div>
            <div className="text-[8px] font-mono text-right leading-tight">
                AI_CORE: ONLINE<br/>
                V_LEVEL: ALPHA
            </div>
        </div>

      {/* SIGNUP PROMPT MODAL */}
      {showSignupPrompt && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-zinc-950 border border-orange-600/40 max-w-sm w-full p-6 font-mono text-xs uppercase tracking-widest">
            <h2 className="text-orange-500 text-sm mb-3">IDENTITY_NOT_FOUND</h2>
            <p className="text-zinc-400 mb-6">
              This email is not registered in the system. Do you want to create a new unit with this address?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSignupPrompt(false);
                  navigate("/register");
                }}
                className="flex-1 bg-orange-600 text-black py-3 font-black italic hover:bg-white transition-colors"
              >
                Initiate Registration
              </button>
              <button
                onClick={() => setShowSignupPrompt(false)}
                className="flex-1 border border-zinc-700 text-zinc-300 py-3 font-black italic hover:bg-zinc-900 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📺 SCANLINE OVERLAY */}
      <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
    </div>
  );
}