import React, { useState } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  AlertTriangle, 
  ShieldCheck,
  Search
} from "lucide-react";
import { toast } from "sonner";
import Button from "../../ui/Button";

const MOCK_DATA = {
  pl: {
    coaches: [
      {
        id: "coach_1",
        name: "Coach Vikram Singh",
        email: "coach@powerlift.ai",
        credentials: "IPF Senior Coach · 840kg Total",
        capacity: 15,
        priceMonthly: "$79/mo",
        athletes: [
          { id: "ath_1", name: "Dev Patel", email: "dev.patel@gym.in", phase: "W6 SBD Peak", adherence: 94, lastActive: "Today", alert: null },
          { id: "ath_2", name: "Arjun Verma", email: "arjun.v@domain.com", phase: "W4 Deload", adherence: 72, lastActive: "3 days ago", alert: "Knee Pain (5/10)" },
          { id: "ath_3", name: "Rohan Malhotra", email: "rohan.lift@domain.com", phase: "W2 Intensification", adherence: 91, lastActive: "Yesterday", alert: null },
        ]
      },
      {
        id: "coach_2",
        name: "Coach Rajesh Rao",
        email: "rajesh.strength@gym.in",
        credentials: "State Powerlifting Champion",
        capacity: 10,
        priceMonthly: "$69/mo",
        athletes: [
          { id: "ath_4", name: "Sameer Joshi", email: "sameer.j@domain.com", phase: "W8 Realization", adherence: 88, lastActive: "Today", alert: null },
          { id: "ath_5", name: "Kavita Nair", email: "kavita.power@domain.com", phase: "W3 Volume Base", adherence: 96, lastActive: "Yesterday", alert: null },
        ]
      }
    ],
    unattachedAthletes: [
      { id: "ath_6", name: "Karan Johar", email: "karan.lifts@domain.com", disciplineDetails: "Squat 210 · Bench 140 · DL 250", adherence: 82, lastActive: "Yesterday", mode: "AI Self-Guided" },
      { id: "ath_7", name: "Manish Sharma", email: "manish.sbd@domain.com", disciplineDetails: "Squat 175 · Bench 115 · DL 210", adherence: 75, lastActive: "4 days ago", mode: "Looking for Coach" },
      { id: "ath_8", name: "Aditya Roy", email: "aditya.roy@domain.com", disciplineDetails: "Squat 190 · Bench 125 · DL 230", adherence: 95, lastActive: "Today", mode: "AI Self-Guided" }
    ]
  },
  bb: {
    coaches: [
      {
        id: "coach_3",
        name: "Coach Kabir Mehra",
        email: "kabir.physique@domain.com",
        credentials: "National Classic Physique Pro",
        capacity: 12,
        priceMonthly: "$89/mo",
        athletes: [
          { id: "ath_9", name: "Priya Sharma", email: "priya.fit@domain.com", phase: "12 Weeks Out (Prep)", adherence: 98, lastActive: "Today", alert: "Posing Photos Due" },
          { id: "ath_10", name: "Ananya Iyer", email: "ananya.bb@domain.com", phase: "Hypertrophy Meso 3", adherence: 89, lastActive: "2 days ago", alert: "Shoulder Fatigue" },
          { id: "ath_11", name: "Varun Dhawan", email: "varun.hyper@domain.com", phase: "Lean Recomp Meso 1", adherence: 93, lastActive: "Yesterday", alert: null }
        ]
      },
      {
        id: "coach_4",
        name: "Coach Neha Sen",
        email: "neha.npc@domain.com",
        credentials: "NPC Bikini Specialist",
        capacity: 10,
        priceMonthly: "$79/mo",
        athletes: [
          { id: "ath_12", name: "Tara Sutaria", email: "tara.fit@domain.com", phase: "8 Weeks Out (Prep)", adherence: 97, lastActive: "Today", alert: null },
          { id: "ath_13", name: "Rhea Kapoor", email: "rhea.b@domain.com", phase: "Reverse Diet Phase", adherence: 84, lastActive: "Yesterday", alert: null }
        ]
      }
    ],
    unattachedAthletes: [
      { id: "ath_14", name: "Siddharth Rao", email: "siddharth.bb@domain.com", disciplineDetails: "Men's Physique · Offseason Meso", adherence: 86, lastActive: "Today", mode: "AI Hypertrophy Engine" },
      { id: "ath_15", name: "Tanvi Shah", email: "tanvi.physique@domain.com", disciplineDetails: "Bikini Division · Looking for Coach", adherence: 91, lastActive: "Yesterday", mode: "Seeking Coach" }
    ]
  }
};

