import React from "react";

export default function LoadingState({
  message = "Loading training data...",
  subtext,
  fullScreen = false,
  className = "",
}) {
  const content = (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 p-8 text-center ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Track-accent spinner */}
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
        <div className="absolute h-4 w-4 rounded-full bg-accent/20 animate-ping" />
      </div>

      <div className="space-y-1">
        <p className="num text-base font-bold tracking-wide text-ink">{message}</p>
        {subtext && <p className="text-xs text-muted">{subtext}</p>}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-dvh w-full bg-bg flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
}
