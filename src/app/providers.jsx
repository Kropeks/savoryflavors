'use client';

import { useEffect, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AuthProvider } from '@/components/AuthProvider';
import { FavoritesProvider } from '@/context/FavoritesContext';

// This component ensures that we only render the theme provider on the client side
export function ThemeProvider({ children, ...props }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}

export function Providers({ children, session: initialSession }) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <SessionProvider session={initialSession}>
        <div className="min-h-screen bg-white dark:bg-gray-900" suppressHydrationWarning />
      </SessionProvider>
    );
  }

  return (
    <SessionProvider session={initialSession}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        storageKey="savoryflavors-theme"
      >
        <AuthProvider>
          <FavoritesProvider>
            {children}
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
