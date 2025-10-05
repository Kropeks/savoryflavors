'server';

import { auth } from '@/auth';
import { query } from '@/lib/db';

export async function checkSubscription() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { 
      status: 'unauthenticated',
      message: 'Not authenticated' 
    };
  }

  try {
    const [subscription] = await query(
      'SELECT status FROM subscriptions WHERE user_id = ? AND status = ?',
      [session.user.id, 'active']
    );

    return {
      status: subscription ? 'active' : 'inactive',
      isActive: !!subscription
    };
  } catch (error) {
    console.error('Subscription check error:', error);
    return { 
      status: 'error',
      message: 'Failed to check subscription status' 
    };
  }
}
