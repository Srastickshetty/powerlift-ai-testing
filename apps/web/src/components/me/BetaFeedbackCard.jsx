import React, { useState } from "react";
import { MessageSquarePlus, AlertOctagon, Check, Send } from "lucide-react";
import Button from "../../ui/Button";

export default function BetaFeedbackCard({ user }) {
  const [severity, setSeverity] = useState("NORMAL");
  const [category, setCategory] = useState("WORKOUT_LOGGING");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successStatus, setSuccessStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || message.length < 3) {
      setErrorMessage("Please enter at least 3 characters.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessStatus(null);

    try {
      const token = user?.getIdToken
        ? await user.getIdToken()
        : `dev_mock_${user?.uid || "ath"}_athlete_powerlifting`;

      const deviceInfo = {
        platform: navigator.platform || "unknown",
        userAgent: navigator.userAgent || "unknown",
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight
      };

      const res = await fetch("/api/v1/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          severity,
          category,
          message: message.trim(),
          deviceInfo
        })
      });

      if (res.ok) {
        setSuccessStatus("Feedback successfully submitted. Thank you for testing the beta!");
        setMessage("");
        setSeverity("NORMAL");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || "Submission failed. Please try again.");
      }
    } catch {
      setErrorMessage("Network error while submitting feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
          <MessageSquarePlus className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-text text-base">Beta Program Feedback</h3>
          <p className="text-xs text-muted">
            Report bugs, suggest improvements, or flag critical workout crashes directly to engineers.
          </p>
        </div>
      </div>

      {successStatus && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successStatus}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-2.5 py-2 text-xs text-text focus:outline-none focus:border-accent min-h-[44px]"
            >
              <option value="NORMAL">Normal / Suggestion</option>
              <option value="SEV2">Sev-2 (Degraded UX)</option>
              <option value="SEV1">Sev-1 (Workout Crash / Data Loss)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-2.5 py-2 text-xs text-text focus:outline-none focus:border-accent min-h-[44px]"
            >
              <option value="WORKOUT_LOGGING">Workout Logging</option>
              <option value="ENGINE">Calculation Engine</option>
              <option value="UI_UX">Design & Layout</option>
              <option value="COACHING">Coaching & Messaging</option>
              <option value="BILLING">Billing & Account</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted mb-1">Details</label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe what occurred, steps to reproduce, or suggestions..."
            className="w-full bg-surface border border-border rounded-lg p-2.5 text-xs text-text focus:outline-none focus:border-accent placeholder:text-muted/60"
            required
          />
        </div>

        {severity === "SEV1" && (
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Sev-1 Notice:</strong> This will trigger an immediate high-priority triage alert in our engineering monitoring queue.
            </span>
          </div>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[44px] flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {submitting ? "Transmitting Feedback..." : "Submit Feedback"}
        </Button>
      </form>
    </div>
  );
}
