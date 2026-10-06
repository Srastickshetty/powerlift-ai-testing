import React, { useState } from "react";
import { Lock, LogIn, ShieldAlert } from "lucide-react";
import Button from "./Button";
import { useAuth } from "../auth/authContext";

export default function SessionExpiredModal({
  isOpen = true,
  onSuccess,
  onDismiss,
  email = "",
}) {
  const { user, login } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const targetEmail = email || user?.email || "athlete@powerlift.ai";

  const handleReAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (login) {
        await login(targetEmail, password);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.message?.replace("Firebase: ", "") || "Re-authentication failed. Please check password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="text-center space-y-2">
          <div className="mx-auto h-14 w-14 rounded-full bg-warn/15 border border-warn/30 grid place-items-center text-warn">
            <Lock className="h-7 w-7" aria-hidden="true" />
          </div>
          <h2 id="session-expired-title" className="num text-2xl font-bold text-ink">
            Session Expired
          </h2>
          <p className="text-sm text-muted">
            Your secure session timed out. Re-authenticate to keep logging and safely upload your buffered sets.
          </p>
        </div>

        <form onSubmit={handleReAuth} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted block mb-1">
              Account
            </label>
            <input
              type="text"
              readOnly
              value={targetEmail}
              className="w-full h-11 rounded-md border border-line bg-bg px-3 text-sm text-muted cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter password to resume"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 rounded-md border border-line bg-bg px-3 text-base text-ink placeholder:text-muted/50 focus:border-accent outline-none"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-md bg-danger/10 border border-danger/25 text-xs text-danger font-medium flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={loading}
              className="w-full font-bold gap-2"
            >
              <LogIn className="h-4 w-4" />
              <span>{loading ? "Verifying..." : "Resume Workout"}</span>
            </Button>

            {onDismiss && (
              <Button
                variant="ghost"
                size="md"
                type="button"
                onClick={onDismiss}
                className="w-full text-xs text-muted hover:text-ink"
              >
                Continue in Offline Mode
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
