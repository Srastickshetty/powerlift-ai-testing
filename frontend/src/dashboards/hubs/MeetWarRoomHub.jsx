import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Award, Dumbbell, ShieldCheck, FileText, Calculator, Globe } from 'lucide-react';
import AttemptStrategistBoard from '../../components/AttemptStrategistBoard';
import PodiumAttemptBattleSolver from '../../components/PodiumAttemptBattleSolver';
import OlympicPlateLoader from '../../components/OlympicPlateLoader';
import CompetitionCommandTrainer from '../../components/CompetitionCommandTrainer';
import WeighInRackCard from '../../components/WeighInRackCard';
import IndianStandardsRadar from '../../components/IndianStandardsRadar';
import PowerliftingCalculators from '../../components/PowerliftingCalculators';
import IndianMeetFinder from '../../components/IndianMeetFinder';

export default function MeetWarRoomHub({ athleteProfile, activeSubTab, onSelectSubTab }) {
  const [internalTab, setInternalTab] = useState('strategist');
  const activeTab = activeSubTab || internalTab;
  const setActiveTab = onSelectSubTab || setInternalTab;

  const bodyweight = athleteProfile?.bodyweight || 74;
  const gender = athleteProfile?.gender || 'men';
  const athleteTotal = athleteProfile?.total || 530;

  const toolLabels = {
    strategist: { label: '9-for-9 Strategist', desc: 'Attempt jumps, warmups & 3rd attempt selector', icon: Target },
    weighin: { label: 'Official Weigh-In Slip', desc: 'IPF/Powerlifting India rack heights & card', icon: FileText },
    standards: { label: 'National Standards & Records', desc: 'All-time Indian records & qualifying totals', icon: Award },
    meetfinder: { label: 'Indian Meet Finder', desc: 'Social media reel cards & custom meet sync', icon: Globe },
    calculators: { label: 'Calculators Toolbox', desc: '1RM, RPE conversion & IPF GL/DOTS points', icon: Calculator },
    podium: { label: 'Podium Battle Solver', desc: 'Attempt matrix to chase medal placement', icon: Trophy },
    plates: { label: 'Plates Sleeve & Timer', desc: 'Visual 20kg bar loader & 60-second platform clock', icon: Dumbbell },
    commands: { label: 'IPF Commands Trainer', desc: 'Audio cadence practice for referee signals', icon: ShieldCheck }
  };

  const currentTool = toolLabels[activeTab] || toolLabels.strategist;
  const ToolIcon = currentTool.icon;

  return (
    <div className="space-y-6">
      {/* CLEAN SLEEK HEADER (No messy horizontal buttons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              PLATFORM WAR ROOM
            </span>
            <span className="text-xs font-mono text-zinc-500">/</span>
            <span className="text-xs font-mono text-zinc-300 font-bold">{currentTool.label}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white flex items-center gap-2.5">
            <ToolIcon className="w-6 h-6 text-amber-500" />
            <span>{currentTool.label}</span>
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            {currentTool.desc}
          </p>
        </div>

        {/* Compact Tool Dropdown Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-[10px] font-mono text-zinc-500 uppercase hidden sm:inline">Active Tool:</label>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-amber-400 font-mono text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer"
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
          {activeTab === 'strategist' && (
            <AttemptStrategistBoard 
              athleteBodyweight={bodyweight} 
              gender={gender} 
            />
          )}

          {activeTab === 'weighin' && (
            <WeighInRackCard 
              profile={athleteProfile} 
            />
          )}

          {activeTab === 'standards' && (
            <IndianStandardsRadar 
              athleteTotal={athleteTotal}
              athleteWeight={bodyweight}
              athleteAge={athleteProfile?.age || 23}
            />
          )}

          {activeTab === 'meetfinder' && (
            <IndianMeetFinder />
          )}

          {activeTab === 'calculators' && (
            <PowerliftingCalculators />
          )}

          {activeTab === 'podium' && (
            <PodiumAttemptBattleSolver 
              athleteProfile={athleteProfile} 
            />
          )}

          {activeTab === 'plates' && (
            <OlympicPlateLoader initialTarget={195} />
          )}

          {activeTab === 'commands' && (
            <CompetitionCommandTrainer />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
