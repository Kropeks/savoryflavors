'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export default function SubscriptionSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentIntentId = useMemo(() => searchParams.get('payment_intent_id'), [searchParams]);

  const [status, setStatus] = useState(paymentIntentId ? 'loading' : 'success');
  const [message, setMessage] = useState(
    paymentIntentId
      ? 'Confirming your payment with PayMongo. Please wait...'
      : 'Thank you for subscribing to FitSavory Premium. Your subscription is now active.'
  );

  useEffect(() => {
    let timer;

    if (status === 'success') {
      timer = setTimeout(() => {
        router.push('/');
      }, 5000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [router, status]);

  useEffect(() => {
    if (!paymentIntentId) return;

    let isMounted = true;

    const verifyPayment = async () => {
      setStatus('loading');
      try {
        const response = await fetch(`/api/payment/paymongo/verify?paymentIntentId=${encodeURIComponent(paymentIntentId)}`, {
          cache: 'no-store',
        });
        const data = await response.json();

        if (!isMounted) return;

        if (!response.ok || !data.success) {
          setStatus('error');
          setMessage(
            data?.message ||
              'We received your payment confirmation but could not activate your subscription automatically. Please contact support.'
          );
          return;
        }

        setStatus('success');
        setMessage('Payment confirmed! Your subscription is active. Redirecting you to the homepage...');
      } catch (error) {
        if (!isMounted) return;
        console.error('PayMongo verification error:', error);
        setStatus('error');
        setMessage('Something went wrong while verifying your payment. Please contact support.');
      }
    };

    verifyPayment();

    return () => {
      isMounted = false;
    };
  }, [paymentIntentId]);

  const renderIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-300 animate-spin" />
          </div>
        );
      case 'error':
        return (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-300" />
          </div>
        );
      default:
        return (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        {renderIcon()}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {status === 'error' ? 'We hit a snag' : status === 'loading' ? 'Hold tight...' : 'Payment Successful!'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>

        {status === 'error' ? (
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/pricing')}
              className="w-full justify-center bg-olive-600 hover:bg-olive-700 text-white"
            >
              Return to Pricing
            </Button>
            <Button
              onClick={() => router.push('/support')}
              variant="outline"
              className="w-full justify-center border-olive-600 text-olive-600 hover:bg-olive-50 dark:hover:bg-olive-900/20"
            >
              Contact Support
            </Button>
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-6 text-sm text-blue-700 dark:text-blue-300">
            <p>{status === 'loading' ? 'Please keep this tab open while we confirm your payment...' : "You'll be redirected to the homepage shortly."}</p>
          </div>
        )}

        {status !== 'error' && (
          <Button
            onClick={() => router.push('/')}
            className="w-full justify-center bg-olive-600 hover:bg-olive-700 text-white"
            disabled={status === 'loading'}
          >
            Go to Home
          </Button>
        )}
      </div>
    </div>
  );
}
