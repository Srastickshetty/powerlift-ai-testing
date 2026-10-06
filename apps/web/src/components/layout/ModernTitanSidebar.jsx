/**
 * ModernTitanSidebar.jsx - Hierarchical Collapsible Navigation Tree
 * Inspired by Linear, Stripe, and Notion navigation standards.
 * Features:
 * - Collapsible dropdown accordions for major sections
 * - Instant tool search/filter input
 * - Direct 1-click access to all 14+ specialized platform tools
 * - Mobile slide-out drawer support with touch backdrop
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  Apple, 
  Trophy, 
  Brain, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Target, 
  FileText, 
  Award, 
  Globe, 
  Calculator, 
  ShieldCheck, 
  Eye, 
  ShieldAlert, 
  Clock, 
  Sparkles, 
  Key, 
  Settings, 
  X,
  Flame,
  Layers
} from 'lucide-react';

export default function ModernTitanSidebar({
  currentHub,
  currentSubView,
  onNavigate,
  pathway = 'powerlifting',
  onOpenSettings,
  isMobileOpen = false,
  onCloseMobile
}) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Accordion open/collapse states
  const [sectionsOpen, setSectionsOpen] = useState({
    essentials: true,
    platform: true,
    ailab: true
  });

  const toggleSection = (sec) => {
    setSectionsOpen(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Navigation schema organized by logical domains
  const navigationGroups = useMemo(() => [
    {
      id: 'essentials',
      title: 'Daily Essentials',
      icon: Layers,
      items: [
        {
          hub: 'train',
          subView: 'workout',
          label: "Today's Workout",
          icon: Dumbbell,
          badge: 'Daily'
        },
        {
          hub: 'fuel',
          subView: 'diet',
          label: "Today's Diet & Macros",
          icon: Apple,
          badge: 'Nutrition'
        }
      ]
    },
    {
      id: 'platform',
      title: pathway === 'powerlifting' ? 'Platform & Meet War Room' : 'Hypertrophy Architecture',
      icon: pathway === 'powerlifting' ? Trophy : Sparkles,
      items: pathway === 'powerlifting' ? [
        {
          hub: 'meet',
          subView: 'strategist',
          label: '9-for-9 Strategist',
          icon: Target
        },
        {
          hub: 'meet',
          subView: 'weighin',
          label: 'Official Weigh-In Slip',
          icon: FileText,
          badge: 'IPF Form'
        },
        {
          hub: 'meet',
          subView: 'standards',
          label: 'National Standards & Records',
          icon: Award,
          badge: 'Records'
        },
        {
          hub: 'meet',
          subView: 'meetfinder',
          label: 'Indian Meet Finder',
          icon: Globe,
          badge: 'Social'
        },
        {
          hub: 'meet',
          subView: 'calculators',
          label: 'Calculators Toolbox',
          icon: Calculator
        },
        {
          hub: 'meet',
          subView: 'podium',
          label: 'Podium Battle Solver',
          icon: Trophy
        },
        {
          hub: 'meet',
          subView: 'plates',
          label: 'Plates Sleeve & Timer',
          icon: Dumbbell
        },
        {
          hub: 'meet',
          subView: 'commands',
          label: 'Referee Commands',
          icon: ShieldCheck
        }
      ] : [
        {
          hub: 'meet',
          subView: 'hypertrophy',
          label: 'MEV/MAV Volume Radar',
          icon: Sparkles
        },
        {
          hub: 'meet',
          subView: 'calculators',
          label: 'Hypertrophy Calculators',
          icon: Calculator
        }
      ]
    },
    {
      id: 'ailab',
      title: 'AI Performance Lab',
      icon: Brain,
      items: [
        {
          hub: 'lab',
          subView: 'biomechanics',
          label: 'CV Video Biomechanics',
          icon: Eye,
          badge: 'Gemini 1.5'
        },
        {
          hub: 'lab',
          subView: 'joint_swap',
          label: 'Joint Injury Swap',
          icon: ShieldAlert
        },
        {
          hub: 'lab',
          subView: 'tempo',
          label: 'Audio Cadence Coach',
          icon: Clock
        },
        {
          hub: 'lab',
          subView: 'hypertrophy',
          label: 'Muscle Volume Blueprint',
          icon: Sparkles
        }
      ]
    }
  ], [pathway]);

  // Filtering based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return navigationGroups;
    const q = searchQuery.toLowerCase();

    return navigationGroups.map(group => {
      const matchedItems = group.items.filter(item => 
        item.label.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
      );
      return {
        ...group,
        items: matchedItems
      };
    }).filter(group => group.items.length > 0);
  }, [navigationGroups, searchQuery]);

  const handleItemClick = (hub, subView) => {
    onNavigate(hub, subView);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full text-zinc-300 font-sans select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black italic text-black text-sm shadow-md ${
            pathway === 'powerlifting' 
              ? 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/20' 
              : 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/20'
          }`}>
            T
          </div>
          <div>
            <div className="font-black italic tracking-wider text-white text-sm flex items-center gap-1.5">
              <span>TITAN</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-orange-950 text-orange-400 border border-orange-500/30">AI</span>
            </div>
            <div className="text-[10px] font-mono text-zinc-400 capitalize">
              {pathway === 'powerlifting' ? 'Powerlifting World' : 'Bodybuilding World'}
            </div>
          </div>
        </div>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button 
            onClick={onCloseMobile}
            className="md:hidden text-zinc-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Search Tool Finder */}
      <div className="p-3 border-b border-zinc-800/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick jump to tool..."
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Hierarchical Accordion Navigation Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
        {filteredGroups.map(group => {
          const isOpen = sectionsOpen[group.id] || searchQuery.length > 0;
          const GroupIcon = group.icon;

          return (
            <div key={group.id} className="space-y-1">
              {/* Accordion Group Header */}
              <button
                onClick={() => toggleSection(group.id)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <GroupIcon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-orange-400 transition-colors" />
                  <span className="text-[11px] font-mono uppercase font-bold tracking-wider">
                    {group.title}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-transform" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-transform" />
                )}
              </button>

              {/* Sub-Items List */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden pl-2 space-y-0.5"
                  >
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const isActive = currentHub === item.hub && (!item.subView || currentSubView === item.subView);

                      return (
                        <button
                          key={`${item.hub}_${item.subView}`}
                          onClick={() => handleItemClick(item.hub, item.subView)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between group ${
                            isActive
                              ? pathway === 'powerlifting'
                                ? 'bg-orange-600/20 border border-orange-500/40 text-orange-300 font-bold shadow-sm'
                                : 'bg-purple-600/20 border border-purple-500/40 text-purple-300 font-bold shadow-sm'
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-orange-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.badge && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded shrink-0 border uppercase font-bold tracking-wider ${
                              isActive
                                ? 'bg-orange-500/30 border-orange-400/50 text-orange-200'
                                : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-400'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-zinc-800/80 space-y-1 bg-zinc-950/60">
        <button
          onClick={onOpenSettings}
          className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-900 flex items-center gap-2 transition-colors"
        >
          <Settings className="w-3.5 h-3.5 text-zinc-500" />
          <span>Recalibrate & Settings</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-zinc-950/80 border-r border-zinc-800/80 backdrop-blur-xl h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Out Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            {/* Sheet */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="absolute top-0 bottom-0 left-0 w-72 bg-zinc-950 border-r border-zinc-800 shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
