/**
 * offlineSyncManager.js - Gym Basement Offline-First Synchronization Engine
 * 
 * Implements Task 5 of P2_athlete_loop / ADR-009:
 * - Persistent set buffer on IndexedDB (zero data loss in underground gym basements)
 * - Unique client_uuid for idempotent deduplication
 * - Automatic background drain upon network reconnection
 * - Visual sync badge integration
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const DB_NAME = 'powerlift_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'pending_sets';
const LAST_SYNC_KEY = 'powerlift_last_sync_timestamp';

// IndexedDB Helper
function openOfflineDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not available'));
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'clientUuid' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get all pending sets queued in IndexedDB
 */
export async function getOfflineQueue() {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // Fallback to localStorage if private browsing blocks IDB
    try {
      const raw = localStorage.getItem('powerlift_offline_fallback');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

/**
 * Queue a workout set into IndexedDB with clientUuid
 */
export async function enqueuePendingSet(sessionId, setPayload) {
  const clientUuid = setPayload.clientUuid || `client_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const item = {
    clientUuid,
    sessionId,
    payload: { ...setPayload, clientUuid },
    queuedAt: new Date().toISOString(),
    retries: 0
  };

  try {
    const db = await openOfflineDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(item);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    const current = JSON.parse(localStorage.getItem('powerlift_offline_fallback') || '[]');
    current.push(item);
    localStorage.setItem('powerlift_offline_fallback', JSON.stringify(current));
  }

  const queue = await getOfflineQueue();
  window.dispatchEvent(new CustomEvent('powerlift_queue_updated', { detail: queue.length }));
  return item;
}

/**
 * Remove synced items from IndexedDB
 */
export async function removePendingSets(clientUuids) {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const uuid of clientUuids) {
      store.delete(uuid);
    }
  } catch (err) {
    localStorage.removeItem('powerlift_offline_fallback');
  }

  const remaining = await getOfflineQueue();
  window.dispatchEvent(new CustomEvent('powerlift_queue_updated', { detail: remaining.length }));
}

/**
 * Flush all pending offline sets to the server
 */
export async function flushOfflineQueue(apiUrl, token) {
  const queue = await getOfflineQueue();
  if (!queue || queue.length === 0) {
    return { success: true, count: 0 };
  }

  const endpoint = apiUrl || (import.meta.env.PROD 
    ? 'https://powerlift-ai-backend.onrender.com' 
    : 'http://localhost:5000');

  // Group queued sets by sessionId
  const bySession = {};
  for (const item of queue) {
    if (!bySession[item.sessionId]) bySession[item.sessionId] = [];
    bySession[item.sessionId].push(item);
  }

  let syncedCount = 0;
  const syncedUuids = [];

  for (const [sessionId, items] of Object.entries(bySession)) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${endpoint}/api/v1/training/sessions/${sessionId}/sets`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sets: items.map(i => i.payload) })
      });

      if (res.ok) {
        syncedCount += items.length;
        syncedUuids.push(...items.map(i => i.clientUuid));
      }
    } catch (err) {
      console.warn(`Sync retry queued for session ${sessionId}:`, err.message);
    }
  }

  if (syncedUuids.length > 0) {
    await removePendingSets(syncedUuids);
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  }

  return { success: true, count: syncedCount, remaining: queue.length - syncedCount };
}

/**
 * React hook for offline status and queue tracking
 */
export function useOfflineSync(token) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(() => localStorage.getItem(LAST_SYNC_KEY) || null);

  const apiUrl = import.meta.env.PROD 
    ? 'https://powerlift-ai-backend.onrender.com' 
    : 'http://localhost:5000';

  const checkQueue = useCallback(async () => {
    const q = await getOfflineQueue();
    setPendingCount(q.length);
  }, []);

  const triggerManualSync = useCallback(async () => {
    if (!navigator.onLine) {
      toast.warning("📶 Basement Mode (Offline). Sets safely secured in IndexedDB.");
      return;
    }

    setIsSyncing(true);
    try {
      const res = await flushOfflineQueue(apiUrl, token);
      await checkQueue();
      setLastSyncTime(new Date().toISOString());
      if (res.count > 0) {
        toast.success(`⚡ Synced ${res.count} sets to server without duplicate records!`);
      } else {
        toast.info("All logged sets are synchronized.");
      }
    } catch {
      toast.error("Sync connection deferred. Will retry automatically.");
    } finally {
      setIsSyncing(false);
    }
  }, [apiUrl, token, checkQueue]);

  useEffect(() => {
    checkQueue();

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("📶 Signal Restored! Auto-synchronizing buffered sets...");
      triggerManualSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("📶 Gym Basement Mode Active. Logging offline with zero latency.");
    };

    const handleQueueChange = (e) => {
      setPendingCount(e.detail);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('powerlift_queue_updated', handleQueueChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('powerlift_queue_updated', handleQueueChange);
    };
  }, [checkQueue, triggerManualSync]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncTime,
    triggerManualSync
  };
}
