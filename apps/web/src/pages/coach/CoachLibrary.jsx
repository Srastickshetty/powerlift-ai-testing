import React, { useState } from "react";
import { Search, X, Dumbbell, Plus } from "lucide-react";
import Button from "../../ui/Button";
import NoSearchResults from "../../ui/NoSearchResults";
import EmptyState from "../../ui/EmptyState";
import Skeleton from "../../ui/Skeleton";

const DEFAULT_MOVEMENTS = [
  { lift: "Competition Squat", category: "Compound", cues: "Tripod foot, wedge upper back, drive hips through" },
  { lift: "Pause Bench Press", category: "Compound", cues: "Leg drive before press, bar over wrists, flared lats" },
  { lift: "Sumo Deadlift", category: "Compound", cues: "Open groin, spread floor, pull slack out of bar" },
  { lift: "Romanian Deadlift", category: "Accessory", cues: "Hinge at hip crease, soft knees, vertical shins" },
  { lift: "JM Press", category: "Accessory", cues: "Elbows forward, bar to chin crease, tricep drive" },
  { lift: "Safety Squat Bar (SSB) Squat", category: "Specialty", cues: "Stay upright against camber, flare lats into pads" },
  { lift: "Chest-Supported T-Bar Row", category: "Accessory", cues: "Neutral spine, squeeze rhomboids, full stretch at bottom" },
  { lift: "Deficit Deadlift (2-inch)", category: "Specialty", cues: "Patience off the floor, leg press the platform" },
];

const CATEGORIES = ["All", "Compound", "Accessory", "Specialty"];

export default function CoachLibrary() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [movements, setMovements] = useState(DEFAULT_MOVEMENTS);

  const filtered = movements.filter((item) => {
    const matchesSearch =
      item.lift.toLowerCase().includes(search.toLowerCase().trim()) ||
      item.cues.toLowerCase().includes(search.toLowerCase().trim());
    const matchesCategory = category === "All" || item.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <header className="border-b border-line pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="num text-3xl font-bold tracking-tight text-ink">
            Exercise Technique & Cue Library
          </h1>
          <p className="text-sm text-muted">
            Curated movement variations, coaching cues, and biomechanics guides.
          </p>
        </div>
        <Button variant="primary" size="md" className="gap-2">
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

        {loading ? (
          <Skeleton.SetRow count={4} />
        ) : movements.length === 0 ? (
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
                setMovements((prev) => [
                  ...prev,
                  { lift: search, category: "Custom", cues: "Custom athlete cue" },
                ]);
                setSearch("");
              }
            }}
          />
        ) : (
          <div className="divide-y divide-line rounded-lg border border-line bg-bg">
            {filtered.map((item) => (
              <div
                key={item.lift}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">{item.lift}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-raised border border-line text-muted">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-xs text-muted block mt-1 italic">
                    Cue: "{item.cues}"
                  </span>
                </div>
                <Button variant="secondary" size="md" className="shrink-0 text-xs">
                  Edit Cues
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
