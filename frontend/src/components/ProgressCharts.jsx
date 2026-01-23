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
            <XAxis dataKey="week" />
            <YAxis domain={[0, 1]} />
            <Tooltip
  formatter={(value, name, props) => {
    if (props.payload.isPR) {
      return [`${value} kg (PR)`, "e1RM"];
    }
    return [`${value} kg`, "e1RM"];
  }}
/>

<Line
  type="monotone"
  dataKey="e1rm"
  stroke="#000"
  strokeWidth={2}
  dot={(props) => {
    const { cx, cy, payload } = props;

    if (!payload.isPR) {
      return <circle cx={cx} cy={cy} r={3} fill="#000" />;
    }

    return <circle cx={cx} cy={cy} r={6} fill="#16a34a" />;
  }}
/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
