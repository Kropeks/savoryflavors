'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import HomeContent from './HomeContent';

// Development-only sign out helper
const useDevSignOut = () => {
  const searchParams = useSearchParams();
  const { status } = useSession();
  
  useEffect(() => {
    // Only run in development and if there's a session
    if (process.env.NODE_ENV === 'development' && 
        searchParams.get('signout') && 
        status === 'authenticated') {
      signOut({ callbackUrl: window.location.pathname });
    }
  }, [searchParams, status]);
};

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Handle development signout
  if (process.env.NODE_ENV === 'development') {
    useDevSignOut();
  }

  // Handle redirections based on auth status and role
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      // Redirect authenticated users to the home page
      router.push('/');
    }
  }, [status, router, session]);

  // Show loading state
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Render the main content
  return <HomeContent />;
}
