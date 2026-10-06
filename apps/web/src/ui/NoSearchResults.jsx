import React from "react";
import { SearchX, RotateCcw, Plus } from "lucide-react";
import Button from "./Button";

export default function NoSearchResults({
  query = "",
  filters = [],
  onClear,
  onAddCustom,
  suggestions = [
    "Check for spelling errors or alternative abbreviations (e.g., 'RDL', 'JM Press')",
    "Try searching by muscle group (e.g., 'Glutes', 'Triceps')",
    "Remove category or track filters to widen results",
  ],
  className = "",
}) {
  return (
    <div
      role="status"
      className={`rounded-xl border border-line bg-surface p-6 sm:p-10 text-center flex flex-col items-center justify-center gap-4 max-w-md mx-auto ${className}`}
    >
      <div className="h-12 w-12 rounded-full bg-raised border border-line grid place-items-center text-muted">
        <SearchX className="h-6 w-6 text-accent" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h3 className="num text-xl font-bold text-ink">
          {query ? (
            <>
              No results for <span className="text-accent italic">"{query}"</span>
            </>
          ) : (
            "No matching results found"
          )}
        </h3>
        <p className="text-sm text-muted">
          We couldn't find any movements or records matching your active criteria.
        </p>
      </div>

      {filters && filters.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 py-1">
          <span className="text-xs text-muted">Active filters:</span>
          {filters.map((f, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded-full bg-raised border border-line text-ink"
            >
              {f}
            </span>
          ))}
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="w-full text-left bg-bg p-3.5 rounded-lg border border-line text-xs space-y-1.5">
          <span className="font-semibold text-ink block text-[11px] uppercase tracking-wider text-muted">
            Suggestions:
          </span>
          <ul className="list-disc list-inside space-y-1 text-muted">
            {suggestions.map((s, idx) => (
              <li key={idx} className="leading-snug">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
        {onClear && (
          <Button variant="primary" size="md" onClick={onClear} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            <span>Clear Search & Filters</span>
          </Button>
        )}
        {onAddCustom && (
          <Button variant="secondary" size="md" onClick={onAddCustom} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Custom Lift</span>
          </Button>
        )}
      </div>
    </div>
  );
}
