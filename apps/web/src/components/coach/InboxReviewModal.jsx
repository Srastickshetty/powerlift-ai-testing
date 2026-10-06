import React, { useState } from "react";
import { X, CheckCircle2, AlertTriangle, Video, Play, Send, Calendar, Clock, ArrowRight } from "lucide-react";
import Button from "../../ui/Button";
import VideoPlayerModal from "./VideoPlayerModal";
import { toast } from "sonner";

export default function InboxReviewModal({ submission, isOpen, onClose, onApprove, onRequestChanges }) {
  const [coachNotes, setCoachNotes] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);

  if (!isOpen || !submission) return null;

  const handleApprove = () => {
    onApprove(submission.id, coachNotes);
    toast.success(`Submission approved and adjustments applied for ${submission.name}!`);
    onClose();
  };

  const handleRequestChanges = () => {
    if (!coachNotes.trim()) {
      toast.error("Please add a coaching cue or explanation before requesting modifications.");
      return;
    }
    onRequestChanges?.(submission.id, coachNotes);
    toast.info(`Feedback sent back to ${submission.name}.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-6 font-sans">
      <div className="w-full max-w-2xl rounded-2xl border border-line bg-surface flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between bg-raised/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border border-line bg-bg grid place-items-center font-bold text-accent">
              {submission.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-ink">{submission.name}</h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-raised border border-line text-muted">
                  {submission.track}
                </span>
              </div>
              <span className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                <Clock className="h-3 w-3" />
                Submitted {submission.time}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-raised transition"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* 1. What was requested */}
          <div className="rounded-xl border border-warn/30 bg-warn/10 p-4 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-warn text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Athlete Action Request: {submission.alert}</span>
            </div>
            <p className="text-ink leading-relaxed">
              "{submission.details || `${submission.name} completed the scheduled microcycle and submitted training telemetry requesting coach review before proceeding to the next block.`}"
            </p>
          </div>

          {/* 2. Current Progress & Program Telemetry */}
          <div className="space-y-2">
            <span className="font-bold text-muted uppercase tracking-wider text-[11px] block">
              Current Progress & Program Context
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-lg border border-line bg-bg">
                <span className="text-muted block text-[11px]">Training Phase</span>
                <span className="font-bold text-ink text-sm block mt-0.5">
                  {submission.phase || "W4 Accumulation"}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-line bg-bg">
                <span className="text-muted block text-[11px]">Adherence Rate</span>
                <span className="font-bold text-ok text-sm block mt-0.5">
                  {submission.adherence || 92}%
                </span>
              </div>
              <div className="p-3 rounded-lg border border-line bg-bg">
                <span className="text-muted block text-[11px]">Weekly Sessions</span>
                <span className="font-bold text-ink text-sm block mt-0.5">4 of 4 Completed</span>
              </div>
              <div className="p-3 rounded-lg border border-line bg-bg">
                <span className="text-muted block text-[11px]">Soreness Index</span>
                <span className={`font-bold text-sm block mt-0.5 ${
                  (submission.soreness || 3) > 3 ? "text-warn" : "text-ok"
                }`}>
                  {submission.soreness || 3}/10
                </span>
              </div>
            </div>
          </div>

          {/* 3. Media Submission (Check-in Video) */}
          <div className="space-y-2">
            <span className="font-bold text-muted uppercase tracking-wider text-[11px] block">
              Attached Check-In Video
            </span>
            <div
              onClick={() => setSelectedVideo({
                url: submission.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                title: `${submission.name} - Form Review Single`
              })}
              className="p-3.5 rounded-xl border border-accent/30 bg-surface flex items-center justify-between cursor-pointer hover:border-accent hover:bg-raised/40 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-accent text-accent-ink grid place-items-center group-hover:scale-105 transition shadow-sm">
                  <Play className="h-4 w-4 fill-accent-ink ml-0.5" />
                </div>
                <div>
                  <span className="font-bold text-ink block">{submission.name} - Squat / Lift Video Check-in</span>
                  <span className="text-[11px] text-accent flex items-center gap-1 mt-0.5">
                    <Video className="h-3 w-3" />
                    <span>Watch Biomechanical Form Clip (0:45)</span>
                  </span>
                </div>
              </div>
              <Button variant="secondary" size="md" className="h-8 text-xs shrink-0">
                Play Video
              </Button>
            </div>
          </div>

          {/* 4. Coach Feedback & Adjustments */}
          <div className="space-y-2">
            <label className="font-bold text-muted uppercase tracking-wider text-[11px] block">
              Coach Adjustments & Direct Feedback Note
            </label>
            <textarea
              rows={3}
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              placeholder="e.g. Approved. Lightened accessory volume by 1 set and scheduled knee-friendly pauses for next week..."
              className="w-full bg-bg border border-line rounded-xl p-3 text-xs text-ink focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-line bg-bg flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <Button variant="ghost" size="md" onClick={onClose} className="w-full sm:w-auto text-xs">
            Cancel
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleRequestChanges}
              className="w-full sm:w-auto text-xs"
            >
              Request Changes
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleApprove}
              className="w-full sm:w-auto text-xs gap-1.5 font-bold"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Approve & Apply to Athlete</span>
            </Button>
          </div>
        </div>
      </div>

      <VideoPlayerModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        videoUrl={selectedVideo?.url}
        title={selectedVideo?.title}
      />
    </div>
  );
}
