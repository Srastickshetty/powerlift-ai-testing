/**
 * IndianMeetFinder.jsx - Social Media & Platform Meet Finder Hub
 * Features:
 * 1. Social media flyer/post/reel format cards for Indian Powerlifting meets
 * 2. Instant Google Search discovery integration
 * 3. Custom Meet Submission modal with persistent backend storage & global broadcast sync
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Share2, 
  ExternalLink, 
  Search, 
  PlusCircle, 
  Filter, 
  Sparkles, 
  Trophy, 
  Instagram, 
  Globe, 
  CheckCircle2, 
  X,
  Users,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function IndianMeetFinder() {
  const [meets, setMeets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New meet form state
  const [newMeet, setNewMeet] = useState({
    name: '',
    federation: 'Powerlifting India (IPF)',
    state: 'Karnataka',
    city: 'Bengaluru',
    venue: 'Kanteerava Indoor Stadium',
    month: 'Upcoming 2026',
    date: '',
    registrationLink: '',
    flyerUrl: '',
    submittedBy: 'Athlete Lifter'
  });

  const apiUrl = import.meta.env.PROD 
    ? 'https://powerlift-ai-backend.onrender.com' 
    : 'http://localhost:5001';

  const loadMeets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/india/meets`);
      const data = await res.json();
      if (data.success && Array.isArray(data.meets)) {
        setMeets(data.meets);
      }
    } catch (e) {
      console.error("Failed to load meets", e);
      toast.error("Could not refresh meets list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeets();
  }, []);

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!newMeet.name.trim() || !newMeet.city.trim()) {
      toast.error("Please provide at least the Meet Name and City.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/api/india/meets/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeet)
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Meet published! Broadcast synced globally across all athletes.");
        setShowSubmitModal(false);
        // Reset form
        setNewMeet({
          name: '',
          federation: 'Powerlifting India (IPF)',
          state: 'Karnataka',
          city: 'Bengaluru',
          venue: '',
          month: 'Upcoming 2026',
          date: '',
          registrationLink: '',
          flyerUrl: '',
          submittedBy: 'Athlete Lifter'
        });
        loadMeets();
      } else {
        toast.error(data.error || "Failed to submit meet.");
      }
    } catch (err) {
      toast.error("Network error submitting meet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSearch = () => {
    const q = encodeURIComponent(`Powerlifting India championships 2026 ${searchQuery || selectedState}`);
    window.open(`https://www.google.com/search?q=${q}`, '_blank');
  };

  const handleInstagramSearch = () => {
    window.open(`https://www.instagram.com/explore/tags/powerliftingindia/`, '_blank');
  };

  // Filtering
  const filteredMeets = meets.filter(m => {
    const matchesSearch = !searchQuery || 
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.federation?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesState = selectedState === 'All' || m.state?.toLowerCase() === selectedState.toLowerCase();

    return matchesSearch && matchesState;
  });

  const availableStates = ['All', 'Karnataka', 'Maharashtra', 'Delhi', 'Punjab', 'Tamil Nadu', 'Kerala', 'Telangana'];

  return (
    <div className="bg-zinc-950 rounded-2xl border border-white/10 p-5 sm:p-6 shadow-2xl font-sans text-white space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
              SOCIAL MEDIA & PLATFORM RADAR
            </span>
            <span className="text-xs font-mono text-zinc-400">Global Peer-to-Peer Sync</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-orange-500" />
            National Meet Finder & Sanction Radar
          </h3>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Discover verified Instagram flyers, reels, Google search listings & community-submitted Indian championships
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleGoogleSearch}
            className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-blue-500 text-xs font-mono font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-blue-400" />
            <span>Search on Google</span>
          </button>

          <button
            onClick={handleInstagramSearch}
            className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-pink-500 text-xs font-mono font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Instagram className="w-3.5 h-3.5 text-pink-400" />
            <span>Instagram Radar</span>
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-orange-950 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>+ Submit Custom Meet</span>
          </button>
        </div>
      </div>

      {/* Filter and State Strip */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search championship, city, fed..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none font-mono text-xs">
          <span className="text-[10px] text-zinc-500 uppercase shrink-0">State:</span>
          {availableStates.map(st => (
            <button
              key={st}
              onClick={() => setSelectedState(st)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors shrink-0 ${
                selectedState === st
                  ? 'bg-orange-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Social Media Flyer & Card Grid */}
      {loading ? (
        <div className="p-12 text-center text-zinc-500 font-mono text-xs animate-pulse">
          Scanning social media feeds & national registry...
        </div>
      ) : filteredMeets.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800 space-y-3 font-mono">
          <Trophy className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-zinc-400 text-xs">No championships found matching current filters.</p>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="text-xs text-orange-400 font-bold hover:underline"
          >
            Found an upcoming championship? Submit it here to sync across all athletes &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMeets.map((meet) => {
            const googleQuery = encodeURIComponent(`${meet.name} ${meet.city} powerlifting registration`);
            const isCustom = meet.isCustom;

            return (
              <motion.div
                key={meet.id || meet.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/70 hover:bg-zinc-900 border border-white/10 hover:border-orange-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all space-y-4 shadow-lg group relative overflow-hidden"
              >
                {/* Visual Header Ribbon */}
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider border ${
                    isCustom 
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : 'bg-blue-950/60 border-blue-500/40 text-blue-300'
                  }`}>
                    {isCustom ? '🌟 Peer Synced' : meet.federation || 'National'}
                  </span>

                  <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-orange-400" />
                    <strong className="text-zinc-200">{meet.month || meet.date}</strong>
                  </span>
                </div>

                {/* Meet Title & Social Reel/Post Card Layout */}
                <div>
                  <h4 className="text-base font-black italic tracking-wide text-white group-hover:text-orange-400 transition-colors">
                    {meet.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-xs mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span className="truncate">{meet.venue ? `${meet.venue}, ` : ''}{meet.city} ({meet.state})</span>
                  </div>
                </div>

                {/* Social Media Preview Box / Flyer Badge */}
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 font-mono text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Platform Style:</span>
                    <span className="text-zinc-200 font-bold">Classic Raw SBD</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Verification:</span>
                    <span className={meet.qualifying_required ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {meet.qualifying_required ? 'State Quota Required' : 'Open Registration'}
                    </span>
                  </div>
                  {isCustom && meet.submittedBy && (
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-900">
                      <span>Reported By:</span>
                      <span className="text-zinc-400">{meet.submittedBy}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                  <a
                    href={meet.registrationLink || `https://www.google.com/search?q=${googleQuery}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold flex items-center justify-center gap-1.5 transition-colors text-center"
                  >
                    <span>Register</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={`https://www.google.com/search?q=${googleQuery}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white font-bold flex items-center justify-center gap-1.5 transition-colors text-center"
                  >
                    <Search className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Check Details</span>
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* SUBMIT CUSTOM MEET MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-black italic uppercase tracking-tight text-white font-sans">
                  Submit Real Indian Meet (Global Sync)
                </h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              Found an official championship reel, poster, or circular on Instagram or WhatsApp? Enter the details below. Once submitted, it saves into the backend and synchronizes across all users' meet lists and alerts!
            </p>

            <form onSubmit={handleCustomSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Meet Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Karnataka State Senior Powerlifting Championship 2026"
                  value={newMeet.name}
                  onChange={e => setNewMeet({ ...newMeet, name: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Federation</label>
                  <input 
                    type="text" 
                    placeholder="Powerlifting India (IPF) / WPC"
                    value={newMeet.federation}
                    onChange={e => setNewMeet({ ...newMeet, federation: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">State *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Karnataka"
                    value={newMeet.state}
                    onChange={e => setNewMeet({ ...newMeet, state: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">City *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Mangaluru"
                    value={newMeet.city}
                    onChange={e => setNewMeet({ ...newMeet, city: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Month / Date</label>
                  <input 
                    type="text" 
                    placeholder="e.g. July 2026 / 14-16 Aug"
                    value={newMeet.month}
                    onChange={e => setNewMeet({ ...newMeet, month: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Venue / Arena</label>
                <input 
                  type="text" 
                  placeholder="e.g. Town Hall Auditorium / District Stadium"
                  value={newMeet.venue}
                  onChange={e => setNewMeet({ ...newMeet, venue: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Registration / Reel / Flyer Link</label>
                <input 
                  type="url" 
                  placeholder="https://instagram.com/p/... or https://powerlifting.in/entry"
                  value={newMeet.registrationLink}
                  onChange={e => setNewMeet({ ...newMeet, registrationLink: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Submitted By (Your Name)</label>
                <input 
                  type="text" 
                  placeholder="Athlete or Coach Name"
                  value={newMeet.submittedBy}
                  onChange={e => setNewMeet({ ...newMeet, submittedBy: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold flex items-center gap-1.5 transition-colors"
                >
                  {isSubmitting ? 'Syncing Globally...' : 'Publish & Broadcast Meet'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
