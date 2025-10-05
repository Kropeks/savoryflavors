import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userEmail = session.user.email?.toLowerCase();
    const userRole = session.user.role?.toUpperCase();
    const isAdminUser = userRole === 'ADMIN' || userEmail === 'savoryadmin@example.com';
    
    if (!isAdminUser) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { timeRange = '30days' } = await request.json();
    
    // Calculate date range based on timeRange
    let startDate = new Date();
    let interval = 'DAY';
    let dateFormat = '%Y-%m-%d';
    
    let dateSubtractClause = '30 DAY';

    switch (timeRange) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        interval = 'DAY';
        dateFormat = '%Y-%m-%d';
        dateSubtractClause = '7 DAY';
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        interval = 'WEEK';
        dateFormat = '%Y-%U';
        dateSubtractClause = '30 DAY';
        break;
      case '12months':
        startDate.setMonth(startDate.getMonth() - 12);
        interval = 'MONTH';
        dateFormat = '%Y-%m';
        dateSubtractClause = '12 MONTH';
        break;
      default:
        break;
    }

    const safeQuery = async (sql, params = []) => {
      try {
        return await query(sql, params);
      } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
          console.warn(`Skipping query, missing table: ${error.message}`);
          return [];
        }
        if (error.message?.includes('Unknown column')) {
          console.warn(`Skipping query, missing column: ${error.message}`);
          return [];
        }
        if (error.message?.includes('database tables do not exist')) {
          console.warn(`Skipping query, optional table not present: ${error.message}`);
          return [];
        }
        throw error;
      }
    };

    const getCount = async (sql, params = []) => {
      const rows = await safeQuery(sql, params);
      if (!Array.isArray(rows) || rows.length === 0) {
        return 0;
      }
      const first = rows[0];
      return first?.count ?? 0;
    };

    const totalUsers = await getCount('SELECT COUNT(*) as count FROM users');
    const newUsers = await getCount(
      `SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${dateSubtractClause})`
    );

    let activeUsers = await getCount(
      `SELECT COUNT(DISTINCT user_id) as count FROM user_sessions WHERE last_activity >= DATE_SUB(NOW(), INTERVAL ${dateSubtractClause})`
    );

    if (activeUsers === 0) {
      activeUsers = await getCount(
        `SELECT COUNT(*) as count FROM users WHERE last_login >= DATE_SUB(NOW(), INTERVAL ${dateSubtractClause})`
      );
    }

    const totalRecipes = await getCount('SELECT COUNT(*) as count FROM recipes');
    const newRecipes = await getCount(
      `SELECT COUNT(*) as count FROM recipes WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${dateSubtractClause})`
    );

    let trafficStats = {
      avgSessionDuration: '0m',
      bounceRate: '0%'
    };

    const [trafficResult] = await safeQuery(
      `SELECT 
        AVG(session_duration) as avgSessionDuration,
        AVG(bounce_rate) as bounceRate
      FROM analytics_sessions`
    );

    if (trafficResult) {
      trafficStats.avgSessionDuration = trafficResult.avgSessionDuration 
        ? `${Math.round(trafficResult.avgSessionDuration)}m`
        : '0m';
      trafficStats.bounceRate = trafficResult.bounceRate
        ? `${Math.round(trafficResult.bounceRate)}%`
        : '0%';
    }

    const userGrowth = await safeQuery(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month
      ORDER BY month`
    );

    const recipeGrowth = await safeQuery(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM recipes
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month
      ORDER BY month`
    );

    const topRecipes = await safeQuery(
      `SELECT 
        r.id,
        r.title,
        u.name as author,
        r.rating,
        r.total_reviews,
        r.created_at
      FROM recipes r
      LEFT JOIN users u ON r.userId = u.id
      ORDER BY r.rating DESC, r.total_reviews DESC
      LIMIT 5`
    );

    const topUsers = await safeQuery(
      `SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(r.id) as totalRecipes,
        MAX(r.created_at) as lastActivity
      FROM users u
      LEFT JOIN recipes r ON r.userId = u.id
      GROUP BY u.id, u.name, u.email
      ORDER BY totalRecipes DESC, lastActivity DESC
      LIMIT 5`
    );

    const trafficSources = await safeQuery(
      `SELECT 
        source,
        COUNT(*) as visits
      FROM analytics_traffic
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY source
      ORDER BY visits DESC`
    );

    return NextResponse.json({
      totalUsers,
      newUsers,
      activeUsers,
      totalRecipes,
      newRecipes,
      avgSessionDuration: trafficStats.avgSessionDuration,
      bounceRate: trafficStats.bounceRate,
      userGrowth,
      recipeGrowth,
      topRecipes,
      topUsers,
      trafficSources,
    });
  } catch (error) {
    console.error('Error in analytics API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
