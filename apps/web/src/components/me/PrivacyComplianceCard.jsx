import React, { useState } from "react";
import { Download, Trash2, Shield, Check, AlertTriangle, X } from "lucide-react";
import Button from "../../ui/Button";

export default function PrivacyComplianceCard({ user }) {
  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletionStatus, setDeletionStatus] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleExportData = async () => {
    setExporting(true);
    setStatusMessage(null);
    try {
      const token = user?.getIdToken ? await user.getIdToken() : `dev_mock_${user?.uid || 'ath'}_athlete_powerlifting`;
      const res = await fetch('/api/v1/me/export', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json.data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `powerlift_data_export_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setStatusMessage(`Data export completed! SHA-256: ${json.checksum.slice(0, 12)}…`);
      } else {
        setStatusMessage('Export failed. Please try again later.');
      }
    } catch {
      setStatusMessage('Network error during data export.');
    } finally {
      setExporting(false);
    }
  };

  const handleScheduleDelete = async () => {
    if (deleteConfirmation !== 'DELETE_MY_ACCOUNT') return;
    setLoadingDelete(true);
    try {
      const token = user?.getIdToken ? await user.getIdToken() : `dev_mock_${user?.uid || 'ath'}_athlete_powerlifting`;
      const res = await fetch('/api/v1/me/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          confirmation: 'DELETE_MY_ACCOUNT',
          reason: 'User requested via profile settings'
        })
      });
      if (res.ok) {
        const json = await res.json();
        setDeletionStatus('SCHEDULED');
        setStatusMessage(json.message);
        setShowDeleteModal(false);
      }
    } catch {
      setStatusMessage('Failed to schedule deletion.');
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleCancelDelete = async () => {
    setLoadingDelete(true);
    try {
      const token = user?.getIdToken ? await user.getIdToken() : `dev_mock_${user?.uid || 'ath'}_athlete_powerlifting`;
      const res = await fetch('/api/v1/me/delete/cancel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDeletionStatus(null);
        setStatusMessage('Account deletion cancelled. Your account is fully active.');
      }
    } catch {
      setStatusMessage('Failed to cancel deletion.');
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="rounded-xl border border-line bg-surface p-6 space-y-4 font-sans">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-accent" />
        <h2 className="num text-xl font-bold text-ink">Privacy, Export & Account Rights</h2>
      </div>

      <p className="text-xs text-muted leading-relaxed">
        Exercise your rights under GDPR and data privacy laws. Download a complete machine-readable copy of your training history, or schedule permanent account erasure.
      </p>

      {statusMessage && (
        <div className="p-3 rounded-lg bg-raised border border-line text-xs text-ink flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-muted hover:text-ink">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {deletionStatus === 'SCHEDULED' ? (
        <div className="p-4 rounded-xl border border-warn/40 bg-warn/10 space-y-3">
          <div className="flex items-center gap-2 text-warn text-sm font-semibold">
            <AlertTriangle className="h-4 w-4" />
            <span>Account Deletion Pending (30-day grace period)</span>
          </div>
          <p className="text-xs text-muted">
            Your data is scheduled for permanent purge. You can cancel this request anytime before the 30-day window expires.
          </p>
          <Button
            variant="secondary"
            size="md"
            onClick={handleCancelDelete}
            disabled={loadingDelete}
          >
            Cancel Account Deletion
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 pt-1">
          <Button
            variant="secondary"
            size="md"
            onClick={handleExportData}
            disabled={exporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>{exporting ? 'Exporting...' : 'Export My Data (JSON)'}</span>
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={() => setShowDeleteModal(true)}
            className="text-danger hover:bg-danger/10 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Account</span>
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-danger/30 bg-surface p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="num text-xl font-bold text-ink">Delete Account</h3>
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="text-muted hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              This action initiates a <strong className="text-ink">30-day grace period</strong>. Your coaching relationships and subscriptions will be immediately paused. After 30 days, all workout logs, sets, and personal data will be <strong className="text-danger">permanently destroyed</strong>.
            </p>

            <div>
              <label className="text-[11px] font-mono text-muted uppercase block mb-1.5">
                Type <span className="text-danger font-bold">DELETE_MY_ACCOUNT</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE_MY_ACCOUNT"
                className="w-full h-10 px-3 rounded-lg border border-line bg-bg text-ink text-sm font-mono focus:outline-none focus:border-danger"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleScheduleDelete}
                disabled={deleteConfirmation !== 'DELETE_MY_ACCOUNT' || loadingDelete}
                className="flex-1 bg-danger hover:bg-danger/90 text-white"
              >
                Confirm Deletion
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
