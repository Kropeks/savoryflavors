'use client';

import { PricingModalProvider } from '@/context/PricingModalContext';
import PricingFormModal from '@/components/subscription/PricingFormModal';

export default function PricingModalWrapper({ children }) {
  return (
    <PricingModalProvider>
      {children}
      <PricingFormModal />
    </PricingModalProvider>
  );
}
