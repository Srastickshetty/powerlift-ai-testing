import React, { useState } from "react";
import { Inbox, CheckCircle, RefreshCw } from "lucide-react";
import Button from "../../ui/Button";
import EmptyState from "../../ui/EmptyState";
import Skeleton from "../../ui/Skeleton";

const INITIAL_SUBMISSIONS = [
  { id: 1, name: "Arjun Verma", track: "Powerlifting", time: "2 hrs ago", alert: "Needs Peaking Adjustment" },
  { id: 2, name: "Priya Sharma", track: "Bodybuilding", time: "5 hrs ago", alert: "Check-in Photos Attached" },
  { id: 3, name: "Dev Patel", track: "Powerlifting", time: "1 day ago", alert: "Reported Knee Fatigue (Score 4)" },
];

export default function CoachInbox() {
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [loading, setLoading] = useState(false);

  const handleReview = (id) => {
    setSubmissions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReset = () => {
    setLoading(true);
    setTimeout(() => {
      setSubmissions(INITIAL_SUBMISSIONS);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <header className="border-b border-line pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="num text-3xl font-bold tracking-tight text-ink">Coach Inbox & Check-Ins</h1>
          <p className="text-sm text-muted">Weekly submissions, form video reviews, and athlete messages.</p>
        </div>
        <div className="flex items-center gap-2">
          {submissions.length === 0 && (
            <Button variant="secondary" size="md" onClick={handleReset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>Reset Demo Inbox</span>
            </Button>
          )}
          <Button variant="primary" size="md">Broadcast Message</Button>
        </div>
      </header>

      <div className="rounded-xl border border-line bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="num text-xl font-bold text-ink">
            Pending Submissions ({submissions.length})
          </h2>
        </div>

        {loading ? (
          <Skeleton.SetRow count={3} />
        ) : submissions.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Inbox Zero: All Athletes Handled"
            description="You have reviewed all pending check-ins and video submissions for this cycle."
            actionLabel="Reset Sample Submissions"
            onAction={handleReset}
          />
        ) : (
          <div className="divide-y divide-line rounded-lg border border-line bg-bg">
            {submissions.map((item) => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-semibold text-ink block">{item.name}</span>
                  <span className="text-xs text-muted">{item.track} · {item.time}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-warn/10 text-warn border border-warn/30">
                    {item.alert}
                  </span>
                  <Button variant="secondary" size="md" onClick={() => handleReview(item.id)}>
                    Approve / Review
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
