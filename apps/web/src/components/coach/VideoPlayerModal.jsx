import React, { useState } from "react";
import { X, Play, Pause, ExternalLink, HardDrive } from "lucide-react";

export default function VideoPlayerModal({ isOpen, onClose, videoUrl, title = "Athlete Check-in Form Video" }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  if (!isOpen) return null;

  // Transform Google Drive share URL into preview embed if applicable
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("drive.google.com")) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    return url;
  };

  const isDriveOrIframe = videoUrl?.includes("drive.google.com") || videoUrl?.includes("youtube.com") || videoUrl?.includes("youtu.be");
  const embedSrc = getEmbedUrl(videoUrl);

  const handleRateChange = (rate) => {
    setPlaybackRate(rate);
    const video = document.getElementById("checkin-html5-video");
    if (video) video.playbackRate = rate;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 font-sans">
      <div className="w-full max-w-3xl rounded-2xl border border-line bg-surface flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-line flex items-center justify-between bg-raised/50">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-accent/15 text-accent grid place-items-center">
              <Play className="h-4 w-4 fill-accent" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-ink">{title}</h3>
              <span className="text-[11px] text-muted">Biomechanical playback with slow-motion scrutiny</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-raised transition"
            aria-label="Close video player"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Canvas */}
        <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
          {isDriveOrIframe ? (
            <iframe
              src={embedSrc}
              title={title}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />
          ) : (
            <video
              id="checkin-html5-video"
              src={videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
              controls
              className="w-full h-full object-contain"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          )}
        </div>

        {/* Controls & Cloud Storage Tip Banner */}
        <div className="p-4 bg-bg border-t border-line space-y-3 text-xs">
          {/* Slow Motion Controls for Form Breakdown */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-muted font-semibold">Slow-Mo Analysis:</span>
              {[0.5, 0.75, 1.0, 1.25].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => handleRateChange(rate)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition border ${
                    playbackRate === rate
                      ? "bg-accent text-accent-ink border-accent"
                      : "bg-surface text-muted border-line hover:text-ink"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {videoUrl && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {/* Storage Strategy Guide */}
          <div className="p-2.5 rounded-xl border border-line bg-surface/70 flex items-start gap-2.5 text-[11px] text-muted">
            <HardDrive className="h-4 w-4 text-info shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-ink">Zero-Cost Cloud Video Strategy:</span> Athletes can link Google Drive (Set to "Anyone with link"), YouTube Unlisted, or Cloudinary URLs. This gives instant 1080p 60fps streaming to coaches without database bandwidth costs!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
