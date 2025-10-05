'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function SubscriptionSuccess() {
  const router = useRouter();

  // Redirect to dashboard after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Thank you for subscribing to FitSavory Premium. Your subscription is now active.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-6 text-sm text-blue-700 dark:text-blue-300">
          <p>You'll be redirected to your dashboard shortly.</p>
        </div>
        <Button
          onClick={() => router.push('/dashboard')}
          className="w-full justify-center bg-olive-600 hover:bg-olive-700 text-white"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
