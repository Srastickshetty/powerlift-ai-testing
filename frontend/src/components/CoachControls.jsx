import api from "../api/api";
import { useState } from "react";

export default function CoachControls({ athleteId }) {
  const [date, setDate] = useState("");

  return (
    <div className="border rounded-lg p-4 bg-gray-50 mt-6">
      <h2 className="text-xl font-semibold mb-4">🧠 Coach Controls</h2>

      <div className="flex flex-col gap-3">
        <button
          onClick={() =>
            api.post("/coach/force-deload", { athlete_id: athleteId })
          }
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Force Deload Next Week
        </button>

        <button
          onClick={() =>
            api.post("/coach/toggle-autoreg", {
              athlete_id: athleteId,
              enabled: false,
            })
          }
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          Disable Autoregulation
        </button>

        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <button
            onClick={() =>
              api.post("/coach/set-competition", {
                athlete_id: athleteId,
                date,
              })
            }
            className="bg-black text-white px-4 py-2 rounded"
          >
            Set Competition
          </button>
        </div>
      </div>
    </div>
  );
}
