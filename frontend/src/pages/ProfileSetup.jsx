import { useState } from "react";
import { useAuth } from "../auth/authContext";
import { useNavigate } from "react-router-dom";
import { Brain, Target, Activity, Users, Trophy, Zap, CheckCircle } from 'lucide-react';
import { db } from '../auth/firebase'; // Import Firebase db from correct path
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore'; // Import Firestore functions

export default function ProfileSetup() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: profile?.name || "",
    age: profile?.age || "",
    bodyweight: profile?.bodyweight || "",
    squat: profile?.training_max?.squat || "",
    bench: profile?.training_max?.bench || "",
    deadlift: profile?.training_max?.deadlift || "",
    experience_level: profile?.experience_level || "beginner",
    days_available: profile?.days_available || 3,
    goal: profile?.goal || "strength",
    profile_complete: true
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [isCoachMode, setIsCoachMode] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Update isCoachMode when training_mode changes
      if (name === 'training_mode') {
        setIsCoachMode(value === 'coach');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First update the profile in Firebase
      const userDocRef = doc(db, "athletes", user.uid);
      const profileData = {
        ...formData,
        training_max: {
          squat: parseFloat(formData.squat),
          bench: parseFloat(formData.bench),
          deadlift: parseFloat(formData.deadlift),
        },
        updated_at: serverTimestamp(),
      };

      // Try to update profile, but don't fail if Firestore is blocked
      try {
        if (profile) {
          await updateDoc(userDocRef, profileData);
        } else {
          await setDoc(userDocRef, {
            ...profileData,
            uid: user.uid,
            email: user.email,
            created_at: serverTimestamp(),
          });
        }
        console.log("✅ Profile saved to Firebase");
      } catch (firestoreError) {
        console.warn("⚠️ Firestore blocked, continuing with backend only:", firestoreError.message);
      }
      
      // Try to initialize system data, but don't fail if Firestore is blocked
      try {
        await setDoc(userDocRef, {
          profile_complete: true,
          created_at: serverTimestamp(),
          // 🆕 Training Mode Fields
          training_mode: isCoachMode ? "coach" : "self",
          coach_id: isCoachMode ? "T37Oellg4pg5oE9HA6kWTqDIFvF2" : null,
          coach_request_status: isCoachMode ? "pending" : "none",
        }, { merge: true });
        console.log("✅ System data saved to Firebase");
      } catch (firestoreError) {
        console.warn("⚠️ Firestore system data blocked, continuing:", firestoreError.message);
      }

      // Generate the initial program via backend (this is the critical part)
      const apiUrl = import.meta.env.PROD 
        ? 'https://powerlift-ai-backend.onrender.com'
        : 'http://localhost:5001';
      
      console.log("🎯 Generating program via backend...");
      const response = await fetch(
        `${apiUrl}/api/programs/generate/${user.uid}`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate program: ${response.status}`);
      }

      const programData = await response.json();
      console.log("✅ Program generated successfully:", programData);

      // Only navigate after program generation succeeds
      navigate("/dashboard");
      
    } catch (err) {
      console.error("SYSTEM_INIT_FAILURE:", err);
      
      // Provide more specific error messages
      if (err.message.includes("404")) {
        alert("Backend is still deploying. Please wait 1-2 minutes and try again.");
      } else if (err.message.includes("Failed to fetch")) {
        alert("Network error. Please check your connection and try again.");
      } else {
        alert(`Failed to complete profile setup: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-orange-500/30 flex items-center justify-center p-4 overflow-hidden relative">
      
      {/* 🌌 BACKGROUND OVERLAYS */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-900/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        
        {/* HEADER: PROTOCOL IDENTIFIER */}
        <div className="mb-8 flex items-end justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-orange-600" />
              <span className="font-mono text-[10px] tracking-[0.4em] text-orange-500 uppercase">Initialization_Protocol_v4.0</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-[1000] italic uppercase tracking-tighter leading-none">
              System <span className="text-zinc-700">Calibration</span>
            </h1>
          </div>
          <div className="hidden md:block text-right font-mono text-[10px] text-zinc-500">
            LOC: NEURAL_LINK_01<br />
            STATUS: WAITING_FOR_INPUT
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-1">
          
          {/* LEFT PANEL: BIOMETRIC SCAN */}
          <div className="lg:col-span-5 bg-zinc-900/40 border border-white/5 p-8 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 font-mono text-[8px] text-white/10 uppercase">Scan_Area_01</div>
            <h3 className="text-orange-500 font-mono text-xs tracking-widest uppercase mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping" /> Biometrics
            </h3>

            <div className="space-y-6">
              {[
                { name: "age", label: "Age_Identity", type: "number" },
                { name: "bodyweight", label: "Mass_Metric (KG)", type: "number" },
              ].map((field) => (
                <div key={field.name} className="relative">
                  <label className="block font-mono text-[9px] text-zinc-500 uppercase mb-1">{field.label}</label>
                  <input
                    name={field.name}
                    type={field.type}
                    onChange={handleChange}
                    required
                    className="w-full bg-black/50 border-l-2 border-zinc-800 p-3 font-mono text-sm focus:border-orange-600 focus:bg-orange-600/5 outline-none transition-all uppercase"
                  />
                </div>
              ))}
              
              <div className="relative">
                <label className="block font-mono text-[9px] text-zinc-500 uppercase mb-1">Expertise_Tier</label>
                <select 
                  name="experience_level" 
                  onChange={handleChange} 
                  required
                  className="w-full bg-black/50 border-l-2 border-zinc-800 p-3 font-mono text-sm focus:border-orange-600 outline-none transition-all text-white appearance-none uppercase"
                >
                  <option value="">Select_Level</option>
                  <option value="beginner">Beginner_Unit</option>
                  <option value="intermediate">Intermediate_Unit</option>
                  <option value="advanced">Advanced_Unit</option>
                </select>
              </div>

              {/* 🆕 TRAINING MODE SELECTION */}
              <div className="relative">
                <label className="block font-mono text-[9px] text-zinc-500 uppercase mb-1">Operational_Mode</label>
                <select 
                  name="training_mode" 
                  onChange={handleChange} 
                  required
                  className="w-full bg-black/50 border-l-2 border-zinc-800 p-3 font-mono text-sm focus:border-orange-600 outline-none transition-all text-white appearance-none uppercase"
                >
                  <option value="self">Self_Training</option>
                  <option value="coach">Request_Coach_Link</option>
                </select>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: LOAD CAPACITIES */}
          <div className="lg:col-span-7 bg-zinc-900/20 border border-white/5 p-8 backdrop-blur-xl relative">
            <h3 className="text-orange-500 font-mono text-xs tracking-widest uppercase mb-8">Load_Capacities_1RM</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: "squat", label: "SQUAT_MAX" },
                { name: "bench", label: "BENCH_MAX" },
                { name: "deadlift", label: "DEADLIFT_MAX" },
                { name: "days_available", label: "FREQ_DAYS/WK" },
              ].map((field) => (
                <div key={field.name} className="group">
                  <label className="block font-mono text-[9px] text-zinc-500 uppercase mb-1 group-hover:text-orange-500 transition-colors">{field.label}</label>
                  <div className="relative">
                    <input
                      name={field.name}
                      type="number"
                      onChange={handleChange}
                      required
                      className="w-full bg-transparent border-b border-zinc-800 p-3 font-black text-2xl italic focus:border-orange-600 outline-none transition-all placeholder:opacity-10"
                      placeholder="000"
                    />
                    <div className="absolute right-0 bottom-0 text-[10px] font-mono text-zinc-700 tracking-tighter">DATA_INPUT</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ACTION BUTTON */}
            <button 
              type="submit"
              className="w-full mt-12 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-orange-600 skew-x-[-12deg] group-hover:bg-white transition-all duration-300" />
              <div className="relative py-5 flex items-center justify-center gap-4">
                <span className="font-[1000] italic text-2xl uppercase tracking-tighter text-white group-hover:text-black transition-colors">
                  Confirm_Calibration
                </span>
                <span className="text-white group-hover:text-black animate-pulse">▶▶</span>
              </div>
            </button>
          </div>
        </form>

        {/* FOOTER DATA STREAM */}
        <div className="mt-6 flex justify-between items-center font-mono text-[8px] text-zinc-600 tracking-[0.3em] uppercase">
          <div className="flex gap-4">
            <span>SECURE_ENCRYPTION_ACTIVE</span>
            <span>//</span>
            <span>CORE_ID: {user?.uid.substring(0,8)}</span>
          </div>
          <div className="animate-pulse">Waiting_for_Confirmation...</div>
        </div>
      </div>
    </div>
  );
}