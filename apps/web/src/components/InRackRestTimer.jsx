/**
 * InRackRestTimer.jsx - Floating In-Rack Rest Interval Timer
 * Keeps athletes on strict rest cadence between heavy powerlifting sets
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Volume2, 
  VolumeX, 
  Minimize2, 
  Maximize2,
  Bell
} from 'lucide-react';

export const InRackRestTimer = ({ initialSeconds = 180 }) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef(null);

  // Play audio beep when timer reaches 0
  const playBeep = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        // 3 consecutive beeps
        [0, 0.25, 0.5].forEach((delay, idx) => {
          setTimeout(() => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = idx === 2 ? 1100 : 880;
            gain.gain.setValueAtTime(0.35, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
          }, delay * 1000);
        });
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      clearInterval(intervalRef.current);
      setIsActive(false);
      playBeep();
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, secondsLeft]);

  const setTimerPreset = (secs) => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setTotalSeconds(secs);
    setSecondsLeft(secs);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setSecondsLeft(totalSeconds);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const progressPct = ((totalSeconds - secondsLeft) / Math.max(1, totalSeconds)) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-40 bg-zinc-950/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md p-4 text-white font-sans"
    >
      {isMinimized ? (
        <div 
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-3 cursor-pointer select-none font-mono text-xs px-2 py-1"
        >
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-orange-500 animate-ping' : 'bg-zinc-600'}`} />
          <span className="font-bold text-orange-400">{formatTime(secondsLeft)}</span>
          <Maximize2 className="w-3.5 h-3.5 text-zinc-400" />
        </div>
      ) : (
        <div className="w-64 space-y-3 select-none">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">In-Rack Rest Timer</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1 text-zinc-400 hover:text-white"
                title={soundEnabled ? 'Mute' : 'Unmute'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-green-400" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-600" />}
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 text-zinc-400 hover:text-white"
                title="Minimize"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Big Time Display */}
          <div className="text-center py-2">
            <div className={`text-4xl font-black italic font-mono tracking-tight ${secondsLeft === 0 ? 'text-green-400 animate-bounce' : isActive ? 'text-orange-400' : 'text-white'}`}>
              {formatTime(secondsLeft)}
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
              <div 
                className="h-1.5 rounded-full bg-orange-600 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
            {[
              { label: '90s', secs: 90 },
              { label: '2m', secs: 120 },
              { label: '3m', secs: 180 },
              { label: '5m', secs: 300 }
            ].map(p => (
              <button
                key={p.secs}
                onClick={() => setTimerPreset(p.secs)}
                className={`py-1 rounded font-bold border transition-colors ${
                  totalSeconds === p.secs ? 'bg-orange-600/30 border-orange-500 text-orange-400' : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={toggleTimer}
              className={`flex-1 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                isActive ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-orange-600 text-white hover:bg-orange-500 shadow-md'
              }`}
            >
              {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isActive ? 'Pause' : 'Start Rest'}
            </button>
            <button
              onClick={resetTimer}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default InRackRestTimer;
