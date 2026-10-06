import React, { useState, useEffect } from "react";
import { Search, X, Dumbbell, Plus, Edit3, Video, Sparkles } from "lucide-react";
import Button from "../../ui/Button";
import NoSearchResults from "../../ui/NoSearchResults";
import EmptyState from "../../ui/EmptyState";
import MovementModal from "../../components/coach/MovementModal";
import VideoPlayerModal from "../../components/coach/VideoPlayerModal";

const DEFAULT_MOVEMENTS = [
  { id: "m1", lift: "Competition Squat", category: "Compound", cues: "Tripod foot, wedge upper back, drive hips through", videoUrl: "" },
  { id: "m2", lift: "Pause Bench Press", category: "Compound", cues: "Leg drive before press, bar over wrists, flared lats", videoUrl: "" },
  { id: "m3", lift: "Sumo Deadlift", category: "Compound", cues: "Open groin, spread floor, pull slack out of bar", videoUrl: "" },
  { id: "m4", lift: "Romanian Deadlift", category: "Accessory", cues: "Hinge at hip crease, soft knees, vertical shins", videoUrl: "" },
  { id: "m5", lift: "JM Press", category: "Accessory", cues: "Elbows forward, bar to chin crease, tricep drive", videoUrl: "" },
  { id: "m6", lift: "Safety Squat Bar (SSB) Squat", category: "Specialty", cues: "Stay upright against camber, flare lats into pads", videoUrl: "" },
  { id: "m7", lift: "Chest-Supported T-Bar Row", category: "Accessory", cues: "Neutral spine, squeeze rhomboids, full stretch at bottom", videoUrl: "" },
  { id: "m8", lift: "Deficit Deadlift (2-inch)", category: "Specialty", cues: "Patience off the floor, leg press the platform", videoUrl: "" },
];

const CATEGORIES = ["All", "Compound", "Accessory", "Specialty", "Isolation"];

export default function CoachLibrary() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [movements, setMovements] = useState(() => {
    try {
      const saved = localStorage.getItem("coach_exercise_library");
      return saved ? JSON.parse(saved) : DEFAULT_MOVEMENTS;
    } catch {
      return DEFAULT_MOVEMENTS;
    }
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  useEffect(() => {
    try {
      localStorage.setItem("coach_exercise_library", JSON.stringify(movements));
    } catch (e) {
      console.error("Failed to save library to localStorage", e);
    }
  }, [movements]);

  const handleSaveMovement = (item) => {
    setMovements((prev) => {
      const idx = prev.findIndex((m) => (m.id && m.id === item.id) || m.lift === item.lift);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...item };
        return next;
      }
      return [item, ...prev];
    });
    showToast(`Saved "${item.lift}" technique cues!`);
  };

  const handleDeleteMovement = (idOrLift) => {
    setMovements((prev) => prev.filter((m) => m.id !== idOrLift && m.lift !== idOrLift));
    showToast("Movement removed from library.");
  };

  const filtered = movements.filter((item) => {
    const matchesSearch =
      item.lift.toLowerCase().includes(search.toLowerCase().trim()) ||
      item.cues.toLowerCase().includes(search.toLowerCase().trim());
    const matchesCategory = category === "All" || item.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-raised border border-accent/40 text-ink px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="border-b border-line pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="num text-3xl font-bold tracking-tight text-ink">
            Exercise Technique & Cue Library
          </h1>
          <p className="text-sm text-muted">
            Curated movement variations, coaching cues, and biomechanics guides.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="gap-2"
          onClick={() => {
            setSelectedMovement(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          <span>Add Movement</span>
        </Button>
      </header>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movements or cues (e.g. 'sumo', 'lat', 'bench')..."
            className="w-full h-11 pl-10 pr-10 rounded-md border border-line bg-surface text-ink text-sm placeholder:text-muted/50 focus:border-accent outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1"
              aria-label="Clear search query"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`h-9 px-3 rounded-md text-xs font-semibold whitespace-nowrap transition border ${
                category === cat
                  ? "bg-accent text-accent-ink border-accent"
                  : "bg-surface text-muted border-line hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Movement List & States */}
      <div className="rounded-xl border border-line bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="num text-xl font-bold text-ink">
            Movement Database ({filtered.length})
          </h2>
          {movements.length === 0 && (
            <span className="text-xs text-muted">0 entries</span>
          )}
        </div>

        {movements.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title="Movement Library Empty"
            description="No exercises have been configured in your coaching database yet."
            actionLabel="Populate Default Powerlifting Lifts"
            onAction={() => setMovements(DEFAULT_MOVEMENTS)}
          />
        ) : filtered.length === 0 ? (
          <NoSearchResults
            query={search}
            filters={category !== "All" ? [category] : []}
            onClear={() => {
              setSearch("");
              setCategory("All");
            }}
            onAddCustom={() => {
              if (search) {
                const newLift = {
                  id: `m_${Date.now()}`,
                  lift: search,
                  category: "Specialty",
                  cues: "Custom athlete cue",
                  videoUrl: ""
                };
                handleSaveMovement(newLift);
                setSearch("");
              }
            }}
          />
        ) : (
          <div className="divide-y divide-line rounded-lg border border-line bg-bg">
            {filtered.map((item) => (
              <div
                key={item.id || item.lift}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface/50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">{item.lift}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-raised border border-line text-muted">
                      {item.category}
                    </span>
                    {item.videoUrl && (
                      <span className="text-[10px] flex items-center gap-1 text-accent font-medium">
                        <Video className="w-3 h-3" /> Video Attached
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted block italic">
                    Cue: "{item.cues}"
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.videoUrl && (
                    <Button
                      variant="secondary"
                      size="md"
                      className="text-xs gap-1"
                      onClick={() => {
                        setActiveVideo({
                          url: item.videoUrl,
                          athleteName: item.lift,
                          date: "Library Guide"
                        });
                        setVideoModalOpen(true);
                      }}
                    >
                      <Video className="w-3.5 h-3.5 text-accent" />
                      <span>Demo</span>
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="md"
                    className="text-xs gap-1"
                    onClick={() => {
                      setSelectedMovement(item);
                      setModalOpen(true);
                    }}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Cues</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Movement Modal (Create / Edit Cues) */}
      <MovementModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedMovement(null);
        }}
        movement={selectedMovement}
        onSave={handleSaveMovement}
        onDelete={handleDeleteMovement}
      />

      {/* Video Player Modal */}
      {videoModalOpen && activeVideo && (
        <VideoPlayerModal
          isOpen={videoModalOpen}
          onClose={() => {
            setVideoModalOpen(false);
            setActiveVideo(null);
          }}
          videoUrl={activeVideo.url}
          athleteName={activeVideo.athleteName}
          date={activeVideo.date}
        />
      )}
    </div>
  );
}
