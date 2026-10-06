import React, { useState } from "react";
import { X, CheckCircle2, Dumbbell, Flame, Award, ArrowRight, ArrowLeft, Send, Sparkles } from "lucide-react";
import Button from "../../ui/Button";

const INITIAL_FORM = {
  name: "", email: "", phone: "", country: "United States", tracks: ["POWERLIFTING"],
  experienceYears: 4, priceMonthly: 99, capacity: 20,
  plFederation: "USAPL", plCoachedTotalKg: 750, plNationalAthletes: 3, plPeriodization: "RPE Auto-Regulation & Block Periodization",
  bbDivisions: "Classic Physique, Men's Physique", bbStageAthletes: 5, bbPeakWeekPhilosophy: "Carb backloading with electrolyte control",
  certifications: "CSCS, ISSA Specialist", athleticAchievements: "Former National lifter / 2x Regional medalist",
  bio: "Dedicated strength & physique coach with proven track record of podium finishes and long-term athlete development.",
  portfolioUrl: ""
};

export default function CoachApplicationModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const isPl = formData.tracks.includes("POWERLIFTING");
  const isBb = formData.tracks.includes("BODYBUILDING");

  const setTrackMode = (mode) => {
    if (mode === "both") setFormData((p) => ({ ...p, tracks: ["POWERLIFTING", "BODYBUILDING"] }));
    else if (mode === "pl") setFormData((p) => ({ ...p, tracks: ["POWERLIFTING"] }));
    else setFormData((p) => ({ ...p, tracks: ["BODYBUILDING"] }));
  };

  const handleNext = () => {
    setError("");
    if (step === 1 && (!formData.name.trim() || !formData.email.trim())) {
      setError("Please fill in your name and email.");
      return;
    }
    setStep((p) => p + 1);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      country: formData.country,
      bio: formData.bio.trim(),
      tracks: formData.tracks,
      experienceYears: Number(formData.experienceYears) || 1,
      capacity: Number(formData.capacity) || 20,
      priceMonthly: Number(formData.priceMonthly) || 89,
      certifications: formData.certifications.split(",").map((s) => s.trim()).filter(Boolean),
      athleticAchievements: formData.athleticAchievements.trim(),
      portfolioUrl: formData.portfolioUrl.trim(),
      plDetails: isPl ? {
        federation: formData.plFederation,
        coachedTotalKg: Number(formData.plCoachedTotalKg) || 0,
        nationalAthletesCount: Number(formData.plNationalAthletes) || 0,
        periodization: formData.plPeriodization
      } : undefined,
      bbDetails: isBb ? {
        divisions: formData.bbDivisions.split(",").map((s) => s.trim()).filter(Boolean),
        stageAthletesCount: Number(formData.bbStageAthletes) || 0,
        peakWeekPhilosophy: formData.bbPeakWeekPhilosophy
      } : undefined
    };

    try {
      const res = await fetch("/api/v1/coaches/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("API submit failed");
    } catch {
      // Local fallback for demo & offline inspection in Admin console
      const existing = JSON.parse(localStorage.getItem("pending_coach_applications") || "[]");
      existing.unshift({
        id: `coach_app_${Date.now()}`,
        name: payload.name,
        email: payload.email,
        tracks: payload.tracks,
        bio: payload.bio,
        priceMonthly: payload.priceMonthly,
        capacity: payload.capacity,
        applicationData: {
          phone: payload.phone,
          country: payload.country,
          certifications: payload.certifications,
          athleticAchievements: payload.athleticAchievements,
          experienceYears: payload.experienceYears,
          plDetails: payload.plDetails,
          bbDetails: payload.bbDetails,
          submittedAt: new Date().toISOString()
        },
        submittedAt: new Date().toISOString()
      });
      localStorage.setItem("pending_coach_applications", JSON.stringify(existing));
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="rounded-2xl border border-line bg-surface max-w-xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-line shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="num text-lg font-bold text-ink">Coach Onboarding Application</h2>
              <p className="text-xs text-muted">Join the vetted PowerLift AI coaching staff</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-muted hover:text-ink min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 overflow-y-auto space-y-4 text-xs pr-1 flex-1">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/40 text-accent flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="num text-xl font-bold text-ink">Application Submitted!</h3>
              <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-ink">{formData.name}</strong>. Your coaching credentials have been routed to the Superadmin Command Queue for vetting.
              </p>
              <div className="p-4 rounded-xl bg-raised border border-line text-left space-y-1">
                <div>Email: <span className="text-ink font-semibold">{formData.email}</span></div>
                <div>Discipline: <span className="text-accent font-semibold">{formData.tracks.join(" & ")}</span></div>
                <div>Status: <span className="text-warn font-semibold">Pending Superadmin Review</span></div>
              </div>
              <Button variant="primary" onClick={onClose} className="w-full mt-4">Close Window</Button>
            </div>
          ) : (
            <>
              {/* Step indicator */}
              <div className="flex items-center justify-between text-[11px] font-mono border-b border-line pb-3">
                <span className={step >= 1 ? "text-accent font-bold" : "text-muted"}>1. Discipline & Contact</span>
                <span className={step >= 2 ? "text-accent font-bold" : "text-muted"}>2. Sport Parameters</span>
                <span className={step >= 3 ? "text-accent font-bold" : "text-muted"}>3. Certs & Philosophy</span>
              </div>

              {error && <div className="p-2.5 rounded-lg bg-danger/10 border border-danger/30 text-danger">{error}</div>}

              {step === 1 && (
                <div className="space-y-3">
                  <label className="font-semibold text-ink block">Select Coaching Specialty</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => setTrackMode("pl")} className={`p-2.5 rounded-xl border text-center transition min-h-[48px] ${isPl && !isBb ? "border-accent bg-accent/15 text-accent font-bold" : "border-line bg-raised text-muted"}`}>
                      <Dumbbell className="w-4 h-4 mx-auto mb-1" /> Powerlifting
                    </button>
                    <button type="button" onClick={() => setTrackMode("bb")} className={`p-2.5 rounded-xl border text-center transition min-h-[48px] ${isBb && !isPl ? "border-accent bg-accent/15 text-accent font-bold" : "border-line bg-raised text-muted"}`}>
                      <Flame className="w-4 h-4 mx-auto mb-1" /> Bodybuilding
                    </button>
                    <button type="button" onClick={() => setTrackMode("both")} className={`p-2.5 rounded-xl border text-center transition min-h-[48px] ${isPl && isBb ? "border-accent bg-accent/15 text-accent font-bold" : "border-line bg-raised text-muted"}`}>
                      <Sparkles className="w-4 h-4 mx-auto mb-1" /> Both Tracks
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-muted block mb-1">Full Legal Name *</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Coach John Doe" className="w-full h-11 px-3 rounded-lg border border-line bg-bg text-ink text-base" required />
                    </div>
                    <div>
                      <label className="text-muted block mb-1">Email Address *</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="coach@domain.com" className="w-full h-11 px-3 rounded-lg border border-line bg-bg text-ink text-base" required />
                    </div>
                    <div>
                      <label className="text-muted block mb-1">Coaching Experience (Years)</label>
                      <input type="number" inputMode="numeric" value={formData.experienceYears} onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-line bg-bg text-ink text-base" />
                    </div>
                    <div>
                      <label className="text-muted block mb-1">Monthly Rate ($/mo)</label>
                      <input type="number" inputMode="numeric" value={formData.priceMonthly} onChange={(e) => setFormData({ ...formData, priceMonthly: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-line bg-bg text-ink text-base" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  {isPl && (
                    <div className="p-3 rounded-xl border border-line bg-raised/50 space-y-2.5">
                      <div className="flex items-center gap-1.5 font-bold text-accent"><Dumbbell className="w-4 h-4" /><span>Powerlifting Metrics</span></div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-muted block mb-1">Sanctioned Fed (USAPL/IPF/etc)</label>
                          <input type="text" value={formData.plFederation} onChange={(e) => setFormData({ ...formData, plFederation: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-line bg-bg text-ink text-base" />
                        </div>
                        <div>
                          <label className="text-muted block mb-1">Top Coached Total (kg)</label>
                          <input type="number" inputMode="numeric" value={formData.plCoachedTotalKg} onChange={(e) => setFormData({ ...formData, plCoachedTotalKg: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-line bg-bg text-ink text-base" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-muted block mb-1">Periodization System</label>
                          <input type="text" value={formData.plPeriodization} onChange={(e) => setFormData({ ...formData, plPeriodization: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-line bg-bg text-ink text-base" />
                        </div>
                      </div>
                    </div>
                  )}

                  {isBb && (
                    <div className="p-3 rounded-xl border border-line bg-raised/50 space-y-2.5">
                      <div className="flex items-center gap-1.5 font-bold text-accent"><Flame className="w-4 h-4" /><span>Bodybuilding & Contest Metrics</span></div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-muted block mb-1">Stage Athletes Prepped</label>
                          <input type="number" inputMode="numeric" value={formData.bbStageAthletes} onChange={(e) => setFormData({ ...formData, bbStageAthletes: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-line bg-bg text-ink text-base" />
                        </div>
                        <div>
                          <label className="text-muted block mb-1">Divisions Coached</label>
                          <input type="text" value={formData.bbDivisions} onChange={(e) => setFormData({ ...formData, bbDivisions: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-line bg-bg text-ink text-base" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-muted block mb-1">Peak Week Philosophy</label>
                          <input type="text" value={formData.bbPeakWeekPhilosophy} onChange={(e) => setFormData({ ...formData, bbPeakWeekPhilosophy: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-line bg-bg text-ink text-base" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <div>
                    <label className="text-muted block mb-1">Certifications (comma separated)</label>
                    <input type="text" value={formData.certifications} onChange={(e) => setFormData({ ...formData, certifications: e.target.value })} placeholder="CSCS, ISSA, NASM" className="w-full h-11 px-3 rounded-lg border border-line bg-bg text-ink text-base" />
                  </div>
                  <div>
                    <label className="text-muted block mb-1">Athletic & Coaching Achievements</label>
                    <input type="text" value={formData.athleticAchievements} onChange={(e) => setFormData({ ...formData, athleticAchievements: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-line bg-bg text-ink text-base" />
                  </div>
                  <div>
                    <label className="text-muted block mb-1">Coaching Bio & Methodology *</label>
                    <textarea rows={3} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="w-full p-3 rounded-lg border border-line bg-bg text-ink text-base" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!submitted && (
          <div className="pt-4 border-t border-line flex items-center justify-between shrink-0">
            {step > 1 ? (
              <Button variant="ghost" size="sm" onClick={() => setStep((p) => p - 1)} className="min-h-[44px]">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            ) : <div />}

            {step < 3 ? (
              <Button variant="primary" size="sm" onClick={handleNext} className="min-h-[44px]">
                Continue <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={handleSubmit} disabled={submitting} className="min-h-[44px]">
                {submitting ? "Transmitting..." : "Submit Application"}
                {!submitting && <Send className="w-4 h-4 ml-1.5" />}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
