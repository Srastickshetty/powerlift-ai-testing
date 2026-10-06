/**
 * apps/api/src/modules/billing/billing.routes.ts
 * Express 5 router for billing endpoints.
 */

import { Router } from 'express';
import { BillingService } from './billing.service';
import { SubscribeInputSchema, ConfirmPaymentSchema, CancelSubscriptionSchema } from './billing.schema';
import { requireAuth } from '../../middleware/requireAuth';
import { activePaymentProvider } from './dummy.provider';

export const billingRouter: Router = Router();

// GET /api/v1/billing/plans
billingRouter.get('/plans', async (_req, res, next) => {
  try {
    const plans = await BillingService.getPlans();
    res.json({ success: true, plans });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/billing/subscribe
billingRouter.post('/subscribe', requireAuth, async (req, res, next) => {
  try {
    const input = SubscribeInputSchema.parse(req.body);
    const userId = req.ctx?.userId;
    if (!userId) {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    const result = await BillingService.subscribe(userId, input);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/billing/confirm
billingRouter.post('/confirm', requireAuth, async (req, res, next) => {
  try {
    const { providerRef } = ConfirmPaymentSchema.parse(req.body);
    const result = await BillingService.confirmPayment(providerRef);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/billing/cancel
billingRouter.post('/cancel', requireAuth, async (req, res, next) => {
  try {
    const { subscriptionId } = CancelSubscriptionSchema.parse(req.body);
    const userId = req.ctx?.userId;
    if (!userId || !subscriptionId) {
      const err: any = new Error('Invalid request');
      err.status = 400;
      throw err;
    }

    const result = await BillingService.cancelSubscription(userId, subscriptionId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/billing/invoices
billingRouter.get('/invoices', requireAuth, async (req, res, next) => {
  try {
    const userId = req.ctx?.userId;
    if (!userId) {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    const invoices = await BillingService.getInvoices(userId);
    res.json({ success: true, invoices });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/billing/webhook/:provider
billingRouter.post('/webhook/:provider', async (req, res, next) => {
  try {
    const signature = (req.headers['stripe-signature'] || req.headers['x-razorpay-signature'] || 'dummy_sig') as string;
    const result = await activePaymentProvider.handleWebhook(req.body, signature);
    res.json({ received: true, ...result });
  } catch (err) {
    next(err);
  }
});
