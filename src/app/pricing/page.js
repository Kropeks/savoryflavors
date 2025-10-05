import { auth } from '@/auth';
import { query } from '@/lib/db';
import SubscriptionPlans from '@/components/subscription/SubscriptionPlans';

export default async function PricingPage() {
  const session = await auth();
  
  let currentPlan = null;
  
  if (session?.user?.id) {
    // Get user's current subscription
    const [subscription] = await query(
      `SELECT sp.name, sp.billing_cycle, s.status, s.end_date 
       FROM subscriptions s
       JOIN subscription_plans sp ON s.plan_id = sp.id
       WHERE s.user_id = ? AND s.status = 'active'
       ORDER BY s.end_date DESC
       LIMIT 1`,
      [session.user.id]
    );
    
    if (subscription) {
      currentPlan = {
        name: subscription.name,
        billing_cycle: subscription.billing_cycle,
        status: subscription.status,
        current_period_end: subscription.end_date
      };
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan for your cooking journey. Cancel or upgrade anytime.
        </p>
      </div>
      
      <SubscriptionPlans currentPlan={currentPlan} />
      
      <div className="mt-16 text-center text-muted-foreground text-sm">
        <p>Need help choosing a plan? <a href="/contact" className="text-primary hover:underline">Contact our support team</a></p>
        <p className="mt-2">All prices are in USD. Taxes may apply.</p>
      </div>
    </div>
  );
}
