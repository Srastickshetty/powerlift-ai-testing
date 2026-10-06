import React from "react";
import { CheckCircle2, ArrowRight, Award, Dumbbell } from "lucide-react";
import Button from "./Button";

export default function SuccessState({
  title = "Workout Successfully Logged!",
  message = "Session saved to training log and synchronized with coach dashboard.",
  metrics = [],
  coachNote = "Hydrate, hit your target protein within 90 minutes, and rest for recovery.",
  primaryActionLabel = "View Training History",
  onPrimaryAction,
  secondaryActionLabel = "Back to Today",
  onSecondaryAction,
  fullScreen = false,
  className = "",
}) {
  const content = (
    <div
      role="region"
      aria-label="Action Succeeded"
      className={`rounded-2xl border border-ok/30 bg-surface p-6 sm:p-10 text-center max-w-lg mx-auto space-y-6 ${className}`}
    >
      {/* Animated / Halo check badge */}
      <div className="relative mx-auto flex items-center justify-center">
        <div className="h-16 w-16 rounded-full bg-ok/15 border border-ok/30 grid place-items-center text-ok">
          <CheckCircle2 className="h-8 w-8 text-ok" aria-hidden="true" />
        </div>
        <div className="absolute h-20 w-20 rounded-full border border-ok/20 animate-ping pointer-events-none" />
      </div>

      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ok/10 border border-ok/20 text-xs font-semibold text-ok">
          <Award className="h-3.5 w-3.5" />
          <span>Success</span>
        </div>
        <h2 className="num text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          {title}
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          {message}
        </p>
      </div>

      {/* Metric chips */}
      {metrics && metrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 py-1">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-line bg-bg p-2.5 text-center"
            >
              <span className="num text-lg font-bold text-ink block">
                {m.value}
              </span>
              <span className="text-[11px] text-muted block capitalize">
                {m.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {coachNote && (
        <div className="rounded-xl border border-line bg-bg p-3.5 text-left text-xs flex items-start gap-2.5">
          <Dumbbell className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-ink block text-[11px] uppercase tracking-wider text-muted">
              Coach Note
            </span>
            <p className="text-muted mt-0.5 leading-snug">{coachNote}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {onPrimaryAction && (
          <Button
            variant="primary"
            size="lg"
            onClick={onPrimaryAction}
            className="w-full sm:w-auto font-bold gap-2"
          >
            <span>{primaryActionLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        {onSecondaryAction && (
          <Button
            variant="secondary"
            size="lg"
            onClick={onSecondaryAction}
            className="w-full sm:w-auto"
          >
            <span>{secondaryActionLabel}</span>
          </Button>
        )}
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