export default function CoachClientHierarchy({ sport = "pl" }) {
  const [expandedCoaches, setExpandedCoaches] = useState({ coach_1: true, coach_3: true });
  const [search, setSearch] = useState("");

  const isPl = sport === "pl";
  const data = MOCK_DATA[sport] || MOCK_DATA.pl;

  const toggleCoach = (id) => {
    setExpandedCoaches(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalClients = data.coaches.reduce((acc, c) => acc + c.athletes.length, 0);

  const filteredCoaches = data.coaches.filter((coach) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const coachMatch =
      coach.name.toLowerCase().includes(q) ||
      coach.email.toLowerCase().includes(q) ||
      coach.credentials.toLowerCase().includes(q);
    const athleteMatch = coach.athletes.some(
      (a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
    );
    return coachMatch || athleteMatch;
  });

  const filteredUnattached = data.unattachedAthletes.filter((ath) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      ath.name.toLowerCase().includes(q) ||
      ath.email.toLowerCase().includes(q) ||
      ath.disciplineDetails?.toLowerCase().includes(q)
    );
  });

  return (
    <div data-track={isPl ? "pl" : "bb"} className="space-y-6">
      {/* Hierarchy Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h2 className="num text-2xl font-bold text-ink flex items-center gap-2">
            <span>{isPl ? "Powerlifting" : "Bodybuilding"} Coaching Roster & Hierarchy</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Superadmin directory of verified coaches, linked clients, and independent {isPl ? "lifters" : "athletes"}.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-raised border border-line text-ink font-semibold">
            {data.coaches.length} Coaches
          </span>
          <span className="px-2.5 py-1 rounded-md bg-raised border border-line text-ink font-semibold">
            {totalClients} Coached Clients
          </span>
          <span className="px-2.5 py-1 rounded-md bg-raised border border-line text-muted">
            {data.unattachedAthletes.length} Unattached
          </span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter coaches, clients, or unattached lifters by name or email..."
          className="w-full bg-surface border border-line rounded-lg pl-10 pr-16 py-2.5 text-xs text-ink placeholder:text-muted focus:outline-none focus:border-accent transition"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-ink px-2 py-0.5"
          >
            Clear
          </button>
        )}
      </div>

      {/* 1. Coaches Tree with Expandable Clients */}
      <div className="space-y-4">
        <h3 className="num text-lg font-bold text-ink">
          Verified Coaches & Attached Athlete Rosters
        </h3>

        {filteredCoaches.length === 0 ? (
          <div className="rounded-xl border border-line bg-surface p-6 text-center text-xs text-muted">
            No coaches match "{search}".
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCoaches.map((coach) => {
              const isExpanded = !!expandedCoaches[coach.id];

              return (
                <div
                  key={coach.id}
                  className="rounded-xl border border-line bg-surface overflow-hidden shadow-sm transition"
                >
                  {/* Coach Header Card */}
                  <div 
                    onClick={() => toggleCoach(coach.id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-raised/40 transition"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="h-10 w-10 rounded-full border border-accent/40 bg-accent/15 text-accent grid place-items-center font-bold text-sm shrink-0">
                        {coach.name.replace(/^Coach\s+/i, "").charAt(0) || "C"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ink">{coach.name}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-ok/10 text-ok border border-ok/20 font-semibold flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> Verified
                          </span>
                        </div>
                        <span className="text-xs text-muted block mt-0.5">
                          {coach.email} · {coach.credentials}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right text-xs">
                        <span className="font-bold text-ink block">
                          {coach.athletes.length} / {coach.capacity} Capacity
                        </span>
                        <span className="text-muted">{coach.priceMonthly}</span>
                      </div>
                      <button
                        type="button"
                        className="p-1 rounded-lg text-muted hover:text-ink"
                        aria-label="Toggle clients list"
                      >
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Nested Athletes List */}
                  {isExpanded && (
                    <div className="border-t border-line bg-bg p-4 space-y-2">
                      <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-2">
                        Athletes Coached by {coach.name} ({coach.athletes.length})
                      </span>

                      <div className="divide-y divide-line rounded-lg border border-line bg-surface overflow-hidden">
                        {coach.athletes.map((ath) => (
                          <div key={ath.id} className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-ink">{ath.name}</span>
                                <span className="text-muted text-[11px]">({ath.email})</span>
                              </div>
                              <span className="text-muted block mt-0.5">
                                Phase: <span className="text-ink font-medium">{ath.phase}</span> · Last active: {ath.lastActive}
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5">
                              {ath.alert ? (
                                <span className="px-2 py-0.5 rounded bg-warn/10 text-warn border border-warn/30 text-[11px] font-semibold flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" /> {ath.alert}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-ok/10 text-ok border border-ok/30 text-[11px] font-semibold">
                                  {ath.adherence}% Adherence
                                </span>
                              )}
                              <Button 
                                variant="secondary" 
                                size="md" 
                                className="h-8 text-[11px] px-2.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.info(`Viewing training logs for ${ath.name} (${ath.email})`);
                                }}
                              >
                                View Logs
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Unattached / Independent Athletes in this Sport */}
      <div className="space-y-4 pt-4 border-t border-line">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="num text-lg font-bold text-ink">
              Unattached & Independent {isPl ? "Lifters" : "Athletes"} ({filteredUnattached.length})
            </h3>
            <p className="text-xs text-muted">Athletes training autonomously via AI algorithms without assigned coaches.</p>
          </div>
        </div>

        {filteredUnattached.length === 0 ? (
          <div className="rounded-xl border border-line bg-surface p-6 text-center text-xs text-muted">
            No unattached athletes match "{search}".
          </div>
        ) : (
          <div className="divide-y divide-line rounded-xl border border-line bg-surface overflow-hidden">
            {filteredUnattached.map((ath) => (
              <div key={ath.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink text-sm">{ath.name}</span>
                    <span className="px-2 py-0.5 rounded bg-raised border border-line text-muted font-mono text-[11px]">
                      {ath.mode}
                    </span>
                  </div>
                  <span className="text-muted block mt-1">
                    {ath.email} · {ath.disciplineDetails}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted">Adherence: <strong className="text-ink">{ath.adherence}%</strong></span>
                  <Button 
                    variant="primary" 
                    size="md" 
                    className="h-8 text-[11px] px-3 font-semibold min-h-[36px]"
                    onClick={() => toast.success(`Assign coach modal opened for ${ath.name}`)}
                  >
                    + Assign Coach
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
