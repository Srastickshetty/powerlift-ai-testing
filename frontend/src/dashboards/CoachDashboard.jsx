import React, { useEffect, useState } from "react";
import { Users, AlertTriangle, CheckCircle2, TrendingUp, RefreshCw } from "lucide-react";
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

  const adminUid = user?.uid || "coach_primary";

  const fetchRoster = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.PROD 
        ? "https://powerlift-ai-backend.onrender.com"
        : "http://localhost:5001";
      const res = await fetch(`${apiUrl}/api/coach/athletes/${adminUid}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAthletes(data);
        }
      }
    } catch (err) {
      // Retain mock roster on local development or network failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [adminUid]);

  const handleApproveProgram = async (athleteId) => {
    try {
      const apiUrl = import.meta.env.PROD 
        ? "https://powerlift-ai-backend.onrender.com"
        : "http://localhost:5001";
      await fetch(`${apiUrl}/api/coach/programs/${athleteId}/approve`, { method: "POST" });
    } catch (err) {
      // Optimistic local success
    }
  };

  const painCount = athletes.filter(a => a.hasPain).length;
  const checkInCount = athletes.filter(a => a.checkInDue).length;
  const avgAdherence = Math.round(athletes.reduce((acc, a) => acc + (a.adherence || 0), 0) / (athletes.length || 1));

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Top Header */}
      <header className="border-b border-line pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="num text-3xl font-bold tracking-tight text-ink">Coach Command Roster</h1>
          <p className="text-sm text-muted">Client adherence tracking, check-in triage, and program reviews.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" onClick={fetchRoster}>
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Roster</span>
          </Button>
        </div>
      </header>

      {/* Roster Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Active Athletes"
          value={athletes.length}
          unit="lifters"
          change="Full roster"
          changeType="neutral"
        />
        <Stat
          label="Team Adherence"
          value={`${avgAdherence}%`}
          change={avgAdherence >= 80 ? "On target" : "Needs attention"}
          changeType={avgAdherence >= 80 ? "ok" : "warn"}
        />
        <Stat
          label="Check-Ins Due"
          value={checkInCount}
          unit="athletes"
          change={checkInCount > 0 ? "Requires review" : "Up to date"}
          changeType={checkInCount > 0 ? "warn" : "ok"}
        />
        <Stat
          label="Pain Alerts"
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
          athletes={athletes}
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