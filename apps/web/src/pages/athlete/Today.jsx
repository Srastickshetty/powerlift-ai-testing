import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, CheckCircle2, ChevronRight, Info, Coffee } from "lucide-react";
import Button from "../../ui/Button";
import Skeleton from "../../ui/Skeleton";
import EmptyState from "../../ui/EmptyState";
import Stat from "../../ui/Stat";
import { getDefaultSession } from "./todayDefaults";
import { useAuth } from "../../auth/authContext";

export default function Today() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [readiness, setReadiness] = useState(8);
  const [loading, setLoading] = useState(false);
  const [isRestDay, setIsRestDay] = useState(false);
  const [plannedSession, setPlannedSession] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  const track = profile?.track === "bb" || profile?.pathway === "fitness" || profile?.track === "BODYBUILDING" ? "bb" : "pl";

  useEffect(() => {
    let isMounted = true;
    async function loadToday() {
      try {
        const token = user?.token || localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/api/v1/training/today', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            setPlannedSession(data.plannedSession);
            setActiveSession(data.activeSession);
          }
        }
      } catch (e) {
        // Dev / offline mode fallback
      }
    }
    loadToday();
    return () => { isMounted = false; };
  }, [user]);

  const defaultSession = getDefaultSession(track);

  const session = plannedSession ? {
    id: activeSession ? activeSession.id : plannedSession.id,
    name: plannedSession.name || (track === "pl" ? `Week ${plannedSession.week} · SBD Day ${plannedSession.day}` : `Week ${plannedSession.week} · Hypertrophy Day ${plannedSession.day}`),
    duration: "~70 min",
    exerciseCount: plannedSession.plannedSets?.length ? new Set(plannedSession.plannedSets.map(s => s.exerciseId)).size : defaultSession.exerciseCount,
    topSet: defaultSession.topSet,
    exercises: plannedSession.plannedSets?.length ? plannedSession.plannedSets.slice(0, 5).map(s => ({
      name: s.exercise?.name || "Main Lift",
      sets: `${s.reps || 5} reps @ ${s.target?.prescribedLoadKg || 100}kg`
    })) : defaultSession.exercises
  } : defaultSession;

  const handleStartWorkout = async () => {
    if (activeSession) {
      navigate(`/workout/${activeSession.id}`);
      return;
    }
    try {
      const token = user?.token || localStorage.getItem('token');
      if (token && plannedSession?.id) {
        const res = await fetch('/api/v1/training/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            plannedSessionId: plannedSession.id,
            rpeTarget: 8
          })
        });
        if (res.ok) {
          const body = await res.json();
          if (body.session?.id) {
            navigate(`/workout/${body.session.id}`);
            return;
          }
        }
      }
    } catch (e) {
      // offline fallback
    }
    navigate(`/workout/${session.id}`);
  };

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isRestDay) {
    return (
      <EmptyState
        icon={Coffee}
        title="Scheduled Rest & Recovery Day"
        description="Muscle protein synthesis and central nervous system replenishment in progress. Hydrate and eat for growth."
        actionLabel="Log Optional Active Recovery"
        onAction={() => setIsRestDay(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <span className="num text-2xl font-bold tracking-tight text-ink">{todayDate}</span>
          <span className="text-xs text-muted block">Week 3 of 12 · Block 1 Accumulation</span>
        </div>
        
        {/* Quick Readiness Indicator */}
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5">
          <span className="text-xs text-muted">Readiness:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setReadiness(lvl * 2)}
                className={`h-3 w-3 rounded-full transition ${
                  lvl <= Math.round(readiness / 2) ? "bg-accent" : "bg-line"
                }`}
                title={`Set readiness ${lvl * 2}/10`}
              />
            ))}
          </div>
          <span className="num text-xs font-semibold text-ink ml-1">{readiness}/10</span>
        </div>
      </div>

      {/* 12-Column Responsive Layout: Col 1-8 Main Workout, Col 9-12 Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <div className="lg:col-span-8 space-y-6">
          {/* Main Hero Session Card */}
          <article className="rounded-xl border border-line bg-surface p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1.5 w-full bg-accent" />
            
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">Today's Workout</span>
                <h1 className="num text-3xl sm:text-4xl font-bold mt-1 text-ink">{session.name}</h1>
                <p className="text-sm text-muted mt-1">
                  {session.exerciseCount} exercises · {session.duration} estimated
                </p>
              </div>
              <div className="rounded-md border border-line bg-bg px-3 py-1.5 text-center">
                <span className="text-[10px] uppercase text-muted block">Prescribed Top Set</span>
                <span className="num text-base font-bold text-accent">{session.topSet}</span>
              </div>
            </div>

            {/* Exercise preview list */}
            <div className="mt-6 divide-y divide-line rounded-lg border border-line bg-bg/50">
              {session.exercises.map((ex, i) => (
                <div key={ex.name} className="flex items-center justify-between p-3.5 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="num text-xs text-muted w-4">{i + 1}</span>
                    <span className="font-semibold text-ink">{ex.name}</span>
                  </div>
                  <span className="text-xs text-muted num">{ex.sets}</span>
                </div>
              ))}
            </div>

            {/* 56px Start Session Button */}
            <div className="mt-6">
              <Button
                variant="primary"
                size="lg"
                className="w-full text-lg shadow-lg shadow-accent/15"
                onClick={handleStartWorkout}
              >
                <Play className="h-5 w-5 fill-current" />
                {activeSession ? "RESUME LIVE WORKOUT" : "START WORKOUT SESSION"}
              </Button>
            </div>
          </article>

          {/* Weekly Consistency Card */}
          <div className="rounded-xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="font-semibold text-ink">This Week: 2 of 4 Sessions Completed</span>
              <span className="num text-xs font-bold text-ok">50% Adherence</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="rounded-lg border border-ok/40 bg-ok/10 p-3 text-center">
                <span className="text-xs block text-muted">Mon</span>
                <CheckCircle2 className="h-5 w-5 text-ok mx-auto mt-1" />
              </div>
              <div className="rounded-lg border border-ok/40 bg-ok/10 p-3 text-center">
                <span className="text-xs block text-muted">Wed</span>
                <CheckCircle2 className="h-5 w-5 text-ok mx-auto mt-1" />
              </div>
              <div className="rounded-lg border border-accent bg-accent/10 p-3 text-center">
                <span className="text-xs block text-accent font-semibold">Today</span>
                <span className="num text-xs font-bold text-accent block mt-1">Ready</span>
              </div>
              <div className="rounded-lg border border-line bg-bg p-3 text-center opacity-60">
                <span className="text-xs block text-muted">Sat</span>
                <span className="text-xs text-muted block mt-1">—</span>
              </div>
            </div>
          </div>

          {/* Autoregulation Insight Card */}
          <div className="rounded-xl border border-line bg-surface p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-raised border border-line text-accent shrink-0">
              <Info className="h-5 w-5" />
            </div>
            <div className="flex-1 text-sm">
              <h3 className="font-semibold text-ink">Why this workout changed</h3>
              <p className="text-muted text-xs sm:text-sm mt-1 leading-relaxed">
                {track === "pl"
                  ? "Based on last session's squat RPE (8.0 vs planned 7.5), load was maintained at 140kg while adding +1 back-off set to reinforce velocity at sticking point."
                  : "Chest volume was bumped +2 sets for this mesocycle based on high recovery score and low fatigue markers."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Desktop Support Column (Col 9-12) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="grid grid-cols-1 gap-3">
            <Stat
              label={track === "pl" ? "Squat e1RM" : "Weekly Chest Sets"}
              value={track === "pl" ? "172.5" : "16"}
              unit={track === "pl" ? "kg" : "sets"}
              change="+5.0 kg this block"
              changeType="ok"
            />
            <Stat
              label={track === "pl" ? "Bench e1RM" : "Weekly Back Sets"}
              value={track === "pl" ? "122.5" : "18"}
              unit={track === "pl" ? "kg" : "sets"}
              change="+2.5 kg this block"
              changeType="ok"
            />
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted block mb-1">Coach Feedback</span>
            <p className="text-xs text-ink italic leading-relaxed">
              "Focus on opening knees out on the descent today. Don't rush out of the hole."
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-muted border-t border-line pt-2">
              <span>Coach Michael</span>
              <Link to="/coach" className="text-accent hover:underline">Reply</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
