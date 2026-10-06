import React, { useState } from "react";
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from "lucide-react";
import Button from "./Button";

export default function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred while loading this view. Your logged sets remain safely stored.",
  error = null,
  onRetry,
  onHome,
  fullScreen = false,
  className = "",
}) {
  const [showDetails, setShowDetails] = useState(false);

  const content = (
    <div
      role="alert"
      className={`rounded-xl border border-danger/30 bg-surface p-6 sm:p-8 text-center flex flex-col items-center justify-center gap-4 max-w-lg mx-auto ${className}`}
    >
      <div className="h-12 w-12 rounded-full bg-danger/10 border border-danger/20 grid place-items-center text-danger">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>

      <div className="space-y-1.5">
        <h3 className="num text-xl font-bold text-ink">{title}</h3>
        <p className="text-sm text-muted leading-relaxed">{message}</p>
      </div>

      {error && (
        <div className="w-full text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-ink mx-auto py-1"
          >
            <span>{showDetails ? "Hide technical details" : "Show technical details"}</span>
            {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showDetails && (
            <pre className="mt-2 p-3 rounded-lg bg-bg border border-line text-[11px] font-mono text-danger/90 overflow-x-auto whitespace-pre-wrap max-h-36">
              {error?.stack || error?.message || String(error)}
            </pre>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {onRetry && (
          <Button variant="primary" size="md" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        )}
        {onHome && (
          <Button variant="secondary" size="md" onClick={onHome} className="gap-2">
            <Home className="h-4 w-4" />
            <span>Return to Dashboard</span>
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
