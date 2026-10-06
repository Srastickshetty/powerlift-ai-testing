import React, { useState } from "react";
import { Zap, X, SignalLow } from "lucide-react";
import Button from "./Button";

export default function SlowNetworkBanner({
  onEnableOfflineMode,
  onDismiss,
  latencyMs = 3800,
  className = "",
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <aside
      role="status"
      aria-label="Slow Network Warning"
      className={`rounded-xl border border-warn/30 bg-surface p-4 text-ink shadow-md transition ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-warn/15 border border-warn/30 grid place-items-center text-warn shrink-0 mt-0.5 sm:mt-0">
            <SignalLow className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-warn">
                Slow Network Detected
              </span>
              <span className="num text-xs font-mono text-muted">
                (~{latencyMs > 1000 ? `${(latencyMs / 1000).toFixed(1)}s` : `${latencyMs}ms`} latency)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted mt-0.5">
              Syncing might lag in the gym. Enable offline logging to buffer sets locally without waiting for server responses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto justify-end">
          {onEnableOfflineMode && (
            <Button
              variant="primary"
              size="md"
              onClick={onEnableOfflineMode}
              className="text-xs gap-1.5"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Offline Mode</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="md"
            onClick={handleDismiss}
            className="text-xs px-2 text-muted hover:text-ink"
            aria-label="Dismiss slow network warning"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
