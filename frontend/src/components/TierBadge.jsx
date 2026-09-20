/**
 * TierBadge.jsx - Visual Tier Indicators & BYOK Configuration Modal
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  Crown, 
  Sparkles, 
  Check, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  Zap,
  Lock
} from 'lucide-react';
import { useTier } from '../context/TierContext';
import { toast } from 'sonner';

export const TierBadge = ({ tier = 'free', size = 'md', showUpgradeAction = false }) => {
  const { 
    tier: currentTier, 
    setTier, 
    groqKey, 
    geminiKey, 
    saveKeys, 
    isKeyModalOpen, 
    setIsKeyModalOpen 
  } = useTier();

  const [localGroq, setLocalGroq] = useState(groqKey || '');
  const [localGemini, setLocalGemini] = useState(geminiKey || '');

  const displayTier = tier || currentTier;

  const handleSave = (e) => {
    e.preventDefault();
    saveKeys({ groq: localGroq.trim(), gemini: localGemini.trim() });
    setIsKeyModalOpen(false);
    toast.success("BYOK API Keys saved! AI features unlocked with zero platform costs.");
  };

  return (
    <>
      <button
        onClick={() => setIsKeyModalOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-full font-mono font-bold uppercase transition-all select-none ${
          displayTier === 'pro'
            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/20'
            : displayTier === 'byok'
            ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400'
            : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 hover:border-emerald-400'
        } ${
          size === 'sm' ? 'px-2 py-0.5 text-[9px]' : size === 'lg' ? 'px-4 py-1.5 text-xs' : 'px-3 py-1 text-[10px]'
        }`}
        title="Click to manage tier & API keys"
      >
        {displayTier === 'pro' ? (
          <>
            <Crown className="w-3 h-3 text-black" />
            <span>TITAN PRO</span>
          </>
        ) : displayTier === 'byok' ? (
          <>
            <Key className="w-3 h-3 text-cyan-400" />
            <span>BYOK UNLOCKED</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>100% FREE TIER</span>
          </>
        )}
      </button>

      {/* BYOK & Tier Management Modal */}
      <AnimatePresence>
        {isKeyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-2xl text-white font-sans space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-black italic uppercase text-white">Tier & BYOK Manager</h3>
                </div>
                <button
                  onClick={() => setIsKeyModalOpen(false)}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tier Selection Quick Switcher */}
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">Active Tier Profile</span>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  {[
                    { id: 'free', label: 'Free Tier', desc: 'Core SBD Engine' },
                    { id: 'byok', label: 'BYOK Tier', desc: 'Free with Keys' },
                    { id: 'pro', label: 'Titan Pro', desc: 'All Unlocked' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTier(t.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        currentTier === t.id
                          ? 'bg-orange-600/20 border-orange-500 text-white shadow-md'
                          : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-bold">{t.label}</div>
                      <div className="text-[10px] text-zinc-500">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* BYOK Key Inputs Form */}
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <label className="text-zinc-300 font-bold">Google Gemini API Key (Video Form Checks)</label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 text-[10px]"
                    >
                      Get Free Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={localGemini}
                    onChange={(e) => setLocalGemini(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:border-cyan-500 outline-none"
                  />
                  <p className="text-[10px] font-mono text-zinc-500">Stored locally in your browser. Never sent to our servers.</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <label className="text-zinc-300 font-bold">Groq API Key (Instant AI Chatbot)</label>
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 text-[10px]"
                    >
                      Get Free Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="password"
                    placeholder="gsk_..."
                    value={localGroq}
                    onChange={(e) => setLocalGroq(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:border-cyan-500 outline-none"
                  />
                  <p className="text-[10px] font-mono text-zinc-500">Provides blazing fast Llama-3 responses at zero cost to you.</p>
                </div>

                <div className="pt-2 flex justify-end gap-3 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setIsKeyModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-lg active:scale-95"
                  >
                    Save Keys & Activate
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TierBadge;
