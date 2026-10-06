import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useOfflineSync } from '../utils/offlineSyncManager';

export default function OfflineSyncBadge() {
  const { isOnline, pendingCount, isSyncing, triggerManualSync } = useOfflineSync();

  return (
    <button
      onClick={triggerManualSync}
      disabled={isSyncing}
      className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
        !isOnline
          ? 'bg-amber-950/80 border-amber-500/50 text-amber-300 hover:bg-amber-900/80'
          : pendingCount > 0
          ? 'bg-amber-950/60 border-amber-500/40 text-amber-200 hover:bg-amber-900/70'
          : 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50'
      }`}
      title={
        !isOnline 
          ? "Gym Basement Mode: Operating offline. Sets are buffered locally."
          : pendingCount > 0
          ? `${pendingCount} sets pending upload. Click to force sync.`
          : "All sets & biofeedback synchronized to cloud."
      }
    >
      {isSyncing ? (
        <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
      ) : !isOnline ? (
        <WifiOff className="w-3 h-3 text-amber-400 animate-pulse" />
      ) : pendingCount > 0 ? (
        <RefreshCw className="w-3 h-3 text-amber-300" />
      ) : (
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
      )}

      <span>
        {!isOnline 
          ? `BASEMENT OFFLINE (${pendingCount})` 
          : isSyncing 
          ? 'SYNCING...' 
          : pendingCount > 0 
          ? `SYNC (${pendingCount})` 
          : 'SYNCED'}
      </span>
    </button>
  );
}
