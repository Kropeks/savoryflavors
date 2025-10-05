'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DebugSession() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Session Debug Information</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Session Status</h2>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
            <pre className="text-sm text-gray-800 dark:text-gray-200">
              Status: {status}
            </pre>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Session Data</h2>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md overflow-x-auto">
            <pre className="text-sm text-gray-800 dark:text-gray-200">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Debug Information</h2>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
            <pre className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
              <div>Role: {session?.user?.role || 'No role found'}</div>
              <div>Is Admin: {session?.user?.role === 'admin' ? 'Yes' : 'No'}</div>
              <div>User ID: {session?.user?.id || 'No user ID'}</div>
              <div>Email: {session?.user?.email || 'No email'}</div>
            </pre>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-800 dark:text-white"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
