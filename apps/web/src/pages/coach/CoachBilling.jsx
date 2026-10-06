import React from "react";
import Button from "../../ui/Button";

export default function CoachBilling() {
  return (
    <div className="space-y-6">
      <header className="border-b border-line pb-4 flex items-center justify-between">
        <div>
          <h1 className="num text-3xl font-bold tracking-tight text-ink">Coach Billing & Payouts</h1>
          <p className="text-sm text-muted">Client subscriptions, earnings overview, and payout settlement.</p>
        </div>
        <Button variant="primary" size="md">Payout Settings</Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-line bg-surface p-5">
          <span className="text-xs text-muted block uppercase">Monthly Recurring Revenue</span>
          <span className="num text-3xl font-bold text-ink block mt-1">₹84,000</span>
          <span className="text-xs text-ok mt-1 block">+12% vs last month</span>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5">
          <span className="text-xs text-muted block uppercase">Active Roster Subscriptions</span>
          <span className="num text-3xl font-bold text-ink block mt-1">21 Athletes</span>
          <span className="text-xs text-muted mt-1 block">Full capacity at 25</span>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5">
          <span className="text-xs text-muted block uppercase">Next Payout Batch</span>
          <span className="num text-3xl font-bold text-accent block mt-1">Oct 5, 2026</span>
          <span className="text-xs text-muted mt-1 block">Automatic bank transfer</span>
        </div>
      </div>
    </div>
  );
}
