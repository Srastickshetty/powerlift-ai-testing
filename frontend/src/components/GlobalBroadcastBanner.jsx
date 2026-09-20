import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, 
  AlertTriangle, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  X, 
  Flame 
} from 'lucide-react';

export default function GlobalBroadcastBanner({ targetAudience = 'all' }) {
  const [broadcast, setBroadcast] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const fetchActiveBroadcast = async () => {
    try {
      const apiUrl = import.meta.env.PROD 
        ? 'https://powerlift-ai-backend.onrender.com' 
        : 'http://localhost:5001';

      const res = await fetch(`${apiUrl}/api/admin/broadcast/active`);
      const data = await res.json();
      if (data.success && data.broadcast) {
        const bc = data.broadcast;
        // Check if targeted to this audience
        if (bc.targetAudience === 'all' || bc.targetAudience === targetAudience) {
          // Check if already dismissed this session
          const dismissedId = sessionStorage.getItem('dismissed_broadcast_id');
          if (dismissedId !== bc.id) {
            setBroadcast(bc);
            setIsDismissed(false);
          }
        }
      } else {
        setBroadcast(null);
      }
    } catch (err) {
      // Offline fallback: check local storage broadcast
      try {
        const local = localStorage.getItem('titan_active_broadcast');
        if (local) {
          const parsed = JSON.parse(local);
          const dismissedId = sessionStorage.getItem('dismissed_broadcast_id');
          if (dismissedId !== parsed.id) {
            setBroadcast(parsed);
          }
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    fetchActiveBroadcast();
    const interval = setInterval(fetchActiveBroadcast, 25000); // check periodically
    return () => clearInterval(interval);
  }, [targetAudience]);

  const handleDismiss = () => {
    if (broadcast) {
      sessionStorage.setItem('dismissed_broadcast_id', broadcast.id);
    }
    setIsDismissed(true);
  };

  if (!broadcast || isDismissed) return null;

  // Determine styling based on urgency
  const getTheme = () => {
    switch (broadcast.urgency) {
      case 'urgent':
        return {
          bg: 'bg-red-950/90 border-red-500/70 text-red-100 shadow-red-950/50',
          badgeBg: 'bg-red-600 text-white',
          icon: <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse shrink-0" />,
          label: 'CRITICAL ALERT'
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/90 border-amber-500/70 text-amber-100 shadow-amber-950/50',
          badgeBg: 'bg-amber-500 text-black',
          icon: <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />,
          label: 'ATTENTION'
        };
      case 'success':
        return {
          bg: 'bg-emerald-950/90 border-emerald-500/70 text-emerald-100 shadow-emerald-950/50',
          badgeBg: 'bg-emerald-600 text-white',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />,
          label: 'RELEASE UPDATE'
        };
      case 'update':
        return {
          bg: 'bg-purple-950/90 border-purple-500/70 text-purple-100 shadow-purple-950/50',
          badgeBg: 'bg-purple-600 text-white',
          icon: <Sparkles className="w-4 h-4 text-purple-300 shrink-0" />,
          label: 'PLATFORM BROADCAST'
        };
      default:
        return {
          bg: 'bg-cyan-950/90 border-cyan-500/70 text-cyan-100 shadow-cyan-950/50',
          badgeBg: 'bg-cyan-600 text-white',
          icon: <Megaphone className="w-4 h-4 text-cyan-300 shrink-0" />,
          label: 'ANNOUNCEMENT'
        };
    }
  };

  const theme = getTheme();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative z-40 mb-4 p-3 sm:p-3.5 rounded-xl border backdrop-blur-md shadow-lg ${theme.bg} transition-all`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
            {theme.icon}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 min-w-0 flex-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-black tracking-wider shrink-0 w-fit ${theme.badgeBg}`}>
                {theme.label}
              </span>
              <span className="text-xs font-bold text-white tracking-wide shrink-0">
                {broadcast.title}
              </span>
              <span className="text-xs text-zinc-300 truncate">
                — {broadcast.message}
              </span>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 ml-2"
            title="Dismiss Announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
