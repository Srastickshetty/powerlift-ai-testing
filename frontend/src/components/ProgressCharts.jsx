import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ProgressCharts({ e1RMTrend, fatigueTrend }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      
      {/* e1RM Trend */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-lg font-semibold mb-3">e1RM Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={e1RMTrend}>
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="squat" stroke="#16a34a" />
            <Line type="monotone" dataKey="bench" stroke="#2563eb" />
            <Line type="monotone" dataKey="deadlift" stroke="#dc2626" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Fatigue Trend */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-lg font-semibold mb-3">Fatigue Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={fatigueTrend}>
            <XAxis dataKey="date" />
            <YAxis domain={[0, 1]} />
            <Tooltip
              formatter={(value) => [
                `${Math.round(value * 100)}%`,
                "Fatigue",
              ]}
            />
            <Line
              type="monotone"
              dataKey="fatigue"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
