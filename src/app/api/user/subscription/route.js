import { auth } from '@/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { 
        success: false,
        message: 'Not authenticated' 
      },
      { status: 401 }
    );
  }

  try {
    const { planId, planName, price, billingCycle } = await req.json();
    
    // For free plan, we just update the user's subscription in the database
    if (planName === 'Basic') {
      // First, get the plan ID from subscription_plans
      const [plan] = await query(
        'SELECT id FROM subscription_plans WHERE name = ? AND billing_cycle = ?',
        [planName, billingCycle]
      );
      
      if (!plan) {
        return NextResponse.json(
          { success: false, message: 'Subscription plan not found' },
          { status: 404 }
        );
      }
      
      // Check if user already has an active subscription
      const [existingSub] = await query(
        'SELECT id FROM subscriptions WHERE user_id = ? AND status = ?',
        [session.user.id, 'active']
      );
      
      const now = new Date();
      const oneYearLater = new Date();
      oneYearLater.setFullYear(now.getFullYear() + 1);
      
      if (existingSub) {
        // Update existing subscription
        await query(
          `UPDATE subscriptions 
           SET plan_id = ?, status = 'active', 
               current_period_start = ?, current_period_end = ?,
               updated_at = NOW()
           WHERE user_id = ?`,
          [plan.id, now, oneYearLater, session.user.id]
        );
      } else {
        // Create new subscription
        await query(
          `INSERT INTO subscriptions 
           (user_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at)
           VALUES (?, ?, 'active', ?, ?, NOW(), NOW())`,
          [session.user.id, plan.id, now, oneYearLater]
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Subscription updated successfully'
      });
    }
    
    // For premium plans, we'll handle this in the payment flow
    return NextResponse.json({
      success: true,
      requiresPayment: true
    });
    
  } catch (error) {
    console.error('Subscription update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { 
        hasSubscription: false,
        status: 'unauthenticated',
        message: 'Not authenticated' 
      },
      { status: 401 }
    );
  }

  try {
    // Get the user's active subscription
    const [subscription] = await query(
      `SELECT s.*, sp.name as plan_name, sp.features 
       FROM subscriptions s
       JOIN subscription_plans sp ON s.plan_id = sp.id
       WHERE s.user_id = ? AND s.status = 'active' 
       AND (s.end_date IS NULL OR s.end_date >= NOW())
       ORDER BY s.end_date DESC
       LIMIT 1`,
      [session.user.id]
    );

    if (!subscription) {
      return new Response(JSON.stringify({ 
        hasSubscription: false,
        status: 'inactive',
        message: 'No active subscription found'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      hasSubscription: true,
      status: subscription.status,
      plan: {
        id: subscription.plan_id,
        name: subscription.plan_name,
        features: subscription.features ? JSON.parse(subscription.features) : []
      },
      currentPeriodEnd: subscription.end_date,
      cancelAtPeriodEnd: subscription.cancel_at_period_end === 1
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch subscription',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
