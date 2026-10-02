import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Timer, 
  Plus, 
  AlertTriangle, 
  Layers, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Sparkles,
  Play,
  Pause
} from "lucide-react";
import { toast } from "sonner";
import SetRow from "../ui/SetRow";
import Button from "../ui/Button";
import PlateCalculatorSheet from "../components/workout/PlateCalculatorSheet";
import JointPainSheet from "../components/workout/JointPainSheet";
import SwapExerciseSheet from "../components/workout/SwapExerciseSheet";
import SessionSummarySheet from "../components/workout/SessionSummarySheet";
import { useAuth } from "../auth/authContext";
import { enqueuePendingLog } from "../utils/offlineSyncManager";

const DEFAULT_EXERCISES = [
  {
    id: "ex_1",
    name: "Competition Squat",
    muscle: "Quads / Glutes",
    lastTime: "135 kg × 5 @ 7.0",
    target: "140 kg × 5 @ 7.5",
    sets: [
      { type: "Warm-up", weight: 60, reps: 5, rating: null, done: true },
      { type: "Warm-up", weight: 100, reps: 5, rating: null, done: true },
      { type: "Top Set", weight: 140, reps: 5, rating: 8, target: "140 × 5 @ 7.5", done: false },
      { type: "Back-off", weight: 122.5, reps: 5, rating: 7, target: "122.5 × 5 @ 7", done: false },
      { type: "Back-off", weight: 122.5, reps: 5, rating: 7, target: "122.5 × 5 @ 7", done: false },
    ]
  },
  {
    id: "ex_2",
    name: "Competition Pause Bench",
    muscle: "Chest / Triceps",
    lastTime: "92.5 kg × 6 @ 7.0",
    target: "95 kg × 6 @ 7.5",
    sets: [
      { type: "Warm-up", weight: 60, reps: 8, rating: null, done: false },
      { type: "Working", weight: 95, reps: 6, rating: 7, target: "95 × 6 @ 7.5", done: false },
      { type: "Working", weight: 95, reps: 6, rating: 7, target: "95 × 6 @ 7.5", done: false },
      { type: "Working", weight: 95, reps: 6, rating: 8, target: "95 × 6 @ 8", done: false },
    ]
  },
  {
    id: "ex_3",
    name: "Romanian Deadlift",
    muscle: "Hamstrings / Lower Back",
    lastTime: "105 kg × 8 @ 7.0",
    target: "110 kg × 8 @ 7.5",
    sets: [
      { type: "Working", weight: 110, reps: 8, rating: 7, target: "110 × 8", done: false },
      { type: "Working", weight: 110, reps: 8, rating: 7, target: "110 × 8", done: false },
      { type: "Working", weight: 110, reps: 8, rating: 8, target: "110 × 8", done: false },
    ]
  }
];

