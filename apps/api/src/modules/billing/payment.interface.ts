/**
 * apps/api/src/modules/billing/payment.interface.ts
 * Abstract payment provider interface.
 * Allows seamless switching between DummyProvider, Stripe, and Razorpay.
 */

export interface CheckoutSessionOptions {
  planId: string;
  payerId: string;
  coachAthleteId?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string;
  provider: string;
  providerRef: string;
  isTestMode: boolean;
}

export interface PaymentConfirmationResult {
  success: boolean;
  subscriptionId: string;
  invoiceId: string;
  status: 'active' | 'past_due' | 'canceled';
  currentPeriodEnd: Date;
}

export interface WebhookEventResult {
  handled: boolean;
  eventType: string;
  providerRef: string;
  details?: Record<string, any>;
}

export interface PaymentProvider {
  readonly providerName: string;
  createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResult>;
  confirmPayment(providerRef: string): Promise<PaymentConfirmationResult>;
  cancelSubscription(providerRef: string): Promise<{ success: boolean; status: string }>;
  handleWebhook(rawBody: string | Buffer, signature: string): Promise<WebhookEventResult>;
}
