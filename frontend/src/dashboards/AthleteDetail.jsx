import { useParams } from "react-router-dom";

export default function AthleteDetail() {
  const { athleteId } = useParams();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">
        Athlete Detail
      </h1>
      <p className="text-gray-500 mb-6">
        Athlete ID: {athleteId}
      </p>

      <div className="border rounded-lg p-4 bg-white">
        <p className="text-gray-600">
          🔧 Athlete analytics, logs, and program controls coming next.
        </p>
      </div>
    </div>
  );
}
