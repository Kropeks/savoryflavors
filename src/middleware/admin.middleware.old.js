import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const requireAdmin = async (req, res, next) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if user is admin
  if (session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }

  return next();
};

export const requireModerator = async (req, res, next) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if user is moderator or admin
  if (!['moderator', 'admin'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Forbidden - Moderator access required' });
  }

  return next();
};
