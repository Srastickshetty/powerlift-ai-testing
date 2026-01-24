import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function SingleLiftChart({ title, data }) {
  if (!data || data.length === 0) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 text-gray-500">
        No data available for {title}
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="font-semibold mb-2">{title}</h3>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="e1rm"
            stroke="#000"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function PerformanceCharts({ progress }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <SingleLiftChart title="Squat e1RM" data={progress.squat} />
      <SingleLiftChart title="Bench e1RM" data={progress.bench} />
      <SingleLiftChart title="Deadlift e1RM" data={progress.deadlift} />
    </div>
  );
}
