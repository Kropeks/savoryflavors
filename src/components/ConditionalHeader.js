'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';

export default function ConditionalHeader() {
  const pathname = usePathname();

  // Don't show header on auth or admin pages
  if (pathname?.startsWith('/auth') || pathname?.startsWith('/admin')) {
    return null;
  }

  return <Header />;
}
