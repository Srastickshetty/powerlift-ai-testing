import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { 
  CalendarDays, 
  Dumbbell, 
  LineChart, 
  MessageCircle, 
  User, 
  Users, 
  Inbox, 
  BookOpen, 
  CreditCard,
  WifiOff
} from "lucide-react";
import { useAuth } from "../../auth/authContext";
import { useOfflineSync } from "../../utils/offlineSyncManager";

/**
 * AppShell - Mobile-first responsive app container
 * Bottom tab bar on mobile/tablet (< 1024px)
 * Left rail navigation on desktop (>= 1024px)
 * Hidden in /workout/:id to ensure distraction-free gym logging
 */

const ATHLETE_TABS = [
  { to: "/today", label: "Today", Icon: Dumbbell },
  { to: "/program", label: "Program", Icon: CalendarDays },
  { to: "/progress", label: "Progress", Icon: LineChart },
  { to: "/coach", label: "Coach", Icon: MessageCircle, hasAlert: true },
  { to: "/me", label: "Me", Icon: User },
];

const COACH_TABS = [
  { to: "/roster", label: "Roster", Icon: Users },
  { to: "/inbox", label: "Inbox", Icon: Inbox, hasAlert: true },
  { to: "/coach-programs", label: "Programs", Icon: CalendarDays },
  { to: "/library", label: "Library", Icon: BookOpen },
  { to: "/billing", label: "Billing", Icon: CreditCard },
];

export default function AppShell() {
  const { user, profile } = useAuth();
  const { isOnline, pendingCount } = useOfflineSync();
  const location = useLocation();

  const isCoach = profile?.role === "coach" || profile?.email?.toLowerCase().includes("coach");
  const track = profile?.track === "bb" || profile?.pathway === "fitness" ? "bb" : "pl";
  const tabs = isCoach ? COACH_TABS : ATHLETE_TABS;

  const getLinkClasses = ({ isActive }) =>
    `flex flex-col lg:flex-row items-center gap-1 lg:gap-3 rounded-md px-2 py-2 lg:px-3 lg:py-3 text-[11px] lg:text-sm font-medium transition select-none relative
     ${isActive ? "text-accent lg:bg-raised font-bold" : "text-muted hover:text-ink hover:bg-surface/50"}`;

  return (
    <div className="min-h-dvh bg-bg text-ink lg:pl-60 font-sans" data-track={track}>
      {/* Desktop Navigation Rail (>= 1024px) */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-line bg-surface p-4 lg:flex z-30">
        <div className="num mb-6 text-2xl font-bold tracking-wide flex items-center justify-between">
          <span>POWERLIFT<span className="text-accent">AI</span></span>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-line bg-raised text-muted">
            {isCoach ? "Coach" : track.toUpperCase()}
          </span>
        </div>

        <nav className="flex flex-col gap-1.5" aria-label="Primary Navigation">
          {tabs.map(({ to, label, Icon, hasAlert }) => (
            <NavLink key={to} to={to} className={getLinkClasses}>
              <div className="relative">
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {hasAlert && !isCoach && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-accent" />
                )}
              </div>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User preview & quick status at bottom of rail */}
        <div className="mt-auto border-t border-line pt-4 flex items-center justify-between text-xs text-muted">
          <div className="truncate">
            <span className="text-ink font-semibold block truncate">{profile?.display_name || user?.email?.split('@')[0] || "Lifter"}</span>
            <span className="capitalize">{profile?.role || "Athlete"}</span>
          </div>
          <NavLink to="/me" className="p-2 hover:bg-raised rounded-md transition text-muted hover:text-ink" aria-label="Profile Settings">
            <User className="h-4 w-4" />
          </NavLink>
        </div>
      </aside>

      {/* Offline Status Banner */}
      {!isOnline && (
        <div role="status" className="bg-warn/15 border-b border-warn/30 px-4 py-2 text-center text-xs sm:text-sm text-warn font-semibold flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>Gym Mode: Offline — Your logs are saved locally and will sync when connection returns.</span>
          {pendingCount > 0 && <span className="bg-warn/30 px-2 py-0.5 rounded-full text-xs">({pendingCount} queued)</span>}
        </div>
      )}

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-screen-xl px-4 pb-28 pt-4 md:px-6 lg:px-8 lg:pb-10 pt-safe">
        <Outlet />
      </main>

      {/* Mobile/Tablet Bottom Navigation Bar (< 1024px) */}
      <nav 
        aria-label="Primary Mobile Navigation" 
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-surface/95 backdrop-blur pb-safe lg:hidden"
      >
        {tabs.map(({ to, label, Icon, hasAlert }) => (
          <NavLink key={to} to={to} className={getLinkClasses}>
            <div className="relative">
              <Icon className="h-6 w-6" aria-hidden="true" />
              {hasAlert && !isCoach && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent" />
              )}
            </div>
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