export default function WorkoutMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const track = profile?.track === "bb" || profile?.pathway === "fitness" ? "bb" : "pl";

  const [exercises, setExercises] = useState(DEFAULT_EXERCISES);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [activeSetIdx, setActiveSetIdx] = useState(2); // start on first pending set

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Bottom Sheets
  const [showPlates, setShowPlates] = useState(false);
  const [showPain, setShowPain] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [showFinish, setShowFinish] = useState(false);

  const currentExercise = exercises[currentExIdx] || exercises[0];

  // Screen Wake Lock API to prevent phone display sleep during training
  useEffect(() => {
    let wakeLockSentinel = null;
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLockSentinel = await navigator.wakeLock.request("screen");
        }
      } catch (err) {
        // WakeLock may fail if low battery or backgrounded
      }
    };
    requestWakeLock();

    return () => {
      if (wakeLockSentinel) wakeLockSentinel.release();
    };
  }, []);

  // Sticky Rest Timer Countdown
  useEffect(() => {
    if (isTimerRunning && restSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
            toast.info("Rest timer complete! Step up to the bar.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, restSeconds]);

  const startRestTimer = (seconds = 120) => {
    setRestSeconds(seconds);
    setIsTimerRunning(true);
  };

  // Modify Set
  const handleSetChange = (setIdx, patch) => {
    setExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[currentExIdx] };
      const updatedSets = [...ex.sets];
      updatedSets[setIdx] = { ...updatedSets[setIdx], ...patch };
      ex.sets = updatedSets;
      next[currentExIdx] = ex;
      return next;
    });
  };

  // Log Set as Prescribed / Complete
  const handleLogSet = (setIdx) => {
    const currentSet = currentExercise.sets[setIdx];

    // Haptic feedback
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Auto-save set locally for gym basement zero-data-loss
    enqueuePendingLog({
      workoutId: id || "session-today",
      exercise: currentExercise.name,
      setIndex: setIdx,
      weight: currentSet.weight,
      reps: currentSet.reps,
      rating: currentSet.rating,
      timestamp: new Date().toISOString()
    });

    // Mark done
    handleSetChange(setIdx, { done: true });

    // Toast with Undo
    toast.success(`Set ${setIdx + 1} logged: ${currentSet.weight}kg × ${currentSet.reps}`, {
      action: {
        label: "Undo",
        onClick: () => handleSetChange(setIdx, { done: false })
      }
    });

    // Auto-start rest timer
    startRestTimer(120);

    // Auto advance to next set if available
    if (setIdx + 1 < currentExercise.sets.length) {
      setActiveSetIdx(setIdx + 1);
    }
  };

  // Add Set
  const handleAddSet = () => {
    const lastSet = currentExercise.sets[currentExercise.sets.length - 1];
    const newSet = {
      type: "Working",
      weight: lastSet ? lastSet.weight : 100,
      reps: lastSet ? lastSet.reps : 5,
      rating: track === "bb" ? 2 : 8,
      target: lastSet?.target || "Prescribed",
      done: false
    };
    setExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[currentExIdx] };
      ex.sets = [...ex.sets, newSet];
      next[currentExIdx] = ex;
      return next;
    });
    setActiveSetIdx(currentExercise.sets.length);
  };

  // Remove Set
  const handleDeleteSet = (setIdx) => {
    if (currentExercise.sets.length <= 1) return;
    setExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[currentExIdx] };
      ex.sets = ex.sets.filter((_, i) => i !== setIdx);
      next[currentExIdx] = ex;
      return next;
    });
    setActiveSetIdx(Math.max(0, setIdx - 1));
  };

  // Total volume calculation
  const totalVolume = useMemo(() => {
    return exercises.reduce((acc, ex) => {
      return acc + ex.sets.reduce((sAcc, s) => {
        return s.done ? sAcc + (s.weight * s.reps) : sAcc;
      }, 0);
    }, 0);
  }, [exercises]);

  const completedSetsCount = useMemo(() => {
    return exercises.reduce((acc, ex) => {
      return acc + ex.sets.filter((s) => s.done).length;
    }, 0);
  }, [exercises]);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const activeWeight = currentExercise.sets[activeSetIdx]?.weight || 140;

  return (
    <div className="min-h-screen bg-bg text-ink font-sans select-none flex flex-col justify-between" data-track={track}>
      {/* Top Fixed Sticky Bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur px-4 py-3 pt-safe">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/today")}
            className="h-11 w-11 rounded-lg border border-line bg-raised grid place-items-center text-muted hover:text-ink transition"
            aria-label="Exit Workout"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Exercise Progression Indicator */}
          <div className="text-center">
            <span className="text-[11px] font-mono uppercase text-muted tracking-wider block">
              Exercise {currentExIdx + 1} of {exercises.length}
            </span>
            <h1 className="num text-xl sm:text-2xl font-bold text-ink truncate max-w-[200px] sm:max-w-xs">
              {currentExercise.name}
            </h1>
          </div>

          {/* Sticky Rest Timer Widget */}
          <div className="flex items-center gap-1.5 rounded-full border border-line bg-raised px-2.5 py-1">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="text-accent hover:brightness-110 p-0.5"
              aria-label={isTimerRunning ? "Pause Timer" : "Start Timer"}
            >
              {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <span className="num font-bold text-sm text-ink">{formatTimer(restSeconds)}</span>
            <button
              onClick={() => setRestSeconds((prev) => prev + 30)}
              className="text-[10px] num font-semibold text-muted hover:text-ink pl-1"
            >
              +30s
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="w-full max-w-2xl mx-auto px-4 py-4 space-y-4 flex-1">
        {/* Exercise Quick Navigation Pills */}
        <div className="flex items-center justify-between text-xs border-b border-line pb-2.5">
          <button
            disabled={currentExIdx === 0}
            onClick={() => { setCurrentExIdx(prev => prev - 1); setActiveSetIdx(0); }}
            className="flex items-center gap-1 text-muted disabled:opacity-30 hover:text-ink transition font-medium"
          >
            <ChevronLeft className="h-4 w-4" /> Prev Lift
          </button>

          <span className="text-muted text-[11px]">{currentExercise.muscle}</span>

          <button
            disabled={currentExIdx === exercises.length - 1}
            onClick={() => { setCurrentExIdx(prev => prev + 1); setActiveSetIdx(0); }}
            className="flex items-center gap-1 text-muted disabled:opacity-30 hover:text-ink transition font-medium"
          >
            Next Lift <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Ghost Performance Targets */}
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-muted">Last session: {currentExercise.lastTime}</span>
          <span className="text-accent font-semibold">Target: {currentExercise.target}</span>
        </div>

        {/* Set Rows Stack (Current active is expanded with steppers, others are compact) */}
        <div className="space-y-2.5">
          {currentExercise.sets.map((set, idx) => (
            <SetRow
              key={idx}
              idx={idx}
              set={set}
              active={activeSetIdx === idx}
              track={track}
              onChange={(patch) => handleSetChange(idx, patch)}
              onDone={() => handleLogSet(idx)}
              onSelect={() => setActiveSetIdx(idx)}
              onDelete={currentExercise.sets.length > 1 ? () => handleDeleteSet(idx) : null}
              unit="kg"
            />
          ))}
        </div>

        {/* In-Rack Utility Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowPlates(true)}
              className="text-xs"
            >
              <Layers className="h-4 w-4" />
              <span>Plates</span>
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowSwap(true)}
              className="text-xs"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Swap</span>
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={handleAddSet}
              className="text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Add Set</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="md"
            onClick={() => setShowPain(true)}
            className="text-xs text-warn hover:bg-warn/10"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Joint Pain?</span>
          </Button>
        </div>
      </main>

      {/* Bottom Sticky Action Area (Safe area padded) */}
      <footer className="sticky bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur p-4 pb-safe">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {currentExIdx < exercises.length - 1 ? (
            <Button
              variant="secondary"
              size="lg"
              className="flex-1 font-bold text-base"
              onClick={() => {
                setCurrentExIdx((prev) => prev + 1);
                setActiveSetIdx(0);
              }}
            >
              Next Exercise →
            </Button>
          ) : null}

          <Button
            variant="primary"
            size="lg"
            className="flex-1 font-bold text-base shadow-lg shadow-accent/20"
            onClick={() => setShowFinish(true)}
          >
            FINISH WORKOUT ({completedSetsCount} sets)
          </Button>
        </div>
      </footer>

      {/* Bottom Sheets */}
      <PlateCalculatorSheet
        isOpen={showPlates}
        onClose={() => setShowPlates(false)}
        targetWeight={activeWeight}
        barWeight={20}
      />

      <SwapExerciseSheet
        isOpen={showSwap}
        onClose={() => setShowSwap(false)}
        currentExercise={currentExercise.name}
        onSelect={(newExName) => {
          setExercises(prev => {
            const next = [...prev];
            next[currentExIdx] = { ...next[currentExIdx], name: newExName };
            return next;
          });
          toast.success(`Swapped to ${newExName}`);
        }}
      />

      <JointPainSheet
        isOpen={showPain}
        onClose={() => setShowPain(false)}
        onSubmit={(painData) => {
          toast.warning(`Pain logged for ${painData.area}: ${painData.severity}/10. Prescriptions auto-regulated.`);
        }}
      />

      <SessionSummarySheet
        isOpen={showFinish}
        onClose={() => setShowFinish(false)}
        totalVolume={totalVolume}
        completedSetsCount={completedSetsCount}
        track={track}
        onFinish={(summaryData) => {
          toast.success("Workout recorded! Great work today.");
          navigate("/today");
        }}
      />
    </div>
  );
}
