import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle, 
  Check, 
  X, 
  Flame, 
  ShieldAlert, 
  MessageSquare,
  RefreshCw,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIBrainTrainingModal({ 
  isOpen, 
  onClose, 
  athleteId = 'athlete_demo',
  currentExercises = []
}) {
  const [rating, setRating] = useState('optimal'); // 'optimal' | 'too_hard' | 'too_easy' | 'joint_pain'
  const [selectedExercise, setSelectedExercise] = useState('');
  const [jointPainArea, setJointPainArea] = useState('');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [learnedRule, setLearnedRule] = useState(null);

  useEffect(() => {
    if (isOpen && currentExercises.length > 0 && !selectedExercise) {
      setSelectedExercise(currentExercises[0].name || currentExercises[0].title || '');
    }
  }, [isOpen, currentExercises]);

  const jointOptions = [
    'None',
    'Shoulder impingement / anterior delt',
    'Elbow tendon irritation',
    'Lower back erector pump',
    'Knee patellar discomfort',
    'Wrist / forearm strain',
    'Hip flexor / adductor tightness'
  ];

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLearnedRule(null);

    try {
      const apiUrl = import.meta.env.PROD 
        ? 'https://powerlift-ai-backend.onrender.com' 
        : 'http://localhost:5001';

      const payload = {
        rating,
        exerciseName: selectedExercise,
        jointPainArea: jointPainArea && jointPainArea !== 'None' ? jointPainArea : null,
        note: feedbackNote,
        favoredExercise: rating === 'optimal' || rating === 'too_easy' ? selectedExercise : null,
        dislikedExercise: rating === 'joint_pain' ? selectedExercise : null
      };

      const res = await fetch(`${apiUrl}/api/programs/ai-feedback/${athleteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.memory) {
        const adaptation = data.memory.adaptationNotes?.[0] || "Lifter vector successfully updated.";
        setLearnedRule(adaptation);
        toast.success("🧠 AI Brain Trained! Memory updated for future sessions.");
      }
    } catch (err) {
      console.error("Failed to submit AI feedback:", err);
      toast.error("Could not send training data to AI Brain.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-[#09090d] border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-950 via-zinc-900 to-black p-5 border-b border-zinc-800 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  REINFORCEMENT LEARNING ENGINE
                </span>
                <h2 className="text-xl font-black italic tracking-tight text-white">
                  TRAIN THE AI COACH BRAIN
                </h2>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitFeedback} className="p-5 sm:p-6 space-y-4">
            {/* Session Difficulty Rating */}
            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 mb-1.5 block">
                How Did Today's Workout Load & Volume Feel?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                {[
                  { id: 'optimal', label: '🔥 Optimal', desc: 'Nailed RPE/RIR targets' },
                  { id: 'too_easy', label: '⚡ Too Easy', desc: 'Ready to add weight' },
                  { id: 'too_hard', label: '😴 Fatiguing', desc: 'Soreness / slow bar' },
                  { id: 'joint_pain', label: '⚠️ Joint Pain', desc: 'Need substitution' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRating(item.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      rating === item.id 
                        ? 'bg-purple-950/60 border-purple-500 text-white font-bold' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs">{item.label}</div>
                    <div className="text-[9px] text-zinc-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise Focus */}
            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 mb-1.5 block">
                Primary Exercise to Train On:
              </label>
              <input
                type="text"
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                placeholder="e.g. Competition Squat, Incline Dumbbell Bench, Skull Crushers"
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Joint / Tweaks selector if applicable */}
            {rating === 'joint_pain' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1.5"
              >
                <label className="text-xs font-mono uppercase text-amber-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Select Joint / Discomfort Area:
                </label>
                <select
                  value={jointPainArea}
                  onChange={(e) => setJointPainArea(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-amber-500/40 text-xs font-mono text-amber-200 focus:outline-none"
                >
                  {jointOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </motion.div>
            )}

            {/* Subjective Coach Feedback */}
            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 mb-1.5 flex items-center justify-between">
                <span>Notes for the AI Coach:</span>
                <span className="text-[10px] text-zinc-500">Teaches the AI how your body responds</span>
              </label>
              <textarea
                rows={3}
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="e.g. Felt great depth on paused squats with zero knee pain. But skull crushers aggravated my elbows, please replace with cable extensions next week."
                className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-sans text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Learned Rule Notification */}
            {learnedRule && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-start gap-2"
              >
                <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold font-mono text-[11px]">BRAIN REINFORCEMENT STORED:</div>
                  <div className="text-zinc-300 mt-0.5">{learnedRule}</div>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition-colors"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-mono text-xs font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-950"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating AI Memory...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-3.5 h-3.5" />
                    <span>Train & Update AI Brain</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
