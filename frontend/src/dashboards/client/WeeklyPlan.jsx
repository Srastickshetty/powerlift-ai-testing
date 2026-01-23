import api from "../../api/api";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/authContext";

export default function WeeklyPlan() {
  const { user } = useAuth();
  const [program, setProgram] = useState(null);

  useEffect(() => {
    api.get(`/programs/${user.athlete_id}`).then((res) => {
      setProgram(res.data);
    });
  }, []);

  if (!program) return <p>Loading weekly plan...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Weekly Plan</h2>

      {program.weeks[0].days.map((day) => (
        <div key={day.day} className="border p-4 mb-3 rounded">
          <h3 className="font-semibold mb-2">Day {day.day}</h3>

          {day.main_lifts.map((lift) => (
            <p key={lift.lift}>
              {lift.lift}: {lift.sets}×{lift.reps} @ {lift.load}kg
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
