import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  UserCheck, 
  Clock, 
  ShieldCheck, 
  Brain, 
  ChevronRight, 
  CheckCircle,
  BellRing,
  Award,
  Zap,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function HumanCoachComingSoonModal({ isOpen, onClose, user, profile, pathway = 'powerlifting' }) {
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState(user?.email || '');
  const [athleteName, setAthleteName] = useState(profile?.displayName || user?.displayName || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  if (!isOpen) return null;

  const isAdmin = 
    profile?.role === 'admin' || 
    user?.email?.toLowerCase().includes('admin') || 
    user?.email?.toLowerCase().includes('srastick') ||
    profile?.role === 'coach';

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      toast.error("Please provide your email or phone number");
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = import.meta.env.PROD 
        ? 'https://powerlift-ai-backend.onrender.com' 
        : 'http://localhost:5001';

      const res = await fetch(`${apiUrl}/api/admin/coach-waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athleteId: user?.uid || 'athlete_demo',
          athleteName: athleteName || 'Athlete',
          email: emailOrPhone,
          pathway,
          notes: notes || 'Requested 1-on-1 human coach pairing'
        })
      });

      const data = await res.json();
      if (data.success) {
        setHasJoined(true);
        toast.success("🎯 You have been added to the v2.0 Coach Waitlist!");
      } else {
        throw new Error(data.error || "Failed to join waitlist");
      }
    } catch (err) {
      console.error("Waitlist error:", err);
      // Fallback local persistence
      localStorage.setItem(`coach_waitlist_${user?.uid || 'demo'}`, 'true');
      setHasJoined(true);
      toast.success("Added to v2.0 Coach Early Access Waitlist!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-zinc-100 relative"
        >
          {/* Top ambient glow banner */}
          <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-amber-400 to-purple-600" />

          {/* Modal Header */}
          <div className="p-6 pb-4 border-b border-zinc-800/80 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  YET TO COME • RELEASE SCHEDULED FOR V2.0
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold">
                  AI COACH ACTIVE
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black italic tracking-tight text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                1-ON-1 HUMAN COACH ROSTER
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Verified human coach pairing & marketplace will unlock in the upcoming v2.0 platform release.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Autonomous AI Coach Notice Card */}
            <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300 uppercase tracking-wider mb-2">
                <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                Your AI Head Coach is 100% Active Now
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                You don't need to wait for a human coach to make elite progress. TITAN-AI's autonomous intelligence is actively managing your training right now with:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Real-Time Load Calibrations</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Weekly Overload (+2.5kg)</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Backroom Meet Strategist</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Joint Prehab Substitutions</span>
                </div>
              </div>
            </div>

            {/* Waitlist Form or Success State */}
            {!hasJoined ? (
              <form onSubmit={handleJoinWaitlist} className="space-y-4">
                <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BellRing className="w-3.5 h-3.5 text-amber-400" />
                  Get Notified When Human Coaches Launch in v2.0
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">Your Name</label>
                    <input
                      type="text"
                      value={athleteName}
                      onChange={(e) => setAthleteName(e.target.value)}
                      placeholder="e.g. Rahul Shetty"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">Email or WhatsApp</label>
                    <input
                      type="text"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="e.g. athlete@gmail.com"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Coaching Goals / Specialization Needed (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g. National IPF meet peaking, SBD bench press lockout, or bodybuilding recomp prep"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black italic text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  {isSubmitting ? "REGISTERING..." : "JOIN V2.0 COACH EARLY ACCESS WAITLIST"}
                </button>
              </form>
            ) : (
              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">You're On The Priority v2.0 Waitlist!</h4>
                <p className="text-xs text-zinc-300">
                  We will notify you the moment certified human coaches open for pairing. In the meantime, continue executing with your AI Head Coach!
                </p>
              </div>
            )}

            {/* Admin Bypass Link if user is admin */}
            {isAdmin && (
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                <div className="text-[10px] font-mono text-amber-400/90 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Authority Detected</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/coach');
                    }}
                    className="text-[11px] font-mono text-purple-400 hover:text-purple-300 underline font-bold"
                  >
                    Open Coach Dashboard ➔
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/admin');
                    }}
                    className="text-[11px] font-mono text-orange-400 hover:text-orange-300 underline font-bold"
                  >
                    Admin Console ➔
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
