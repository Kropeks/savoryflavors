'use client';

import { useState } from 'react';
import { X, Loader2, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export default function PricingFormModal({ isOpen, onClose, onPlanSelect, planType = 'monthly' }) {
  const [selectedPlan, setSelectedPlan] = useState(planType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentError, setPaymentError] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpMonth, setCardExpMonth] = useState('');
  const [cardExpYear, setCardExpYear] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const router = useRouter();
  
  const plans = {
    monthly: {
      name: 'Premium Monthly',
      price: '₱199',
      period: 'month',
      features: [
        'Access to FitSavory',
        'Save unlimited favorite recipes',
        'Sell your own recipes',
        'Premium member badge'
      ]
    },
    yearly: {
      name: 'Premium Yearly',
      price: '₱1,990',
      period: 'year',
      savings: 'Save 17%',
      features: [
        'Everything in Premium Monthly',
        '2 months free',
        'Early access to future features',
        'Yearly member badge'
      ]
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    setPaymentError('');
    setPaymentProcessing(true);

    try {
      // Get the plan price based on selection
      const amount = selectedPlan === 'monthly' ? 19900 : 199000; // in centavos
      
      // Create payment intent
      const response = await fetch('/api/payment/paymongo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount / 100, // Convert to PHP
          planId: selectedPlan === 'monthly' ? 'premium_monthly' : 'premium_yearly',
          paymentMethod: paymentMethod,
          billingCycle: selectedPlan === 'monthly' ? 'month' : 'year',
          cardDetails: paymentMethod === 'card' ? {
            cardNumber,
            expMonth: cardExpMonth,
            expYear: cardExpYear,
            cvc: cardCvc,
            billing: {
              name: `${e.target.firstName?.value || ''} ${e.target.lastName?.value || ''}`.trim() || undefined,
              email: e.target.email?.value || undefined,
              phone: e.target.phone?.value || undefined,
              address: {
                country: e.target.country?.value || undefined,
              },
            },
          } : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const friendlyMessage = data.message?.includes('ECONNREFUSED')
          ? 'Payment failed because the database is unavailable. Please start MySQL and try again.'
          : data.message?.includes('testing for PayMongo')
            ? 'PayMongo only accepts the sandbox card numbers listed below during testing. Please use one of them.'
            : data.message;
        throw new Error(friendlyMessage || 'Failed to process payment');
      }

      if (paymentMethod === 'gcash') {
        if (data.requiresAction && data.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
        return;
      }

      if (paymentMethod === 'card') {
        if (!cardNumber || !cardExpMonth || !cardExpYear || !cardCvc) {
          throw new Error('Please provide complete card details.');
        }

        if (data.requiresAction && data.redirectUrl) {
          window.location.href = data.redirectUrl;
          return;
        }
        if (data.success) {
          formElement.reset();
          setCardNumber('');
          setCardExpMonth('');
          setCardExpYear('');
          setCardCvc('');
          setPaymentError('');
          setPaymentSuccess(true);
          setTimeout(() => {
            onPlanSelect?.(selectedPlan);
            onClose();
          }, 2000);
          return;
        }
        throw new Error(data.message || 'Unable to complete card payment.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'Payment failed. Please try again.');
      if (error.message?.includes('database is unavailable')) {
        setPaymentError(
          'We could not reach the database. Please verify MySQL is running on localhost:3306 and refresh before retrying.'
        );
      }
    } finally {
      setPaymentProcessing(false);
    }
  };
  
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setPaymentError('');
    if (method === 'gcash') {
      setCardNumber('');
      setCardExpMonth('');
      setCardExpYear('');
      setCardCvc('');
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full p-0 overflow-hidden md:min-h-[70vh]">
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] md:min-h-[70vh]">
            {/* Left side - Form */}
            <div className="p-6 sm:p-6 md:p-7 overflow-y-auto max-h-[85vh]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Upgrade to Premium
                </DialogTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Unlock all features including FitSavory
                </p>
              </DialogHeader>

              <form onSubmit={handlePayment} className="mt-6 space-y-5">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        placeholder="First Name"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        placeholder="Last Name"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Email Address"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <select
                        id="country"
                        name="country"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Country</option>
                        <option value="PH">Philippines</option>
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="Phone Number"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Payment Method
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-3">
                    <div 
                      className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                        paymentMethod === 'card' 
                          ? 'border-olive-500 bg-olive-50 dark:bg-olive-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => handlePaymentMethodChange('card')}
                    >
                      <input
                        id="credit-card"
                        name="payment-method"
                        type="radio"
                        className="h-4 w-4 text-olive-600 focus:ring-olive-500"
                        checked={paymentMethod === 'card'}
                        onChange={() => {}}
                      />
                      <label htmlFor="credit-card" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Credit/Debit Card
                      </label>
                    </div>
                    
                    <div 
                      className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                        paymentMethod === 'gcash' 
                          ? 'border-olive-500 bg-olive-50 dark:bg-olive-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => handlePaymentMethodChange('gcash')}
                    >
                      <input
                        id="gcash"
                        name="payment-method"
                        type="radio"
                        className="h-4 w-4 text-olive-600 focus:ring-olive-500"
                        checked={paymentMethod === 'gcash'}
                        onChange={() => {}}
                      />
                      <label htmlFor="gcash" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        GCash
                      </label>
                    </div>
                    
                    {paymentMethod === 'card' && (
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Card Number
                            </label>
                            <input
                              id="cardNumber"
                              type="text"
                              inputMode="numeric"
                              autoComplete="cc-number"
                              placeholder="4311 5188 0466 1120"
                              value={cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ').trim()}
                              onChange={(e) => {
                                const rawDigits = e.target.value.replace(/[^0-9]/g, '');
                                setCardNumber(rawDigits.slice(0, 19));
                              }}
                              maxLength={23}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="cardExpMonth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Expiry Month
                              </label>
                              <input
                                id="cardExpMonth"
                                type="text"
                                inputMode="numeric"
                                autoComplete="cc-exp-month"
                                placeholder="MM"
                                maxLength={2}
                                value={cardExpMonth}
                                onChange={(e) => setCardExpMonth(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor="cardExpYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Expiry Year
                              </label>
                              <input
                                id="cardExpYear"
                                type="text"
                                inputMode="numeric"
                                autoComplete="cc-exp-year"
                                placeholder="YY"
                                maxLength={4}
                                value={cardExpYear}
                                onChange={(e) => setCardExpYear(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              CVC
                            </label>
                            <input
                              id="cardCvc"
                              type="text"
                              inputMode="numeric"
                              autoComplete="cc-csc"
                              placeholder="123"
                              maxLength={4}
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, ''))}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                              required
                            />
                          </div>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          <p className="font-medium">Use a PayMongo sandbox test card:</p>
                          <p>Visa 3DS: <code>4311 5188 0466 1120</code> · Exp <code>12/34</code> · CVC <code>123</code></p>
                          <p>Mastercard 3DS: <code>5200 8282 8282 8210</code> · Exp <code>12/34</code> · CVC <code>123</code></p>
                          <p>Visa non-3DS: <code>4000 0025 0000 3155</code> · Exp <code>12/34</code> · CVC <code>123</code></p>
                        </div>
                      </div>
                    )}
                    
                    {paymentMethod === 'gcash' && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-sm text-blue-700 dark:text-blue-300">
                        You'll be redirected to GCash to complete your payment.
                      </div>
                    )}
                  </div>
                  </div>
                </div>

                <div className="pt-4">
                  {paymentError && (
                    <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-md">
                      {paymentError}
                    </div>
                  )}
                  
                  {paymentSuccess ? (
                    <div className="p-4 text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-3">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Payment Successful!</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Your subscription is now active. Redirecting...</p>
                    </div>
                  ) : (
                    <>
                      <Button
                        type="submit"
                        className="w-full justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-olive-600 hover:bg-olive-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-500"
                        disabled={paymentProcessing}
                      >
                        {paymentProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          `Subscribe for ${plans[selectedPlan].price}/${plans[selectedPlan].period}`
                        )}
                      </Button>
                      <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
                        By subscribing, you agree to our Terms of Service and Privacy Policy.
                      </p>
                    </>
                  )}
                </div>
              </form>
            </div>

            {/* Right side - Plan details */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 sm:p-7 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[85vh]">
              <div className="sticky top-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Plan Details</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="monthly"
                        name="billing"
                        type="radio"
                        className="h-4 w-4 text-olive-600 focus:ring-olive-500"
                        checked={selectedPlan === 'monthly'}
                        onChange={() => setSelectedPlan('monthly')}
                      />
                      <label htmlFor="monthly" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Monthly Billing
                      </label>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {plans.monthly.price}<span className="text-gray-500">/month</span>
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <input
                        id="yearly"
                        name="billing"
                        type="radio"
                        className="h-4 w-4 text-olive-600 focus:ring-olive-500 mt-1"
                        checked={selectedPlan === 'yearly'}
                        onChange={() => setSelectedPlan('yearly')}
                      />
                      <div className="ml-3">
                        <label htmlFor="yearly" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Yearly Billing
                        </label>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {plans.yearly.savings} (2 months free)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {plans.yearly.price}<span className="text-gray-500">/year</span>
                      </span>
                      <p className="text-xs text-gray-500">
                        {plans.yearly.price}/year
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {plans[selectedPlan].name} includes:
                  </h4>
                  <ul className="space-y-3">
                    {plans[selectedPlan].features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">7-day money-back guarantee</h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Not satisfied? Get a full refund within 7 days of purchase, no questions asked.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
