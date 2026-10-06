import React from "react";
import { 
  LogOut, 
  ExternalLink, 
  Trash2, 
  ShieldCheck, 
  User,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/authContext";
import { toast } from "sonner";
import SportSwitcher from "./SportSwitcher";

export default function AdminHeader({ activeSport, onSelectSport, onOpenFreshStart }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Superadmin session closed successfully.");
      navigate("/login");
    } catch {
      toast.error("Error signing out. Redirecting...");
      navigate("/login");
    }
  };

  const isPl = activeSport === "pl";

  return (
    <header className="rounded-2xl border border-line bg-surface/85 backdrop-blur-md p-4 sm:p-6 shadow-xl space-y-5">
      {/* Top Bar: Authority Mark & Profile Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Brand & Authority Badge */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-accent/15 border border-accent/35 text-accent font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              Root System Authority
            </span>

            <span className="px-2.5 py-1 rounded-md bg-ok/15 border border-ok/30 text-ok font-mono text-[11px] font-semibold flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Live Production
            </span>
          </div>

          <h1 className="num text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            POWERLIFT<span className="text-accent">AI</span> SUPERADMIN CONSOLE
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Cross-sport orchestrator for {isPl ? "Powerlifting (IPF SBD)" : "Bodybuilding (Hypertrophy Meso)"}, coach-athlete rosters & platform state.
          </p>
        </div>

        {/* Action Controls & User Account */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Quick Nav: Coach Portal */}
          <button
            type="button"
            onClick={() => navigate("/roster")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-line bg-raised hover:bg-raised/80 hover:text-ink text-muted text-xs font-semibold min-h-[44px] transition"
            title="Inspect Coach Roster Portal"
          >
            <Users className="h-4 w-4 text-info" />
            <span className="hidden sm:inline">Coach Portal</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </button>

          {/* Quick Nav: Landing Page */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-line bg-raised hover:bg-raised/80 hover:text-ink text-muted text-xs font-semibold min-h-[44px] transition"
            title="Preview Public Landing Page"
          >
            <ExternalLink className="h-4 w-4 text-accent" />
            <span className="hidden sm:inline">Public Site</span>
          </button>

          {/* System Wipe / Fresh Start Button */}
          <button
            type="button"
            onClick={onOpenFreshStart}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-danger/30 bg-danger/10 hover:bg-danger/20 text-danger text-xs font-bold min-h-[44px] transition shadow-sm"
            title="Open Clean Slate Wipe"
          >
            <Trash2 className="h-4 w-4" />
            <span>Fresh Start</span>
          </button>

          {/* Admin User Chip */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-line bg-bg min-h-[44px]">
            <div className="h-7 w-7 rounded-full bg-accent/20 border border-accent/40 text-accent grid place-items-center font-bold text-xs shrink-0">
              <User className="h-3.5 w-3.5" />
            </div>
            <div className="text-left text-[11px] leading-tight pr-1 hidden md:block">
              <span className="font-bold text-ink block truncate max-w-[140px]">
                {user?.email || "admin@powerlift.ai"}
              </span>
              <span className="text-muted font-mono text-[10px]">Superadmin</span>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-line bg-raised hover:bg-danger/15 hover:border-danger/30 hover:text-danger text-muted text-xs font-bold min-h-[44px] transition"
            aria-label="Sign out of superadmin"
            title="Sign out of superadmin console"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Sport Switcher with Visual Divider */}
      <div className="pt-3 border-t border-line/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-muted uppercase tracking-wider text-[11px]">
            Active Governance Domain:
          </span>
          <span className="font-bold text-ink flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${isPl ? "bg-accent shadow-[0_0_8px_var(--accent)]" : "bg-accent shadow-[0_0_8px_var(--accent)]"}`} />
            {isPl ? "Powerlifting (SBD Engine · Wilks / DOTS / GL)" : "Bodybuilding (Hypertrophy Meso · Sparing & Diet)"}
          </span>
        </div>

        {/* Dual Sport Switcher */}
        <SportSwitcher activeSport={activeSport} onSelectSport={onSelectSport} />
      </div>
    </header>
  );
}
