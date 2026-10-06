import React from "react";
import { Dumbbell, Flame } from "lucide-react";

export default function SportSwitcher({ activeSport, onSelectSport }) {
  return (
    <div className="flex items-center gap-2 p-1 rounded-xl border border-line bg-surface">
      <button
        type="button"
        data-track="pl"
        onClick={() => onSelectSport("pl")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold min-h-[44px] transition ${
          activeSport === "pl"
            ? "bg-accent text-accent-ink shadow-md"
            : "text-muted hover:text-ink hover:bg-raised"
        }`}
      >
        <Dumbbell className="h-4 w-4" />
        <span>Powerlifting (SBD)</span>
      </button>

      <button
        type="button"
        data-track="bb"
        onClick={() => onSelectSport("bb")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold min-h-[44px] transition ${
          activeSport === "bb"
            ? "bg-accent text-accent-ink shadow-md"
            : "text-muted hover:text-ink hover:bg-raised"
        }`}
      >
        <Flame className="h-4 w-4" />
        <span>Bodybuilding (Hypertrophy)</span>
      </button>
    </div>
  );
}
