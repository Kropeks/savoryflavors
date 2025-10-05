'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChefHat,
  Mail,
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);

    // Check for success message from signup
    const message = searchParams.get('message');
    if (message) {
      setSuccess(true);
      // Clear the URL parameter
      router.replace('/auth/forgot-password');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // For demo purposes, we'll simulate a successful password reset
      // In a real app, you'd make an API call to send the reset email
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-olive-50 via-white to-olive-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-olive-600" />
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-olive-50 via-white to-olive-100 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 animate-bounce opacity-20">
            <div className="w-12 h-12 bg-olive-300 rounded-full"></div>
          </div>
          <div className="absolute top-40 right-20 animate-pulse opacity-20">
            <div className="w-16 h-16 bg-olive-400 rounded-full"></div>
          </div>
          <div className="absolute bottom-40 left-20 animate-bounce opacity-15" style={{ animationDelay: '1s' }}>
            <div className="w-10 h-10 bg-olive-500 rounded-full"></div>
          </div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h1>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>.
                Click the link in the email to reset your password.
              </p>
              <div className="space-y-3">
                <Link
                  href="/auth/login"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-olive-600 to-olive-700 hover:from-olive-700 hover:to-olive-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-500 transition-all duration-200"
                >
                  Back to Login
                </Link>
                <button
                  onClick={() => setSuccess(false)}
                  className="w-full text-sm text-olive-600 hover:text-olive-500 font-medium transition-colors"
                >
                  Try a different email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-olive-50 via-white to-olive-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating ingredients */}
        <div className="absolute top-20 left-10 animate-bounce opacity-20">
          <div className="w-12 h-12 bg-olive-300 rounded-full"></div>
        </div>
        <div className="absolute top-40 right-20 animate-pulse opacity-20">
          <div className="w-16 h-16 bg-olive-400 rounded-full"></div>
        </div>
        <div className="absolute bottom-40 left-20 animate-bounce opacity-15" style={{ animationDelay: '1s' }}>
          <div className="w-10 h-10 bg-olive-500 rounded-full"></div>
        </div>
        <div className="absolute bottom-20 right-10 animate-pulse opacity-20" style={{ animationDelay: '2s' }}>
          <div className="w-8 h-8 bg-olive-600 rounded-full"></div>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-olive-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-olive-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <div className="mb-8">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-olive-600 hover:text-olive-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-olive-600 to-olive-700 rounded-2xl shadow-lg mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Your Password?</h1>
              <p className="text-gray-600">
                No worries! Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500 transition-colors"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-olive-600 to-olive-700 hover:from-olive-700 hover:to-olive-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-olive-600 hover:text-olive-500 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs text-blue-600 font-bold">i</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Need Help?</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      If you don't receive the email within a few minutes, check your spam folder
                      or contact support for assistance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
