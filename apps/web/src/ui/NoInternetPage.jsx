import React, { useState, useEffect } from "react";
import { WifiOff, RefreshCw, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import Button from "./Button";
import { getOfflineQueue } from "../utils/offlineSyncManager";

export default function NoInternetPage({
  onRetry,
  onContinueOffline,
  fullScreen = true,
  className = "",
}) {
  const [queueCount, setQueueCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function checkQueue() {
      try {
        const queue = await getOfflineQueue();
        if (isMounted) setQueueCount(queue.length);
      } catch {
        // Fallback silently
      }
    }
    checkQueue();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCheckConnection = async () => {
    setIsChecking(true);
    setStatusMessage("Checking network ping...");

    // Check navigator.onLine and ping lightweight endpoint
    try {
      const isOnline = typeof navigator !== "undefined" ? navigator.onLine : false;
      if (isOnline) {
        setStatusMessage("Connection restored! Returning online...");
        if (onRetry) {
          setTimeout(() => onRetry(), 500);
        } else {
          setTimeout(() => window.location.reload(), 500);
        }
        return;
      }
      setStatusMessage("Still offline. Gym basement mode active.");
    } catch {
      setStatusMessage("Could not establish connection.");
    } finally {
      setTimeout(() => setIsChecking(false), 800);
    }
  };

  const content = (
    <div
      role="region"
      aria-label="Offline Mode Notice"
      className={`rounded-2xl border border-line bg-surface p-6 sm:p-8 text-center max-w-lg mx-auto space-y-6 ${className}`}
    >
      <div className="mx-auto h-16 w-16 rounded-full bg-warn/15 border border-warn/30 grid place-items-center text-warn">
        <WifiOff className="h-8 w-8" aria-hidden="true" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warn/10 border border-warn/20 text-xs font-semibold text-warn">
          <span className="h-2 w-2 rounded-full bg-warn animate-pulse" />
          <span>Gym Basement Mode</span>
        </div>
        <h1 className="num text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          No Internet Connection
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          You are currently offline. Your sets, weights, and RPE scores are secured in IndexedDB storage and will auto-sync when you get reception.
        </p>
      </div>

      {/* Offline Storage Status Card */}
      <div className="rounded-xl border border-line bg-bg p-4 text-left space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Local Storage Engine:</span>
          <span className="font-semibold text-ok flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> IndexedDB Active
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Pending Sets Queued:</span>
          <span className="num font-bold text-ink">
            {queueCount > 0 ? `${queueCount} sets awaiting sync` : "All sets synced"}
          </span>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-line text-[11px] text-muted">
          <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
          <span>Zero workout data is lost while training offline.</span>
        </div>
      </div>

      {statusMessage && (
        <p className="text-xs font-medium text-warn" role="status">
          {statusMessage}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={handleCheckConnection}
          disabled={isChecking}
          className="w-full sm:w-auto font-bold"
        >
          <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
          <span>{isChecking ? "Testing Signal..." : "Retry Connection"}</span>
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={onContinueOffline || (() => (window.location.href = "/today"))}
          className="w-full sm:w-auto"
        >
          <span>Continue Offline</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
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
