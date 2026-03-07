import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import { motion } from "framer-motion";
import LoadingSpinner from "../components/animations/LoadingSpinner";

export default function AthleteDetailSimple() {
  const { athleteId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [athlete, setAthlete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const fetchAthleteData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = import.meta.env.PROD 
          ? 'https://powerlift-ai-backend.onrender.com'
          : 'http://localhost:5001';
        
        // Fetch athlete details
        const athleteRes = await fetch(`${apiUrl}/api/users/${athleteId}`);
        const athleteData = await athleteRes.json();
        
        if (athleteData) {
          setAthlete(athleteData);
          console.log("✅ Athlete data loaded:", athleteData);
        }
        
      } catch (err) {
        console.error("❌ ATHLETE_FETCH_ERROR:", err);
        setError("Failed to load athlete data");
      } finally {
        setLoading(false);
      }
    };

    if (athleteId) {
      fetchAthleteData();
    }
  }, [athleteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-8"
        >
          <LoadingSpinner type="orbit" size="large" text="LOADING_ATHLETE_DATA" />
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-orange-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-8 max-w-md"
        >
          <div className="text-red-500 font-mono text-lg mb-4">ERROR_LOADING_DATA</div>
          <div className="text-red-400 text-sm mb-6">{error}</div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded font-mono text-sm hover-glow"
          >
            RETRY
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  if (!athlete) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-center"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-8 max-w-md"
        >
          <div className="text-zinc-500 font-mono text-lg mb-4">ATHLETE_NOT_FOUND</div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-zinc-700 text-white rounded font-mono text-sm hover-lift"
          >
            BACK_TO_DASHBOARD
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#020202] text-white"
    >
      {/* HEADER WITH NAVIGATION */}
      <div className="bg-zinc-900 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate("/dashboard")}
                className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 hover-lift group"
              >
                <motion.span 
                  className="text-lg group-hover:text-orange-500 transition-colors"
                  whileHover={{ x: -5 }}
                >
                  ←
                </motion.span>
                <span className="text-sm font-mono uppercase">Back_to_Coach_Command</span>
              </button>
              
              <div className="h-8 w-px bg-zinc-700"></div>
              
              <motion.h1 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold uppercase italic"
              >
                {athlete.name || "Unknown_Athlete"}
              </motion.h1>
            </div>
            
            <div className="flex items-center gap-6">
              <motion.button 
                onClick={() => setActiveTab("details")}
                className={`px-4 py-2 text-sm font-mono uppercase transition-all hover-lift ${
                  activeTab === "details" 
                    ? "bg-green-600 text-white animate-glow" 
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Details
              </motion.button>
              
              <motion.button 
                onClick={() => setActiveTab("workouts")}
                className={`px-4 py-2 text-sm font-mono uppercase transition-all hover-lift ${
                  activeTab === "workouts" 
                    ? "bg-green-600 text-white animate-glow" 
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Workouts
              </motion.button>
              
              <motion.button 
                onClick={() => navigate(`/athlete/${athleteId}/agents`)}
                className={`px-4 py-2 text-sm font-mono uppercase transition-all hover-lift ${
                  activeTab === "agents" 
                    ? "bg-green-600 text-white animate-glow" 
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                AI_Agents
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Basic Info */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/40 border border-white/10 rounded-lg p-6 hover-glow"
            >
              <h2 className="text-lg font-bold uppercase italic text-green-500 mb-6">Bio_Data</h2>
              <div className="space-y-4 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-600">Name:</span>
                  <span className="text-zinc-300">{athlete.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Email:</span>
                  <span className="text-zinc-300">{athlete.email || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">UID:</span>
                  <span className="text-zinc-300">{athlete.uid?.substring(0, 8) || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Status:</span>
                  <span className="text-green-400">{athlete.coach_request_status || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Role:</span>
                  <span className="text-blue-400">{athlete.role || "client"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Training:</span>
                  <span className="text-blue-400">{athlete.training_mode || "individual"}</span>
                </div>
                {athlete.weight_class && (
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Weight Class:</span>
                    <span className="text-zinc-300">{athlete.weight_class}</span>
                  </div>
                )}
                {athlete.age && (
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Age:</span>
                    <span className="text-zinc-300">{athlete.age}</span>
                  </div>
                )}
                {athlete.profile_complete && (
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Profile:</span>
                    <span className="text-green-400">Complete</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Performance Stats */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900/40 border border-white/10 rounded-lg p-6 hover-glow"
            >
              <h2 className="text-lg font-bold uppercase italic text-blue-500 mb-6">Performance_Stats</h2>
              <div className="space-y-4 text-sm text-zinc-400">
                <p className="text-center text-zinc-600">Performance data will be displayed here</p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 bg-black/40 border border-white/10 rounded">
                    <div className="text-2xl font-bold text-blue-400">0</div>
                    <div className="text-xs font-mono uppercase mt-2">Total_Lifts</div>
                  </div>
                  <div className="text-center p-4 bg-black/40 border border-white/10 rounded">
                    <div className="text-2xl font-bold text-green-400">12</div>
                    <div className="text-xs font-mono uppercase mt-2">Workouts_Completed</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-zinc-900/40 border border-white/10 rounded-lg p-6 hover-glow"
            >
              <h2 className="text-lg font-bold uppercase italic text-purple-500 mb-6">Recent_Activity</h2>
              <div className="space-y-4 text-sm text-zinc-400">
                <p className="text-center text-zinc-600">Recent activity and workout history will be displayed here</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-black/40 border border-white/10 rounded">
                    <span className="text-zinc-600">Today</span>
                    <span className="text-green-400">Upper Body - Completed</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-black/40 border border-white/10 rounded">
                    <span className="text-zinc-600">Yesterday</span>
                    <span className="text-blue-400">Lower Body - In Progress</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "workouts" && (
          <motion.div
            key="workouts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold uppercase italic text-blue-500 mb-6">Workout_Programs</h2>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="text-center py-12 bg-zinc-900/40 border border-white/10 rounded-lg hover-glow">
                <p className="text-zinc-600 font-mono">Workout programs will be displayed here</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
