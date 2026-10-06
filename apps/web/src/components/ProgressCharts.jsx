import { memo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default memo(function ProgressCharts({ progress }) {
  // Fallback to empty arrays if data not available
  const squat = progress?.squat || [];
  const bench = progress?.bench || [];
  const deadlift = progress?.deadlift || [];
  const fatigue = progress?.fatigue || [];

  if (!squat.length && !bench.length && !deadlift.length && !fatigue.length) {
    return (
      <div className="p-4 text-center text-gray-500 italic">
        No progress data available yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      
      {/* Load Progression */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-lg font-semibold mb-3">Load Progression</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={squat.length > 0 ? squat : bench.length > 0 ? bench : deadlift}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => `${Math.round(value)} kg`} />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Fatigue Trend */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-lg font-semibold mb-3">Fatigue Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={fatigue.length > 0 ? fatigue : [{date: 'N/A', value: 0}]}>
            <XAxis dataKey="date" />
            <YAxis domain={[0, 10]} />
            <Tooltip formatter={(value) => `RPE: ${value}`} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="RPE"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
});
