import { useEffect, useState } from "react";
import api from "../../api/api";

export default function TodayWorkout() {
  const athleteId = "athlete_001"; // later from auth

  const [program, setProgram] = useState(null);
  const [workout, setWorkout] = useState(null);
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  // 📅 Helper: days between dates
  const daysBetween = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.floor((e - s) / (1000 * 60 * 60 * 24));
  };
if (!workout) {
  return (
    <div className="p-6 text-center text-gray-500">
      💤 Rest Day — Recover & come back stronger
    </div>
  );
}

  useEffect(() => {
    async function loadTodayWorkout() {
      try {
        const res = await api.get(`/programs/${athleteId}`);
        const programData = res.data;

        setProgram(programData);

        const today = new Date().toISOString().slice(0, 10);
        const daysSinceStart = daysBetween(programData.start_date, today);

        if (daysSinceStart < 0) {
          setMessage("Program has not started yet.");
          setLoading(false);
          return;
        }

        const trainingDays = programData.weeks.flatMap((w) => w.days);
        const todayWorkout = trainingDays[daysSinceStart];

        if (!todayWorkout) {
          setMessage("😴 Rest Day — No workout scheduled today.");
          setLoading(false);
          return;
        }

        setWorkout(todayWorkout);

        // Initialize log
        setLog({
          main_lifts: todayWorkout.main_lifts.map((lift) => ({
            lift: lift.lift,
            prescribed: lift,
            performed: Array.from({ length: lift.sets }).map((_, i) => ({
              set: i + 1,
              reps: "",
              rpe: "",
            })),
          })),
          accessories: todayWorkout.accessories.map((a) => ({
            exercise: a.exercise,
            sets: a.sets,
            reps: a.reps,
            completed: false,
          })),
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load today’s workout.");
        setLoading(false);
      }
    }

    loadTodayWorkout();
  }, []);

  if (loading) return <div className="p-6">Loading today’s workout…</div>;
  if (message) return <div className="p-6 text-gray-600">{message}</div>;
  if (!workout || !log) return <div className="p-6">No workout found.</div>;

  const updateSet = (liftIdx, setIdx, field, value) => {
    const updated = structuredClone(log);
    updated.main_lifts[liftIdx].performed[setIdx][field] = value;
    setLog(updated);
  };

  const toggleAccessory = (idx) => {
    const updated = structuredClone(log);
    updated.accessories[idx].completed = !updated.accessories[idx].completed;
    setLog(updated);
  };

  const validate = () => {
    for (const lift of log.main_lifts) {
      for (const set of lift.performed) {
        if (set.reps === "") return "Enter reps for all sets.";
        if (set.rpe && (set.rpe < 0 || set.rpe > 10))
          return "RPE must be between 0–10.";
      }
    }
    return "";
  };

  const submitWorkout = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    try {
      await api.post("/logs", {
        athlete_id: athleteId,
        date: new Date().toISOString().slice(0, 10),
        day: workout.day,
        main_lifts: log.main_lifts,
        accessories: log.accessories,
        notes,
      });

      alert("✅ Workout logged successfully");
    } catch {
      alert("❌ Failed to log workout");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Today’s Workout</h1>
      <p className="text-gray-500 mb-6">Day {workout.day}</p>

      {log.main_lifts.map((lift, i) => (
        <div key={lift.lift} className="mb-8">
          <h2 className="text-xl font-semibold">{lift.lift}</h2>
          <p className="text-gray-500 mb-3">
            Prescribed: {lift.prescribed.sets}×{lift.prescribed.reps} @{" "}
            {lift.prescribed.load}kg
          </p>

          {lift.performed.map((set, j) => (
            <div
              key={set.set}
              className="grid grid-cols-3 gap-3 items-center mb-2"
            >
              <span>Set {set.set}</span>

              <input
                type="number"
                placeholder="Reps *"
                value={set.reps}
                onChange={(e) =>
                  updateSet(i, j, "reps", e.target.value)
                }
                className="border rounded px-2 py-1"
              />

              <input
                type="number"
                step="0.5"
                placeholder="RPE"
                value={set.rpe}
                onChange={(e) =>
                  updateSet(i, j, "rpe", e.target.value)
                }
                className="border rounded px-2 py-1"
              />
            </div>
          ))}
        </div>
      ))}

      <h2 className="text-xl font-semibold mb-2">Accessories</h2>
      {log.accessories.map((a, i) => (
        <label key={a.exercise} className="flex gap-3 mb-2">
          <input
            type="checkbox"
            checked={a.completed}
            onChange={() => toggleAccessory(i)}
          />
          {a.exercise} — {a.sets}×{a.reps}
        </label>
      ))}

      <textarea
        className="border w-full p-2 mt-4"
        placeholder="Session notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {error && <div className="text-red-600 mt-2">{error}</div>}

      <button
        onClick={submitWorkout}
        className="mt-4 bg-black text-white px-6 py-3 rounded-lg"
      >
        Submit Workout
      </button>
    </div>
  );
}
