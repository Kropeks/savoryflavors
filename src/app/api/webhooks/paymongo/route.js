import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req) {
  try {
    // Verify webhook signature
    const signature = req.headers.get('paymongo-signature');
    if (!signature) {
      return new Response('No signature', { status: 400 });
    }

    // Get raw body for signature verification
    const body = await req.text();
    
    // Verify webhook signature
    const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(body).digest('hex');
    
    if (signature !== digest) {
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(body);
    
    // Handle the event
    switch (event.data.attributes.type) {
      case 'payment.paid':
        await handleSuccessfulPayment(event.data.attributes.data);
        break;
      case 'payment.failed':
        await handleFailedPayment(event.data.attributes.data);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook error', { status: 400 });
  }
}

async function handleSuccessfulPayment(payment) {
  const { amount, metadata, payment_intent_id } = payment.attributes;
  
  if (!metadata?.userId || !metadata?.planId) {
    console.error('Missing metadata in payment:', payment);
    return;
  }

  const userId = metadata.userId;
  const planId = metadata.planId;
  const billingCycle = metadata.billingCycle || 'month';
  
  // Calculate subscription dates
  const now = new Date();
  const endDate = new Date(now);
  
  if (billingCycle === 'year') {
    endDate.setFullYear(now.getFullYear() + 1);
  } else {
    endDate.setMonth(now.getMonth() + 1);
  }

  // Update or create subscription
  const [existingSub] = await query(
    'SELECT id FROM subscriptions WHERE user_id = ?',
    [userId]
  );

  if (existingSub) {
    await query(
      `UPDATE subscriptions 
       SET plan_id = ?, status = 'active', 
           current_period_start = ?, current_period_end = ?,
           updated_at = NOW()
       WHERE user_id = ?`,
      [planId, now, endDate, userId]
    );
  } else {
    await query(
      `INSERT INTO subscriptions 
       (user_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at)
       VALUES (?, ?, 'active', ?, ?, NOW(), NOW())`,
      [userId, planId, now, endDate]
    );
  }

  // Record payment
  await query(
    `INSERT INTO payments 
     (user_id, plan_id, amount, currency, payment_intent_id, status, payment_method, created_at)
     VALUES (?, ?, ?, 'PHP', ?, 'succeeded', 'gcash', NOW())`,
    [userId, planId, amount / 100, payment_intent_id]
  );
}

async function handleFailedPayment(payment) {
  const { metadata, payment_intent_id } = payment.attributes;
  
  if (!metadata?.userId) return;

  // Record failed payment
  await query(
    `INSERT INTO payments 
     (user_id, amount, currency, payment_intent_id, status, payment_method, error_message, created_at)
     VALUES (?, ?, 'PHP', ?, 'failed', 'gcash', ?, NOW())`,
    [metadata.userId, payment.attributes.amount / 100, payment_intent_id, payment.attributes.last_payment_error?.message || 'Payment failed']
  );
}
