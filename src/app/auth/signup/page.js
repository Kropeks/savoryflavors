'use client';

import React, { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChefHat,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Utensils,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Check if user is already logged in
    // Session check removed to prevent dashboard redirection
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      // Create user account via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      // Account created successfully
      setCurrentStep(2);
      setTimeout(() => {
        router.push('/auth/login?message=Account created successfully! Please sign in.');
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);

      // Provide user-friendly error messages
      if (error.message.includes('Database connection')) {
        setError('Database connection error. Please check your database configuration.');
      } else if (error.message.includes('already exists')) {
        setError('An account with this email already exists. Please use a different email or sign in instead.');
      } else if (error.message.includes('Failed to create account')) {
        setError('Failed to create account. Please check your information and try again.');
      } else {
        setError(error.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    // Redirect to home page as guest
    router.push('/');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-olive-50 via-white to-olive-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-olive-600" />
      </div>
    );
  }

  // Success step
  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-olive-50 via-white to-olive-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Created!</h1>
            <p className="text-gray-600 mb-6">
              Welcome to SavoryFlavors! Your account has been created successfully.
              Redirecting you to login...
            </p>
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-olive-600" />
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
          <Utensils className="w-12 h-12 text-olive-400" />
        </div>
        <div className="absolute top-40 right-20 animate-pulse opacity-20">
          <ChefHat className="w-16 h-16 text-olive-500" />
        </div>
        <div className="absolute bottom-40 left-20 animate-bounce opacity-15" style={{ animationDelay: '1s' }}>
          <Sparkles className="w-10 h-10 text-olive-600" />
        </div>
        <div className="absolute bottom-20 right-10 animate-pulse opacity-20" style={{ animationDelay: '2s' }}>
          <div className="w-8 h-8 bg-olive-300 rounded-full"></div>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-olive-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-olive-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Welcome Content */}
          <div className="hidden lg:block">
            <div className="text-center lg:text-left space-y-8">
              {/* Logo and Title */}
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-olive-600 to-olive-700 rounded-2xl shadow-lg">
                  <ChefHat className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                  Join the{' '}
                  <span className="bg-gradient-to-r from-olive-600 to-olive-700 bg-clip-text text-transparent">
                    Culinary Community
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Start your cooking journey with SavoryFlavors. Create your account and unlock
                  a world of delicious recipes, meal planning tools, and fellow food enthusiasts.
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Why Join SavoryFlavors?</h3>
                <div className="grid gap-3">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <div className="w-2 h-2 bg-olive-500 rounded-full"></div>
                    <span>Save and organize your favorite recipes</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <div className="w-2 h-2 bg-olive-500 rounded-full"></div>
                    <span>Create personalized meal plans</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <div className="w-2 h-2 bg-olive-500 rounded-full"></div>
                    <span>Share your culinary creations</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <div className="w-2 h-2 bg-olive-500 rounded-full"></div>
                    <span>Connect with food lovers worldwide</span>
                  </div>
                </div>
              </div>

              {/* Fun Quote */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-olive-200/50">
                <p className="text-lg font-medium text-olive-800 italic">
                  "The discovery of a new dish does more for the happiness of the human race than the discovery of a star."
                </p>
                <p className="text-sm text-olive-600 mt-2">— Jean Anthelme Brillat-Savarin</p>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
              {/* Mobile Header */}
              <div className="lg:hidden text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-olive-600 to-olive-700 rounded-2xl shadow-lg mb-4">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Join SavoryFlavors
                </h1>
              </div>

              {/* Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500 transition-colors"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

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
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500 transition-colors"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500 transition-colors"
                      placeholder="Create a password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500 transition-colors"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="h-4 w-4 text-olive-600 focus:ring-olive-500 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the{' '}
                    <Link href="/terms" className="text-olive-600 hover:text-olive-500 font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-olive-600 hover:text-olive-500 font-medium">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-olive-600 to-olive-700 hover:from-olive-700 hover:to-olive-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Your Account'
                  )}
                </button>
              </form>

              {/* Guest Access Notice */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Utensils className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Want to explore first?</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        You can browse recipes and explore the app as a guest without creating an account.
                      </p>
                    </div>
                    <div className="mt-3">
                      <button
                        onClick={handleGuestAccess}
                        className="text-sm font-medium text-blue-800 hover:text-blue-900"
                      >
                        Continue as Guest →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="font-medium text-olive-600 hover:text-olive-500 transition-colors"
                  >
                    Sign in instead
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
