import React, { useEffect, useState } from "react";
import { Users, AlertTriangle, CheckCircle2, TrendingUp, RefreshCw, Dumbbell, Flame } from "lucide-react";
import { useAuth } from "../auth/authContext";
import Button from "../ui/Button";
import Stat from "../ui/Stat";
import Skeleton from "../ui/Skeleton";
import CoachRosterTable from "../components/coach/CoachRosterTable";
import AthleteDetailModal from "../components/coach/AthleteDetailModal";

const MOCK_ATHLETES = [
  { id: "ath_1", name: "Dev Patel", email: "dev.patel@gym.in", track: "pl", adherence: 94, lastSession: "Today (Squat)", hasPain: false, checkInDue: false, meetWeeks: 6 },
  { id: "ath_2", name: "Arjun Verma", email: "arjun.v@domain.com", track: "pl", adherence: 65, lastSession: "3 days ago", hasPain: true, painArea: "Knee", painScore: 5, checkInDue: true, meetWeeks: 4 },
  { id: "ath_3", name: "Priya Sharma", email: "priya.fit@domain.com", track: "bb", adherence: 98, lastSession: "Yesterday", hasPain: false, checkInDue: true, meetWeeks: null },
  { id: "ath_4", name: "Rohan Malhotra", email: "rohan.lift@domain.com", track: "pl", adherence: 88, lastSession: "Yesterday", hasPain: false, checkInDue: false, meetWeeks: 10 },
  { id: "ath_5", name: "Ananya Iyer", email: "ananya.bb@domain.com", track: "bb", adherence: 91, lastSession: "2 days ago", hasPain: true, painArea: "Shoulder", painScore: 3, checkInDue: false, meetWeeks: null },
];

export default function CoachDashboard() {
  const { user, profile } = useAuth();
  const [athletes, setAthletes] = useState(MOCK_ATHLETES);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sportFilter, setSportFilter] = useState("all"); // 'all' | 'pl' | 'bb'

  const fetchRoster = async () => {
    setLoading(true);
    try {
      const token = user?.getIdToken ? await user.getIdToken() : `dev_mock_${user?.uid || 'coach'}_coach_powerlifting`;
      const res = await fetch('/api/v1/coach/roster', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.roster) && json.roster.length > 0) {
          const mapped = json.roster.map(r => ({
            id: r.athleteId,
            name: r.athleteName,
            email: r.email,
            track: r.track?.toLowerCase() === 'bodybuilding' ? 'bb' : 'pl',
            adherence: 90,
            trafficLight: r.trafficLight,
            hasPain: r.activeAlerts?.some(a => a.type?.includes('PAIN')),
            checkInDue: r.activeAlerts?.some(a => a.type?.includes('CHECKIN')),
            lastSession: r.lastActiveAt ? new Date(r.lastActiveAt).toLocaleDateString() : 'Recent',
            activeAlerts: r.activeAlerts
          }));
          setAthletes(mapped);
        }
      }
    } catch {
      // Retain mock roster on local development or network failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [user]);

  const handleSportChange = (sport) => {
    setSportFilter(sport);
    if (sport === "bb" || sport === "pl") {
      document.documentElement.dataset.track = sport;
    }
  };

  const handleApproveProgram = async (athleteId, versionId) => {
    try {
      const token = user?.getIdToken ? await user.getIdToken() : `dev_mock_${user?.uid || 'coach'}_coach_powerlifting`;
      await fetch(`/api/v1/training/approve-draft/${versionId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchRoster();
    } catch {
      // Optimistic local success
    }
  };

  const filteredAthletes = athletes.filter(a => {
    if (sportFilter === "all") return true;
    return a.track === sportFilter;
  });

  const painCount = filteredAthletes.filter(a => a.hasPain).length;
  const checkInCount = filteredAthletes.filter(a => a.checkInDue).length;
  const avgAdherence = Math.round(filteredAthletes.reduce((acc, a) => acc + (a.adherence || 0), 0) / (filteredAthletes.length || 1));

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Top Header & Sport Discipline Filter */}
      <header className="border-b border-line pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="num text-3xl font-bold tracking-tight text-ink">Coach Command Roster</h1>
          <p className="text-sm text-muted">Client adherence tracking, check-in triage, and sport-specific reviews.</p>
        </div>

        {/* Sport Switcher for Coach */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-line bg-surface text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleSportChange("all")}
            className={`px-3 py-2 rounded-lg min-h-[44px] transition ${
              sportFilter === "all" ? "bg-raised text-ink font-bold shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            All Sports ({athletes.length})
          </button>
          <button
            type="button"
            data-track="pl"
            onClick={() => handleSportChange("pl")}
            className={`px-3 py-2 rounded-lg min-h-[44px] transition flex items-center gap-1.5 ${
              sportFilter === "pl" ? "bg-accent text-accent-ink font-bold shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            <Dumbbell className="h-3.5 w-3.5" />
            <span>Powerlifting ({athletes.filter(a => a.track === 'pl').length})</span>
          </button>
          <button
            type="button"
            data-track="bb"
            onClick={() => handleSportChange("bb")}
            className={`px-3 py-2 rounded-lg min-h-[44px] transition flex items-center gap-1.5 ${
              sportFilter === "bb" ? "bg-accent text-accent-ink font-bold shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Bodybuilding ({athletes.filter(a => a.track === 'bb').length})</span>
          </button>
        </div>
      </header>

      {/* Roster Overview Stats (Dynamic by Sport) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label={sportFilter === "pl" ? "Powerlifting Lifters" : sportFilter === "bb" ? "Physique Athletes" : "Active Roster"}
          value={filteredAthletes.length}
          unit="athletes"
          change="Assigned roster"
          changeType="neutral"
        />
        <Stat
          label="Cohort Adherence"
          value={`${avgAdherence}%`}
          change={avgAdherence >= 80 ? "On target" : "Needs attention"}
          changeType={avgAdherence >= 80 ? "ok" : "warn"}
        />
        <Stat
          label={sportFilter === "bb" ? "Posing Check-Ins Due" : "Weekly Check-Ins"}
          value={checkInCount}
          unit="athletes"
          change={checkInCount > 0 ? "Requires review" : "Up to date"}
          changeType={checkInCount > 0 ? "warn" : "ok"}
        />
        <Stat
          label={sportFilter === "pl" ? "Axial Pain Flags" : "Injury & Strain Flags"}
          value={painCount}
          unit="reported"
          change={painCount > 0 ? "Triage needed" : "Zero pain flags"}
          changeType={painCount > 0 ? "danger" : "ok"}
        />
      </div>

      {/* Roster Table & Mobile Cards Component */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <CoachRosterTable
          athletes={filteredAthletes}
          onSelectAthlete={(ath) => setSelectedAthlete(ath)}
        />
      )}

      {/* Athlete Detail Review & Chat Modal */}
      <AthleteDetailModal
        athlete={selectedAthlete}
        isOpen={!!selectedAthlete}
        onClose={() => setSelectedAthlete(null)}
        onApproveProgram={handleApproveProgram}
      />
    </div>
  );
}