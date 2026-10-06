import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-line bg-surface p-2.5 shadow-xl text-xs space-y-1">
        <span className="font-mono text-muted block">{label}</span>
        <div className="flex items-center gap-2">
          <span className="num font-bold text-base text-ink">{payload[0].value} kg</span>
          {data.isPR && (
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-accent/20 text-accent font-bold">
              ★ PR
            </span>
          )}
        </div>
        {data.note && <span className="text-[11px] text-muted italic block">{data.note}</span>}
      </div>
    );
  }
  return null;
};

export default function ChartCard({
  title,
  subtitle,
  data = [],
  dataKey = "value",
  unit = "kg",
  color = "var(--accent)",
  className = ""
}) {
  return (
    <div className={`rounded-xl border border-line bg-surface p-5 space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="num text-xl font-bold text-ink">{title}</h3>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
      </div>

      <div className="h-[180px] md:h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" opacity={0.6} />
            <XAxis
              dataKey="week"
              stroke="var(--muted)"
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              tickLine={false}
            />
            <YAxis
              stroke="var(--muted)"
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              tickLine={false}
              domain={["dataMin - 5", "dataMax + 5"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              dot={{ fill: "var(--surface)", stroke: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: color, stroke: "var(--bg)", strokeWidth: 2 }}
            />
            {data.map((item, idx) =>
              item.isPR ? (
                <ReferenceDot
                  key={idx}
                  x={item.week}
                  y={item[dataKey]}
                  r={7}
                  fill="var(--accent)"
                  stroke="var(--bg)"
                  strokeWidth={2}
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
