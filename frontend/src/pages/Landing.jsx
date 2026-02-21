import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

export default function Landing() {
  const navigate = useNavigate();
  
  // --- 1. THE HYPE POOL (TICKER) ---
  const tickerPhrases = [
    "FORCE = MASS × ACCELERATION",
    "MAXIMIZE MOTOR UNIT RECRUITMENT",
    "CENTRAL NERVOUS SYSTEM OVERRIDE ACTIVE",
    "TORQUE GENERATION: PEAK EFFICIENCY",
    "OPTIMIZE THE LEVER ARM. REDUCE THE MOMENT.",
    "BEND THE BAR OR THE BAR BENDS YOU",
    "STRETCH-SHORTENING CYCLE: LOADED",
    "INTRA-ABDOMINAL PRESSURE STABILIZED",
    "HIP DRIVE: THE ULTIMATE EQUALIZER",
    "VELOCITY LOSS DETECTED. PUSH THROUGH.",
    "POST-ACTIVATION POTENTIATION ENGAGED",
    "KINEMATIC CHAIN INTEGRITY: 100%",
    "THE PLATFORM DOES NOT RECOGNIZE FEAR",
    "GRAVITY IS A CONSTANT. WILL IS THE VARIABLE.",
    "MYOFIBRILLAR HYPERTROPHY PROTOCOL ACTIVE",
    "RPE 10 DETECTED. ASCENSION IMMINENT.",
    "ECCENTRIC LOADING COMPLETED. FIRE.",
    "CALCULATING 1RM PROJECTIONS...",
    "ATP-CP STORES DEPLETED. RESYNTHESIZING...",
    "POWERLIFT_AI // RECALIBRATING LIMITS"
  ];

  // --- 2. THE DATA POINT POOL ---
  const dataPool = [
    { id: "NEURAL", label: "Neural Drive", desc: "Unlock 100% motor unit recruitment. Most people only use 60% of their strength. We take the rest." },
    { id: "BIO", label: "Kinematics", desc: "Perfecting the lever arm. Your body is a machine; we optimize the torque and force output." },
    { id: "LOAD", label: "Iron Logic", desc: "Gravity is a constant. Your output isn't. Track the velocity of every single rep." },
    { id: "HYPER", label: "Myofibrillar", desc: "Targeted damage to the contractile apparatus. Rebuild stronger. Rebuild heavier." },
    { id: "VEO", label: "VBT Protocol", desc: "Velocity Based Training. If the bar slows down, you're failing. Keep the lightning in the iron." },
    { id: "RECOV", label: "Metabolic Shift", desc: "Optimizing ATP-CP pathways. Minimum rest, maximum violent output." }
  ];

  // Logic to pick 3 random items from the pool on mount
  const [activeData, setActiveData] = useState("");
  const [displayData, setDisplayData] = useState([]);

  useEffect(() => {
    // Shuffle and pick 3
    const shuffled = [...dataPool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    setDisplayData(selected);
    setActiveData(selected[0].id); // Set the first one as default active
  }, []);

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#050505] text-white font-sans">
      
      {/* 🎥 THE VOID: VIDEO BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay muted loop playsInline
          className="h-full w-full object-cover opacity-30 grayscale contrast-125 scale-110"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-heavy-weightlifter-in-a-gym-23423-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      {/* 📡 TOP DATA TICKER (THE HYPE MACHINE) */}
      <div className="absolute top-0 w-full bg-orange-600/90 text-black py-1 overflow-hidden whitespace-nowrap z-50">
        <div className="flex animate-[scroll_40s_linear_infinite] font-black uppercase text-[11px] tracking-widest italic">
          {/* We render the array twice to ensure seamless looping */}
          {[...tickerPhrases, ...tickerPhrases].map((phrase, i) => (
            <span key={i} className="mx-8 flex items-center">
              {phrase} <span className="ml-8 opacity-30">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* 🏗️ MAIN INTERACTIVE CORE */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-7xl w-full">
        <div className="mb-4 flex flex-col items-center w-full">
            <span className="text-orange-500 font-mono text-[10px] tracking-[0.4em] uppercase mb-2">Internal System v2.06</span>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-[1000] italic leading-none tracking-tight uppercase whitespace-nowrap">
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-white to-gray-400 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] pb-2">
                &nbsp;POWERLIFT-AI&nbsp;
              </span>
            </h1>
        </div>

        {/* INTERACTIVE DATA POINTS (NOW RANDOMIZED) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10 w-full">
            {displayData.map((item) => (
                <div 
                    key={item.id}
                    onMouseEnter={() => setActiveData(item.id)}
                    className={`p-6 border-l-4 transition-all duration-300 cursor-help ${activeData === item.id ? 'bg-white/5 border-orange-600 scale-105' : 'bg-transparent border-white/10 opacity-40 hover:opacity-100'}`}
                >
                    <h3 className="font-black italic text-xl text-left uppercase">{item.label}</h3>
                    <p className="text-[10px] text-left text-gray-400 mt-2 leading-relaxed">{item.desc}</p>
                </div>
            ))}
        </div>

        {/* 💀 AGGRESSIVE CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={() => navigate("/login")}
            className="group relative px-16 py-6 bg-white text-black font-black text-2xl uppercase italic overflow-hidden transition-all hover:bg-orange-600 hover:text-white"
          >
            <span className="relative z-10">Ascend Now</span>
            <div className="absolute top-0 left-0 w-0 h-full bg-black/10 transition-all group-hover:w-full" />
          </button>
          
          <button
            onClick={() => navigate("/register")}
            className="group px-16 py-6 border-4 border-white text-white font-black text-2xl uppercase italic hover:bg-white hover:text-black transition-all"
          >
            Join the 1%
          </button>
        </div>

        <p className="mt-12 text-[9px] uppercase tracking-[0.3em] text-gray-600 max-w-md italic">
          WARNING: This platform is not for the casual lifter. If you fear the iron, leave now. We build monsters, not enthusiasts.
        </p>
      </div>

      {/* 📟 HUD: LEFT SIDE */}
      <div className="absolute left-6 bottom-10 hidden lg:flex flex-col gap-4 font-mono text-[10px] text-white/30 border-l border-white/10 pl-4">
         <div>[FORCE_VECTOR: 9.81 m/s²]</div>
         <div>[OXYGEN_SAT: OPTIMAL]</div>
         <div className="text-orange-600">[ADRENALINE_DRIVE: HIGH]</div>
      </div>

      {/* 📟 HUD: RIGHT SIDE */}
      <div className="absolute right-6 bottom-10 hidden lg:block text-right font-mono text-[10px] text-white/30">
         <p>LATENCY: 0.002ms</p>
         <p>ENCRYPTION: AES-256</p>
         <p className="mt-2 text-white/60">POWERLIFT_AI // GLOBAL_LEADERBOARD</p>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        button { clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%); }
      `}</style>
    </div>
  );
}