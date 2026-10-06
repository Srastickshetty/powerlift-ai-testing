import React from "react";
import { ShieldAlert, ArrowLeft, LogOut, UserCheck } from "lucide-react";
import Button from "./Button";
import { useAuth } from "../auth/authContext";

export default function PermissionDenied({
  title = "Access Restricted",
  message = "You do not have authorization to view this area. This section requires coach or administrator clearance.",
  requiredRole = "Coach",
  onBack,
  fullScreen = true,
  className = "",
}) {
  const { user, profile, logout } = useAuth();
  const currentRole = profile?.role || "Athlete";

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      const track = profile?.track === "bb" ? "bb" : "pl";
      window.location.href = `/${track}/today`;
    }
  };

  const handleLogout = async () => {
    try {
      if (logout) await logout();
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  const content = (
    <div
      role="region"
      aria-label="Permission Denied"
      className={`rounded-2xl border border-line bg-surface p-6 sm:p-10 text-center max-w-lg mx-auto space-y-6 ${className}`}
    >
      <div className="mx-auto h-16 w-16 rounded-full bg-danger/10 border border-danger/25 grid place-items-center text-danger">
        <ShieldAlert className="h-8 w-8" aria-hidden="true" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger/10 border border-danger/20 text-xs font-semibold text-danger">
          <span>Error 403 · Forbidden</span>
        </div>
        <h1 className="num text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          {title}
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          {message}
        </p>
      </div>

      {/* Role diagnostics */}
      <div className="rounded-xl border border-line bg-bg p-4 text-left space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted">Signed In As:</span>
          <span className="font-semibold text-ink capitalize flex items-center gap-1">
            <UserCheck className="h-3.5 w-3.5 text-accent" />
            {profile?.display_name || user?.email || "Current Athlete"} ({currentRole})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted">Required Privilege:</span>
          <span className="font-semibold text-warn">{requiredRole} Access</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={handleBack}
          className="w-full sm:w-auto font-bold gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={handleLogout}
          className="w-full sm:w-auto gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Switch Account</span>
        </Button>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-dvh w-full bg-bg flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
}
