import React from "react";

export default function Stat({ label, value, unit, change, changeType = "ok", className = "" }) {
  const changeColors = {
    ok: "text-ok",
    warn: "text-warn",
    danger: "text-danger",
    neutral: "text-muted"
  };

  return (
    <div className={`rounded-xl border border-line bg-surface p-4 ${className}`}>
      <span className="text-xs uppercase font-mono tracking-wider text-muted block">{label}</span>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="num text-2xl sm:text-3xl font-bold text-ink">{value}</span>
        {unit && <span className="text-xs text-muted">{unit}</span>}
      </div>
      {change && (
        <span className={`num text-xs font-semibold mt-1 inline-block ${changeColors[changeType]}`}>
          {change}
        </span>
      )}
    </div>
  );
}
