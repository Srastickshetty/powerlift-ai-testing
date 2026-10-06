import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import SetRow from "../ui/SetRow";
import Button from "../ui/Button";
import PlateCalculatorSheet from "../components/workout/PlateCalculatorSheet";
import JointPainSheet from "../components/workout/JointPainSheet";
import SwapExerciseSheet from "../components/workout/SwapExerciseSheet";
import SessionSummarySheet from "../components/workout/SessionSummarySheet";
import WorkoutHeader from "../components/workout/WorkoutHeader";
import InRackToolbar from "../components/workout/InRackToolbar";
import { useRestTimer } from "../components/workout/useRestTimer";
import { DEFAULT_EXERCISES, generateClientUuid } from "../components/workout/workoutDefaults";
import { useAuth } from "../auth/authContext";
import { enqueuePendingSet, useOfflineSync } from "../utils/offlineSyncManager";

export default function WorkoutMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const track = profile?.track === "bb" || profile?.pathway === "fitness" ? "bb" : "pl";
  const { isOnline, pendingCount, isSyncing, triggerManualSync } = useOfflineSync(user?.token);

  const [exercises, setExercises] = useState(DEFAULT_EXERCISES);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [activeSetIdx, setActiveSetIdx] = useState(2);

  const {
    isRunning: isTimerRunning,
    formatted: timerFormatted,
    startTimer,
    toggleTimer,
    addTime
  } = useRestTimer(120);

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
      } catch {
        // WakeLock may fail if low battery or backgrounded
      }
    };
    requestWakeLock();
    return () => {
      if (wakeLockSentinel) wakeLockSentinel.release();
    };
  }, []);

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

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }

    const clientUuid = generateClientUuid();
    enqueuePendingSet(id || "session-today", {
      clientUuid,
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.name,
      setType: currentSet.type?.toUpperCase() === 'WARM-UP' ? 'WARMUP' : 'WORKING',
      weightKg: Number(currentSet.weight) || 0,
      reps: Number(currentSet.reps) || 0,
      rpe: Number(currentSet.rating) || 8,
      note: currentSet.note || ''
    });

    handleSetChange(setIdx, { done: true });

    toast.success(`Set ${setIdx + 1} logged: ${currentSet.weight}kg × ${currentSet.reps}`, {
      action: {
        label: "Undo",
        onClick: () => handleSetChange(setIdx, { done: false })
      }
    });

    startTimer(120);

    if (setIdx + 1 < currentExercise.sets.length) {
      setActiveSetIdx(setIdx + 1);
    }
  };

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

  const activeWeight = currentExercise.sets[activeSetIdx]?.weight || 140;

  return (
    <div className="min-h-screen bg-bg text-ink font-sans select-none flex flex-col justify-between" data-track={track}>
      <WorkoutHeader
        onExit={() => navigate("/today")}
        onManualSync={triggerManualSync}
        isOnline={isOnline}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
        exerciseIndex={currentExIdx}
        totalExercises={exercises.length}
        exerciseName={currentExercise.name}
        timerFormatted={timerFormatted}
        isTimerRunning={isTimerRunning}
        onToggleTimer={toggleTimer}
        onAddTimerTime={addTime}
      />

      <main className="w-full max-w-2xl mx-auto px-4 py-4 space-y-4 flex-1">
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

        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-muted">Last session: {currentExercise.lastTime}</span>
          <span className="text-accent font-semibold">Target: {currentExercise.target}</span>
        </div>

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

        <InRackToolbar
          onShowPlates={() => setShowPlates(true)}
          onShowSwap={() => setShowSwap(true)}
          onAddSet={handleAddSet}
          onShowPain={() => setShowPain(true)}
        />
      </main>

      <footer className="sticky bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur p-4 pb-safe">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {currentExIdx < exercises.length - 1 && (
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
          )}

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
        onFinish={() => {
          toast.success("Workout recorded! Great work today.");
          navigate("/today");
        }}
      />
    </div>
  );
}
