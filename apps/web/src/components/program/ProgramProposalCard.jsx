import React from "react";
import { Shield, Check, X } from "lucide-react";
import Button from "../../ui/Button";

export default function ProgramProposalCard({
  proposal,
  loading,
  onApprove,
  onReject
}) {
  if (!proposal) return null;

  return (
    <div className="rounded-2xl border-2 border-accent bg-accent/5 p-5 space-y-4 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-accent/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-xs uppercase font-bold text-accent tracking-wider">
            AI Program Proposal (v{proposal.version}) Pending Review
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-ok bg-ok/10 px-2.5 py-1 rounded-full border border-ok/30">
          <Shield className="h-3.5 w-3.5" />
          <span>Safety Rule §9 Verified</span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="num text-lg font-bold text-ink">
          {proposal.rationale?.title || "Adapted Mesocycle Prescription"}
        </h3>
        <p className="text-xs text-muted leading-relaxed">
          {proposal.rationale?.summary}
        </p>
      </div>

      {/* Key Changes Diff */}
      {proposal.rationale?.keyChanges && (
        <div className="space-y-1.5 bg-surface/80 rounded-xl p-3 border border-line">
          <span className="text-[11px] font-mono uppercase text-muted font-bold block">
            Prescription Modifications:
          </span>
          <ul className="space-y-1">
            {proposal.rationale.keyChanges.map((change, idx) => (
              <li key={idx} className="text-xs text-ink flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1 shrink-0" />
                <span>{change}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Approval Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="primary"
          size="md"
          onClick={onApprove}
          disabled={loading}
          className="flex-1"
        >
          <Check className="h-4 w-4" />
          <span>Approve & Activate Schedule</span>
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={onReject}
          disabled={loading}
        >
          <X className="h-4 w-4" />
          <span>Reject</span>
        </Button>
      </div>
    </div>
  );
}
