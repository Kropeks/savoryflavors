'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const PricingModalContext = createContext();

export function PricingModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [plan, setPlan] = useState('monthly');

  const openModal = useCallback((selectedPlan = 'monthly') => {
    setPlan(selectedPlan);
    setIsOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    // Re-enable body scroll when modal is closed
    document.body.style.overflow = 'auto';
  }, []);

  const value = useMemo(() => ({
    isOpen,
    plan,
    openModal,
    closeModal,
  }), [isOpen, plan, openModal, closeModal]);

  return (
    <PricingModalContext.Provider value={value}>
      {children}
    </PricingModalContext.Provider>
  );
}

export const usePricingModal = () => {
  const context = useContext(PricingModalContext);
  if (context === undefined) {
    throw new Error('usePricingModal must be used within a PricingModalProvider');
  }
  return context;
};
