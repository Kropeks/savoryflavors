import { auth } from '@/auth.config';
import { query } from './db';

export async function checkUserSubscription(userId) {
  if (!userId) return { isPremium: false };
  
  try {
    const [subscription] = await query(
      `SELECT s.*, sp.name as plan_name 
       FROM subscriptions s
       JOIN subscription_plans sp ON s.plan_id = sp.id
       WHERE s.user_id = ? AND s.status = 'active' 
       AND (s.end_date IS NULL OR s.end_date >= NOW())
       ORDER BY s.end_date DESC
       LIMIT 1`,
      [userId]
    );

    return {
      isPremium: !!subscription,
      subscription: subscription || null,
      planName: subscription?.plan_name || 'Free',
      endsAt: subscription?.end_date || null
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return { isPremium: false, error: error.message };
  }
}

export async function getServerSideSubscription(context) {
  const session = await auth();
  if (!session?.user?.id) return { isPremium: false };
  
  return checkUserSubscription(session.user.id);
}
