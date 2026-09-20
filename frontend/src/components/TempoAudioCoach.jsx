/**
 * TempoAudioCoach.jsx - Web Audio API Precision Tempo Metronome & Pause Coach
 * For Competition Paused Squat/Bench and Eccentric Hypertrophy Training
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Square, 
  Volume2, 
  VolumeX, 
  Clock, 
  Dumbbell, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Sliders,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

// Standard Powerlifting & Bodybuilding Tempo Presets
const TEMPO_PRESETS = [
  { id: 'comp_pause', name: '3-1-X-0 Comp Pause', desc: 'IPF Competition pause squat/bench standard', eccentric: 3, pause: 1, concentric: 1, reset: 1 },
  { id: 'hyper_eccentric', name: '4-0-1-0 Hypertrophy', desc: 'Maximal muscle damage & eccentric stretch', eccentric: 4, pause: 0, concentric: 1, reset: 1 },
  { id: 'deep_pause', name: '2-2-1-0 Sticking Point', desc: 'Dead stop pause to eliminate stretch reflex', eccentric: 2, pause: 2, concentric: 1, reset: 1 },
  { id: 'spoto', name: '3-3-1-0 Spoto / Larsen', desc: 'Extended hover for mid-range bench strength', eccentric: 3, pause: 3, concentric: 1, reset: 1 },
];

export default function TempoAudioCoach({ onClose }) {
  // Tempo parameters (seconds)
  const [eccentricSec, setEccentricSec] = useState(3);
  const [pauseSec, setPauseSec] = useState(1);
  const [concentricSec, setConcentricSec] = useState(1);
  const [resetSec, setResetSec] = useState(1);

  // Training Session Config
  const [targetReps, setTargetReps] = useState(5);
  const [currentRep, setCurrentRep] = useState(1);

  // Audio & Voice Preferences
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Playback State: 'idle' | 'running' | 'completed'
  const [isRunning, setIsRunning] = useState(false);
  // Current Rep Phase: 'eccentric' | 'pause' | 'concentric' | 'reset'
  const [phase, setPhase] = useState('idle');
  const [countdown, setCountdown] = useState(0);

  // Audio Context Ref
  const audioCtxRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize Web Audio Context
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Play tone via Web Audio API
  const playTone = (freq, type = 'sine', duration = 0.15) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context policy fallback
    }
  };

  // Voice speech cue using native Web Speech API
  const speakCue = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel(); // cancel previous queued speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.3;
      utterance.pitch = 1.1;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Speech synthesis fallback
    }
  };

  // Start metronome
  const startMetronome = () => {
    getAudioContext();
    setIsRunning(true);
    setCurrentRep(1);
    executeRepCycle(1);
  };

  // Stop metronome
  const stopMetronome = () => {
    setIsRunning(false);
    setPhase('idle');
    setCountdown(0);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  // Metronome execution loop across the 4 phases
  const executeRepCycle = (repNumber) => {
    if (repNumber > targetReps) {
      setIsRunning(false);
      setPhase('completed');
      playTone(880, 'triangle', 0.4);
      setTimeout(() => playTone(1320, 'sine', 0.5), 200);
      speakCue("Set complete! Great lift!");
      toast.success(`🎯 Set of ${targetReps} reps completed!`);
      return;
    }

    setCurrentRep(repNumber);

    // Phase 1: Eccentric Descent
    setPhase('eccentric');
    let secLeft = eccentricSec;
    setCountdown(secLeft);
    speakCue("Down");
    playTone(523.25, 'sine', 0.2); // C5

    const runEccentricTick = () => {
      secLeft -= 1;
      if (secLeft > 0) {
        setCountdown(secLeft);
        playTone(523.25, 'sine', 0.15);
        timerRef.current = setTimeout(runEccentricTick, 1000);
      } else {
        // Proceed to Phase 2: Bottom Pause
        if (pauseSec > 0) {
          setPhase('pause');
          let pauseLeft = pauseSec;
          setCountdown(pauseLeft);
          speakCue("Pause");
          playTone(659.25, 'square', 0.25); // E5

          const runPauseTick = () => {
            pauseLeft -= 1;
            if (pauseLeft > 0) {
              setCountdown(pauseLeft);
              playTone(659.25, 'square', 0.2);
              timerRef.current = setTimeout(runPauseTick, 1000);
            } else {
              proceedToConcentric();
            }
          };

          timerRef.current = setTimeout(runPauseTick, 1000);
        } else {
          proceedToConcentric();
        }
      }
    };

    const proceedToConcentric = () => {
      // Phase 3: Concentric Drive
      setPhase('concentric');
      setCountdown(concentricSec);
      speakCue("Drive");
      playTone(1046.5, 'sine', 0.3); // High C6 punch tone

      timerRef.current = setTimeout(() => {
        // Phase 4: Top Reset / Breath
        setPhase('reset');
        setCountdown(resetSec);
        playTone(440, 'triangle', 0.15);

        timerRef.current = setTimeout(() => {
          // Loop to next rep
          executeRepCycle(repNumber + 1);
        }, resetSec * 1000);
      }, concentricSec * 1000);
    };

    timerRef.current = setTimeout(runEccentricTick, 1000);
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // Apply preset
  const applyPreset = (preset) => {
    setEccentricSec(preset.eccentric);
    setPauseSec(preset.pause);
    setConcentricSec(preset.concentric);
    setResetSec(preset.reset);
    if (isRunning) stopMetronome();
    toast.info(`⚡ Loaded ${preset.name}`);
  };

  return (
    <div className="bg-zinc-950 rounded-2xl border border-cyan-500/20 p-5 md:p-7 shadow-2xl space-y-6 text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-bold">PRECISION AUDIO PACER</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white flex items-center gap-3">
            <Clock className="w-7 h-7 text-cyan-500" />
            Audio Tempo Metronome & Pause Coach
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Eliminate rushed pauses on bench and dive-bombing on squats. Web Audio ticks & voice commands for precise tempo.
          </p>
        </div>

        {/* Audio / Voice Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 border font-bold transition-all ${
              soundEnabled ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300' : 'bg-zinc-900 border-white/5 text-zinc-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'BEEPS ON' : 'MUTED'}</span>
          </button>

          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 border font-bold transition-all ${
              voiceEnabled ? 'bg-purple-950/80 border-purple-500/50 text-purple-300' : 'bg-zinc-900 border-white/5 text-zinc-500'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{voiceEnabled ? 'VOICE ON' : 'VOICE OFF'}</span>
          </button>
        </div>
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {TEMPO_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => applyPreset(p)}
            className={`p-3 rounded-xl border text-left transition-all ${
              eccentricSec === p.eccentric && pauseSec === p.pause
                ? 'bg-cyan-950/50 border-cyan-500/70 text-white shadow-lg'
                : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <p className="text-xs font-bold text-white leading-tight">{p.name}</p>
            <p className="text-[10px] font-mono text-zinc-500 mt-1">{p.desc}</p>
          </button>
        ))}
      </div>

      {/* Main Interactive Stage: The Pulsing Phase Ring */}
      <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Pulsing Visual Meter */}
        <div className="flex flex-col items-center justify-center relative w-48 h-48">
          <motion.div
            animate={{
              scale: phase === 'eccentric' ? [1, 0.9] : phase === 'pause' ? [0.9, 0.9] : phase === 'concentric' ? [0.9, 1.15] : 1,
              borderColor:
                phase === 'eccentric' ? '#38bdf8' :
                phase === 'pause' ? '#f59e0b' :
                phase === 'concentric' ? '#10b981' :
                phase === 'completed' ? '#a855f7' : '#3f3f46'
            }}
            transition={{ duration: 0.5, repeat: isRunning ? Infinity : 0 }}
            className="w-44 h-44 rounded-full border-4 flex flex-col items-center justify-center bg-black/60 shadow-2xl relative"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
              {isRunning ? `REP ${currentRep} / ${targetReps}` : 'TEMPO PACER'}
            </span>
            <span className={`text-2xl font-black italic tracking-tight font-mono ${
              phase === 'eccentric' ? 'text-sky-400' :
              phase === 'pause' ? 'text-amber-400' :
              phase === 'concentric' ? 'text-emerald-400' :
              phase === 'reset' ? 'text-zinc-300' : 'text-zinc-500'
            }`}>
              {phase === 'eccentric' ? 'DESCENT' :
               phase === 'pause' ? 'PAUSE ⏸️' :
               phase === 'concentric' ? 'DRIVE ⚡' :
               phase === 'reset' ? 'RESET' :
               phase === 'completed' ? 'DONE! 🏆' : 'READY'}
            </span>
            {isRunning && (
              <span className="text-3xl font-black text-white font-mono mt-1">
                {countdown}s
              </span>
            )}
          </motion.div>
        </div>

        {/* Real-time Stepper Controls */}
        <div className="flex-1 space-y-4 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
            <div className="bg-black/40 border border-sky-500/30 p-3 rounded-xl">
              <span className="text-[10px] text-sky-400 uppercase block font-bold">1. Eccentric (Down)</span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <button
                  disabled={isRunning}
                  onClick={() => setEccentricSec(Math.max(1, eccentricSec - 1))}
                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold"
                >-</button>
                <span className="text-2xl font-black text-white">{eccentricSec}s</span>
                <button
                  disabled={isRunning}
                  onClick={() => setEccentricSec(eccentricSec + 1)}
                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold"
                >+</button>
              </div>
            </div>

            <div className="bg-black/40 border border-amber-500/30 p-3 rounded-xl">
              <span className="text-[10px] text-amber-400 uppercase block font-bold">2. Pause (Bottom)</span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <button
                  disabled={isRunning}
                  onClick={() => setPauseSec(Math.max(0, pauseSec - 1))}
                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold"
                >-</button>
                <span className="text-2xl font-black text-white">{pauseSec}s</span>
                <button
                  disabled={isRunning}
                  onClick={() => setPauseSec(pauseSec + 1)}
                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold"
                >+</button>
              </div>
            </div>

            <div className="bg-black/40 border border-emerald-500/30 p-3 rounded-xl">
              <span className="text-[10px] text-emerald-400 uppercase block font-bold">3. Concentric (Up)</span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <button
                  disabled={isRunning}
                  onClick={() => setConcentricSec(Math.max(1, concentricSec - 1))}
                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold"
                >-</button>
                <span className="text-2xl font-black text-white">{concentricSec}s</span>
                <button
                  disabled={isRunning}
                  onClick={() => setConcentricSec(concentricSec + 1)}
                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold"
                >+</button>
              </div>
            </div>

            <div className="bg-black/40 border border-purple-500/30 p-3 rounded-xl">
              <span className="text-[10px] text-purple-400 uppercase block font-bold">Target Reps</span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <button
                  disabled={isRunning}
                  onClick={() => setTargetReps(Math.max(1, targetReps - 1))}
                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold"
                >-</button>
                <span className="text-2xl font-black text-white">{targetReps}</span>
                <button
                  disabled={isRunning}
                  onClick={() => setTargetReps(targetReps + 1)}
                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold"
                >+</button>
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="flex items-center gap-3 pt-2">
            {!isRunning ? (
              <button
                onClick={startMetronome}
                className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-mono font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START TEMPO PACER ({eccentricSec}-{pauseSec}-{concentricSec}-{resetSec})</span>
              </button>
            ) : (
              <button
                onClick={stopMetronome}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-mono font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-950"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>STOP PACER</span>
              </button>
            )}

            <button
              onClick={() => {
                stopMetronome();
                setPhase('idle');
              }}
              className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all"
              title="Reset Metronome"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
