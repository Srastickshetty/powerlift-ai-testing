import React from "react";
import Button from "./Button";

export default function EmptyState({
  icon: Icon,
  title = "No data available",
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
  compact = false,
}) {
  return (
    <div
      role="status"
      className={`rounded-xl border border-line bg-surface text-center flex flex-col items-center justify-center gap-3 transition ${
        compact ? "p-5" : "p-8 md:p-12"
      } ${className}`}
    >
      {Icon && (
        <div className="h-12 w-12 rounded-full bg-raised border border-line grid place-items-center text-muted">
          <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
        </div>
      )}
      <div className="space-y-1 max-w-md">
        <h3 className="num text-xl font-bold text-ink">{title}</h3>
        {description && <p className="text-sm text-muted leading-relaxed">{description}</p>}
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2">
          {actionLabel && (
            <Button variant="primary" size="md" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button variant="secondary" size="md" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
