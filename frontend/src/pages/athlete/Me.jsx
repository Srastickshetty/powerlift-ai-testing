import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  User, 
  Dumbbell, 
  Shield, 
  Settings, 
  FlaskConical, 
  LogOut, 
  ChevronRight, 
  Check, 
  CreditCard,
  HeartPulse,
  Sliders
} from "lucide-react";
import Button from "../../ui/Button";
import { useAuth } from "../../auth/authContext";

export default function Me() {
  const { user, profile, logout } = useAuth();
  const [track, setTrack] = useState(
    profile?.track === "bb" || profile?.pathway === "fitness" ? "bb" : "pl"
  );
  const [units, setUnits] = useState("kg");
  const [showLabs, setShowLabs] = useState(false);

  const [equipment, setEquipment] = useState({
    rack: true,
    barbell: true,
    dumbbells: true,
    cables: true,
    legPress: false
  });

  const handleTrackSwitch = (t) => {
    setTrack(t);
    document.documentElement.dataset.track = t;
    localStorage.setItem("active_world_discipline", t === "bb" ? "fitness" : "powerlifting");
  };

  const toggleEquipment = (key) => {
    setEquipment(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = async () => {
    if (logout) await logout();
    window.location.href = "/";
  };

  const labsTools = [
    { name: "Podium Attempt Battle Solver", desc: "9-for-9 strategic attempt distribution engine", path: "/cockpit-powerlifting" },
    { name: "Biomechanics Moment-Arm Analyzer", desc: "Segment ratio and bar path kinematics calculator", path: "/cockpit-powerlifting" },
    { name: "Competition Command Trainer", desc: "Audio IPF referee commands reaction trainer", path: "/cockpit-powerlifting" },
    { name: "Desi & Regional Nutrition Engine", desc: "Macro calculator with Indian dietary preferences", path: "/cockpit-fitness" },
  ];

  return (
    <div className="space-y-6 max-w-3xl pb-10">
      <header className="border-b border-line pb-4 flex items-center justify-between">
        <div>
          <h1 className="num text-3xl font-bold tracking-tight text-ink">Athlete Profile & Settings</h1>
          <p className="text-sm text-muted">Manage your training track, units, equipment, and experimental labs.</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-danger border border-danger/30 hover:bg-danger/10 px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Profile Header Card */}
      <div className="rounded-xl border border-line bg-surface p-6 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full border border-line bg-raised grid place-items-center text-2xl font-bold text-accent">
          {user?.email?.charAt(0).toUpperCase() || "A"}
        </div>
        <div>
          <h2 className="num text-xl font-bold text-ink">{profile?.display_name || user?.email?.split('@')[0]}</h2>
          <span className="text-xs text-muted block">{user?.email}</span>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-raised border border-line text-muted mt-1 inline-block">
            Role: {profile?.role || "Athlete"}
          </span>
        </div>
      </div>

      {/* Track Selection Switch (Strictly tokens-based) */}
      <div className="rounded-xl border border-line bg-surface p-6 space-y-4">
        <div>
          <h2 className="num text-xl font-bold text-ink">Primary Discipline Track</h2>
          <p className="text-xs text-muted">Switching tracks toggles color tokens, programming algorithms, and logging fields.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleTrackSwitch("pl")}
            className={`p-4 rounded-xl border text-left transition flex items-center justify-between ${
              track === "pl"
                ? "border-accent bg-accent/10 text-ink shadow-sm"
                : "border-line bg-bg text-muted hover:text-ink"
            }`}
          >
            <div>
              <span className="font-bold block text-sm">Powerlifting</span>
              <span className="text-xs text-muted">e1RM, RPE, Peaking & Meet</span>
            </div>
            {track === "pl" && <Check className="h-5 w-5 text-accent" />}
          </button>

          <button
            type="button"
            onClick={() => handleTrackSwitch("bb")}
            className={`p-4 rounded-xl border text-left transition flex items-center justify-between ${
              track === "bb"
                ? "border-accent bg-accent/10 text-ink shadow-sm"
                : "border-line bg-bg text-muted hover:text-ink"
            }`}
          >
            <div>
              <span className="font-bold block text-sm">Bodybuilding</span>
              <span className="text-xs text-muted">Volume per Muscle, RIR, Photos</span>
            </div>
            {track === "bb" && <Check className="h-5 w-5 text-accent" />}
          </button>
        </div>
      </div>

      {/* Units & Barbell Settings */}
      <div className="rounded-xl border border-line bg-surface p-6 flex items-center justify-between">
        <div>
          <h2 className="num text-xl font-bold text-ink">Barbell & Load Units</h2>
          <p className="text-xs text-muted">Metric kilograms (kg) or imperial pounds (lbs)</p>
        </div>
        <div className="flex rounded-md border border-line bg-raised p-1">
          <button
            type="button"
            onClick={() => setUnits("kg")}
            className={`px-3 py-1 rounded text-xs font-semibold ${units === "kg" ? "bg-accent text-accent-ink" : "text-muted"}`}
          >
            KG
          </button>
          <button
            type="button"
            onClick={() => setUnits("lbs")}
            className={`px-3 py-1 rounded text-xs font-semibold ${units === "lbs" ? "bg-accent text-accent-ink" : "text-muted"}`}
          >
            LBS
          </button>
        </div>
      </div>

      {/* Equipment Profile */}
      <div className="rounded-xl border border-line bg-surface p-6 space-y-3">
        <h2 className="num text-xl font-bold text-ink">Gym Equipment Available</h2>
        <p className="text-xs text-muted">AI generator only selects exercises compatible with your selected equipment.</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { key: "rack", label: "Power Rack" },
            { key: "barbell", label: "Olympic Barbell & Plates" },
            { key: "dumbbells", label: "Dumbbells (Up to 50kg)" },
            { key: "cables", label: "Cable Tower / Pulldown" },
            { key: "legPress", label: "45-Degree Leg Press" }
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleEquipment(key)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                equipment[key]
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-line bg-bg text-muted hover:text-ink"
              }`}
            >
              {equipment[key] ? "✓ " : "+ "}{label}
            </button>
          ))}
        </div>
      </div>

      {/* Subscription Status Card */}
      <div className="rounded-xl border border-line bg-surface p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-raised border border-line text-accent">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h3 className="num text-xl font-bold text-ink">Pro Plan (Beta Test Mode)</h3>
            <span className="text-xs text-muted">Full AI Programming, Autoregulation & Analytics</span>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-ok/20 text-ok border border-ok/30 font-bold">
          Active
        </span>
      </div>

      {/* Legal & Privacy Links */}
      <div className="rounded-xl border border-line bg-surface p-4 flex items-center justify-around text-xs text-muted">
        <Link to="/privacy" className="hover:text-ink transition">Privacy Policy</Link>
        <span>•</span>
        <Link to="/terms" className="hover:text-ink transition">Terms of Service</Link>
        <span>•</span>
        <Link to="/ui-lab" className="hover:text-ink transition">Component UI Lab</Link>
      </div>

      {/* Labs / Experimental Features Drawer */}
      <div className="rounded-xl border border-line bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-accent" />
            <h2 className="num text-xl font-bold text-ink">Experimental Labs</h2>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowLabs(!showLabs)}
          >
            {showLabs ? "Hide Labs" : "View Labs Modules"}
          </Button>
        </div>

        {showLabs && (
          <div className="divide-y divide-line rounded-lg border border-line bg-bg pt-1">
            {labsTools.map((tool) => (
              <div key={tool.name} className="p-4 flex items-center justify-between hover:bg-surface/50 transition">
                <div>
                  <span className="font-semibold text-sm text-ink block">{tool.name}</span>
                  <span className="text-xs text-muted">{tool.desc}</span>
                </div>
                <Button variant="secondary" size="md" onClick={() => window.location.href = tool.path}>
                  Launch
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
