import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  Apple, 
  Trophy, 
  Brain, 
  ChevronRight,
  Sparkles,
  Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/authContext';
import Navbar from '../Navbar';
import ModernTitanSidebar from './ModernTitanSidebar';
import AIProgramGeneratorModal from '../AIProgramGeneratorModal';
import SettingsModal from '../SettingsModal';
import HypertrophyIntelligence from '../HypertrophyIntelligence';
import GlobalBroadcastBanner from '../GlobalBroadcastBanner';
import AIChatBot from '../AIChatBot';
import InstallPrompt from '../pwa/InstallPrompt';
import usePlatform from '../../hooks/usePlatform';
import { useAndroidBackInterceptor, useIOSEdgeSwipeBack } from '../../hooks/useNativeGestures';

// Hubs
import TrainingHub from '../../dashboards/hubs/TrainingHub';
import FuelHub from '../../dashboards/hubs/FuelHub';
import MeetWarRoomHub from '../../dashboards/hubs/MeetWarRoomHub';
import AILabHub from '../../dashboards/hubs/AILabHub';

export default function TitanAppShell({ defaultPathway = 'powerlifting', defaultHub = 'train' }) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { isIOS, isAndroid, isStandalone, tokens } = usePlatform();

  const activeDiscipline = localStorage.getItem('active_world_discipline') || defaultPathway;
  const pathway = activeDiscipline;

  const [currentHub, setCurrentHub] = useState(defaultHub); // 'train' | 'fuel' | 'meet' | 'lab'
  const [currentSubView, setCurrentSubView] = useState('workout');
  const [isAdvancedMode, setIsAdvancedMode] = useState(true); // Default to full tools visibility
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [showAiGenModal, setShowAiGenModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Android Native Hardware / Gesture Back Navigation Interceptor
  useAndroidBackInterceptor({
    isActive: isMobileSidebarOpen || currentHub !== 'train',
    onBack: () => {
      if (isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      } else if (currentHub !== 'train') {
        setCurrentHub('train');
        setCurrentSubView('workout');
      }
    }
  });

  // iOS Left-Edge Swipe Back Gesture
  useIOSEdgeSwipeBack({
    enabled: isIOS && (currentHub !== 'train' || isMobileSidebarOpen),
    onSwipeBack: () => {
      if (isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      } else if (currentHub !== 'train') {
        setCurrentHub('train');
        setCurrentSubView('workout');
      }
    }
  });

  const handleSidebarNavigate = (hub, subView) => {
    tokens.hapticTap();
    setCurrentHub(hub);
    if (subView) setCurrentSubView(subView);
    if (hub === 'meet' || hub === 'lab') {
      setIsAdvancedMode(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-100 flex flex-col font-sans selection:bg-orange-500/30 safe-top">
      {/* Background ambient lighting */}
      <div className={`fixed top-0 left-1/3 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none ${
        pathway === 'powerlifting' ? 'bg-orange-600/5' : 'bg-purple-600/5'
      }`} />

      {/* Modern Simplified Navbar */}
      <Navbar 
        pathway={pathway}
        isAdvancedMode={isAdvancedMode}
        onToggleAdvancedMode={setIsAdvancedMode}
        onOpenSettings={() => setShowSettingsModal(true)}
        onToggleMobileMenu={() => setIsMobileSidebarOpen(prev => !prev)}
      />

      {/* Main Layout: Persistent Hierarchical Sidebar + Content Area */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto min-h-0">
        {/* World-Class Hierarchical Sidebar with Dropdowns (Linear / Stripe Standard) */}
        <ModernTitanSidebar 
          currentHub={currentHub}
          currentSubView={currentSubView}
          onNavigate={handleSidebarNavigate}
          pathway={pathway}
          onOpenSettings={() => setShowSettingsModal(true)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Content Workspace */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto">
          <GlobalBroadcastBanner targetAudience={pathway === 'powerlifting' ? 'powerlifting' : 'fitness'} />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentHub + currentSubView + pathway}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.12 }}
            >
              {currentHub === 'train' && (
                <TrainingHub 
                  pathway={pathway}
                  athleteProfile={profile}
                  isAdvancedMode={isAdvancedMode}
                  onOpenAiSynthesis={() => setShowAiGenModal(true)}
                />
              )}

              {currentHub === 'fuel' && (
                <FuelHub 
                  pathway={pathway}
                  athleteProfile={profile}
                  isAdvancedMode={isAdvancedMode}
                />
              )}

              {currentHub === 'meet' && (
                pathway === 'powerlifting' ? (
                  <MeetWarRoomHub 
                    athleteProfile={profile} 
                    activeSubTab={currentSubView}
                    onSelectSubTab={(tab) => setCurrentSubView(tab)}
                  />
                ) : (
                  <HypertrophyIntelligence 
                    bodyweight={profile?.bodyweight || 74}
                    trainingExperience={profile?.fitnessLevel || 'intermediate'}
                  />
                )
              )}

              {currentHub === 'lab' && (
                <AILabHub 
                  athleteProfile={profile} 
                  activeSubTab={currentSubView}
                  onSelectSubTab={(tab) => setCurrentSubView(tab)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* MOBILE QUICK BOTTOM BAR with Safe Area Handling */}
      <nav 
        style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom, 0px))' }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-xl px-2 pt-2 flex items-center justify-around shadow-2xl font-mono"
      >
        <button
          onClick={() => handleSidebarNavigate('train', 'workout')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition-all rounded-xl ${
            currentHub === 'train' ? 'text-orange-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span className="text-[10px] uppercase">Workout</span>
        </button>

        <button
          onClick={() => handleSidebarNavigate('fuel', 'diet')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition-all rounded-xl ${
            currentHub === 'fuel' ? 'text-orange-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Apple className="w-4 h-4" />
          <span className="text-[10px] uppercase">Diet</span>
        </button>

        <button
          onClick={() => handleSidebarNavigate('meet', 'strategist')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition-all rounded-xl ${
            currentHub === 'meet' ? 'text-orange-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span className="text-[10px] uppercase">Meet</span>
        </button>

        <button
          onClick={() => handleSidebarNavigate('lab', 'biomechanics')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition-all rounded-xl ${
            currentHub === 'lab' ? 'text-orange-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span className="text-[10px] uppercase">AI Lab</span>
        </button>

        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex-1 py-1.5 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-white transition-all rounded-xl"
        >
          <Menu className="w-4 h-4 text-orange-400" />
          <span className="text-[10px] uppercase font-bold text-orange-400">All Tools</span>
        </button>
      </nav>

      {/* AI Synthesis Modal */}
      {showAiGenModal && (
        <AIProgramGeneratorModal 
          isOpen={showAiGenModal} 
          onClose={() => setShowAiGenModal(false)}
          pathway={pathway}
          athleteId={user?.uid || 'athlete_demo'}
          profile={profile}
        />
      )}

      {/* Settings & Recalibration Modal */}
      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          pathway={pathway}
          profile={profile || {}}
          athleteId={user?.uid || 'athlete_demo'}
        />
      )}

      {/* Floating AI Coach & Video Form Assistant (BYOK Supported) */}
      <AIChatBot />

      {/* Frictionless Platform-Adaptive PWA Install Prompter */}
      <InstallPrompt />
    </div>
  );
}
