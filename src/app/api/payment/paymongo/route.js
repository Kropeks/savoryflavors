import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';

export async function POST(req) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const { amount, planId, paymentMethod, billingCycle } = await req.json();
    
    // Get plan details
    const [plan] = await query(
      'SELECT * FROM subscription_plans WHERE id = ?',
      [planId]
    );

    if (!plan) {
      return NextResponse.json(
        { success: false, message: 'Plan not found' },
        { status: 404 }
      );
    }

    // Initialize PayMongo client
    const paymongoSecretKey = process.env.PAYMONGO_SECRET_KEY;
    const authString = Buffer.from(`${paymongoSecretKey}:`).toString('base64');

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
            amount: amount * 100, // Convert to centavos
            payment_method_allowed: [paymentMethod],
            payment_method_options: {
              card: {
                request_three_d_secure: 'any'
              }
            },
            currency: 'PHP',
            description: `Subscription: ${plan.name} (${billingCycle})`,
            metadata: {
              userId: session.user.id,
              planId: plan.id,
              billingCycle,
            }
          }
        }
      })
    });

    const paymentIntentData = await paymentIntentResponse.json();

    if (!paymentIntentResponse.ok) {
      console.error('PayMongo error:', paymentIntentData);
      throw new Error('Failed to create payment intent');
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
              amount: amount * 100,
              currency: 'PHP',
              description: `Subscription: ${plan.name} (${billingCycle})`,
            }
          }
        })
      });

      const paymentMethodData = await paymentMethodResponse.json();
      
      if (!paymentMethodResponse.ok) {
        console.error('PayMongo GCash error:', paymentMethodData);
        throw new Error('Failed to create GCash payment method');
      }

      // Attach payment method to payment intent
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
              return_url: `${process.env.NEXTAUTH_URL}/subscription/success`,
            }
          }
        })
      });

      const attachData = await attachResponse.json();

      if (!attachResponse.ok) {
        console.error('PayMongo attach error:', attachData);
        throw new Error('Failed to attach payment method');
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
