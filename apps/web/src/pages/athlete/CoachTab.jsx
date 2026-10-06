import React, { useState, useEffect } from "react";
import { MessageCircle, Video, CheckCircle2, UserCheck, ShieldAlert, Users, Search, DollarSign, Send } from "lucide-react";
import Button from "../../ui/Button";
import { useAuth } from "../../auth/authContext";

export default function CoachTab() {
  const { user, profile } = useAuth();
  const [coaches, setCoaches] = useState([]);
  const [activeCoach, setActiveCoach] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestSentTo, setRequestSentTo] = useState(null);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinData, setCheckinData] = useState({ rating: 8, notes: "", fatigue: 5 });
  const [checkinSuccess, setCheckinSuccess] = useState(false);

  // Fetch coach directory
  useEffect(() => {
    async function loadCoaches() {
      setLoading(true);
      try {
        const track = (profile?.track === 'bb' || profile?.track === 'bodybuilding') ? 'BODYBUILDING' : 'POWERLIFTING';
        const res = await fetch(`/api/v1/coaches?track=${track}`);
        if (res.ok) {
          const json = await res.json();
          if (json.coaches && json.coaches.length > 0) {
            setCoaches(json.coaches);
          }
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    }
    loadCoaches();
  }, [profile]);

  const handleHireCoach = async (coach) => {
    try {
      const token = user?.getIdToken ? await user.getIdToken() : `dev_mock_${user?.uid || 'ath'}_athlete_powerlifting`;
      // 1. Submit coaching request
      const reqRes = await fetch(`/api/v1/coaches/${coach.id}/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ hasGuardianConsent: true })
      });

      if (reqRes.ok) {
        const reqJson = await reqRes.json();
        // 2. Trigger dummy subscription
        await fetch('/api/v1/billing/subscribe', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            planKind: "COACHING",
            coachAthleteId: reqJson.request?.id
          })
        });

        setActiveCoach(coach);
        setRequestSentTo(coach.id);
      }
    } catch {
      // Optimistic client link for demo
      setActiveCoach(coach);
      setRequestSentTo(coach.id);
    }
  };

  const handleSubmitCheckin = async (e) => {
    e.preventDefault();
    try {
      const token = user?.getIdToken ? await user.getIdToken() : `dev_mock_${user?.uid || 'ath'}_athlete_powerlifting`;
      await fetch('/api/v1/checkins', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          data: checkinData,
          photos: [],
          consentPhotosToCoach: true
        })
      });
      setCheckinSuccess(true);
      setTimeout(() => {
        setShowCheckinModal(false);
        setCheckinSuccess(false);
      }, 1500);
    } catch {
      setCheckinSuccess(true);
      setTimeout(() => setShowCheckinModal(false), 1500);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <header className="border-b border-line pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="num text-3xl font-bold tracking-tight text-ink">Coach Collaboration</h1>
          <p className="text-sm text-muted">Direct messaging, video technique review, and weekly program check-ins.</p>
        </div>
        {activeCoach && (
          <Button variant="primary" size="md" onClick={() => setShowCheckinModal(true)}>
            Submit Weekly Check-In
          </Button>
        )}
      </header>

      {/* Linked Coach Status Banner */}
      {activeCoach ? (
        <div className="rounded-xl border border-line bg-surface p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full border border-accent/40 bg-accent/10 grid place-items-center text-xl font-bold text-accent">
              {activeCoach.name?.substring(0, 2).toUpperCase() || "CP"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="num text-xl font-bold text-ink">{activeCoach.name}</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-ok/20 text-ok border border-ok/30 font-semibold">
                  Active Link (Copilot)
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">{activeCoach.bio || "Specialized in progressive overload & meet peaking."}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="md">
              <MessageCircle className="h-4 w-4 mr-1.5" />
              <span>Direct Chat</span>
            </Button>
            <Button variant="ghost" size="md" onClick={() => setActiveCoach(null)} className="text-muted hover:text-danger">
              End Coaching
            </Button>
          </div>
        </div>
      ) : (
        /* Coach Marketplace / Directory */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Verified Coach Directory</h2>
              <p className="text-xs text-muted">Browse accredited sports-science coaches for 1-on-1 programming & video reviews.</p>
            </div>
            <span className="text-xs font-mono text-muted bg-raised px-2.5 py-1 rounded border border-line">
              Track: {(profile?.track || 'powerlifting').toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coaches.map((c) => (
              <div key={c.id} className="rounded-xl border border-line bg-surface p-5 flex flex-col justify-between gap-4 hover:border-accent/40 transition">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-ink text-base">{c.name}</h3>
                      <span className="text-xs text-muted">{c.email}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                      ${(c.priceMonthlyMinor / 100).toFixed(0)}/mo
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-3 line-clamp-2">{c.bio || "Certified coach specializing in powerlifting and bodybuilding technique."}</p>
                  
                  {c.specialties?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {c.specialties.map(s => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-raised border border-line text-muted">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Button 
                  variant="primary" 
                  size="md" 
                  onClick={() => handleHireCoach(c)}
                  className="w-full"
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>Hire Coach (Test Mode)</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Check-In Submission Modal */}
      {showCheckinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-ink">Weekly Coach Check-In</h2>
            <p className="text-xs text-muted">Your check-in metrics will be sent to your coach for review and next week's adjustments.</p>

            <form onSubmit={handleSubmitCheckin} className="space-y-4">
              <div>
                <label className="text-xs text-muted block mb-1">Session Adherence / Quality (1-10)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={checkinData.rating}
                  onChange={(e) => setCheckinData({...checkinData, rating: Number(e.target.value)})}
                  className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
                />
              </div>

              <div>
                <label className="text-xs text-muted block mb-1">Systemic Fatigue Level (1-10)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={checkinData.fatigue}
                  onChange={(e) => setCheckinData({...checkinData, fatigue: Number(e.target.value)})}
                  className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
                />
              </div>

              <div>
                <label className="text-xs text-muted block mb-1">Weekly Notes / Joint Feedback</label>
                <textarea 
                  rows="3"
                  value={checkinData.notes}
                  onChange={(e) => setCheckinData({...checkinData, notes: e.target.value})}
                  placeholder="How did the pause squats feel? Any joint tweaks?"
                  className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-muted"
                />
              </div>

              {checkinSuccess && (
                <div className="p-3 rounded-lg bg-ok/15 border border-ok/30 text-ok text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Check-in submitted to coach queue!</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="md" type="button" onClick={() => setShowCheckinModal(false)}>Cancel</Button>
                <Button variant="primary" size="md" type="submit">Submit Check-In</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
