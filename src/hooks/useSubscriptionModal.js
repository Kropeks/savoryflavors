'use client';

import { useState, useCallback } from 'react';

export function useSubscriptionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerElement, setTriggerElement] = useState(null);

  const onOpen = useCallback((element = null) => {
    setTriggerElement(element);
    setIsOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
    // Re-enable body scroll when modal is closed
    document.body.style.overflow = 'auto';
    
    // If there was a trigger element, return focus to it
    if (triggerElement?.current) {
      triggerElement.current.focus();
    }
  }, [triggerElement]);

  return {
    isOpen,
    onOpen,
    onClose,
    triggerElement
  };
}
