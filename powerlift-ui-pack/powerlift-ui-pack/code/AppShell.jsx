import { NavLink, Outlet } from "react-router-dom";
import { CalendarDays, Dumbbell, LineChart, MessageCircle, User } from "lucide-react";

/** Responsive shell: bottom tabs < lg, left rail >= lg. Hide the bar in workout mode by rendering that route outside <AppShell/>. */
const TABS = [
  { to: "/today", label: "Today", Icon: Dumbbell },
  { to: "/program", label: "Program", Icon: CalendarDays },
  { to: "/progress", label: "Progress", Icon: LineChart },
  { to: "/coach", label: "Coach", Icon: MessageCircle },
  { to: "/me", label: "Me", Icon: User },
];
const link = ({ isActive }) =>
  `flex flex-col lg:flex-row items-center gap-1 lg:gap-3 rounded-md px-2 py-2 lg:px-3 lg:py-3 text-[11px] lg:text-sm font-medium transition
   ${isActive ? "text-accent lg:bg-raised" : "text-muted hover:text-ink"}`;

export default function AppShell({ track = "pl", offline = false }) {
  return (
    <div className="min-h-dvh bg-bg text-ink lg:pl-60" data-track={track}>
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-line bg-surface p-4 lg:flex">
        <div className="num mb-6 text-2xl font-bold tracking-wide">POWERLIFT<span className="text-accent">AI</span></div>
        <nav className="flex flex-col gap-1" aria-label="Primary">
          {TABS.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={link}><Icon className="h-5 w-5" aria-hidden />{label}</NavLink>
          ))}
        </nav>
      </aside>

      {offline && <div role="status" className="bg-warn/20 px-4 py-2 text-center text-sm text-warn">Offline — your sets are saved and will sync.</div>}

      <main className="mx-auto w-full max-w-screen-xl px-4 pb-28 pt-4 md:px-6 lg:px-8 lg:pb-10 pt-safe">
        <Outlet />
      </main>

      {/* Mobile/tablet bottom tabs */}
      <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-surface/95 backdrop-blur pb-safe lg:hidden">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className={link}><Icon className="h-6 w-6" aria-hidden />{label}</NavLink>
        ))}
      </nav>
    </div>
  );
}
/* Usage (router v6):
<Route element={<AppShell track={profile.track==='bodybuilding'?'bb':'pl'} />}>
  <Route path="/today" element={<Today/>} /> ... </Route>
<Route path="/workout/:id" element={<WorkoutMode/>} />   // outside the shell = full screen
Also set document.documentElement.dataset.track = 'pl' | 'bb' once the profile loads. */
