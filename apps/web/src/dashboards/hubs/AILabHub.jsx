import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Eye, ShieldAlert, Clock, Sparkles } from 'lucide-react';
import BiomechanicsLab from '../../components/BiomechanicsLab';
import JointTweakEngine from '../../components/JointTweakEngine';
import TempoAudioCoach from '../../components/TempoAudioCoach';
import HypertrophyIntelligence from '../../components/HypertrophyIntelligence';

export default function AILabHub({ athleteProfile, activeSubTab, onSelectSubTab }) {
  const [internalTab, setInternalTab] = useState('biomechanics');
  const activeTab = activeSubTab || internalTab;
  const setActiveTab = onSelectSubTab || setInternalTab;

  const toolLabels = {
    biomechanics: { label: 'CV Video Biomechanics', desc: 'Real-time Google Gemini 1.5 Flash Vision form check & bar path vector', icon: Eye },
    joint_swap: { label: 'Joint Injury Workaround', desc: 'Knee, shoulder, or lower back pain auto-substitutions', icon: ShieldAlert },
    tempo: { label: 'Audio Cadence Coach', desc: 'Binaural eccentric/pause/concentric voice & beeps metronome', icon: Clock },
    hypertrophy: { label: 'Muscle Volume Radar', desc: 'MEV, MAV & MRV weekly sets architecture', icon: Sparkles }
  };

  const currentTool = toolLabels[activeTab] || toolLabels.biomechanics;
  const ToolIcon = currentTool.icon;

  return (
    <div className="space-y-6">
      {/* CLEAN SLEEK HEADER (No messy horizontal buttons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
              AI PERFORMANCE LAB
            </span>
            <span className="text-xs font-mono text-zinc-500">/</span>
            <span className="text-xs font-mono text-zinc-300 font-bold">{currentTool.label}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white flex items-center gap-2.5">
            <ToolIcon className="w-6 h-6 text-purple-400" />
            <span>{currentTool.label}</span>
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            {currentTool.desc}
          </p>
        </div>

        {/* Compact Tool Dropdown Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-[10px] font-mono text-zinc-500 uppercase hidden sm:inline">Active Module:</label>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-purple-400 font-mono text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            {Object.entries(toolLabels).map(([key, val]) => (
              <option key={key} value={key} className="bg-zinc-900 text-white">
                {val.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'biomechanics' && (
            <BiomechanicsLab />
          )}

          {activeTab === 'joint_swap' && (
            <JointTweakEngine />
          )}

          {activeTab === 'tempo' && (
            <TempoAudioCoach />
          )}

          {activeTab === 'hypertrophy' && (
            <HypertrophyIntelligence 
              bodyweight={athleteProfile?.bodyweight || 74}
              trainingExperience={athleteProfile?.experienceLevel || 'intermediate'}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
