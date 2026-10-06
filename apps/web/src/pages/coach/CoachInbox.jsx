import React, { useState } from "react";
import { Inbox, CheckCircle, RefreshCw, Eye } from "lucide-react";
import Button from "../../ui/Button";
import EmptyState from "../../ui/EmptyState";
import Skeleton from "../../ui/Skeleton";
import InboxReviewModal from "../../components/coach/InboxReviewModal";

const INITIAL_SUBMISSIONS = [
  { 
    id: 1, 
    name: "Arjun Verma", 
    track: "Powerlifting", 
    time: "2 hrs ago", 
    alert: "Needs Peaking Adjustment",
    phase: "W4 Deload & Peaking",
    adherence: 91,
    soreness: 5,
    details: "Knee discomfort during squat backoffs. Requesting accessory deload and 2.5kg lighter top single for next microcycle.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  },
  { 
    id: 2, 
    name: "Priya Sharma", 
    track: "Bodybuilding", 
    time: "5 hrs ago", 
    alert: "Check-in Photos & Video Attached",
    phase: "W8 Contest Prep Meso",
    adherence: 98,
    soreness: 2,
    details: "Morning fasted physique check-in and mandatories video attached. Weight down 0.4kg this week, requesting macro adjustment.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  },
  { 
    id: 3, 
    name: "Dev Patel", 
    track: "Powerlifting", 
    time: "1 day ago", 
    alert: "Reported Knee Fatigue (Score 4)",
    phase: "W6 SBD Peak",
    adherence: 95,
    soreness: 4,
    details: "SBD simulation felt great on bench and deadlift, but squat speed was slightly sluggish on opener jump. Video attached for depth check.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
  },
];

export default function CoachInbox() {
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleApproveSubmission = (id, coachNotes) => {
    setSubmissions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRequestChanges = (id, coachNotes) => {
    setSubmissions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReset = () => {
    setLoading(true);
    setTimeout(() => {
      setSubmissions(INITIAL_SUBMISSIONS);
      setLoading(false);
    }, 300);
  };

  return (
    <div className="space-y-6 font-sans">
      <header className="border-b border-line pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="num text-3xl font-bold tracking-tight text-ink">Coach Inbox & Check-Ins</h1>
          <p className="text-sm text-muted">Review athlete requests, assess progress & videos, and approve adjustments.</p>
        </div>
        <div className="flex items-center gap-2">
          {submissions.length === 0 && (
            <Button variant="secondary" size="md" onClick={handleReset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>Reset Sample Submissions</span>
            </Button>
          )}
        </div>
      </header>

      <div className="rounded-xl border border-line bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="num text-xl font-bold text-ink">
            Pending Athlete Submissions ({submissions.length})
          </h2>
        </div>

        {loading ? (
          <Skeleton.SetRow count={3} />
        ) : submissions.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Inbox Zero: All Submissions Handled"
            description="You have thoroughly reviewed and approved all pending athlete check-ins for this cycle."
            actionLabel="Reset Sample Submissions"
            onAction={handleReset}
          />
        ) : (
          <div className="divide-y divide-line rounded-lg border border-line bg-bg">
            {submissions.map((item) => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink text-sm">{item.name}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-line text-muted">
                      {item.track}
                    </span>
                  </div>
                  <span className="text-muted block mt-1">Submitted {item.time} · {item.phase}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-warn/10 text-warn border border-warn/30">
                    {item.alert}
                  </span>
                  <Button 
                    variant="primary" 
                    size="md" 
                    onClick={() => setSelectedSubmission(item)}
                    className="gap-1.5 min-h-[44px]"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Review & Approve</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <InboxReviewModal
        submission={selectedSubmission}
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        onApprove={handleApproveSubmission}
        onRequestChanges={handleRequestChanges}
      />
    </div>
  );
}
