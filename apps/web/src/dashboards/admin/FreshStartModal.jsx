import React, { useState } from "react";
import { AlertTriangle, Trash2, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import Button from "../../ui/Button";
import { useAuth } from "../../auth/authContext";

export default function FreshStartModal({ isOpen, onClose, onResetComplete }) {
  const { user } = useAuth();
  const [confirmInput, setConfirmInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleExecuteFreshStart = async (e) => {
    e.preventDefault();
    if (confirmInput.trim() !== "FRESH_START_CONFIRM") {
      setError("Please type exactly 'FRESH_START_CONFIRM' to verify.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = user?.getIdToken ? await user.getIdToken() : `dev_mock_${user?.uid || 'admin'}_admin_powerlifting`;
      const res = await fetch("/api/v1/admin/maintenance/fresh-start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ confirmCode: "FRESH_START_CONFIRM" })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to execute database purge");
      }

      toast.success("Platform successfully purged. All test users and programs cleared!");
      setConfirmInput("");
      onClose();
      if (onResetComplete) onResetComplete();
    } catch (err) {
      setError(err?.message || "Execution error during purge.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fresh-start-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border border-danger/40 bg-surface p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-danger/15 border border-danger/30 grid place-items-center text-danger">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="fresh-start-title" className="num text-xl font-bold text-ink">
                Fresh Start System Wipe
              </h2>
              <span className="text-xs text-danger font-semibold">Irreversible Action</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-11 rounded-lg text-muted hover:text-ink hover:bg-raised transition flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-muted leading-relaxed">
          <p>
            This action will permanently delete all present non-admin users, AI-generated programs, mesocycle versions, workout session logs, and messages.
          </p>
          <div className="p-3 rounded-xl bg-bg border border-line space-y-1">
            <span className="font-semibold text-ink block">What is preserved:</span>
            <ul className="list-disc list-inside space-y-0.5 text-muted">
              <li>Core 300+ Exercise library</li>
              <li>Base Billing subscription tiers</li>
              <li>Superadmin authority credentials</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleExecuteFreshStart} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted block mb-1.5">
              Type <span className="font-mono text-danger font-bold">FRESH_START_CONFIRM</span> to proceed:
            </label>
            <input
              type="text"
              required
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="FRESH_START_CONFIRM"
              className="w-full h-11 px-3 rounded-lg border border-line bg-bg text-ink text-base font-mono outline-none focus:border-danger"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || confirmInput !== "FRESH_START_CONFIRM"}
              className="w-full font-bold bg-danger text-white hover:brightness-110 min-h-[44px]"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span>{loading ? "Purging Records..." : "Execute Fresh Start Wipe"}</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onClose}
              className="w-full text-xs text-muted hover:text-ink min-h-[44px]"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
