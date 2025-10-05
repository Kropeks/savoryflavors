/**
 * Authentication utility functions
 * This file helps manage authentication state when auth is disabled
 */

export const isAuthDisabled = process.env.DISABLE_AUTH === 'true';

/**
 * Get a mock session when auth is disabled
 */
export const getMockSession = () => ({
  user: {
    name: 'Demo User',
    email: 'demo@example.com',
    image: '/images/default-avatar.png',
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
});

/**
 * Wrapper for useSession that returns mock data when auth is disabled
 */
export const useMockableSession = (useSessionHook) => {
  if (isAuthDisabled) {
    return { data: getMockSession(), status: 'authenticated' };
  }
  return useSessionHook();
};

/**
 * Wrapper for getServerSession that returns mock data when auth is disabled
 */
export const getMockableServerSession = async (getServerSessionFn, ...args) => {
  if (isAuthDisabled) {
    return getMockSession();
  }
  return getServerSessionFn(...args);
};
