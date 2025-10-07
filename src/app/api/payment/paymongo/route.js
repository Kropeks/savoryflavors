import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { activateSubscription } from './subscription-utils';

const PAYMONGO_SANDBOX_CARD_ALIASES = {
  // Stripe-style test cards → PayMongo sandbox equivalents
  '4242424242424242': '4311518804661120',
  '4111111111111111': '4311518804661120',
  '5555555555554444': '5200828282828210',
  '378282246310005': '4000002500003155',
};

export async function POST(req) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const { amount, planId, paymentMethod, billingCycle, cardDetails } = await req.json();

    // Determine lookup strategy for plan
    let plan = null;

    if (Number.isInteger(planId) || (typeof planId === 'string' && /^\d+$/.test(planId))) {
      const [planById] = await query(
        'SELECT * FROM subscription_plans WHERE id = ?',
        [planId]
      );
      plan = planById;
    }

    if (!plan) {
      let planName = null;
      let planBillingCycle = billingCycle;

      switch (planId) {
        case 'premium_monthly':
          planName = 'Premium';
          planBillingCycle = 'monthly';
          break;
        case 'premium_yearly':
          planName = 'Premium';
          planBillingCycle = 'yearly';
          break;
        case 'basic':
          planName = 'Basic';
          planBillingCycle = 'monthly';
          break;
        default:
          planName = typeof planId === 'string' ? planId : null;
      }

      if (planName) {
        const [planByName] = await query(
          'SELECT * FROM subscription_plans WHERE name = ? AND billing_cycle = ?',
          [planName, planBillingCycle]
        );
        plan = planByName;
      }
    }

    if (!plan) {
      return NextResponse.json(
        { success: false, message: 'Plan not found' },
        { status: 404 }
      );
    }

    // Initialize PayMongo client
    const paymongoSecretKey = process.env.PAYMONGO_SECRET_KEY;
    const authString = Buffer.from(`${paymongoSecretKey}:`).toString('base64');

    const amountInCentavos = Math.round(amount * 100);

    if (paymentMethod === 'card') {
      if (!cardDetails?.cardNumber || !cardDetails?.expMonth || !cardDetails?.expYear || !cardDetails?.cvc) {
        return NextResponse.json(
          { success: false, message: 'Incomplete card details provided.' },
          { status: 400 }
        );
      }

      const normalizedCardNumber = cardDetails.cardNumber.replace(/\D+/g, '');
      const mappedCardNumber = PAYMONGO_SANDBOX_CARD_ALIASES[normalizedCardNumber] || normalizedCardNumber;
      const sanitizedCardNumber = String(mappedCardNumber).replace(/\D+/g, '');

      if (process.env.NODE_ENV !== 'production') {
        console.info('[PayMongo] Card mapping', {
          originalInput: cardDetails.cardNumber,
          normalizedCardNumber,
          mappedCardNumber,
          aliasApplied: mappedCardNumber !== normalizedCardNumber,
        });
      }
      const expMonthRaw = String(cardDetails.expMonth ?? '').trim();
      const expYearRaw = String(cardDetails.expYear ?? '').trim();
      const expMonthDigits = expMonthRaw.replace(/\D+/g, '');
      const expYearDigits = expYearRaw.replace(/\D+/g, '');
      const normalizedCvc = cardDetails.cvc.replace(/\D+/g, '');

      const expMonth = parseInt(expMonthDigits, 10);
      const expYearForValidation = expYearDigits.length === 2
        ? 2000 + parseInt(expYearDigits, 10)
        : parseInt(expYearDigits, 10);

      const expMonthString = expMonthDigits.padStart(2, '0');
      const expYearString = expYearDigits.length === 2
        ? `20${expYearDigits}`
        : expYearDigits.padStart(4, '0');
      const expYearInt = parseInt(expYearString, 10);

      if (!Number.isInteger(expMonth) || !Number.isInteger(expYearForValidation)) {
        return NextResponse.json(
          { success: false, message: 'Invalid card expiration date.' },
          { status: 400 }
        );
      }

      if (expMonth < 1 || expMonth > 12) {
        return NextResponse.json(
          { success: false, message: 'Card expiration month must be between 01 and 12.' },
          { status: 400 }
        );
      }

      const currentYear = new Date().getFullYear();
      if (expYearForValidation < currentYear || expYearForValidation > currentYear + 20) {
        return NextResponse.json(
          { success: false, message: 'Card expiration year is invalid.' },
          { status: 400 }
        );
      }

      if (!/^[0-9]{12,19}$/.test(sanitizedCardNumber)) {
        return NextResponse.json(
          { success: false, message: 'Card number must contain 12 to 19 digits.' },
          { status: 400 }
        );
      }

      if (!/^[0-9]{3,4}$/.test(normalizedCvc)) {
        return NextResponse.json(
          { success: false, message: 'CVC must contain 3 or 4 digits.' },
          { status: 400 }
        );
      }

      // Create payment intent for the card
      const cardIntentResponse = await fetch('https://api.paymongo.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: amountInCentavos,
              payment_method_allowed: ['card'],
              payment_method_options: {
                card: {
                  request_three_d_secure: 'any',
                },
              },
              currency: 'PHP',
              description: `Subscription: ${plan.name} (${billingCycle})`,
              metadata: {
                userId: String(session.user.id),
                planId: String(plan.id),
                planName: plan.name,
                billingCycle,
                paymentMethod,
                originalCardNumber: normalizedCardNumber,
              },
            },
          },
        }),
      });

      const cardIntentData = await cardIntentResponse.json();

      if (!cardIntentResponse.ok) {
        console.error('PayMongo card intent error:', cardIntentData);
        const errorDetail = cardIntentData?.errors?.[0]?.detail || cardIntentData?.message || 'Failed to create payment intent';
        return NextResponse.json(
          {
            success: false,
            message: errorDetail,
            error: process.env.NODE_ENV === 'development' ? cardIntentData : undefined,
          },
          { status: cardIntentResponse.status || 500 }
        );
      }

      const paymentIntentId = cardIntentData.data.id;

      // Create card payment method
      const cardPaymentMethodResponse = await fetch('https://api.paymongo.com/v1/payment_methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              type: 'card',
              details: {
                card_number: sanitizedCardNumber,
                exp_month: expMonth,
                exp_year: expYearInt,
                cvc: normalizedCvc,
              },
              billing: cardDetails.billing ? cardDetails.billing : undefined,
              metadata: {
                userId: String(session.user.id),
                planId: String(plan.id),
                planName: plan.name,
                billingCycle,
                paymentMethod: 'card',
                originalCardNumber: normalizedCardNumber,
              },
            },
          },
        }),
      });
      const cardPaymentMethodData = await cardPaymentMethodResponse.json();

      if (!cardPaymentMethodResponse.ok) {
        console.error('PayMongo card payment method error:', cardPaymentMethodData);
        const errorDetail = cardPaymentMethodData?.errors?.[0]?.detail || cardPaymentMethodData?.message || 'Failed to create card payment method';
        return NextResponse.json(
          {
            success: false,
            message: errorDetail,
            error: process.env.NODE_ENV === 'development' ? cardPaymentMethodData : undefined,
          },
          { status: cardPaymentMethodResponse.status || 500 }
        );
      }

      const cardPaymentMethodId = cardPaymentMethodData.data.id;

      // Attach card payment method to intent
      const successReturnUrl = `${process.env.NEXTAUTH_URL}/subscription/success?${new URLSearchParams({ payment_intent_id: paymentIntentId }).toString()}`;

      const cardAttachResponse = await fetch(`https://api.paymongo.com/v1/payment_intents/${paymentIntentId}/attach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              payment_method: cardPaymentMethodId,
              return_url: successReturnUrl,
            },
          },
        }),
      });

      const cardAttachData = await cardAttachResponse.json();

      if (!cardAttachResponse.ok) {
        console.error('PayMongo card attach error:', cardAttachData);
        const errorDetail = cardAttachData?.errors?.[0]?.detail || cardAttachData?.message || 'Failed to attach card payment method';
        return NextResponse.json(
          {
            success: false,
            message: errorDetail,
            error: process.env.NODE_ENV === 'development' ? cardAttachData : undefined,
          },
          { status: cardAttachResponse.status || 500 }
        );
      }

      const cardNextAction = cardAttachData?.data?.attributes?.next_action;
      const cardStatus = cardAttachData?.data?.attributes?.status;

      if (cardNextAction?.redirect?.url) {
        return NextResponse.json({
          success: true,
          requiresAction: true,
          redirectUrl: cardNextAction.redirect.url,
          paymentIntentId,
        });
      }

      if (cardStatus === 'succeeded') {
        await activateSubscription({
          userId: session.user.id,
          planId: plan.id,
          billingCycle,
          amountCentavos: amountInCentavos,
          paymentIntentId,
          paymentMethod: 'card',
        });

        return NextResponse.json({
          success: true,
          paymentIntentId,
        });
      }

      return NextResponse.json({
        success: false,
        message: 'Card payment could not be completed. Please try another method.',
        status: cardStatus,
      }, { status: 400 });
    }

    const paymentMethodAllowed = ['gcash'];

    // Create a payment intent
    const paymentIntentResponse = await fetch('https://api.paymongo.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amountInCentavos,
            payment_method_allowed: paymentMethodAllowed,
            currency: 'PHP',
            description: `Subscription: ${plan.name} (${billingCycle})`,
            metadata: {
              userId: String(session.user.id),
              planId: String(plan.id),
              planName: plan.name,
              billingCycle,
              paymentMethod,
            }
          }
        }
      })
    });

    const paymentIntentData = await paymentIntentResponse.json();

    if (!paymentIntentResponse.ok) {
      console.error('PayMongo error:', paymentIntentData);
      const errorDetail = paymentIntentData?.errors?.[0]?.detail || paymentIntentData?.message || 'Failed to create payment intent';
      return NextResponse.json(
        {
          success: false,
          message: errorDetail,
          error: process.env.NODE_ENV === 'development' ? paymentIntentData : undefined,
        },
        { status: paymentIntentResponse.status || 500 }
      );
    }

    // For GCash, we need to create a payment method and attach it
    if (paymentMethod === 'gcash') {
      const paymentMethodResponse = await fetch('https://api.paymongo.com/v1/payment_methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              type: 'gcash',
              amount: amountInCentavos,
              currency: 'PHP',
              description: `Subscription: ${plan.name} (${billingCycle})`,
            }
          }
        })
      });

      const paymentMethodData = await paymentMethodResponse.json();
      
      if (!paymentMethodResponse.ok) {
        console.error('PayMongo GCash error:', paymentMethodData);
        const errorDetail = paymentMethodData?.errors?.[0]?.detail || paymentMethodData?.message || 'Failed to create GCash payment method';
        return NextResponse.json(
          {
            success: false,
            message: errorDetail,
            error: process.env.NODE_ENV === 'development' ? paymentMethodData : undefined,
          },
          { status: paymentMethodResponse.status || 500 }
        );
      }

      // Attach payment method to payment intent
      const successReturnUrl = `${process.env.NEXTAUTH_URL}/subscription/success?${new URLSearchParams({ payment_intent_id: paymentIntentData.data.id }).toString()}`;

      const attachResponse = await fetch(`https://api.paymongo.com/v1/payment_intents/${paymentIntentData.data.id}/attach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              payment_method: paymentMethodData.data.id,
              return_url: successReturnUrl,
            }
          }
        })
      });

      const attachData = await attachResponse.json();

      if (!attachResponse.ok) {
        console.error('PayMongo attach error:', attachData);
        const errorDetail = attachData?.errors?.[0]?.detail || attachData?.message || 'Failed to attach payment method';
        return NextResponse.json(
          {
            success: false,
            message: errorDetail,
            error: process.env.NODE_ENV === 'development' ? attachData : undefined,
          },
          { status: attachResponse.status || 500 }
        );
      }

      // Return the GCash redirect URL
      return NextResponse.json({
        success: true,
        requiresAction: true,
        clientSecret: paymentIntentData.data.attributes.client_key,
        redirectUrl: attachData.data.attributes.next_action.redirect.url,
        paymentIntentId: paymentIntentData.data.id
      });
    }

    // For credit card payments, return the client secret
    return NextResponse.json({
      success: true,
      clientSecret: paymentIntentData.data.attributes.client_key,
      paymentIntentId: paymentIntentData.data.id
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Payment processing failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
