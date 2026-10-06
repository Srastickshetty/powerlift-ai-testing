import React, { useState } from "react";
import { KeyRound, Mail, CheckCircle2, AlertCircle, X, ArrowLeft } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../auth/firebase";
import Button from "../../ui/Button";

export default function ForgotPasswordModal({ isOpen, onClose, initialEmail = "" }) {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err) {
      const code = err?.code || "";
      if (code === "auth/user-not-found") {
        setError("No registered account found with this email.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(err?.message?.replace("Firebase: ", "") || "Failed to send reset link. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setSent(false);
    setError("");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-accent/10 border border-accent/20 grid place-items-center text-accent">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="forgot-password-title" className="num text-xl font-bold text-ink">
                Reset Password
              </h2>
              <span className="text-xs text-muted">Receive a secure link to your email</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-11 rounded-lg text-muted hover:text-ink hover:bg-raised transition flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="space-y-5 text-center py-2">
            <div className="mx-auto h-14 w-14 rounded-full bg-ok/15 border border-ok/30 grid place-items-center text-ok">
              <CheckCircle2 className="h-7 w-7 text-ok" aria-hidden="true" />
            </div>

            <div className="space-y-1.5">
              <h3 className="num text-lg font-bold text-ink">Check Your Inbox</h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                We've sent a password reset link to <span className="text-ink font-semibold">{email}</span>. Click the link in the email to choose a new password.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-bg border border-line text-xs text-muted text-left">
              <span>Didn't receive it? Check your spam/junk folder or try sending again.</span>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button variant="primary" size="lg" onClick={onClose} className="w-full font-bold">
                Return to Log In
              </Button>
              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs text-muted hover:text-ink transition py-1"
              >
                Send to a different email address
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-muted leading-relaxed">
              Enter your registered athlete or coach email address. We will send you an official password recovery link.
            </p>

            <div>
              <label className="text-xs font-semibold text-muted block mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-muted pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="athlete@powerliftai.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-line bg-bg text-ink text-base placeholder:text-muted/60 focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || !email}
                className="w-full font-bold"
              >
                <span>{loading ? "Sending Link..." : "Send Reset Link"}</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={onClose}
                className="w-full text-xs text-muted hover:text-ink gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Login</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
