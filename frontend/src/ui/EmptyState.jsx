import React from "react";
import Button from "./Button";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ""
}) {
  return (
    <div className={`rounded-xl border border-line bg-surface p-8 text-center flex flex-col items-center justify-center gap-3 ${className}`}>
      {Icon && (
        <div className="h-12 w-12 rounded-full bg-raised border border-line grid place-items-center text-muted">
          <Icon className="h-6 w-6 text-accent" />
        </div>
      )}
      <h3 className="num text-xl font-bold text-ink">{title}</h3>
      {description && <p className="text-sm text-muted max-w-sm">{description}</p>}
      {actionLabel && (
        <Button variant="primary" size="md" className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
