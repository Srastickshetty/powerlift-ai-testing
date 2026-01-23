import { useEffect, useState } from "react";
import api from "../api/api";
import { smoothSeries, getYAxisDomain } from "../utils/chartUtils";
import { detectPRs } from "../utils/prUtils";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function LiftChart({ title, rawData }) {
  if (!rawData || rawData.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-500">No data yet</p>
      </div>
    );
  }

  const data = smoothSeries(rawData);
  const domain = getYAxisDomain(data);

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis domain={domain} />
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

export default function ClientProgress({ athleteId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/progress/${athleteId}`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [athleteId]);

 if (!data) return <p>Loading progress...</p>;

const hasAnyData =
  (data.squat?.length > 0) ||
  (data.bench?.length > 0) ||
  (data.deadlift?.length > 0);
    <div className="text-gray-500">
      No progress data yet. Log workouts to see progress.
    </div>
  ;
}


