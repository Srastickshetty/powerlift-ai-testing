import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/authContext";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Key, AlertCircle, ArrowRight, Shield, Brain, AlertTriangle } from "lucide-react";
import Button from "../ui/Button";
import ForgotPasswordModal from "../components/auth/ForgotPasswordModal";

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
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [switchModal, setSwitchModal] = useState({
    isOpen: false,
    currentPathway: "",
    requestedWorld: ""
  });

  useEffect(() => {
    if (user && profile) {
      if (profile.role === "admin") {
        navigate("/admin", { replace: true });
        return;
      }
      if (profile.role === "coach") {
        navigate("/roster", { replace: true });
        return;
      }
      if (!profile.profile_complete) {
        navigate(`/profile-setup?world=${worldParam || profile.pathway || "powerlifting"}`, { replace: true });
        return;
      }

      const userDiscipline = profile.pathway || profile.track || "powerlifting";
      if (worldParam && worldParam !== userDiscipline) {
        setSwitchModal({
          isOpen: true,
          currentPathway: userDiscipline,
          requestedWorld: worldParam
        });
      } else {
        const isBb = userDiscipline === "bb" || userDiscipline === "bodybuilding" || userDiscipline === "fitness";
        navigate(isBb ? "/bb/today" : "/pl/today", { replace: true });
      }
    }
  }, [user, profile, navigate, worldParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      const code = err?.code || "";
      if (code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Incorrect email or password.");
      } else {
        setError(err.message?.replace("Firebase: ", "") || "Authentication failed. Please check credentials.");
      }
      setLoading(false);
    }
  };

  const fillCredentials = (role) => {
    if (role === "admin") {
      setEmail("admin@powerlift.ai");
      setPassword("AdminPassword123!");
    } else if (role === "coach") {
      setEmail("coach@powerlift.ai");
      setPassword("CoachPassword123!");
    }
    setError("");
  };

  return (
    <div className="min-h-dvh bg-bg text-ink font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="num text-2xl font-bold tracking-wide inline-block mb-3">
            POWERLIFT<span className="text-accent">AI</span>
          </Link>
          <h1 className="num text-3xl font-bold text-ink">Welcome back</h1>
          <p className="text-sm text-muted mt-1">Log in to access your program and daily training log.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-line bg-surface p-6 sm:p-8 space-y-4 shadow-xl">
          <div>
            <label className="text-xs font-semibold text-muted block mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="athlete@powerliftai.com"
              className="w-full h-11 px-3 rounded-lg border border-line bg-bg text-ink text-base placeholder:text-muted/60 focus:outline-none focus:border-accent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-muted">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="py-1 text-xs text-accent hover:underline font-medium min-h-[32px] flex items-center"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full h-11 px-3 rounded-lg border border-line bg-bg text-ink text-base placeholder:text-muted/60 focus:outline-none focus:border-accent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full font-bold text-base mt-2"
          >
            <span>{loading ? "Verifying..." : "Log in"}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </Button>

          {/* Quick Demo Autofill Roles */}
          <div className="pt-4 border-t border-line">
            <span className="text-[11px] font-mono text-muted uppercase tracking-wider block mb-2 text-center">
              Quick Test Roles
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials("admin")}
                className="p-2.5 rounded-lg border border-line bg-raised hover:bg-raised/80 text-left text-xs transition"
              >
                <div className="font-semibold text-accent flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </div>
                <div className="text-[10px] text-muted truncate mt-0.5">admin@powerlift.ai</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("coach")}
                className="p-2.5 rounded-lg border border-line bg-raised hover:bg-raised/80 text-left text-xs transition"
              >
                <div className="font-semibold text-accent flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5" />
                  <span>Coach</span>
                </div>
                <div className="text-[10px] text-muted truncate mt-0.5">coach@powerlift.ai</div>
              </button>
            </div>
          </div>
        </form>

        <p className="text-center text-xs text-muted">
          Don't have an athlete account?{" "}
          <Link to="/register" className="text-accent font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>

      {/* Track Mismatch Modal */}
      {switchModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="rounded-2xl border border-line bg-surface p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warn/15 border border-warn/30 text-warn">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="num text-lg font-bold text-ink">Track Switch</h3>
                <span className="text-xs text-muted">Switch discipline confirmation</span>
              </div>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Your profile is registered in <strong className="text-ink uppercase">{switchModal.currentPathway}</strong>, but you requested <strong className="text-accent uppercase">{switchModal.requestedWorld}</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  const target = switchModal.requestedWorld;
                  localStorage.setItem("active_world_discipline", target);
                  setSwitchModal({ isOpen: false, currentPathway: "", requestedWorld: "" });
                  navigate(`/profile-setup?world=${target}&switching=true`, { replace: true });
                }}
                className="flex-1"
              >
                Switch Track
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setSwitchModal({ isOpen: false, currentPathway: "", requestedWorld: "" });
                  const isBb = switchModal.currentPathway === "bb" || switchModal.currentPathway === "bodybuilding" || switchModal.currentPathway === "fitness";
                  navigate(isBb ? "/bb/today" : "/pl/today", { replace: true });
                }}
                className="flex-1"
              >
                Continue Current
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Flow Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        initialEmail={email}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
}