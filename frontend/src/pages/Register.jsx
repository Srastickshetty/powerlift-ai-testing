import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "../auth/firebase";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create the user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      // 2. Send the Verification Email
      await sendEmailVerification(userCredential.user);
      
      // 3. Force Sign Out (so they have to verify before logging in)
      await signOut(auth);

      alert("SEQUENCING COMPLETE: Verification email dispatched. Check your inbox to activate system access.");
      navigate("/login");
    } catch (err) {
      console.error("REGISTRATION_FAILURE:", err);
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white font-sans relative overflow-hidden">
      
      {/* 🧬 BACKGROUND DECOR: CYBERNETIC DNA */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 border-l border-t border-orange-600/30" />
        <div className="absolute bottom-10 right-10 w-32 h-32 border-r border-b border-orange-600/30" />
        <div className="h-full w-full bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-6">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h2 className="text-orange-500 font-mono text-[10px] tracking-[0.5em] uppercase mb-2 animate-pulse">
            // Recruitment_Phase_01
          </h2>
          <h1 className="text-5xl md:text-6xl font-[1000] italic uppercase tracking-tighter">
            Build the <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">Machine</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="group relative bg-zinc-900/30 border border-white/5 p-8 backdrop-blur-sm">
            
            <div className="space-y-6">
              {/* EMAIL INPUT */}
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  placeholder="COMM_CHANNEL (EMAIL)"
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-b-2 border-zinc-800 p-3 font-mono text-sm focus:outline-none focus:border-orange-600 transition-all placeholder:text-zinc-700"
                />
              </div>

              {/* PASSWORD INPUT */}
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  placeholder="ACCESS_ENCRYPTION (PASSWORD)"
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-b-2 border-zinc-800 p-3 font-mono text-sm focus:outline-none focus:border-orange-600 transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* ERROR DISPLAY */}
            {error && (
              <div className="mt-4 text-[10px] font-mono text-red-500 bg-red-500/10 border border-red-500/20 p-2 text-center animate-pulse">
                {error}
              </div>
            )}

            {/* PROTOCOL BUTTON */}
            <button 
              type="submit"
              disabled={loading}
              className={`w-full mt-10 py-5 font-black uppercase italic text-2xl transition-all relative overflow-hidden group/btn
                ${loading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-white hover:text-black'}
              `}
              style={{ clipPath: 'polygon(0 0, 95% 0, 100% 30%, 100% 100%, 5% 100%, 0 70%)' }}
            >
              <span className="relative z-10">
                {loading ? "SEQUENCING..." : "Initialize Protocol"}
              </span>
              <div className="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
            </button>

            {/* PROGRESS SIMULATION */}
            <div className="mt-8 flex items-center gap-2">
              <div className="h-[2px] flex-1 bg-zinc-800 overflow-hidden">
                <div className="h-full bg-orange-600 animate-[loading_3s_ease-in-out_infinite]" style={{width: '30%'}} />
              </div>
              <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                {loading ? "Writing_Auth_Data..." : "Genetic_Audit_Standby"}
              </span>
            </div>
          </div>

          <p className="text-center text-[10px] text-zinc-500 uppercase tracking-widest mt-6">
            Already registered? <button type="button" onClick={() => navigate("/login")} className="text-orange-500 hover:text-white transition-colors underline underline-offset-4">Override to Login</button>
          </p>
        </form>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(200%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}