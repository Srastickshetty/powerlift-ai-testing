/**
 * apps/api/src/modules/billing/dummy.provider.ts
 * Deterministic Test-Mode Payment Provider implementation.
 *
 * TO SWAP IN PRODUCTION:
 * 1. For Stripe: Replace this with `StripeProvider` calling `stripe.checkout.sessions.create()`
 *    and verifying webhooks with `stripe.webhooks.constructEvent()`.
 * 2. For Razorpay (India): Implement `RazorpayProvider` creating standard razorpay orders / subscriptions
 *    and verifying `razorpay_signature` using HMAC SHA256.
 * All route handlers and entitlement guards remain completely unchanged.
 */

import { PaymentProvider, CheckoutSessionOptions, CheckoutSessionResult, PaymentConfirmationResult, WebhookEventResult } from './payment.interface';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';

export class DummyProvider implements PaymentProvider {
  readonly providerName = 'dummy';

  async createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResult> {
    const providerRef = `test_sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    logger.info({ options, providerRef }, '💳 [TEST MODE] DummyProvider: Created mock checkout session.');

    return {
      sessionId: `sess_${providerRef}`,
      checkoutUrl: `/billing/mock-checkout?ref=${providerRef}`,
      provider: this.providerName,
      providerRef,
      isTestMode: true
    };
  }

  async confirmPayment(providerRef: string): Promise<PaymentConfirmationResult> {
    // 30 days period by default
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Find the subscription row created during checkout or upsert
    let subscription = await prisma.subscription.findFirst({
      where: { providerRef }
    });

    if (!subscription) {
      const err: any = new Error(`Subscription with ref ${providerRef} not found.`);
      err.status = 404;
      throw err;
    }

    subscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'active',
        currentPeriodEnd: periodEnd
      }
    });

    // Create a real paid invoice row
    const plan = await prisma.plan.findUnique({
      where: { id: subscription.planId }
    });

    const invoice = await prisma.invoice.create({
      data: {
        subscriptionId: subscription.id,
        amountMinor: plan?.priceMinor || 1999,
        status: 'paid',
        providerRef: `inv_${providerRef}`,
        issuedAt: now
      }
    });

    logger.info({ subscriptionId: subscription.id, invoiceId: invoice.id }, '💳 [TEST MODE] Payment confirmed successfully.');

    return {
      success: true,
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      status: 'active',
      currentPeriodEnd: periodEnd
    };
  }

  async cancelSubscription(providerRef: string): Promise<{ success: boolean; status: string }> {
    const subscription = await prisma.subscription.findFirst({
      where: { providerRef }
    });

    if (!subscription) {
      const err: any = new Error(`Subscription with ref ${providerRef} not found.`);
      err.status = 404;
      throw err;
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'canceled' }
    });

    logger.info({ subscriptionId: subscription.id }, '💳 [TEST MODE] Subscription canceled.');

    return { success: true, status: 'canceled' };
  }

  async handleWebhook(rawBody: string | Buffer, signature: string): Promise<WebhookEventResult> {
    logger.info({ signature }, '💳 [TEST MODE] Webhook handled.');
    return {
      handled: true,
      eventType: 'payment.succeeded',
      providerRef: 'test_webhook_ref'
    };
  }
}

export const activePaymentProvider: PaymentProvider = new DummyProvider();
