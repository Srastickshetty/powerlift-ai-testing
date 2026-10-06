import React, { useState } from "react";
import { Dumbbell } from "lucide-react";
import {
  EmptyState,
  LoadingState,
  Skeleton,
  ErrorState,
  NoInternetPage,
  SlowNetworkBanner,
  NoSearchResults,
  PermissionDenied,
  SessionExpiredModal,
  FormField,
  SuccessState,
  Button
} from "../../ui";

const STATE_TABS = [
  { id: "empty", label: "1. Empty" },
  { id: "loading", label: "2. Loading" },
  { id: "error", label: "3. Error" },
  { id: "offline", label: "4. No Internet" },
  { id: "slow", label: "5. Slow Network" },
  { id: "search", label: "6. No Search" },
  { id: "forbidden", label: "7. Perm Denied" },
  { id: "expired", label: "8. Session Expired" },
  { id: "form", label: "9. Form Validation" },
  { id: "success", label: "10. Success" },
];

export default function UiStatesShowcase() {
  const [activeTab, setActiveTab] = useState("empty");
  const [formData, setFormData] = useState({
    email: "srastick@powerlift.ai",
    bodyweight: "74.2",
    squatMax: "195",
    notes: "Felt explosive out of the hole today.",
  });
  const [touched, setTouched] = useState({
    email: true,
    bodyweight: true,
    squatMax: true,
    notes: false,
  });
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("deficit zercher");

  const formErrors = {};
  if (!formData.email.includes("@") || !formData.email.includes(".")) {
    formErrors.email = "Please enter a valid email address.";
  }
  const bw = parseFloat(formData.bodyweight);
  if (isNaN(bw) || bw < 40 || bw > 250) {
    formErrors.bodyweight = "Enter bodyweight between 40kg and 250kg.";
  }
  const sq = parseFloat(formData.squatMax);
  if (isNaN(sq) || sq < 20 || sq > 550) {
    formErrors.squatMax = "Squat 1RM must be between 20kg and 550kg.";
  }

  return (
    <div className="space-y-6">
      {/* State Switcher Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-line">
        {STATE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition border ${
              activeTab === t.id
                ? "bg-accent text-accent-ink border-accent"
                : "bg-surface text-muted border-line hover:text-ink hover:bg-raised"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* State Renderings */}
      <div className="min-h-[360px] flex items-center justify-center">
        {activeTab === "empty" && (
          <div className="w-full max-w-md">
            <EmptyState
              icon={Dumbbell}
              title="No Training Logged Today"
              description="You have no active sets recorded for today's session. Start logging or load your programmed routine."
              actionLabel="+ Start Empty Session"
              onAction={() => alert("Empty session initiated")}
              secondaryActionLabel="Load Week 4 Program"
              onSecondaryAction={() => alert("Program loaded")}
            />
          </div>
        )}

        {activeTab === "loading" && (
          <div className="w-full max-w-lg space-y-6">
            <LoadingState
              message="Syncing Training Program..."
              subtext="Calculating daily target loads from RPE formulas"
            />
            <div className="border-t border-line pt-4 space-y-3">
              <span className="text-xs uppercase tracking-wider text-muted font-bold block">
                Skeleton Placeholders:
              </span>
              <Skeleton.Card />
              <Skeleton.SetRow count={2} />
            </div>
          </div>
        )}

        {activeTab === "error" && (
          <div className="w-full max-w-md">
            <ErrorState
              title="Failed to Load Program Block"
              message="The training database encountered a sync timeout. Your local offline cache is intact."
              error={new Error("PrismaClientKnownRequestError: P2024 Timed out fetching a new connection from pool")}
              onRetry={() => alert("Retrying request...")}
              onHome={() => alert("Navigating home...")}
            />
          </div>
        )}

        {activeTab === "offline" && (
          <div className="w-full max-w-md">
            <NoInternetPage
              fullScreen={false}
              onRetry={() => alert("Testing connection...")}
              onContinueOffline={() => alert("Resuming offline mode")}
            />
          </div>
        )}

        {activeTab === "slow" && (
          <div className="w-full max-w-lg space-y-4">
            <SlowNetworkBanner
              latencyMs={4200}
              onEnableOfflineMode={() => alert("Switched to offline buffering mode!")}
              onDismiss={() => alert("Banner dismissed")}
            />
            <div className="p-4 rounded-xl border border-line bg-surface text-xs text-muted">
              Simulated: Gym basement with 2G cellular reception. Sets will be stored in IndexedDB instantly.
            </div>
          </div>
        )}

        {activeTab === "search" && (
          <div className="w-full max-w-md space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type query to test..."
                className="flex-1 h-10 px-3 rounded-md border border-line bg-surface text-xs text-ink outline-none focus:border-accent"
              />
              <Button size="md" variant="secondary" onClick={() => setSearchQuery("")}>
                Clear
              </Button>
            </div>
            <NoSearchResults
              query={searchQuery}
              filters={["Accessory Lifts", "Quad Focus"]}
              onClear={() => setSearchQuery("")}
              onAddCustom={() => alert(`Adding custom lift: "${searchQuery}"`)}
            />
          </div>
        )}

        {activeTab === "forbidden" && (
          <div className="w-full max-w-md">
            <PermissionDenied
              fullScreen={false}
              title="Coach Roster Restricted"
              message="You are signed in as an Athlete. Only head coaches have access to roster athlete management and billing."
              requiredRole="Coach"
              onBack={() => alert("Navigating back to Athlete Today")}
            />
          </div>
        )}

        {activeTab === "expired" && (
          <div className="w-full max-w-md text-center space-y-4">
            <div className="p-6 rounded-xl border border-line bg-surface space-y-3">
              <p className="text-sm text-ink font-semibold">
                Click below to simulate session expiration (401 token expiry):
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsSessionModalOpen(true)}
              >
                Trigger 401 Session Expired Modal
              </Button>
            </div>
            <SessionExpiredModal
              isOpen={isSessionModalOpen}
              email="srastick@powerlift.ai"
              onSuccess={() => {
                alert("Session re-authenticated!");
                setIsSessionModalOpen(false);
              }}
              onDismiss={() => setIsSessionModalOpen(false)}
            />
          </div>
        )}

        {activeTab === "form" && (
          <div className="w-full max-w-md rounded-xl border border-line bg-surface p-6 space-y-4 shadow-lg">
            <div className="border-b border-line pb-3">
              <h3 className="num text-lg font-bold text-ink">Interactive Form Validation</h3>
              <p className="text-xs text-muted">Real-time validation, touch states, and accessible ARIA cues.</p>
            </div>

            <FormField
              id="val-email"
              label="Athlete Email"
              type="email"
              value={formData.email}
              touched={touched.email}
              isValid={!formErrors.email}
              error={formErrors.email}
              onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
              onBlur={() => setTouched(p => ({ ...p, email: true }))}
              helperText="Official login email for coach notifications"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                id="val-bw"
                label="Bodyweight"
                inputMode="decimal"
                unit="kg"
                value={formData.bodyweight}
                touched={touched.bodyweight}
                isValid={!formErrors.bodyweight}
                error={formErrors.bodyweight}
                onChange={(e) => setFormData(p => ({ ...p, bodyweight: e.target.value }))}
                onBlur={() => setTouched(p => ({ ...p, bodyweight: true }))}
                required
              />

              <FormField
                id="val-sq"
                label="Squat 1RM"
                inputMode="decimal"
                unit="kg"
                value={formData.squatMax}
                touched={touched.squatMax}
                isValid={!formErrors.squatMax}
                error={formErrors.squatMax}
                onChange={(e) => setFormData(p => ({ ...p, squatMax: e.target.value }))}
                onBlur={() => setTouched(p => ({ ...p, squatMax: true }))}
                required
              />
            </div>

            <FormField
              id="val-notes"
              label="Training Reflection"
              as="textarea"
              maxLength={120}
              value={formData.notes}
              onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
              placeholder="Session notes for coach..."
            />

            <Button
              variant="primary"
              size="lg"
              className="w-full font-bold mt-2"
              disabled={Object.keys(formErrors).length > 0}
              onClick={() => alert("Form submitted with valid inputs!")}
            >
              {Object.keys(formErrors).length > 0 ? "Fix Validation Errors" : "Save Profile Data"}
            </Button>
          </div>
        )}

        {activeTab === "success" && (
          <div className="w-full max-w-md">
            <SuccessState
              title="Session Logged: SBD Peak Day"
              message="Your workout sets and video notes have been uploaded and synced with coach review."
              metrics={[
                { label: "Completed Sets", value: "14" },
                { label: "Total Volume", value: "12,850 kg" },
                { label: "PR Sets", value: "+2 New" },
              ]}
              coachNote="Great speed off the floor on deadlifts. Rest 48 hours before next heavy press."
              onPrimaryAction={() => alert("Viewing history")}
              onSecondaryAction={() => alert("Returning to Today")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
