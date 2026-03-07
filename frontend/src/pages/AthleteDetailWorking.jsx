import { useParams, useNavigate } from "react-router-dom";

export default function AthleteDetailWorking() {
  const { athleteId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="text-center">
        <div className="text-4xl font-bold text-green-400 mb-4">✅ ATHLETE LOADED</div>
        <div className="text-xl mb-2">Athlete ID: {athleteId}</div>
        <div className="text-zinc-400 mb-8">Navigation is working!</div>
        
        <div className="space-x-4">
          <button 
            onClick={() => navigate(`/athlete/${athleteId}/agents`)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 mr-4"
          >
            AI Agents
          </button>
          
          <button 
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
