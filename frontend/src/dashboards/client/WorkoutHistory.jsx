import api from "../../api/api";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/authContext";

export default function WorkoutHistory() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get(`/logs?athlete_id=${user.athlete_id}`).then((res) => {
      setLogs(res.data);
    });
  }, []);
if (logs.length === 0) {
  return (
    <div className="text-gray-500">
      No workouts logged yet.
    </div>
  );
}

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Workout History</h2>

      {logs.map((log) => (
        <div key={log.date} className="border p-3 mb-2 rounded">
          <p className="font-medium">{log.date}</p>
          <p className="text-sm text-gray-600">
            Week {log.week}, Day {log.day}
          </p>
        </div>
      ))}
    </div>
  );
}
