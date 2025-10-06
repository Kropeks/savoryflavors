'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SubscriptionPlans from './SubscriptionPlans';

export function PricingModal({ isOpen, onClose, triggerElement = null }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
          <DialogTitle className="text-2xl font-bold text-center">
            Upgrade to Premium
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            Unlock all features and start cooking smarter with FitSavory
          </p>
        </DialogHeader>
        
        <div className="py-4">
          <SubscriptionPlans onSubscriptionSuccess={onClose} />
        </div>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Cancel anytime. No questions asked.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PricingModal;
