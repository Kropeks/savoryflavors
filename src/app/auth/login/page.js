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
  Utensils,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    // Check for success message from signup
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    if (message) {
      setSuccessMessage(message);
      // Clear the URL parameter
      router.replace('/auth/login');
    }

    // Check if user is already logged in
    // Session check removed to prevent dashboard redirection
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        // Get the user's session to check if they're an admin
        const session = await getSession();
        const isAdmin = session?.user?.email?.toLowerCase() === 'savoryadmin@example.com' || 
                       session?.user?.role?.toLowerCase() === 'admin';
        
        // Set success message
        setSuccessMessage(isAdmin ? 'Welcome back, Admin! Redirecting to dashboard...' : 'Welcome back! Redirecting...');
        
        // Redirect based on user role
        setTimeout(() => {
          router.push(isAdmin ? '/admin' : '/');
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Something went wrong. Please try again.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-olive-50 via-white to-olive-100 relative overflow-hidden">
      {/* Top Left Logo and Title */}
      <div className="absolute top-6 left-6 z-20">
        <div className="flex items-center space-x-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-sm border border-white/50">
            <ChefHat className="w-6 h-6 text-olive-600" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-olive-800">SavoryFlavors</h1>
          </div>
        </div>
      </div>

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
                  Welcome Back to{' '}
                  <span className="bg-gradient-to-r from-olive-600 to-olive-700 bg-clip-text text-transparent">
                    SavoryFlavors
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Your culinary journey continues here. Sign in to access your favorite recipes,
                  meal plans, and connect with fellow food enthusiasts.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Continue Your Cooking Adventure</h3>
                <div className="grid gap-3">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <div className="w-2 h-2 bg-olive-500 rounded-full"></div>
                    <span>Access your saved recipes and meal plans</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <div className="w-2 h-2 bg-olive-500 rounded-full"></div>
                    <span>Share your culinary creations with the community</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <div className="w-2 h-2 bg-olive-500 rounded-full"></div>
                    <span>Discover new recipes tailored to your taste</span>
                  </div>
                </div>
              </div>

              {/* Fun Quote */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-olive-200/50">
                <p className="text-lg font-medium text-olive-800 italic">
                  "Cooking is like love. It should be entered into with abandon or not at all."
                </p>
                <p className="text-sm text-olive-600 mt-2">— Harriet Van Horne</p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
              {/* Mobile Header */}
              <div className="lg:hidden text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-olive-600 to-olive-700 rounded-2xl shadow-lg mb-4">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome to{' '}
                  <span className="gradient-text">
                    SavoryFlavors
                  </span>
                </h1>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-field-focus">
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
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="form-field-focus">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500 transition-colors"
                      placeholder="Enter your password"
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

                {successMessage && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-600">{successMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-olive-600 focus:ring-olive-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-olive-600 hover:text-olive-500 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-olive-600 to-olive-700 hover:from-olive-700 hover:to-olive-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] btn-press-effect"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 auth-loading-spinner" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In to Your Account'
                  )}
                </button>
              </form>

              {/* Guest Access Button */}
              <div className="mt-6">
                <button
                  onClick={handleGuestAccess}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-olive-300 rounded-lg shadow-sm text-sm font-medium text-olive-700 bg-white hover:bg-olive-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] btn-press-effect"
                >
                  <Utensils className="w-4 h-4 mr-2" />
                  Continue as Guest
                </button>
              </div>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    href="/auth/signup"
                    className="font-medium text-olive-600 hover:text-olive-500 transition-colors"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>

              {/* Demo Mode Notice */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">Want to explore without signing up?</h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>
                        Click "Continue as Guest" to browse recipes and explore the app without creating an account.
                      </p>
                    </div>
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
