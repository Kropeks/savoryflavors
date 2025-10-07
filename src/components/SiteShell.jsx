'use client';

import { usePathname } from 'next/navigation';
import ConditionalHeader from '@/components/ConditionalHeader';
import Footer from '@/components/Footer';

export default function SiteShell({ children }) {
  const pathname = usePathname();
  const hideGlobalChrome = pathname?.startsWith('/admin') || pathname?.startsWith('/auth');
  const hideFooter = hideGlobalChrome || pathname === '/profile';

  return (
    <div className="min-h-screen flex flex-col">
      {!hideGlobalChrome && <ConditionalHeader />}
      <main
        id="main-content"
        className={`flex-grow${hideGlobalChrome ? '' : ' pt-16 md:pt-20'}`}
      >
        {children}
      </main>

      {!hideFooter && <Footer />}
    </div>
  );
}
