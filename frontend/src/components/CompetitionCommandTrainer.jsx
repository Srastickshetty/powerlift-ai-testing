/**
 * CompetitionCommandTrainer.jsx - Voice-Free Visual & Haptic Competition Referee Trainer
 * Simulates strict IPF / Powerlifting India referee commands and pause durations
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  AlertTriangle, 
  Volume2, 
  VolumeX,
  Sliders,
  Flag
} from 'lucide-react';

export const CompetitionCommandTrainer = () => {
  const [activeLift, setActiveLift] = useState('bench'); // 'squat' | 'bench' | 'deadlift'
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [chestPauseDuration, setChestPauseDuration] = useState(1.5); // seconds
  const [soundBeep, setSoundBeep] = useState(true);
  const [lightDecision, setLightDecision] = useState(null); // 'white' | 'red' | null
  const timerRef = useRef(null);

  // Lift Command Protocols under IPF Rulebook
  const LIFT_PROTOCOLS = {
    bench: [
      { id: 'unrack', title: 'Unrack & Settle', directive: 'Unrack bar. Settle with locked elbows and feet flat on the floor.', cue: 'WAIT FOR START COMMAND' },
      { id: 'start', title: 'START', directive: 'Lower bar with controlled descent to motionless chest contact.', cue: 'CHEST TOUCH' },
      { id: 'pause', title: 'PAUSE (Motionless on Chest)', directive: 'Hold bar completely motionless. No bouncing, sinking, or heaving.', cue: 'WAITING FOR PRESS...' },
      { id: 'press', title: 'PRESS', directive: 'Drive bar to full simultaneous lockout. Keep head, shoulders, and glutes pinned.', cue: 'LOCKOUT ELBOWS' },
      { id: 'rack', title: 'RACK', directive: 'Hold motionless at lockout until commanded. Guide bar safely back into uprights.', cue: 'LIFT COMPLETE' }
    ],
    squat: [
      { id: 'unrack', title: 'Unrack & Walkout', directive: 'Walk out in 2-3 clean steps. Lock knees and establish rigid upright posture.', cue: 'WAIT FOR SQUAT COMMAND' },
      { id: 'squat', title: 'SQUAT', directive: 'Descend smoothly until hip crease breaks top surface of knees (IPF depth).', cue: 'DRIVE OUT OF HOLE' },
      { id: 'rack', title: 'RACK', directive: 'Stand upright with locked knees. Wait for signal before stepping forward into rack.', cue: 'LIFT COMPLETE' }
    ],
    deadlift: [
      { id: 'approach', title: 'Approach & Setup', directive: 'Bar is loaded. Wedge hips, lock grip, take slack out of bar.', cue: 'BEGIN PULL' },
      { id: 'lockout', title: 'Lockout Hold', directive: 'Shoulders back, knees locked, erect posture. Hold motionless.', cue: 'WAIT FOR DOWN COMMAND' },
      { id: 'down', title: 'DOWN', directive: 'Return bar to floor under control with both hands on the barbell.', cue: 'LIFT COMPLETE' }
    ]
  };

  const steps = LIFT_PROTOCOLS[activeLift];
  const currentStep = steps[stepIndex] || steps[0];

  // Sound beep synthesizer (audio context for click/beep without external assets)
  const playBeep = (freq = 880, dur = 0.15) => {
    if (!soundBeep || typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
        osc.start();
        osc.stop(ctx.currentTime + dur);
      }
    } catch (e) {
      // Audio not supported or autoplay blocked
    }
  };

  // Next step in command flow
  const advanceStep = () => {
    if (stepIndex < steps.length - 1) {
      playBeep(920, 0.2);
      setStepIndex(prev => prev + 1);
    } else {
      // Completed lift - 3 White Lights!
      playBeep(1200, 0.35);
      setLightDecision('white');
      setIsRunning(false);
    }
  };

  const resetTrainer = () => {
    clearTimeout(timerRef.current);
    setStepIndex(0);
    setIsRunning(false);
    setLightDecision(null);
  };

  // Automated drill mode with pauses
  const startAutomatedSequence = () => {
    resetTrainer();
    setIsRunning(true);
    playBeep(700, 0.15);

    if (activeLift === 'bench') {
      // Bench cadence: Unrack (2s) -> START (1.5s) -> Chest Pause (X sec) -> PRESS (1.5s) -> RACK
      timerRef.current = setTimeout(() => {
        setStepIndex(1); // START
        playBeep(880, 0.2);

        timerRef.current = setTimeout(() => {
          setStepIndex(2); // PAUSE
          playBeep(600, 0.1);

          timerRef.current = setTimeout(() => {
            setStepIndex(3); // PRESS
            playBeep(1050, 0.25);

            timerRef.current = setTimeout(() => {
              setStepIndex(4); // RACK
              playBeep(880, 0.2);

              timerRef.current = setTimeout(() => {
                setLightDecision('white');
                playBeep(1200, 0.4);
                setIsRunning(false);
              }, 1200);
            }, 1800);
          }, chestPauseDuration * 1000);
        }, 1500);
      }, 2000);
    } else if (activeLift === 'squat') {
      // Squat cadence: Unrack (2s) -> SQUAT -> In the hole -> RACK (3s)
      timerRef.current = setTimeout(() => {
        setStepIndex(1); // SQUAT
        playBeep(880, 0.2);

        timerRef.current = setTimeout(() => {
          setStepIndex(2); // RACK
          playBeep(1050, 0.25);

          timerRef.current = setTimeout(() => {
            setLightDecision('white');
            playBeep(1200, 0.4);
            setIsRunning(false);
          }, 1200);
        }, 3000);
      }, 2000);
    } else {
      // Deadlift cadence: Approach (1.5s) -> Lockout (2s) -> DOWN
      timerRef.current = setTimeout(() => {
        setStepIndex(1); // Lockout
        playBeep(880, 0.2);

        timerRef.current = setTimeout(() => {
          setStepIndex(2); // DOWN
          playBeep(1050, 0.25);

          timerRef.current = setTimeout(() => {
            setLightDecision('white');
            playBeep(1200, 0.4);
            setIsRunning(false);
          }, 1200);
        }, 2500);
      }, 2000);
    }
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div className="bg-zinc-950 rounded-2xl border border-white/10 p-6 shadow-2xl font-sans text-white space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-orange-400 uppercase font-bold">IPF REFEREE SIMULATOR</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white flex items-center gap-3">
            <Flag className="w-7 h-7 text-orange-500" />
            Visual Competition Command Trainer
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Eliminate red lights on technicalities. Drill competition pause lengths & referee commands.
          </p>
        </div>

        {/* Lift Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1.5 rounded-xl border border-white/5 font-mono text-xs">
          {[
            { id: 'squat', label: 'Squat' },
            { id: 'bench', label: 'Bench Press' },
            { id: 'deadlift', label: 'Deadlift' }
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => {
                setActiveLift(l.id);
                resetTrainer();
              }}
              className={`px-4 py-2 rounded-lg font-bold uppercase transition-all ${
                activeLift === l.id
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Referee Signal Display Box */}
      <div className="relative bg-zinc-900/90 rounded-2xl border border-white/10 p-8 md:p-12 text-center overflow-hidden">
        {/* Three Lights System (Top) */}
        <div className="flex items-center justify-center gap-6 mb-8">
          {[1, 2, 3].map((referee) => (
            <div key={referee} className="flex flex-col items-center gap-1.5">
              <div 
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all duration-300 shadow-xl ${
                  lightDecision === 'white'
                    ? 'bg-white border-white shadow-[0_0_20px_rgba(255,255,255,0.8)]'
                    : lightDecision === 'red'
                    ? 'bg-red-600 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]'
                    : 'bg-zinc-800/80 border-zinc-700'
                }`}
              />
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Ref #{referee}</span>
            </div>
          ))}
        </div>

        {/* Giant Active Referee Command Callout */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeLift}_${stepIndex}_${currentStep.id}`}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.15, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="py-4"
          >
            <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold block mb-2">
              REFEREE DIRECTIVE #{stepIndex + 1} OF {steps.length}
            </span>
            <h1 className="text-5xl md:text-7xl font-[1000] italic uppercase tracking-tight text-white font-mono drop-shadow-2xl">
              {currentStep.title}
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-300 max-w-xl mx-auto mt-4">
              {currentStep.directive}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8 pt-6 border-t border-white/5">
          <button
            onClick={startAutomatedSequence}
            disabled={isRunning}
            className="px-6 py-3.5 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-800 text-white font-mono font-black text-xs uppercase rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Drill In Progress...' : 'Start Automated Cadence'}
          </button>

          <button
            onClick={advanceStep}
            className="px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-mono font-bold text-xs uppercase rounded-xl transition-all border border-white/10"
          >
            Manual Next Step (Tap)
          </button>

          <button
            onClick={resetTrainer}
            className="p-3.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-colors"
            title="Reset Command Cycle"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Adjustments & IPF Red Light Traps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timing Controls */}
        <div className="bg-zinc-900/60 p-6 rounded-xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400 font-bold">Chest Pause Duration</h3>
            <span className="text-orange-400 font-mono font-bold text-sm">{chestPauseDuration}s (Strict IPF)</span>
          </div>

          <input 
            type="range"
            min="1.0"
            max="3.0"
            step="0.25"
            value={chestPauseDuration}
            onChange={(e) => setChestPauseDuration(parseFloat(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>1.0s (Quick Touch)</span>
            <span>1.5s (Standard IPF)</span>
            <span>2.5s+ (National Final Strict)</span>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs font-mono">
            <span className="text-zinc-400">Audio Tone Signals</span>
            <button
              onClick={() => setSoundBeep(!soundBeep)}
              className="flex items-center gap-1.5 text-zinc-300 hover:text-white"
            >
              {soundBeep ? <Volume2 className="w-4 h-4 text-green-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
              <span>{soundBeep ? 'Enabled' : 'Muted'}</span>
            </button>
          </div>
        </div>

        {/* IPF Technical Red Light Checklist */}
        <div className="bg-zinc-900/60 p-6 rounded-xl border border-white/5 space-y-3 font-mono text-xs">
          <h3 className="text-sm font-mono uppercase tracking-wider text-red-400 font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Common Technical Red Light Traps
          </h3>
          <ul className="space-y-2 text-zinc-300 text-[11px]">
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span><strong>Bench Press:</strong> Moving the bar downwards after starting the press upward. Double bouncing off chest.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span><strong>Squat:</strong> Walking or shifting feet after the unrack or before the RACK command is given.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span><strong>Deadlift:</strong> Releasing the barbell from hands before it rests motionless on the competition platform.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CompetitionCommandTrainer;
