import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Clock, 
  Users, 
  AlertTriangle, 
  Check, 
  Volume2, 
  VolumeX, 
  Share2, 
  ChevronRight, 
  RotateCcw, 
  Play, 
  Pause,
  Layers,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

export default function MeetBackroomStrategist({ 
  athleteName = 'Athlete',
  currentLift = 'Squat', 
  defaultOpenerKg = 190,
  barWeightKg = 20
}) {
  const [openerKg, setOpenerKg] = useState(defaultOpenerKg);
  const [liftersOut, setLiftersOut] = useState(7);
  const [tableTimerSeconds, setTableTimerSeconds] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const timerRef = useRef(null);

  // Play synthesized web audio beep
  const playBeep = (frequency = 600, duration = 0.15) => {
    if (isAudioMuted) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  };

  // 60-Second Table Submission Clock
  useEffect(() => {
    if (isTimerRunning && tableTimerSeconds > 0) {
      timerRef.current = setTimeout(() => {
        setTableTimerSeconds(prev => {
          const nextVal = prev - 1;
          if (nextVal === 30) playBeep(520, 0.2);
          if (nextVal === 15) {
            playBeep(880, 0.4);
            toast.error("⚠️ 15 SECONDS! Submit attempt card to table immediately!");
          }
          if (nextVal === 5) playBeep(980, 0.2);
          if (nextVal === 0) {
            playBeep(1100, 0.8);
            setIsTimerRunning(false);
            toast.error("🛑 60-SECOND DEADLINE EXPIRED! Card must be handed in!");
          }
          return nextVal;
        });
      }, 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [isTimerRunning, tableTimerSeconds]);

  const startTimer = () => {
    setTableTimerSeconds(60);
    setIsTimerRunning(true);
    playBeep(650, 0.15);
    toast.info("60-second table submission clock active!");
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTableTimerSeconds(60);
  };

  // Calculate plate configuration for a given weight
  const calculatePlates = (targetWeight) => {
    let sideWeight = (targetWeight - barWeightKg) / 2;
    if (sideWeight <= 0) return [];

    const availablePlates = [
      { weight: 25, color: '#dc2626', text: 'white', label: '25' },
      { weight: 20, color: '#2563eb', text: 'white', label: '20' },
      { weight: 15, color: '#eab308', text: 'black', label: '15' },
      { weight: 10, color: '#16a34a', text: 'white', label: '10' },
      { weight: 5, color: '#ffffff', text: 'black', label: '5' },
      { weight: 2.5, color: '#18181b', text: 'white', label: '2.5' },
      { weight: 1.25, color: '#94a3b8', text: 'black', label: '1.25' }
    ];

    const result = [];
    for (const p of availablePlates) {
      while (sideWeight >= p.weight) {
        result.push(p);
        sideWeight -= p.weight;
      }
    }
    return result;
  };

  // Generate 5-6 timed warm-up jumps leading up to 1st attempt
  const warmupJumps = [
    { name: "Bar Primer", weight: barWeightKg, reps: "2x5", targetMinOut: 28, pct: Math.round((barWeightKg / openerKg) * 100) },
    { name: "Jump 1", weight: Math.round(openerKg * 0.38 / 2.5) * 2.5, reps: "3", targetMinOut: 20, pct: 38 },
    { name: "Jump 2", weight: Math.round(openerKg * 0.58 / 2.5) * 2.5, reps: "2", targetMinOut: 14, pct: 58 },
    { name: "Jump 3", weight: Math.round(openerKg * 0.74 / 2.5) * 2.5, reps: "1", targetMinOut: 9, pct: 74 },
    { name: "Jump 4", weight: Math.round(openerKg * 0.86 / 2.5) * 2.5, reps: "1", targetMinOut: 6, pct: 86 },
    { name: "Last Warmup", weight: Math.round(openerKg * 0.93 / 2.5) * 2.5, reps: "1", targetMinOut: 3, pct: 93 }
  ];

  // WhatsApp Broadcast
  const shareAttemptToWhatsApp = () => {
    const text = `🏋️ *MEET DAY ATTEMPT UPDATE* 🏋️
👤 *Athlete:* ${athleteName}
🎯 *Event:* ${currentLift.toUpperCase()}
⚡ *1st Attempt (Opener):* *${openerKg} KG*
⏱️ *Current Staging:* ${liftersOut} lifters out (~${liftersOut} mins)
🔥 *Last Warm-up:* ${warmupJumps[warmupJumps.length - 1].weight} KG taken

Reported via TITAN-AI Meet Backroom Strategist`;

    const encoded = encodeURI(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    toast.success("Opening WhatsApp to broadcast attempt status!");
  };

  return (
    <div className="bg-zinc-950 border border-orange-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-orange-950 border border-orange-500/40 text-[10px] font-mono text-orange-400 font-bold tracking-wider">
              IPF BACKROOM WAR ROOM
            </span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black italic text-white flex items-center gap-2">
            MEET DAY WARM-UP STRATEGIST & 60s TABLE CLOCK
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`p-2 rounded-lg border transition-colors ${
              isAudioMuted 
                ? 'bg-zinc-800 text-zinc-500 border-zinc-700' 
                : 'bg-orange-950/60 border-orange-500/40 text-orange-400'
            }`}
            title={isAudioMuted ? "Unmute clock chimes" : "Mute clock chimes"}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={shareAttemptToWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950"
          >
            <Share2 className="w-4 h-4" />
            <span>Broadcast Update</span>
          </button>
        </div>
      </div>

      {/* TOP CONTROLS: LIFTERS OUT & 60s TABLE CLOCK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Lifters Out Counter */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5">
              <Users className="w-4 h-4 text-orange-400" />
              Lifters Remaining in Flight:
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
              liftersOut <= 2 ? 'bg-red-950 text-red-400 border border-red-500/40 animate-pulse' :
              liftersOut <= 5 ? 'bg-amber-950 text-amber-400 border border-amber-500/40' :
              'bg-zinc-800 text-zinc-300'
            }`}>
              {liftersOut <= 1 ? 'ON DECK / STAGE NOW' : liftersOut <= 4 ? 'FINAL CHALK / WRAPS' : 'WARM-UP ACTIVE'}
            </span>
          </div>

          <div className="flex items-center justify-between my-2">
            <button
              onClick={() => setLiftersOut(prev => Math.max(0, prev - 1))}
              className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-2xl font-bold text-white transition-colors flex items-center justify-center border border-zinc-700"
            >
              -
            </button>
            <div className="text-center">
              <div className="text-4xl font-black font-mono italic text-white">{liftersOut}</div>
              <div className="text-[10px] font-mono text-zinc-400">~{liftersOut} Mins to Platform</div>
            </div>
            <button
              onClick={() => setLiftersOut(prev => prev + 1)}
              className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-2xl font-bold text-white transition-colors flex items-center justify-center border border-zinc-700"
            >
              +
            </button>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 text-center">
            {liftersOut <= 2 
              ? "⚡ In the tunnel! Knee sleeves inspected, belt notched, chalk applied." 
              : "Keep athlete moving, stay warm between jumps."}
          </div>
        </div>

        {/* 2. Official 60-Second Table Submission Clock */}
        <div className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
          tableTimerSeconds <= 15 ? 'bg-red-950/40 border-red-500 animate-pulse' :
          tableTimerSeconds <= 30 ? 'bg-amber-950/30 border-amber-500/50' :
          'bg-zinc-900/80 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono uppercase text-zinc-300 font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-400" />
              60-Second Table Submission Clock
            </span>
            <span className="text-[10px] font-mono text-zinc-400">IPF Technical Rule</span>
          </div>

          <div className="flex items-center justify-between my-2">
            <div className="text-left">
              <div className={`text-4xl font-black font-mono italic ${
                tableTimerSeconds <= 15 ? 'text-red-400' :
                tableTimerSeconds <= 30 ? 'text-amber-400' :
                'text-white'
              }`}>
                00:{tableTimerSeconds < 10 ? `0${tableTimerSeconds}` : tableTimerSeconds}
              </div>
              <div className="text-[10px] font-mono text-zinc-400">
                {tableTimerSeconds <= 15 ? 'SUBMIT CARD TO DESK!' : isTimerRunning ? 'Clock Running...' : 'Ready to start'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={isTimerRunning ? () => setIsTimerRunning(false) : startTimer}
                className={`px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                  isTimerRunning 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-950'
                }`}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isTimerRunning ? 'Pause' : 'Start 60s'}</span>
              </button>

              <button
                onClick={resetTimer}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors border border-zinc-700"
                title="Reset Clock to 60s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-[10px] font-mono text-zinc-500">
            Hand next attempt card to table within 60s after leaving platform.
          </div>
        </div>
      </div>

      {/* OPENER INPUT & TIMED WARM-UP JUMP LADDER */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-mono uppercase text-zinc-300 font-bold">
              1st Attempt (Opener) Weight:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="2.5"
              value={openerKg}
              onChange={(e) => setOpenerKg(parseFloat(e.target.value) || 100)}
              className="w-28 p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm font-mono font-bold text-white text-center"
            />
            <span className="text-xs font-mono text-zinc-400">KG</span>
          </div>
        </div>

        {/* Timed Warm-up Jump Table */}
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase text-zinc-400 flex items-center justify-between">
            <span>Timed Warm-Up Jumps Leading to Platform:</span>
            <span className="text-[10px] text-zinc-500">Per-side plate loader</span>
          </div>

          <div className="space-y-2">
            {warmupJumps.map((jump, idx) => {
              const plates = calculatePlates(jump.weight);
              const isLast = idx === warmupJumps.length - 1;

              return (
                <div 
                  key={idx}
                  className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isLast 
                      ? 'bg-orange-950/40 border-orange-500/50' 
                      : 'bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-zinc-400 font-bold w-12">{jump.name}</span>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold font-mono text-white">{jump.weight} KG</span>
                        <span className="text-xs font-mono text-zinc-400">× {jump.reps} reps</span>
                        <span className="text-[10px] font-mono text-orange-400">({jump.pct}%)</span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        Take at ~{jump.targetMinOut} mins before stepping on platform
                      </div>
                    </div>
                  </div>

                  {/* Plates visualization */}
                  <div className="flex items-center gap-1 flex-wrap font-mono text-[10px]">
                    <span className="text-[10px] text-zinc-500 mr-1">Each Side:</span>
                    {plates.length > 0 ? (
                      plates.map((p, pIdx) => (
                        <span
                          key={pIdx}
                          style={{ backgroundColor: p.color, color: p.text }}
                          className="px-1.5 py-0.5 rounded font-bold shadow-sm"
                        >
                          {p.label}
                        </span>
                      ))
                    ) : (
                      <span className="text-zinc-600">Empty Bar</span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Platform Opener Target */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-orange-950 via-zinc-900 to-black border border-orange-500 text-white flex items-center justify-between font-mono">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                <span className="text-xs uppercase font-bold text-orange-300">PLATFORM OPENER:</span>
              </div>
              <div className="text-lg font-black italic text-white">
                {openerKg} KG (White Lights Target)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
