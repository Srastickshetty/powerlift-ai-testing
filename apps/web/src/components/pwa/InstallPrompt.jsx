/**
 * InstallPrompt.jsx - Platform-Adaptive PWA In-App Install Prompter
 * Features:
 * 1. Automatic suppression in standalone PWA window mode
 * 2. 7-Day dismissal memory via localStorage
 * 3. Android Chrome: Native beforeinstallprompt banner with 1-tap install trigger
 * 4. iOS Safari: Non-intrusive bottom drawer with 2-step Apple visual guide
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Share, 
  PlusSquare, 
  X, 
  Sparkles, 
  Smartphone, 
  Check, 
  Zap,
  Flame
} from 'lucide-react';
import usePlatform from '../../hooks/usePlatform';

const DISMISS_KEY = 'titan_pwa_install_dismissed';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default function InstallPrompt() {
  const { isStandalone, isIOS, isAndroid } = usePlatform();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // 1. If already installed & running standalone, never show prompt
    if (isStandalone) {
      setIsVisible(false);
      return;
    }

    // 2. Check 7-day dismissal memory
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const timeSince = Date.now() - parseInt(dismissedAt, 10);
      if (timeSince < SEVEN_DAYS_MS) {
        setIsDismissed(true);
        return;
      }
    }
    setIsDismissed(false);

    // 3. Android / Chromium: Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a pleasant 3-second delay so user isn't startled
      setTimeout(() => setIsVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. iOS Safari: If mobile Safari and not standalone, show iOS guidance after delay
    if (isIOS && !isStandalone) {
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);
      if (isSafari) {
        const timer = setTimeout(() => setIsVisible(true), 4000);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isStandalone, isIOS]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible || isStandalone || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 260 }}
        className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 pointer-events-auto"
      >
        <div className="bg-zinc-950/95 border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl font-sans text-white relative overflow-hidden">
          {/* Subtle gold glow line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors"
            title="Dismiss for 7 days"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-black italic text-black shadow-lg shrink-0 text-sm">
              T
            </div>
            <div className="pr-6">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono uppercase font-bold tracking-wider text-amber-400">
                  {isIOS ? 'Install on iPhone' : 'Install Native App'}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                  Offline Ready
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">
                TITAN AI — Powerlifting Platform
              </h4>
              <p className="text-[11px] font-mono text-zinc-400 mt-1 leading-relaxed">
                Add to your home screen for full-screen workouts, zero browser lag, and offline gym logging.
              </p>
            </div>
          </div>

          {/* Body Content: Android 1-Tap vs iOS 2-Step */}
          <div className="mt-3 pt-3 border-t border-zinc-800/80">
            {isIOS ? (
              /* iOS Safari 2-Step Visual Instructions */
              <div className="space-y-2 text-xs font-mono text-zinc-300">
                <div className="flex items-center gap-2.5 bg-zinc-900/80 p-2 rounded-xl border border-zinc-800">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">1</span>
                  <span>Tap the <strong className="text-white flex-inline items-center"><Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> Share</strong> button in your Safari toolbar</span>
                </div>
                <div className="flex items-center gap-2.5 bg-zinc-900/80 p-2 rounded-xl border border-zinc-800">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">2</span>
                  <span>Scroll down and select <strong className="text-white flex-inline items-center"><PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" /> Add to Home Screen</strong></span>
                </div>
              </div>
            ) : (
              /* Android Chrome 1-Tap Install Button */
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] font-mono text-zinc-400">
                  <span>Fast 1-tap install • 0 MB store download</span>
                </div>
                <button
                  onClick={handleAndroidInstall}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-orange-950 transition-all shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
