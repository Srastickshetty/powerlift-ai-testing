import React, { useState } from "react";
import { 
  ShieldAlert, 
  Sliders, 
  Users, 
  Radio, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle2, 
  Sparkles,
  RefreshCw,
  Send,
  Award
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../auth/authContext";
import Button from "../ui/Button";
import SportSwitcher from "./admin/SportSwitcher";
import PlSportConsole from "./admin/PlSportConsole";
import BbSportConsole from "./admin/BbSportConsole";
import CoachClientHierarchy from "./admin/CoachClientHierarchy";
import CoachApplicationsQueue from "./admin/CoachApplicationsQueue";
import FreshStartModal from "./admin/FreshStartModal";

export default function AdminCommandCenter() {
  const { user } = useAuth();
  const [activeSport, setActiveSport] = useState("pl"); // 'pl' | 'bb'
  const [activeTab, setActiveTab] = useState("sport"); // 'sport' | 'hierarchy' | 'flags' | 'broadcast'
  const [showFreshStartModal, setShowFreshStartModal] = useState(false);

  // Feature Flags State
  const [featureFlags, setFeatureFlags] = useState({
    humanCoachMarketplace: true,
    aiProgramEngine: true,
    weeklyEvolutionCron: true,
    desiNutritionMealPlans: true,
    offlineBasementSync: true,
    pwaBackgroundWakeLock: true,
  });

  // Global Broadcast State
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    urgency: "update",
  });
  const [activeBroadcast, setActiveBroadcast] = useState(null);

  const handleToggleFlag = (key) => {
    setFeatureFlags(prev => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success(`Feature Flag '${key}' updated to ${next[key] ? 'ENABLED' : 'DISABLED'}`);
      return next;
    });
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) return;
    setActiveBroadcast({ ...broadcastForm, sentAt: new Date().toLocaleTimeString() });
    toast.success(`Broadcast '${broadcastForm.title}' published across all athlete apps.`);
    setBroadcastForm({ title: "", message: "", urgency: "update" });
  };

  return (
    <div className="min-h-screen bg-bg text-ink p-4 sm:p-6 lg:p-8 font-sans space-y-6" data-track={activeSport}>
      {/* Super Admin Top Header */}
      <header className="border-b border-line pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-accent/15 border border-accent/30 text-accent font-mono text-[11px] font-bold uppercase tracking-wider">
              Main System Authority
            </span>
            <span className="text-xs text-muted">Admin: {user?.email || "admin@powerlift.ai"}</span>
          </div>
          <h1 className="num text-3xl font-bold tracking-tight text-ink mt-1">
            POWERLIFT<span className="text-accent">AI</span> SUPERADMIN CONSOLE
          </h1>
          <p className="text-sm text-muted">
            Global management portal for sport domains, coach-athlete relationships, and parameters.
          </p>
        </div>

        {/* Dual Sport Switcher */}
        <SportSwitcher activeSport={activeSport} onSelectSport={setActiveSport} />
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-line">
        <button
          type="button"
          onClick={() => setActiveTab("sport")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            activeTab === "sport"
              ? "bg-accent text-accent-ink"
              : "text-muted hover:text-ink hover:bg-raised"
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>{activeSport === "pl" ? "Powerlifting (SBD) Console" : "Bodybuilding (Hypertrophy) Console"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("hierarchy")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            activeTab === "hierarchy"
              ? "bg-accent text-accent-ink"
              : "text-muted hover:text-ink hover:bg-raised"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Coach & Client Hierarchy Tree</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("flags")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            activeTab === "flags"
              ? "bg-accent text-accent-ink"
              : "text-muted hover:text-ink hover:bg-raised"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>System Feature Flags</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("applications")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            activeTab === "applications" ? "bg-accent text-accent-ink" : "text-muted hover:text-ink hover:bg-raised"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Coach Applications</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("broadcast")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            activeTab === "broadcast" ? "bg-accent text-accent-ink" : "text-muted hover:text-ink hover:bg-raised"
          }`}
        >
          <Radio className="h-4 w-4" />
          <span>Broadcast Dispatcher</span>
        </button>
      </div>

      {/* Tab Panels */}
      <main className="space-y-6">
        {/* 1. Sport Specific Console & Parameters */}
        {activeTab === "sport" && (
          activeSport === "pl" ? <PlSportConsole /> : <BbSportConsole />
        )}

        {/* 2. Coach-Client Hierarchy Roster */}
        {activeTab === "hierarchy" && (
          <CoachClientHierarchy sport={activeSport} />
        )}

        {/* 3. Global Feature Flags */}
        {activeTab === "flags" && (
          <div className="rounded-xl border border-line bg-surface p-6 space-y-4">
            <div>
              <h2 className="num text-xl font-bold text-ink">Platform Release Controls & Feature Flags</h2>
              <p className="text-xs text-muted">Dynamically toggle core engines and user capabilities without redeployment.</p>
            </div>

            <div className="divide-y divide-line rounded-lg border border-line bg-bg">
              {Object.entries(featureFlags).map(([key, enabled]) => (
                <div key={key} className="p-4 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-ink text-sm block capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="text-xs text-muted">
                      {enabled ? "Active for all production lifters" : "Gated / Disabled platform-wide"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleFlag(key)}
                    className="p-1 rounded-md text-ink hover:text-accent transition"
                    aria-label={`Toggle flag ${key}`}
                  >
                    {enabled ? (
                      <ToggleRight className="h-8 w-8 text-accent" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-muted" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Clean Slate & Database Reset Action */}
            <div className="rounded-lg border border-danger/30 bg-bg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-semibold text-ink text-sm block flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-danger" />
                  <span>Fresh Start System Reset</span>
                </span>
                <span className="text-xs text-muted">
                  Wipe all generated test programs, athlete accounts, and training logs to begin with a completely clean slate.
                </span>
              </div>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => setShowFreshStartModal(true)}
                className="bg-danger text-white hover:brightness-110 font-bold shrink-0 min-h-[44px]"
              >
                Execute Fresh Start
              </Button>
            </div>
          </div>
        )}

        {/* 4. Global Broadcast Dispatcher */}
        {activeTab === "broadcast" && (
          <div className="rounded-xl border border-line bg-surface p-6 space-y-6 max-w-2xl">
            <div>
              <h2 className="num text-xl font-bold text-ink flex items-center gap-2">
                <Radio className="h-5 w-5 text-accent" />
                <span>Global Broadcast Dispatcher</span>
              </h2>
              <p className="text-xs text-muted">Send platform-wide notices to all mobile apps and dashboards.</p>
            </div>

            {activeBroadcast && (
              <div className="p-4 rounded-lg bg-bg border border-accent/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-accent uppercase tracking-wider">Live Broadcast</span>
                  <span className="text-muted">{activeBroadcast.sentAt}</span>
                </div>
                <h4 className="font-bold text-ink">{activeBroadcast.title}</h4>
                <p className="text-xs text-muted">{activeBroadcast.message}</p>
                <button
                  type="button"
                  onClick={() => setActiveBroadcast(null)}
                  className="text-xs text-danger hover:underline pt-1 block"
                >
                  Dismiss Broadcast
                </button>
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Banner Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled Maintenance / New Peaking Model Release"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-lg border border-line bg-bg text-ink text-base outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Notice Content</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe update, competition news, or release advisory..."
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full p-3 rounded-lg border border-line bg-bg text-ink text-base outline-none focus:border-accent resize-y"
                />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full font-bold gap-2">
                <Send className="h-4 w-4" />
                <span>Dispatch Platform Broadcast</span>
              </Button>
            </form>
          </div>
        )}

        {/* 5. Coach Applications Queue */}
        {activeTab === "applications" && <CoachApplicationsQueue />}
      </main>

      <FreshStartModal
        isOpen={showFreshStartModal}
        onClose={() => setShowFreshStartModal(false)}
      />
    </div>
  );
}
