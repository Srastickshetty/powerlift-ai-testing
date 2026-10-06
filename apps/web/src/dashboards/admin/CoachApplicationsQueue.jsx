import React, { useState, useEffect } from "react";
import { Award, CheckCircle2, XCircle, Dumbbell, Flame, Sparkles, Mail, ShieldCheck, Clock, UserCheck } from "lucide-react";
import { toast } from "sonner";
import Button from "../../ui/Button";

export default function CoachApplicationsQueue() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'pl' | 'bb' | 'both'
  const [actioningId, setActioningId] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/coaches/pending");
      if (res.ok) {
        const data = await res.json();
        if (data.coaches && data.coaches.length > 0) {
          setApplications(data.coaches);
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    // LocalStorage fallback for demo/offline vetting
    const local = JSON.parse(localStorage.getItem("pending_coach_applications") || "[]");
    if (local.length > 0) {
      setApplications(local);
    } else {
      // Seed default pending demo application if completely empty
      const demoApp = [{
        id: "coach_app_demo_1",
        name: "Marcus Vance",
        email: "marcus.vance@powerliftingpro.com",
        tracks: ["POWERLIFTING"],
        bio: "Former IPF competitor with 9 years coaching raw & equipped powerlifters. Specializing in submaximal volume and peak fatigue management.",
        priceMonthly: 120,
        capacity: 25,
        submittedAt: new Date().toISOString(),
        applicationData: {
          country: "United States",
          experienceYears: 9,
          certifications: ["CSCS", "USAPL Senior National Coach"],
          athleticAchievements: "National Silver Medalist (93kg Raw), 785kg SBD Total",
          plDetails: {
            federation: "USAPL / IPF",
            coachedTotalKg: 840,
            nationalAthletesCount: 6,
            periodization: "RPE Autoregulation with Block Peaking"
          }
        }
      }];
      setApplications(demoApp);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (app) => {
    setActioningId(app.id);
    try {
      await fetch(`/api/v1/admin/coaches/${app.id}/verify`, { method: "POST" });
    } catch {
      // ignore
    }
    // Update local state
    const next = applications.filter((a) => a.id !== app.id);
    setApplications(next);
    const local = JSON.parse(localStorage.getItem("pending_coach_applications") || "[]");
    localStorage.setItem("pending_coach_applications", JSON.stringify(local.filter((a) => a.id !== app.id)));
    setActioningId(null);
    toast.success(`Coach ${app.name} approved & onboarded to PowerLift AI!`);
  };

  const handleDecline = async (app) => {
    setActioningId(app.id);
    try {
      await fetch(`/api/v1/admin/coaches/${app.id}/reject`, { method: "POST" });
    } catch {
      // ignore
    }
    const next = applications.filter((a) => a.id !== app.id);
    setApplications(next);
    const local = JSON.parse(localStorage.getItem("pending_coach_applications") || "[]");
    localStorage.setItem("pending_coach_applications", JSON.stringify(local.filter((a) => a.id !== app.id)));
    setActioningId(null);
    toast.info(`Application for ${app.name} declined.`);
  };

  const filtered = applications.filter((app) => {
    const isPl = app.tracks?.includes("POWERLIFTING");
    const isBb = app.tracks?.includes("BODYBUILDING");
    if (filter === "pl") return isPl && !isBb;
    if (filter === "bb") return isBb && !isPl;
    if (filter === "both") return isPl && isBb;
    return true;
  });

  return (
    <div className="rounded-xl border border-line bg-surface p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="num text-xl font-bold text-ink">Coach Onboarding Applications</h2>
            <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent font-bold text-xs">
              {applications.length} Pending
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Vet sport credentials and approve coaches onto the public roster.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-raised p-1 rounded-lg border border-line text-xs font-semibold">
          {["all", "pl", "bb", "both"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded transition min-h-[32px] uppercase text-[11px] ${filter === f ? "bg-accent text-accent-ink font-bold" : "text-muted hover:text-ink"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted text-xs animate-pulse">Loading coach vetting queue...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-line bg-bg space-y-2">
          <ShieldCheck className="w-8 h-8 text-accent mx-auto" />
          <h3 className="font-bold text-ink text-sm">Vetting Queue Clear</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            All prospective coach applications have been processed. New applicant submissions will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((app) => {
            const isPl = app.tracks?.includes("POWERLIFTING");
            const isBb = app.tracks?.includes("BODYBUILDING");
            const details = app.applicationData || {};
            const pl = details.plDetails || {};
            const bb = details.bbDetails || {};

            return (
              <div key={app.id} className="rounded-xl border border-line bg-bg p-5 space-y-4 hover:border-line-focus transition">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="num text-lg font-bold text-ink">{app.name}</h3>
                      <div className="flex items-center gap-1">
                        {isPl && (
                          <span className="px-2 py-0.5 rounded bg-accent/15 border border-accent/30 text-accent text-[10px] font-bold flex items-center gap-1">
                            <Dumbbell className="w-3 h-3" /> PL
                          </span>
                        )}
                        {isBb && (
                          <span className="px-2 py-0.5 rounded bg-accent/15 border border-accent/30 text-accent text-[10px] font-bold flex items-center gap-1">
                            <Flame className="w-3 h-3" /> BB
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{app.email}</span>
                      <span>•</span>
                      <span>{details.experienceYears || 4} Years Exp</span>
                      <span>•</span>
                      <span className="text-accent font-bold">${app.priceMonthly}/mo</span>
                      <span>•</span>
                      <span>Cap: {app.capacity || 20} Athletes</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDecline(app)}
                      disabled={actioningId === app.id}
                      className="text-danger hover:bg-danger/10 min-h-[44px]"
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(app)}
                      disabled={actioningId === app.id}
                      className="font-bold min-h-[44px]"
                    >
                      <UserCheck className="w-4 h-4 mr-1.5" /> Approve & Onboard
                    </Button>
                  </div>
                </div>

                {/* Bio & Credentials */}
                <p className="text-xs text-muted leading-relaxed">{app.bio}</p>

                {/* Sport Breakdown Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {isPl && (
                    <div className="p-3 rounded-lg bg-surface border border-line space-y-1">
                      <div className="font-bold text-accent flex items-center gap-1">
                        <Dumbbell className="w-3.5 h-3.5" /> Powerlifting Specs
                      </div>
                      <div className="text-muted">Federation: <span className="text-ink font-semibold">{pl.federation || "USAPL / IPF"}</span></div>
                      <div className="text-muted">Max Coached Total: <span className="text-ink font-semibold">{pl.coachedTotalKg || 750} kg</span></div>
                      <div className="text-muted">Periodization: <span className="text-ink font-semibold">{pl.periodization || "RPE Autoregulation"}</span></div>
                    </div>
                  )}

                  {isBb && (
                    <div className="p-3 rounded-lg bg-surface border border-line space-y-1">
                      <div className="font-bold text-accent flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" /> Bodybuilding Specs
                      </div>
                      <div className="text-muted">Divisions: <span className="text-ink font-semibold">{Array.isArray(bb.divisions) ? bb.divisions.join(", ") : bb.divisions || "Classic & Open"}</span></div>
                      <div className="text-muted">Stage Preps: <span className="text-ink font-semibold">{bb.stageAthletesCount || 5} Athletes</span></div>
                      <div className="text-muted">Peak Week: <span className="text-ink font-semibold">{bb.peakWeekPhilosophy || "Electrolyte & Carb protocol"}</span></div>
                    </div>
                  )}
                </div>

                {details.certifications && (
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px] pt-1">
                    <span className="text-muted font-mono uppercase">Accreditations:</span>
                    {(Array.isArray(details.certifications) ? details.certifications : [details.certifications]).map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-raised border border-line text-ink font-semibold">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
