import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { activateSubscription } from '@/app/api/payment/paymongo/subscription-utils';

export async function GET(req) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const url = new URL(req.url);
    const paymentIntentId = url.searchParams.get('paymentIntentId') || url.searchParams.get('payment_intent_id');

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, message: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    const paymongoSecretKey = process.env.PAYMONGO_SECRET_KEY;

    if (!paymongoSecretKey) {
      return NextResponse.json(
        { success: false, message: 'PayMongo secret key is not configured' },
        { status: 500 }
      );
    }

    const authString = Buffer.from(`${paymongoSecretKey}:`).toString('base64');

    const intentResponse = await fetch(`https://api.paymongo.com/v1/payment_intents/${paymentIntentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
    });

    const intentData = await intentResponse.json();

    if (!intentResponse.ok) {
      const errorDetail = intentData?.errors?.[0]?.detail || intentData?.message || 'Unable to retrieve payment intent';
      return NextResponse.json(
        {
          success: false,
          message: errorDetail,
          error: process.env.NODE_ENV === 'development' ? intentData : undefined,
        },
        { status: intentResponse.status || 500 }
      );
    }

    const intent = intentData?.data;
    const attributes = intent?.attributes || {};
    const metadata = attributes.metadata || {};

    // Ensure the payment intent belongs to the authenticated user
    if (metadata?.userId && metadata.userId !== String(session.user.id)) {
      return NextResponse.json(
        { success: false, message: 'Payment intent does not belong to the authenticated user' },
        { status: 403 }
      );
    }

    const status = attributes.status;
    const isSucceeded = status === 'succeeded';
    const requiresAction = status === 'awaiting_next_action';

    let activation = null;

    if (isSucceeded && metadata?.userId && metadata?.planId) {
      try {
        activation = await activateSubscription({
          userId: metadata.userId,
          planId: metadata.planId,
          billingCycle: metadata.billingCycle,
          amountCentavos: attributes.amount,
          paymentIntentId,
          paymentMethod: metadata.paymentMethod || attributes.payment_method || 'card',
        });
      } catch (activationError) {
        console.error('PayMongo verification activation error:', activationError);
        return NextResponse.json(
          {
            success: false,
            paymentIntentId,
            status,
            requiresAction,
            amount: attributes.amount,
            currency: attributes.currency,
            nextAction: attributes.next_action || null,
            metadata,
            message: 'Payment succeeded but subscription activation failed. Please contact support.',
            activationError: process.env.NODE_ENV === 'development' ? activationError.message : undefined,
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      success: isSucceeded,
      paymentIntentId,
      status,
      requiresAction,
      amount: attributes.amount,
      currency: attributes.currency,
      nextAction: attributes.next_action || null,
      metadata,
      activation,
    });
  } catch (error) {
    console.error('PayMongo verification error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Payment intent verification failed',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
