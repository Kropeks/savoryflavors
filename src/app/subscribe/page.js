'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import PricingFormModal from '@/components/subscription/PricingFormModal';

export default function SubscribePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [error, setError] = useState('');
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  // Check authentication and subscription status
  useEffect(() => {
    const checkAuth = async () => {
      if (status === 'loading') {
        return;
      }

      if (status === 'unauthenticated') {
        router.push(`/login?callbackUrl=${encodeURIComponent('/subscribe')}`);
        return;
      }

      try {
        // Check for plan in URL params
        const plan = searchParams.get('plan');
        if (plan === 'yearly') {
          setSelectedPlan('yearly');
        }

        // Check if user already has an active subscription
        const res = await fetch('/api/user/subscription');
        const data = await res.json();

        if (data.status === 'active') {
          setHasActiveSubscription(true);
          setInfoMessage('You already have an active subscription. Enjoy all premium benefits!');
          return;
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
        setError('Failed to check subscription status');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, searchParams, status]);

  const handlePlanSelect = (plan) => {
    if (hasActiveSubscription) {
      setInfoMessage('You already have an active subscription. No further action is required.');
      return;
    }

    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handlePaymentSuccess = () => {
    router.push('/subscription/success');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-olive-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading subscription options...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-olive-600 hover:bg-olive-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Choose Your Plan
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300 sm:mt-4">
            Select the plan that works best for you and start cooking smarter with FitSavory Premium
          </p>
          {infoMessage && (
            <div className="mt-6 mx-auto max-w-2xl rounded-md border border-olive-200 bg-olive-50 px-4 py-3 text-sm text-olive-800 dark:border-olive-800/40 dark:bg-olive-900/20 dark:text-olive-200">
              {infoMessage}
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Basic Plan */}
          <div className="relative flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic</h3>
            <p className="mt-4 flex items-baseline text-gray-900 dark:text-white">
              <span className="text-5xl font-extrabold tracking-tight">Free</span>
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">For home cooks who want to explore recipes</p>
            <ul role="list" className="mt-6 space-y-4 flex-1">
              <li className="flex items-start">
                <svg className="h-6 w-6 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Access to basic recipes</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Save up to 10 recipes</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Basic search functionality</span>
              </li>
            </ul>
            <Button
              className="mt-8 w-full justify-center bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
              disabled
            >
              Your Current Plan
            </Button>
          </div>

          {/* Premium Monthly */}
          <div className="relative flex flex-col rounded-2xl border-2 border-olive-500 bg-white dark:bg-gray-800 p-8 shadow-lg">
            <div className="absolute top-0 right-0 -mt-4 mr-6">
              <div className="rounded-full bg-olive-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                Popular
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Premium</h3>
            <p className="mt-4 flex items-baseline text-gray-900 dark:text-white">
              <span className="text-5xl font-extrabold tracking-tight">₱199</span>
              <span className="ml-1 text-xl font-semibold text-gray-500 dark:text-gray-300">/month</span>
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Billed monthly. Cancel anytime.</p>
            <ul role="list" className="mt-6 space-y-4 flex-1">
              <li className="flex items-start">
                <svg className="h-6 w-6 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">All Basic features</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Unlimited recipe saves</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Advanced search filters</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Ad-free experience</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Priority support</span>
              </li>
            </ul>
            <Button
              onClick={() => handlePlanSelect('monthly')}
              className="mt-8 w-full justify-center bg-olive-600 hover:bg-olive-700 text-white"
              disabled={hasActiveSubscription}
            >
              Get Started
            </Button>
          </div>

          {/* Premium Yearly */}
          <div className="relative flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-sm">
            <div className="absolute top-0 right-0 -mt-4 mr-6">
              <div className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                Best Value
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Premium Yearly</h3>
            <p className="mt-4 flex items-baseline text-gray-900 dark:text-white">
              <span className="text-5xl font-extrabold tracking-tight">₱1,990</span>
              <span className="ml-1 text-xl font-semibold text-gray-500 dark:text-gray-300">/year</span>
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Billed annually. Save 17%</p>
            <ul role="list" className="mt-6 space-y-4 flex-1">
              <li className="flex items-start">
                <svg className="h-6 w-6 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">All Premium Monthly features</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">2 months free</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Exclusive content</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Yearly member badge</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Priority customer support</span>
              </li>
            </ul>
            <Button
              onClick={() => handlePlanSelect('yearly')}
              className="mt-8 w-full justify-center bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
              disabled={hasActiveSubscription}
            >
              Get Best Value
            </Button>
          </div>
        </div>

        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Can I cancel my subscription anytime?</h3>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Yes, you can cancel your subscription at any time. Your subscription will remain active until the end of the current billing period.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">What payment methods do you accept?</h3>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                We accept all major credit/debit cards and GCash for payments. All payments are securely processed through PayMongo.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Is my payment information secure?</h3>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Yes, we use PayMongo for secure payment processing. We don't store your payment information on our servers.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Do you offer refunds?</h3>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                We offer a 14-day money-back guarantee. If you're not satisfied, contact our support team for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>

      <PricingFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        planType={selectedPlan}
        onPlanSelect={handlePaymentSuccess}
      />
    </div>
  );
}
