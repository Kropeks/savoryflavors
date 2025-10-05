'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Crown, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SubscriptionPlans({ currentPlan = null }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('premium_monthly');
  const [plans, setPlans] = useState([
    {
      id: 'basic',
      name: 'Basic',
      price: 0,
      priceId: 'price_basic',
      billing: 'monthly',
      description: 'Essential features for home cooks',
      features: [
        'Browse all public recipes',
        'Post in community',
        'Create and share recipes',
        'Basic support via email'
      ],
      isCurrent: currentPlan?.name === 'Basic'
    },
    {
      id: 'premium_monthly',
      name: 'Premium',
      price: 199,
      priceId: 'price_premium_monthly',
      billing: 'monthly',
      description: 'Unlock all features including recipe monetization',
      features: [
        'All Basic features',
        'Access to FitSavory',
        'Save unlimited favorite recipes',
        'Sell your own recipes',
        'Priority 24/7 support',
        'Ad-free experience'
      ],
      isPopular: true,
      isCurrent: currentPlan?.name === 'Premium' && currentPlan?.billing_cycle === 'monthly'
    },
    {
      id: 'premium_yearly',
      name: 'Premium',
      price: 1990,
      priceId: 'price_premium_yearly',
      billing: 'yearly',
      description: 'Best value - Get 2 months free',
      features: [
        'All Premium Monthly features',
        'Save ₱398 vs monthly',
        'Priority customer support',
        'Early access to new features',
        'Exclusive content',
        'Yearly member badge'
      ],
      isCurrent: currentPlan?.name === 'Premium' && currentPlan?.billing_cycle === 'yearly',
      savePercent: 17
    }
  ]);

  const handleSubscribe = async (planId) => {
    if (status !== 'authenticated') {
      router.push(`/auth/login?callbackUrl=/pricing`);
      return;
    }

    setLoading(true);
    try {
      const plan = plans.find(p => p.id === planId);
      
      // For free plan, just update the user's subscription in the database
      if (planId === 'basic') {
        const response = await fetch('/api/user/subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId: 'basic',
            planName: 'Basic',
            price: 0,
            billingCycle: 'monthly'
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to update subscription');
        }

        toast.success('Subscription updated to Basic plan');
        router.refresh();
        return;
      }

      // For premium plans, redirect to payment
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          price: plan.price,
          billingCycle: plan.billing,
          userId: session.user.id
        })
      });

      const { url } = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to process subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <Card 
          key={plan.id}
          className={`relative transition-all hover:shadow-lg ${
            plan.isPopular ? 'border-2 border-primary' : ''
          }`}
        >
          {plan.isPopular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
              MOST POPULAR
            </div>
          )}
          
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  {plan.name}
                  {plan.name === 'Premium' && <Crown className="h-5 w-5 text-amber-500" />}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </div>
              {plan.isCurrent && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Current Plan
                </span>
              )}
            </div>
            
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-medium">₱</span>
                <span className="text-4xl font-bold">
                  {plan.price.toLocaleString('en-PH')}
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  /{plan.billing === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              {plan.billing === 'yearly' && (
                <p className="text-sm text-muted-foreground">
                  Only ₱{(plan.price / 12).toFixed(2)}/month
                  {plan.savePercent && (
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      Save {plan.savePercent}%
                    </span>
                  )}
                </p>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <ul className="space-y-3">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading || plan.isCurrent}
              className={`w-full ${plan.isPopular ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700' : ''}`}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : plan.isCurrent ? (
                'Current Plan'
              ) : plan.price === 0 ? (
                'Select Free Plan'
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Get {plan.name} {plan.billing === 'yearly' ? 'Yearly' : ''}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
