import React, { useState } from "react";
import { Video, Play, Calendar, AlertTriangle, ExternalLink, HardDrive } from "lucide-react";
import VideoPlayerModal from "./VideoPlayerModal";
import Button from "../../ui/Button";

export default function AthleteCheckinsTab({ athlete }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const isPl = athlete.track === "pl";

  // Athlete specific submissions
  const checkins = [
    {
      id: "chk_1",
      title: "Sunday Competition Prep Check-In",
      date: "2 days ago",
      notes: isPl
        ? "Paused bench singles felt locked in. Left knee had slight tendon warmth on set 3 of squats."
        : "Posing angles checked in. Abdominal fullness looking tighter, energy stable on current carb intake.",
      videoUrl: isPl 
        ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      videoTitle: `${athlete.name} - Squat Top Set (140kg)`,
      duration: "0:42",
      sorenessScore: athlete.hasPain ? 5 : 2,
      sleepHours: 7.8
    },
    {
      id: "chk_2",
      title: "Mid-Week Form Video Review",
      date: "6 days ago",
      notes: "Bar path tracking on competition deadlift. Kept lats engaged off floor.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
      videoTitle: `${athlete.name} - Deadlift 210kg Single`,
      duration: "0:36",
      sorenessScore: 2,
      sleepHours: 8.2
    }
  ];

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-ink">Check-In Submissions for {athlete.name}</h3>
          <p className="text-muted">Biomechanical video submissions, recovery ratings, and check-in logs.</p>
        </div>
      </div>

      <div className="space-y-3">
        {checkins.map((chk) => (
          <div key={chk.id} className="rounded-xl border border-line bg-bg p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink text-sm">{chk.title}</span>
                <span className="text-[11px] text-muted flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {chk.date}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-surface border border-line text-muted font-mono text-[11px]">
                  Sleep: {chk.sleepHours}h
                </span>
                <span className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                  chk.sorenessScore > 3 ? "bg-warn/15 text-warn border border-warn/30" : "bg-ok/15 text-ok border border-ok/30"
                }`}>
                  Soreness: {chk.sorenessScore}/10
                </span>
              </div>
            </div>

            <p className="text-ink leading-relaxed">"{chk.notes}"</p>

            {/* Playable Video Card */}
            {chk.videoUrl && (
              <div 
                onClick={() => setSelectedVideo({ url: chk.videoUrl, title: chk.videoTitle })}
                className="p-3 rounded-lg border border-accent/30 bg-surface flex items-center justify-between cursor-pointer hover:border-accent hover:bg-raised/40 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-accent text-accent-ink grid place-items-center group-hover:scale-105 transition shadow-md">
                    <Play className="h-4 w-4 fill-accent-ink ml-0.5" />
                  </div>
                  <div>
                    <span className="font-bold text-ink block">{chk.videoTitle}</span>
                    <span className="text-[11px] text-accent flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      <span>Play Form Video ({chk.duration}) · Slow-mo Analysis</span>
                    </span>
                  </div>
                </div>

                <Button variant="secondary" size="md" className="h-8 text-xs shrink-0">
                  Open Player
                </Button>
              </div>
            )}
          </div>
        ))}
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
