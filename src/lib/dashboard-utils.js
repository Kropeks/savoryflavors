/**
 * Dashboard Utility Functions
 * 
 * This file contains helper functions to fetch and transform data for the admin dashboard.
 */

/**
 * Fetches user statistics
 */
export async function getUserStats() {
  const [userStats] = await query(`
    SELECT 
      COUNT(*) as total_users,
      SUM(role = 'user') as regular_users,
      SUM(role = 'moderator') as moderators,
      SUM(role = 'admin') as admins,
      SUM(is_verified = 1) as verified_users,
      COUNT(DISTINCT DATE(created_at)) as days_since_first_user
    FROM users
  `);

  // Get active users (users with activity in the last 30 days)
  const [activeUsers] = await query(`
    SELECT COUNT(DISTINCT user_id) as count
    FROM user_sessions
    WHERE last_activity >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  `);

  return {
    ...userStats,
    active_users: activeUsers?.count || 0
  };
}

/**
 * Fetches recipe statistics
 */
export async function getRecipeStats() {
  const [recipeStats] = await query(`
    SELECT 
      COUNT(*) as total_recipes,
      COALESCE(AVG(rating), 0) as avg_rating,
      COUNT(DISTINCT user_id) as recipe_authors,
      COUNT(*) / NULLIF(COUNT(DISTINCT user_id), 0) as avg_recipes_per_user
    FROM recipes
  `);

  // Get recent recipe counts for trend analysis
  const [currentPeriod] = await query(`
    SELECT COUNT(*) as count 
    FROM recipes 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  `);

  const [previousPeriod] = await query(`
    SELECT COUNT(*) as count 
    FROM recipes 
    WHERE created_at BETWEEN DATE_SUB(NOW(), INTERVAL 60 DAY) AND DATE_SUB(NOW(), INTERVAL 30 DAY)
  `);

  return {
    ...recipeStats,
    recent_count: currentPeriod?.count || 0,
    previous_period_count: previousPeriod?.count || 0
  };
}

/**
 * Fetches subscription statistics
 */
export async function getSubscriptionStats() {
  const [stats] = await query(`
    SELECT 
      COUNT(*) as total_subscriptions,
      SUM(status = 'active') as active_subscriptions,
      SUM(status = 'canceled') as canceled_subscriptions,
      SUM(status = 'paused') as paused_subscriptions,
      SUM(CASE WHEN status = 'active' THEN amount ELSE 0 END) as mrr
    FROM subscriptions
  `);

  return stats || {};
}

/**
 * Fetches report statistics
 */
export async function getReportStats() {
  const [stats] = await query(`
    SELECT 
      COUNT(*) as total_reports,
      SUM(status = 'pending') as pending_reports,
      SUM(status = 'reviewed') as reviewed_reports,
      SUM(status = 'resolved') as resolved_reports
    FROM reports
  `);

  return stats || {};
}

/**
 * Fetches recent activity
 */
export async function getRecentActivity(limit = 10) {
  const [activities] = await query(
    `
    SELECT 
      a.id,
      a.action,
      a.entity_type,
      a.entity_id,
      a.created_at,
      u.id as user_id,
      u.name as user_name,
      u.email as user_email
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT ?
  `,
    [limit]
  );

  return activities || [];
}

/**
 * Fetches activity data for charts
 */
export async function getActivityData(days = 7) {
  const [data] = await query(
    `
    SELECT 
      DATE(created_at) as activity_date,
      COUNT(*) as activity_count
    FROM audit_logs
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY DATE(created_at)
    ORDER BY activity_date ASC
  `,
    [days]
  );

  return data || [];
}

/**
 * Fetches pending actions count
 */
export async function getPendingActionsCount() {
  const [result] = await query(`
    SELECT 
      (SELECT COUNT(*) FROM reports WHERE status = 'pending') as pending_reports,
      (SELECT COUNT(*) FROM moderation_queue WHERE status = 'pending') as pending_moderation
  `);

  return {
    total: (result?.pending_reports || 0) + (result?.pending_moderation || 0),
    ...result
  };
}

/**
 * Calculates storage usage
 */
export async function getStorageStats() {
  // This is a placeholder - replace with actual storage calculation logic
  // For example, if you're using S3, you might use the AWS SDK to get bucket stats
  return {
    total: 1024 * 1024 * 1024 * 10, // 10GB
    used: 1024 * 1024 * 1024 * 3.5, // 3.5GB
    free: 1024 * 1024 * 1024 * 6.5 // 6.5GB
  };
}
