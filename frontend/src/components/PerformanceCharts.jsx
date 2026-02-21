import { memo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const SingleLiftChart = memo(({ title, data, color }) => {
  // If no data, show a helpful message instead of just "No Data"
  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] flex flex-col items-center justify-center border border-white/5 bg-black/20 text-[10px] uppercase font-mono">
        <span className="text-zinc-600 mb-2">No_Data_For: {title}</span>
        <span className="text-orange-500/50">Check if keys 'lift' or 'exercise' exist</span>
      </div>
    );
  }

  // Determine which key to use for the Y-Axis
  const firstItem = data[0];
  const dataKey = firstItem.value ? "value" : (firstItem.e1rm ? "e1rm" : (firstItem.volume ? "volume" : "load"));

  return (
    <div className="bg-black/40 border border-white/5 p-4 rounded-sm">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis dataKey="date" hide={true} />
          <YAxis hide={true} domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#121215', border: '1px solid #333', borderRadius: '4px' }}
            itemStyle={{ color: color, fontWeight: 'bold', fontSize: '12px' }}
          />
          <Line 
            type="monotone" 
            dataKey={dataKey} // <--- Dynamic key detection
            stroke={color} 
            strokeWidth={3} 
            dot={{ r: 4, fill: color }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

SingleLiftChart.displayName = 'SingleLiftChart';

export default memo(function PerformanceCharts({ progress }) {
  if (Array.isArray(progress) && progress.length > 0) {
    console.log("🔍 INSPECTING ONE ITEM:", Object.keys(progress[0]), progress[0]);
  }
  // --- Categorization Logic ---
  // If progress is an array, filter it. If it's already an object, use the keys.
  const categorizedData = {
    squat: Array.isArray(progress) 
      ? progress.filter(p => {
          const name = (p.lift || p.exercise || p.name || "").toLowerCase();
          return name.includes('squat');
        }) 
      : progress?.squat || [],
      
    bench: Array.isArray(progress) 
      ? progress.filter(p => {
          const name = (p.lift || p.exercise || p.name || "").toLowerCase();
          return name.includes('bench');
        }) 
      : progress?.bench || [],
      
    deadlift: Array.isArray(progress) 
      ? progress.filter(p => {
          const name = (p.lift || p.exercise || p.name || "").toLowerCase();
          return name.includes('deadlift');
        }) 
      : progress?.deadlift || [],
  };
  console.log("📊 CATEGORIZED_FOR_CHARTS:", categorizedData);

  return (
    <div className="space-y-4">
      {/* Fallback check if no data is found after categorization */}
      {(!progress || (Array.isArray(progress) && progress.length === 0)) && (
        <div className="p-4 border border-orange-500/50 bg-orange-500/10 text-orange-500 font-mono text-xs rounded">
          SYSTEM_ALERT: No progress logs detected in stream.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SingleLiftChart 
          title="Squat e1RM" 
          data={categorizedData.squat} 
          color="#f97316" 
        />
        <SingleLiftChart 
          title="Bench e1RM" 
          data={categorizedData.bench} 
          color="#3b82f6" 
        />
        <SingleLiftChart 
          title="Deadlift e1RM" 
          data={categorizedData.deadlift} 
          color="#ef4444" 
        />
      </div>
    </div>
  );
});