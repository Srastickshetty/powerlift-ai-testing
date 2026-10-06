import React from "react";
import { Check, AlertCircle } from "lucide-react";

export default function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error = "",
  touched = false,
  isValid = false,
  helperText = "",
  placeholder = "",
  required = false,
  disabled = false,
  inputMode,
  unit,
  className = "",
  as: Component = "input",
  children,
  maxLength,
  ...props
}) {
  const fieldId = id || `field-${label?.toLowerCase().replace(/\s+/g, "-") || "input"}`;
  const hasError = touched && !!error;
  const showValid = touched && isValid && !error;

  const baseInputStyles = `
    w-full rounded-md border bg-bg px-3.5 text-base text-ink transition
    placeholder:text-muted/50 disabled:opacity-50 disabled:cursor-not-allowed
    outline-none
  `;

  const stateStyles = hasError
    ? "border-danger focus:ring-2 focus:ring-danger/30 text-danger"
    : showValid
    ? "border-ok focus:ring-2 focus:ring-ok/30"
    : "border-line focus:border-accent focus:ring-2 focus:ring-accent/20";

  const sizeStyles = Component === "textarea" ? "min-h-[96px] py-2.5" : "h-11";

  return (
    <div className={`space-y-1.5 text-left ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-xs">
          <label htmlFor={fieldId} className="font-semibold text-ink/90 flex items-center gap-1">
            <span>{label}</span>
            {required && <span className="text-accent" aria-hidden="true">*</span>}
          </label>
          {maxLength && (
            <span className="text-[11px] text-muted">
              {String(value || "").length}/{maxLength}
            </span>
          )}
        </div>
      )}

      <div className="relative flex items-center">
        {Component === "select" ? (
          <select
            id={fieldId}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            aria-invalid={hasError ? "true" : "false"}
            aria-describedby={hasError ? `${fieldId}-error` : helperText ? `${fieldId}-hint` : undefined}
            className={`${baseInputStyles} ${stateStyles} ${sizeStyles} appearance-none pr-10`}
            {...props}
          >
            {children}
          </select>
        ) : Component === "textarea" ? (
          <textarea
            id={fieldId}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            aria-invalid={hasError ? "true" : "false"}
            aria-describedby={hasError ? `${fieldId}-error` : helperText ? `${fieldId}-hint` : undefined}
            className={`${baseInputStyles} ${stateStyles} ${sizeStyles} resize-y`}
            {...props}
          />
        ) : (
          <input
            id={fieldId}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            inputMode={inputMode}
            maxLength={maxLength}
            aria-invalid={hasError ? "true" : "false"}
            aria-describedby={hasError ? `${fieldId}-error` : helperText ? `${fieldId}-hint` : undefined}
            className={`${baseInputStyles} ${stateStyles} ${sizeStyles} ${unit || hasError || showValid ? "pr-10" : ""}`}
            {...props}
          />
        )}

        {/* Status indicator or unit badge */}
        <div className="absolute right-3 pointer-events-none flex items-center gap-1.5 text-xs">
          {unit && <span className="text-muted font-mono">{unit}</span>}
          {hasError && <AlertCircle className="h-4 w-4 text-danger" aria-hidden="true" />}
          {showValid && !unit && <Check className="h-4 w-4 text-ok" aria-hidden="true" />}
        </div>
      </div>

      {/* Validation or Helper Message */}
      {hasError ? (
        <p id={`${fieldId}-error`} role="alert" className="text-xs text-danger font-medium flex items-center gap-1">
          <span>{error}</span>
        </p>
      ) : showValid ? (
        <p className="text-xs text-ok font-medium flex items-center gap-1">
          <span>Looks good</span>
        </p>
      ) : helperText ? (
        <p id={`${fieldId}-hint`} className="text-xs text-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
