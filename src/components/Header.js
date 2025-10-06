'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon, Menu, X, ChefHat, LogIn, ChevronRight, ArrowRight, MessageCircle, Gamepad2, Utensils, User, ChevronDown, ShieldCheck, Crown } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

// Dynamically import the MemoryGame component with no SSR
const MemoryGame = dynamic(() => import('./games/MemoryGame'), {
  ssr: false,
});

export default function Header() {
  // Hooks must be called unconditionally at the top level
  const { data: session, status, update } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMemoryGame, setShowMemoryGame] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameMode, setGameMode] = useState(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const userMenuRef = useRef(null);
  const router = useRouter();
  const userEmail = session?.user?.email?.toLowerCase();
  const userRole = session?.user?.role?.toLowerCase();
  const isAdminUser = userRole === 'admin' || userEmail === 'savoryadmin@example.com';
  const isPremiumUser = userRole === 'premium';

  // Require authentication function
  const requireAuth = (feature) => {
    const confirmLogin = confirm(`Please sign in to ${feature}. Do you want to log in now?`);
    if (confirmLogin) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  };

  // Handle session state
  useEffect(() => {
    const checkSession = async () => {
      if (status === 'loading') return;
      
      setIsLoading(true);
      try {
        if (status === 'unauthenticated') {
          // Try to refresh the session if not authenticated
          const result = await update();
          if (result?.error) {
            console.error('Session refresh failed:', result.error);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [status, update]);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle click outside for user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle FitSavory click
  const handleFitSavoryClick = (e) => {
    e.preventDefault();
    if (status === 'authenticated') {
      if (isPremiumUser) {
        router.push('/fitsavory');
      } else {
        setShowPricingModal(true);
      }
    } else {
      requireAuth('access FitSavory features');
    }
  };

  // Close mobile menu
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await nextAuthSignOut({ callbackUrl: '/auth/login' });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading state only during initial load
  if (!mounted || (isLoading && !session)) {
    return (
      <>
        <header className="fixed top-0 left-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="container flex h-20 items-center justify-between">
            <div className="animate-pulse h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="animate-pulse h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </header>
      </>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-sm">
      <div className="container flex h-20 items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 absolute left-4">
          <Link 
            href="/" 
            className="relative inline-flex items-center justify-center overflow-hidden font-medium transition-all rounded-lg group py-2 px-4 h-11 no-underline hover:no-underline" 
            onClick={closeMobileMenu}
          >
            <ChefHat className="h-6 w-6 text-green-600 dark:group-hover:text-white group-hover:text-white transition-colors duration-300 z-10" />
            <span className="text-2xl md:text-[1.75rem] font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent dark:group-hover:text-white group-hover:text-green-700 dark:group-hover:from-white dark:group-hover:to-white group-hover:from-green-700 group-hover:to-green-600 transition-all duration-300 z-10 ml-2">
              SavoryFlavors
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-0 transition-all duration-500 ease-out transform rounded-full bg-green-600 dark:group-hover:bg-green-600 group-hover:bg-green-100 group-hover:w-48 group-hover:h-48 group-hover:-ml-2 group-hover:translate-x-full group-hover:translate-y-full"></span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center justify-center flex-1 space-x-2">
          {[
            { href: "/", label: "Home" },
            { href: "/recipes", label: "Recipes" },
            { href: "/cuisines", label: "Cuisines" },
            { 
              href: "/fitsavory", 
              label: "FitSavory", 
              isSpecial: true, 
              requiresAuth: true,
              onClick: handleFitSavoryClick
            },
            { href: "/favorites", label: "Favorites" },
            { href: "/community", label: "Community" }
          ].map((item) => (
            <div key={item.href}>
              {item.requiresAuth ? (
                <button
                  onClick={(e) => {
                    if (item.onClick) {
                      item.onClick(e);
                    } else if (status === 'authenticated') {
                      window.location.href = item.href;
                    } else {
                      requireAuth('access this feature');
                    }
                  }}
                  className={`
                    relative inline-flex items-center justify-center overflow-hidden font-medium transition-all rounded-lg group py-2 px-4 h-11
                    text-[0.95rem] leading-snug mx-0.5
                    ${item.isSpecial
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-green-400/30'
                      : 'bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400'}
                  `}
                >
                  <span className={`absolute bottom-0 left-0 w-0 h-0 transition-all duration-500 ease-out transform rounded-full ${item.isSpecial ? 'bg-emerald-600' : 'bg-green-600'} group-hover:w-48 group-hover:h-48 group-hover:-ml-2 group-hover:translate-x-full group-hover:translate-y-full`}></span>
                  <span className={`relative w-full text-left transition-colors duration-300 ease-in-out font-[500] ${
                    item.isSpecial
                      ? 'group-hover:text-white'
                      : 'group-hover:text-gray-900 dark:group-hover:text-white'
                  }`}>
                    {item.label}
                  </span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`
                    relative inline-flex items-center justify-center overflow-hidden font-medium transition-all rounded-lg group py-2 px-4 h-11
                    text-[0.95rem] leading-snug mx-0.5
                    ${item.isSpecial
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-green-400/30'
                      : 'bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400'}
                  `}
                >
                  <span className={`absolute bottom-0 left-0 w-0 h-0 transition-all duration-500 ease-out transform rounded-full ${item.isSpecial ? 'bg-emerald-600' : 'bg-green-600'} group-hover:w-48 group-hover:h-48 group-hover:-ml-2 group-hover:translate-x-full group-hover:translate-y-full`}></span>
                  <span className={`relative w-full text-left transition-colors duration-300 ease-in-out font-[500] ${
                    item.isSpecial
                      ? 'group-hover:text-white'
                      : 'group-hover:text-gray-900 dark:group-hover:text-white'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2 absolute right-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-accent"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )
            ) : (
              <div className="h-5 w-5" />
            )}
          </button>

          {/* Game Controller Button */}
          <button
            className="p-2 rounded-md hover:bg-accent relative group"
            aria-label="Play Memory Game"
            onClick={() => setShowMemoryGame(true)}
          >
            <Gamepad2 className="h-5 w-5 text-gray-700 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
          </button>
          
          {/* Memory Game Modal */}
          {showMemoryGame && (
            <MemoryGame onClose={() => setShowMemoryGame(false)} canRecord={status === 'authenticated'} />
          )}

          {/* Messages Button */}
          {status === 'authenticated' && (
            <button
              className="p-2 rounded-md hover:bg-accent relative group"
              aria-label="View messages"
            >
              <MessageCircle className="h-5 w-5 text-gray-700 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                3
              </span>
            </button>
          )}

          {/* Subscribe Button */}
          <Link
            href="/subscribe"
            className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-md bg-olive-600 hover:bg-olive-700 text-white text-sm font-medium transition-colors"
          >
            <Crown className="w-4 h-4" />
            Subscribe
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="p-2 rounded-full md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            )}
          </button>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-2">
            {isLoading ? (
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            ) : status === 'authenticated' ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  {session?.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt="Profile" 
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                      {session?.user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${userMenuOpen ? 'transform rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div 
                    className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    {isAdminUser && (
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        setUserMenuOpen(false);
                        try {
                          await nextAuthSignOut({ 
                            redirect: true,
                            callbackUrl: '/auth/login' 
                          });
                          // Force a full page reload to ensure all session data is cleared
                          router.refresh();
                        } catch (error) {
                          console.error('Error during sign out:', error);
                          window.location.href = '/auth/login';
                        }
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <LogIn className="w-4 h-4 mr-1" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={closeMobileMenu}
      >
        <div
          className={`fixed right-0 top-0 h-full w-4/5 max-w-sm bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                  <ChefHat className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-2xl md:text-[1.75rem] font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                  SavoryFlavors
                </span>
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/recipes", label: "Recipes" },
                { href: "/cuisines", label: "Cuisines" },
                { 
                  href: "/fitsavory", 
                  label: "FitSavory", 
                  isSpecial: true, 
                  requiresAuth: true,
                  onClick: (e) => {
                    e.preventDefault();
                    closeMobileMenu();
                    if (status === 'authenticated') {
                      if (isPremiumUser) {
                        router.push('/fitsavory');
                      } else {
                        setShowPricingModal(true);
                      }
                    } else {
                      requireAuth('access FitSavory features');
                    }
                  }
                },
                { href: "/favorites", label: "Favorites" },
                { href: "/community", label: "Community" }
              ].map((item) => (
                <div key={item.href}>
                  {item.requiresAuth ? (
                    <button
                      onClick={(e) => {
                        if (item.onClick) {
                          item.onClick(e);
                        } else if (status === 'authenticated') {
                          window.location.href = item.href;
                          closeMobileMenu();
                        } else {
                          requireAuth('access this feature');
                          closeMobileMenu();
                        }
                      }}
                      className={`
                        relative inline-flex items-center justify-start overflow-hidden font-medium transition-all rounded-lg group py-3 px-5 my-1.5 h-14
                        text-base leading-snug
                        ${item.isSpecial
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                          : 'bg-gray-100/80 dark:bg-gray-800/30 text-gray-700 dark:text-gray-200 hover:text-white dark:hover:text-white'}
                      `}
                    >
                      <span className={`absolute bottom-0 left-0 w-48 h-48 -ml-2 transition-all duration-500 ease-out transform translate-x-full translate-y-full rounded-full ${item.isSpecial ? 'bg-emerald-600' : 'bg-green-600'} group-hover:-translate-y-12 group-hover:translate-x-12`}></span>
                      <span className="relative w-full text-left transition-colors duration-300 ease-in-out group-hover:text-white">
                        {item.label}
                      </span>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`
                        relative inline-flex items-center justify-start overflow-hidden font-medium transition-all rounded-lg group py-3 px-5 my-1.5 h-14
                        text-base leading-snug
                        ${item.isSpecial
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                          : 'bg-gray-100/80 dark:bg-gray-800/30 text-gray-700 dark:text-gray-200 hover:text-white dark:hover:text-white'}
                      `}
                    >
                      <span className={`absolute bottom-0 left-0 w-48 h-48 -ml-2 transition-all duration-500 ease-out transform translate-x-full translate-y-full rounded-full ${item.isSpecial ? 'bg-emerald-600' : 'bg-green-600'} group-hover:-translate-y-12 group-hover:translate-x-12`}></span>
                      <span className="relative w-full text-left transition-colors duration-300 ease-in-out group-hover:text-white">
                        {item.label}
                      </span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            <div className="pt-6 mt-auto border-t border-gray-200 dark:border-gray-800">
              {session ? (
                <button
                  onClick={handleSignOut}
                  className="w-full py-3 px-4 text-center text-base font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    window.location.href = '/';
                    closeMobileMenu();
                  }}
                  className="w-full py-3 px-4 text-center text-base font-semibold text-white bg-olive-600 hover:bg-olive-700 rounded-lg transition-colors"
                >
                  <Utensils className="w-4 h-4 inline mr-2" />
                  Continue as Guest
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="pricing-modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500/75 transition-opacity" 
              aria-hidden="true" 
              onClick={() => setShowPricingModal(false)}
            ></div>
            
            <div className="inline-block w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all sm:my-8 sm:w-full">
              <div className="relative">
                <button
                  type="button"
                  className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowPricingModal(false)}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </button>
                
                <div className="p-6 sm:p-8">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      Choose Your Plan
                    </h2>
                    <p className="mt-3 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                      Unlock all features and start cooking smarter with FitSavory. Select the plan that works best for you.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Basic Plan */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Basic</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">Essential features for home cooks</p>
                        <div className="flex items-baseline mb-6">
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">₱0</span>
                          <span className="ml-1 text-gray-500 dark:text-gray-400">/month</span>
                        </div>
                        <ul className="space-y-3 mb-6">
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-800 dark:text-gray-200">Browse all public recipes</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-800 dark:text-gray-200">Post in community</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-800 dark:text-gray-200">Create and share recipes</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-800 dark:text-gray-200">Basic support via email</span>
                          </li>
                        </ul>
                      </div>
                      <button
                        onClick={() => {
                          setShowPricingModal(false);
                          router.push('/fitsavory?trial=true');
                        }}
                        className="w-full mt-auto py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Start Free
                      </button>
                    </div>
                    
                    {/* Premium Monthly */}
                    <div className="rounded-xl border-2 border-olive-600 bg-olive-100/80 dark:bg-gray-800 p-6 flex flex-col h-full transform scale-105 relative">
                      <div className="absolute top-0 right-0 bg-olive-700 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                        POPULAR
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Premium</h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">Unlock all features including recipe monetization</p>
                        <div className="flex items-baseline mb-6">
                          <span className="text-3xl font-bold text-gray-800 dark:text-white">₱199</span>
                          <span className="ml-1 text-gray-700 dark:text-gray-300">/month</span>
                        </div>
                        <ul className="space-y-3 mb-6">
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-800 dark:text-gray-200">All Basic features</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-800 dark:text-gray-200">Access to FitSavory</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-800 dark:text-gray-200">Save unlimited favorite recipes</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-800 dark:text-gray-200">Sell your own recipes</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-800 dark:text-gray-200">Priority 24/7 support</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-800 dark:text-gray-200">Ad-free experience</span>
                          </li>
                        </ul>
                      </div>
                      <button
                        onClick={() => {
                          setShowPricingModal(false);
                          router.push('/subscribe?plan=premium_monthly');
                        }}
                        className="w-full mt-auto py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-olive-600 hover:bg-olive-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-500"
                      >
                        Get Started
                      </button>
                    </div>
                    
                    {/* Premium Yearly */}
                    <div className="rounded-xl border-2 border-amber-500 bg-amber-50 dark:bg-amber-900/20 p-6 flex flex-col h-full">
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Premium Yearly</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">Best value - Get 2 months free</p>
                          </div>
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-800/30 dark:text-amber-200">
                            BEST VALUE
                          </span>
                        </div>
                        <div className="flex items-baseline mb-6">
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">₱1,990</span>
                          <span className="ml-1 text-gray-600 dark:text-gray-400">/year</span>
                        </div>
                        <div className="mb-4">
                          <span className="inline-block px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-100 rounded-full dark:bg-amber-900/30 dark:text-amber-200">
                            Save 17% (₱398)
                          </span>
                          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            Only ₱166/month
                          </p>
                        </div>
                        <ul className="space-y-3 mb-6">
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-800 dark:text-gray-200">All Premium Monthly features</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-800 dark:text-gray-200">Save ₱398 vs monthly</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-800 dark:text-gray-200">Priority customer support</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-800 dark:text-gray-200">Early access to new features</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-800 dark:text-gray-200">Exclusive content</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-800 dark:text-gray-200">Yearly member badge</span>
                          </li>
                        </ul>
                      </div>
                      <button
                        onClick={() => {
                          setShowPricingModal(false);
                          router.push('/subscribe?plan=premium_yearly');
                        }}
                        className="w-full mt-auto py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        Get Best Value
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>Cancel anytime. No questions asked. 30-day money-back guarantee.</p>
                    <p className="mt-2">Need help deciding? <a href="#" className="text-olive-600 hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-300 font-medium">Contact our support team</a></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}