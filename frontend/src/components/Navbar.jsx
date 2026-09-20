import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dumbbell, 
  Flame, 
  Settings, 
  DoorOpen,
  Sparkles,
  SlidersHorizontal,
  Menu
} from 'lucide-react';
import { useAuth } from '../auth/authContext';
import OfflineSyncBadge from './OfflineSyncBadge';

export default function Navbar({ 
  pathway = 'powerlifting', 
  isAdvancedMode = false,
  onToggleAdvancedMode,
  onOpenSettings,
  onToggleMobileMenu
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);

  const handleExitWorld = () => {
    setShowExitConfirmModal(false);
    navigate('/', { replace: true });
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-black/80 backdrop-blur-md border-b border-zinc-800/60 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Mobile Hamburger & Active World Pill */}
          <div className="flex items-center gap-2.5 sm:gap-5">
            {onToggleMobileMenu && (
              <button 
                onClick={onToggleMobileMenu}
                className="lg:hidden p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                title="Open Tools Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 cursor-pointer select-none group"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black italic text-black text-sm shadow-md transition-transform group-hover:scale-105 ${
                pathway === 'powerlifting' 
                  ? 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/20' 
                  : 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/20'
              }`}>
                T
              </div>
              <span className="font-black italic tracking-wider text-white text-base hidden sm:inline">
                TITAN<span className="text-xs font-mono text-orange-500 ml-1 font-bold">AI</span>
              </span>
            </div>

            {/* Active World Badge */}
            <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border ${
              pathway === 'powerlifting'
                ? 'bg-orange-950/40 border-orange-500/30 text-orange-400'
                : 'bg-purple-950/40 border-purple-500/30 text-purple-400'
            }`}>
              {pathway === 'powerlifting' ? (
                <>
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span className="tracking-tight text-[11px] uppercase">Powerlifting World</span>
                </>
              ) : (
                <>
                  <Dumbbell className="w-3.5 h-3.5 text-purple-400" />
                  <span className="tracking-tight text-[11px] uppercase">Bodybuilding World</span>
                </>
              )}
            </div>
          </div>

          {/* Right Controls: Sync Badge, Mode Switcher & Exit World */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Gym Basement Offline Sync Indicator */}
            <OfflineSyncBadge />

            {/* Simple vs Pro Mode Switcher */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-full p-0.5 text-xs font-mono">
              <button
                onClick={() => onToggleAdvancedMode(false)}
                className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1 ${
                  !isAdvancedMode
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Simple clean view for everyday lifting and diet"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Simple</span>
              </button>
              <button
                onClick={() => onToggleAdvancedMode(true)}
                className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1 ${
                  isAdvancedMode
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Unlock advanced competition tools, video biomechanics & water cuts"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Pro Tools</span>
              </button>
            </div>

            {/* Settings & Recalibration */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
              title="Calibration & Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Exit World Button */}
            <button
              onClick={() => setShowExitConfirmModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors"
              title="Exit World & Switch Discipline"
            >
              <DoorOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* EXIT WORLD CONFIRMATION MODAL */}
      {showExitConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
              <DoorOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Exit {pathway === 'powerlifting' ? 'Powerlifting' : 'Bodybuilding'}?</h3>
              <p className="text-xs text-zinc-400 mt-2">
                Return to the main gateway to switch disciplines. Your training progress is safely saved.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowExitConfirmModal(false)}
                className="flex-1 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-xs"
              >
                Stay
              </button>
              <button
                onClick={handleExitWorld}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold"
              >
                Exit to Gateway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
