export default function RecentSessionsTable({ sessions }) {
  if (!sessions || sessions.length === 0) {
    return (
      <p className="text-gray-500 mt-2">
        No sessions logged yet.
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 text-left">Date</th>
            <th className="border px-3 py-2">Week</th>
            <th className="border px-3 py-2">Day</th>
            <th className="border px-3 py-2">Missed Sets</th>
            <th className="border px-3 py-2">Avg RPE</th>
            <th className="border px-3 py-2 text-left">Notes</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s, i) => (
            <tr key={i} className="border-t">
              <td className="border px-3 py-2">{s.date}</td>
              <td className="border px-3 py-2 text-center">{s.week}</td>
              <td className="border px-3 py-2 text-center">{s.day}</td>
              <td className="border px-3 py-2 text-center">
                {s.missed_sets ?? 0}
              </td>
              <td className="border px-3 py-2 text-center">
                {s.avg_rpe ?? "-"}
              </td>
              <td className="border px-3 py-2">
                {s.session_notes || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
