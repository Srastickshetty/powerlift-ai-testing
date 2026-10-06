import React, { useState, useMemo } from "react";
import { Search, Filter, AlertTriangle, Clock, ArrowUpDown, ChevronRight, User } from "lucide-react";
import Button from "../../ui/Button";

export default function CoachRosterTable({ athletes = [], onSelectAthlete }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // 'all' | 'attention' | 'checkin' | 'meet'
  const [sortBy, setSortBy] = useState("adherence"); // 'adherence' | 'recent' | 'name'

  const filteredAthletes = useMemo(() => {
    return athletes.filter((ath) => {
      const matchesSearch = ath.name?.toLowerCase().includes(search.toLowerCase()) ||
                            ath.email?.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (filter === "attention") return ath.hasPain || ath.adherence < 70;
      if (filter === "checkin") return ath.checkInDue;
      if (filter === "meet") return ath.meetWeeks !== null && ath.meetWeeks <= 8;
      return true;
    }).sort((a, b) => {
      if (sortBy === "adherence") return b.adherence - a.adherence;
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return new Date(b.lastSessionDate || 0) - new Date(a.lastSessionDate || 0);
    });
  }, [athletes, search, filter, sortBy]);

  return (
    <div className="space-y-4 font-sans">
      {/* Search and Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-4 rounded-xl border border-line">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search athletes by name or email..."
            className="w-full pl-9 pr-4 py-2 bg-bg border border-line rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Athletes" },
            { id: "attention", label: "Needs Attention" },
            { id: "checkin", label: "Check-In Due" },
            { id: "meet", label: "Meet < 8 Wks" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition ${
                filter === f.id
                  ? "border-accent bg-accent text-accent-ink shadow-sm"
                  : "border-line bg-bg text-muted hover:text-ink hover:bg-raised"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Roster Table (>= md) */}
      <div className="hidden md:block rounded-xl border border-line bg-surface overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-raised/80 sticky top-0 z-10 text-xs font-mono uppercase text-muted tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Status & Athlete</th>
              <th className="py-3.5 px-4">Track</th>
              <th className="py-3.5 px-4">Last Session</th>
              <th className="py-3.5 px-4 cursor-pointer" onClick={() => setSortBy(sortBy === "adherence" ? "name" : "adherence")}>
                <div className="flex items-center gap-1">
                  <span>Adherence</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3.5 px-4">Pain / Fatigue</th>
              <th className="py-3.5 px-4">Check-In</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filteredAthletes.map((ath) => (
              <tr
                key={ath.id}
                onClick={() => onSelectAthlete?.(ath)}
                className="hover:bg-raised/50 cursor-pointer transition"
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                        ath.hasPain
                          ? "bg-danger animate-pulse"
                          : ath.checkInDue
                          ? "bg-warn"
                          : "bg-ok"
                      }`}
                      title={ath.hasPain ? "Pain alert" : ath.checkInDue ? "Check-in due" : "On track"}
                    />
                    <div>
                      <span className="font-semibold text-ink block">{ath.name}</span>
                      <span className="text-xs text-muted block">{ath.email}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                      ath.track === "bb"
                        ? "border-[#19C3B1]/40 bg-[#19C3B1]/10 text-[#19C3B1]"
                        : "border-[#E5484D]/40 bg-[#E5484D]/10 text-[#E5484D]"
                    }`}
                  >
                    {ath.track === "bb" ? "BB" : "PL"}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-xs text-muted">
                  {ath.lastSession || "Yesterday"}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className="num font-bold text-ink">{ath.adherence}%</span>
                    <div className="w-16 bg-line h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${ath.adherence >= 80 ? "bg-ok" : "bg-warn"}`}
                        style={{ width: `${ath.adherence}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  {ath.hasPain ? (
                    <span className="inline-flex items-center gap-1 text-xs text-danger font-semibold bg-danger/10 border border-danger/20 px-2 py-0.5 rounded">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {ath.painArea} ({ath.painScore}/10)
                    </span>
                  ) : (
                    <span className="text-xs text-muted">None reported</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  {ath.checkInDue ? (
                    <span className="text-xs text-warn font-semibold bg-warn/10 border border-warn/20 px-2 py-0.5 rounded">
                      Due Today
                    </span>
                  ) : (
                    <span className="text-xs text-muted">Sunday</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Button variant="secondary" size="md" className="text-xs">
                    Review
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Roster Cards (< md) - Zero Horizontal Scrolling at 360px */}
      <div className="md:hidden space-y-3">
        {filteredAthletes.map((ath) => (
          <div
            key={ath.id}
            onClick={() => onSelectAthlete?.(ath)}
            className="rounded-xl border border-line bg-surface p-4 space-y-3 cursor-pointer hover:border-line/80 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                    ath.hasPain ? "bg-danger" : ath.checkInDue ? "bg-warn" : "bg-ok"
                  }`}
                />
                <div>
                  <span className="font-bold text-sm text-ink block">{ath.name}</span>
                  <span className="text-xs text-muted">{ath.email}</span>
                </div>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  ath.track === "bb"
                    ? "border-[#19C3B1]/40 bg-[#19C3B1]/10 text-[#19C3B1]"
                    : "border-[#E5484D]/40 bg-[#E5484D]/10 text-[#E5484D]"
                }`}
              >
                {ath.track === "bb" ? "BODYBUILDING" : "POWERLIFTING"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-y border-line py-2">
              <div>
                <span className="text-muted block">Adherence</span>
                <span className="num font-bold text-ink text-sm">{ath.adherence}%</span>
              </div>
              <div>
                <span className="text-muted block">Last Lift</span>
                <span className="text-ink">{ath.lastSession || "Yesterday"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              {ath.hasPain ? (
                <span className="text-danger font-semibold flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {ath.painArea} ({ath.painScore}/10)
                </span>
              ) : (
                <span className="text-muted">No pain flags</span>
              )}
              <div className="flex items-center gap-1 text-accent font-semibold">
                <span>View Details</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
