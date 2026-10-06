import React from "react";
import { Dumbbell, Flame } from "lucide-react";

export default function SportSwitcher({ activeSport, onSelectSport }) {
  const isPl = activeSport === "pl";
  const isBb = activeSport === "bb";

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl border border-line bg-surface shadow-inner">
      <button
        type="button"
        data-track="pl"
        onClick={() => onSelectSport("pl")}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold min-h-[44px] transition ${
          isPl
            ? "bg-accent text-accent-ink shadow-lg shadow-accent/25"
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
        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold min-h-[44px] transition ${
          isBb
            ? "bg-accent text-accent-ink shadow-lg shadow-accent/25"
            : "text-muted hover:text-ink hover:bg-raised"
        }`}
      >
        <Flame className="h-4 w-4" />
        <span>Bodybuilding (Hypertrophy)</span>
      </button>
    </div>
  );
}
