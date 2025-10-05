'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { pool, query } from '@/lib/db';

// Get admin dashboard statistics
export async function getAdminStats() {
  const session = await auth();
  
  const userEmail = session?.user?.email?.toLowerCase();
  const userRole = session?.user?.role?.toUpperCase(); // Match DB case
  const isAdminUser = userRole === 'ADMIN' || userEmail === 'savoryadmin@example.com';
  
  if (!isAdminUser) {
    console.log('Admin action unauthorized:', { userEmail, userRole });
    throw new Error('Unauthorized');
  }

  try {
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

        throw error;
      }
    };

    const getCount = async (sql, params = []) => {
      const rows = await safeQuery(sql, params);
      if (!rows?.length) {
        return 0;
      }

      const first = rows[0];
      return first?.count ?? 0;
    };

    const totalUsers = await getCount('SELECT COUNT(*) as count FROM users');
    const newUsers = await getCount(
      'SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );

    const totalRecipes = await getCount('SELECT COUNT(*) as count FROM recipes');
    const newRecipes = await getCount(
      'SELECT COUNT(*) as count FROM recipes WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );

    const pendingReviews = await getCount(
      'SELECT COUNT(*) as count FROM reviews WHERE status = ?',
      ['pending']
    );

    let monthlyActiveUsers = await getCount(
      'SELECT COUNT(DISTINCT user_id) as count FROM user_sessions WHERE last_activity >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );

    if (monthlyActiveUsers === 0) {
      monthlyActiveUsers = await getCount(
        'SELECT COUNT(*) as count FROM users WHERE last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
      );
    }

    return {
      totalUsers,
      newUsers,
      totalRecipes,
      newRecipes,
      pendingReviews,
      monthlyActiveUsers,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    // Return fallback values in case of error
    return {
      totalUsers: 0,
      totalRecipes: 0,
      pendingReviews: 0,
      monthlyActiveUsers: 0,
    };
  }
}

// Get all users with pagination and filtering
// Update user status (active/suspended)
export async function updateUserStatus(userId, status) {
  const session = await auth();
  
  const userEmail = session?.user?.email?.toLowerCase();
  const userRole = session?.user?.role?.toUpperCase(); // Match DB case
  const isAdminUser = userRole === 'ADMIN' || userEmail === 'savoryadmin@example.com';
  
  if (!isAdminUser) {
    console.log('Admin action unauthorized:', { userEmail, userRole });
    throw new Error('Unauthorized');
  }

  try {
    // Prevent deactivating yourself
    if (session.user.id === userId) {
      throw new Error('You cannot modify your own status');
    }

    // Prevent modifying other admins unless you're the main admin
    if (userEmail !== 'savoryadmin@example.com') {
      const [targetUser] = await query('SELECT role FROM users WHERE id = ?', [userId]);
      if (targetUser?.role === 'ADMIN') {
        throw new Error('Only the main admin can modify other admins');
      }
    }

    // Update user status using is_verified field
    const isVerified = status === 'active' ? 1 : 0;
    await query(
      'UPDATE users SET is_verified = ?, updated_at = NOW(3) WHERE id = ?',
      [isVerified, userId]
    );

    // Try to log the action (admin_audit_log table might not exist)
    try {
      await query(
        'INSERT INTO admin_audit_log (admin_id, action, target_id, details) VALUES (?, ?, ?, ?)',
        [
          session.user.id,
          'UPDATE_USER_STATUS',
          userId,
          JSON.stringify({ status, is_verified: isVerified })
        ]
      );
    } catch (logError) {
      console.warn('Failed to log admin action (table might not exist):', logError);
    }

    revalidatePath('/admin/users');
    return { 
      success: true, 
      message: `User marked as ${status} successfully`,
      data: { is_verified: isVerified }
    };
  } catch (error) {
    console.error('Error updating user status:', error);
    throw new Error(error.message || 'Failed to update user status');
  }
}

export async function getUsers({ page = 1, limit = 10, search = '', status = 'all' }) {
  console.log('=== Starting getUsers function ===');
  console.log('Parameters:', { page, limit, search, status });
  
  try {
    const session = await auth();
    console.log('Session data:', {
      hasSession: !!session,
      user: session?.user ? {
        email: session.user.email,
        role: session.user.role,
        id: session.user.id
      } : 'No user in session'
    });
    
    if (!session?.user) {
      console.error('No user session found');
      throw new Error('Authentication required');
    }
    
    const userEmail = session.user.email?.toLowerCase();
    const userRole = session.user.role?.toUpperCase();
    const isAdminUser = userRole === 'ADMIN' || userEmail === 'savoryadmin@example.com';
    
    console.log('Admin check:', { userEmail, userRole, isAdminUser });
    
    if (!isAdminUser) {
      console.error('Admin action unauthorized:', { userEmail, userRole });
      throw new Error('Unauthorized: Admin privileges required');
    }

    const offset = (page - 1) * limit;
    const params = [];
    
    console.log('Building query with pagination:', { page, limit, offset, status });
    
    // Base query - updated to match database schema
    let queryStr = `
      SELECT 
        u.id, 
        u.email, 
        u.name,
        u.name as displayName,
        u.role,
        CASE 
          WHEN u.is_verified = 1 THEN 'active'
          ELSE 'pending'
        END as status,
        u.created_at as createdAt,
        u.updated_at as updatedAt,
        u.is_verified,
        (SELECT COUNT(*) FROM recipes r WHERE r.user_id = u.id) as recipeCount
      FROM users u
      WHERE 1=1
    `;

    // Add search filter
    if (search) {
      queryStr += ' AND (u.email LIKE ? OR u.name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
      console.log('Added search filter:', { search, searchTerm });
    }
    
    // Add status filter
    if (status === 'active') {
      queryStr += ' AND u.is_verified = 1';
      console.log('Filtering for active users');
    } else if (status === 'pending') {
      queryStr += ' AND (u.is_verified = 0 OR u.is_verified IS NULL)';
      console.log('Filtering for pending users');
    }

    // Add order and limit
    queryStr += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    console.log('Final query with pagination:', { limit, offset });

    // Get users
    console.log('Executing users query:', queryStr, params);
    const users = await query(queryStr, params);
    console.log('Retrieved users:', users.length);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users u WHERE 1=1';
    const countParams = [];
    
    if (search) {
      countQuery += ' AND (u.email LIKE ? OR u.name LIKE ? OR u.username LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (status !== 'all') {
      countQuery += ' AND u.status = ?';
      countParams.push(status);
    }

    console.log('Executing count query:', countQuery, countParams);
    const [countResult] = await query(countQuery, countParams);
    const total = countResult?.total || 0;

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error in getUsers:', error);
    return {
      users: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0
      }
    };
  }
}

// Get all recipes with filtering
export async function getRecipes({ page = 1, limit = 10, status = 'all', search = '' }) {
  const session = await auth();

  const userEmail = session?.user?.email?.toLowerCase();
  const userRole = session?.user?.role?.toLowerCase();
  const isAdminUser = userRole === 'admin' || userEmail === 'savoryadmin@example.com';

  if (!isAdminUser) {
    console.log('Admin action unauthorized:', { userEmail, userRole });
    throw new Error('Unauthorized');
  }

  try {
    const offset = (page - 1) * limit;
    const params = [];

    const normalizedStatus = status?.toLowerCase();

    let queryStr = `
      SELECT
        r.id,
        r.slug,
        r.title,
        r.description,
        r.image,
        r.prep_time AS prepTime,
        r.cook_time AS cookTime,
        r.servings,
        r.difficulty,
        r.cuisine,
        r.status AS publicationStatus,
        r.approval_status AS moderationStatus,
        r.is_public AS isPublic,
        r.submitted_at AS submittedAt,
        r.created_at AS createdAt,
        r.updated_at AS updatedAt,
        u.id AS userId,
        u.name AS authorName,
        u.email AS authorEmail,
        NULL AS authorUsername,
        (SELECT COUNT(*) FROM reviews rev WHERE rev.recipe_id = r.id) AS reviewCount,
        (SELECT AVG(rating) FROM reviews rev WHERE rev.recipe_id = r.id) AS averageRating
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1 = 1
    `;

    if (normalizedStatus && normalizedStatus !== 'all') {
      if (['pending', 'approved', 'rejected'].includes(normalizedStatus)) {
        queryStr += ' AND r.approval_status = ?';
        params.push(normalizedStatus);
      } else if (['draft', 'published', 'archived'].includes(normalizedStatus)) {
        queryStr += ' AND r.status = ?';
        params.push(normalizedStatus.toUpperCase());
      }
    }

    if (search) {
      const searchTerm = `%${search}%`;
      queryStr += ' AND (r.title LIKE ? OR r.description LIKE ?)';
      params.push(searchTerm, searchTerm);
    }

    queryStr += ' ORDER BY r.submitted_at DESC, r.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const recipes = await query(queryStr, params);

    let countQuery = 'SELECT COUNT(*) AS total FROM recipes r WHERE 1 = 1';
    const countParams = [];

    if (normalizedStatus && normalizedStatus !== 'all') {
      if (['pending', 'approved', 'rejected'].includes(normalizedStatus)) {
        countQuery += ' AND r.approval_status = ?';
        countParams.push(normalizedStatus);
      } else if (['draft', 'published', 'archived'].includes(normalizedStatus)) {
        countQuery += ' AND r.status = ?';
        countParams.push(normalizedStatus.toUpperCase());
      }
    }

    if (search) {
      const searchTerm = `%${search}%`;
      countQuery += ' AND (r.title LIKE ? OR r.description LIKE ?)';
      countParams.push(searchTerm, searchTerm);
    }

    const [countResult] = await query(countQuery, countParams);
    const total = countResult?.total || 0;

    const normalizedRecipes = recipes.map((recipe) => {
      const authorUsername = recipe.authorUsername || (recipe.authorEmail ? recipe.authorEmail.split('@')[0] : null);

      return {
        id: recipe.slug || recipe.id,
        databaseId: recipe.id,
        slug: recipe.slug,
        title: recipe.title,
        description: recipe.description,
        image: recipe.image,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        cuisine: recipe.cuisine,
        status: recipe.moderationStatus ?? 'pending',
        moderationStatus: recipe.moderationStatus ?? 'pending',
        publicationStatus: recipe.publicationStatus,
        isPublic: recipe.isPublic === 1,
        submittedAt: recipe.submittedAt,
        createdAt: recipe.createdAt,
        updatedAt: recipe.updatedAt,
        reviewCount: recipe.reviewCount ?? 0,
        averageRating: recipe.averageRating ?? null,
        dietaryInfo: [],
        allergens: [],
        author: {
          id: recipe.userId,
          name: recipe.authorName || 'Unknown author',
          email: recipe.authorEmail || null,
          username: authorUsername,
        },
      };
    });

    return {
      recipes: normalizedRecipes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return { recipes: [], pagination: { total: 0, page, limit, totalPages: 0 } };
  }
}

// Update recipe status (approved/rejected)
export async function updateRecipeStatus(recipeId, status, feedback = '') {
  const session = await auth();
  
  const userEmail = session?.user?.email?.toLowerCase();
  const userRole = session?.user?.role?.toLowerCase();
  const isAdminUser = userRole === 'admin' || userEmail === 'savoryadmin@example.com';
  
  if (!isAdminUser) {
    console.log('Admin action unauthorized:', { userEmail, userRole });
    throw new Error('Unauthorized');
  }

  let connection;
  try {
    // Get database connection
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get recipe details
    const [recipeRows] = await connection.query(
      `SELECT id, slug, user_id as userId, approval_status as currentStatus
       FROM recipes
       WHERE id = ? OR slug = ?
       LIMIT 1 FOR UPDATE`,
      [recipeId, recipeId]
    );

    const recipe = recipeRows?.[0];

    if (!recipe) {
      throw new Error('Recipe not found');
    }

    // Prevent duplicate status updates
    if (recipe.currentStatus?.toLowerCase() === status.toLowerCase()) {
      throw new Error(`Recipe is already ${status}`);
    }

    // Update recipe status
    await connection.query(
      'UPDATE recipes SET approval_status = ?, updated_at = NOW(3) WHERE id = ?',
      [status.toLowerCase(), recipe.id]
    );

    // Add status history
    await connection.query(
      'INSERT INTO recipe_status_history (recipe_id, status, changed_by, notes) VALUES (?, ?, ?, ?)',
      [recipe.id, status.toLowerCase(), session.user.id, feedback || `Status changed to ${status}`]
    );

    // Log the action to audit_logs table
    try {
      await query(
        `INSERT INTO audit_logs 
        (user_id, action, entity_type, entity_id, new_values, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          session.user.id,
          'UPDATE_RECIPE_STATUS',
          'recipe',
          recipeId,
          JSON.stringify({ status, feedback: feedback || `Recipe ${status}` }),
          null, // ip_address
          null  // user_agent
        ]
      );
    } catch (logError) {
      console.warn('Failed to log recipe status update:', logError);
      // Continue execution even if logging fails
    }

    await connection.commit();
    revalidatePath('/admin/recipes');
    return { success: true, message: `Recipe ${status} successfully` };
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error updating recipe status:', error);
    throw new Error(error.message || 'Failed to update recipe status');
  } finally {
    if (connection) connection.release();
  }
}

// Get subscription data
export async function getSubscriptions({ page = 1, limit = 10, status = 'active' }) {
  const session = await auth();
  
  const userEmail = session?.user?.email?.toLowerCase();
  const userRole = session?.user?.role?.toLowerCase();
  const isAdminUser = userRole === 'admin' || userEmail === 'savoryadmin@example.com';
  
  if (!isAdminUser) {
    console.log('Admin action unauthorized:', { userEmail, userRole });
    throw new Error('Unauthorized');
  }

  // TODO: Implement actual subscription data fetching
  return [];
}

// Update subscription status
export async function updateSubscription(subscriptionId, data) {
  const session = await auth();
  
  const userEmail = session?.user?.email?.toLowerCase();
  const userRole = session?.user?.role?.toLowerCase();
  const isAdminUser = userRole === 'admin' || userEmail === 'savoryadmin@example.com';
  
  if (!isAdminUser) {
    console.log('Admin action unauthorized:', { userEmail, userRole });
    throw new Error('Unauthorized');
  }

  // TODO: Implement actual subscription update
  revalidatePath('/admin/subscriptions');
  return { success: true };
}

// Get reports
export async function getReports({ page = 1, limit = 10, type = 'all', status = 'open' }) {
  const session = await auth();
  
  const userEmail = session?.user?.email?.toLowerCase();
  const userRole = session?.user?.role?.toLowerCase();
  const isAdminUser = userRole === 'admin' || userEmail === 'savoryadmin@example.com';
  
  if (!isAdminUser) {
    console.log('Admin action unauthorized:', { userEmail, userRole });
    throw new Error('Unauthorized');
  }

  try {
    const offset = (page - 1) * limit;
    let queryStr = 'SELECT * FROM reports WHERE 1=1';
    const params = [];
    
    if (type !== 'all') {
      queryStr += ' AND report_type = ?';
      params.push(type);
    }
    
    if (status !== 'all') {
      queryStr += ' AND status = ?';
      params.push(status);
    }
    
    queryStr += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const reports = await query(queryStr, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM reports WHERE 1=1';
    const countParams = [];
    
    if (type !== 'all') {
      countQuery += ' AND report_type = ?';
      countParams.push(type);
    }
    
    if (status !== 'all') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    const [countResult] = await query(countQuery, countParams);
    const total = countResult?.total || 0;
    
    return {
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching reports:', error);
    return {
      reports: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0
      }
    };
  }
}
// Update report status
export async function updateReportStatus(reportId, status) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const userEmail = session.user.email.toLowerCase();
  const userRole = session.user.role?.toUpperCase();
  const isAdminUser = userRole === 'ADMIN' || userEmail === 'savoryadmin@example.com';
  
  if (!isAdminUser) {
    throw new Error('Forbidden');
  }

  try {
    await query(
      'UPDATE reports SET status = ?, updated_at = NOW(3) WHERE id = ?',
      [status, reportId]
    );

    revalidatePath('/admin/reports');
    return { success: true };
  } catch (error) {
    console.error('Error updating report status:', error);
    throw new Error('Failed to update report status');
  }
}

export async function importRecipe(recipeData) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const userEmail = session.user.email.toLowerCase();
  const userRole = session.user.role?.toUpperCase();
  const isAdminUser = userRole === 'ADMIN' || userEmail === 'savoryadmin@example.com';
  
  if (!isAdminUser) {
    throw new Error('Forbidden');
  }

  try {
    const response = await fetch('/api/admin/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipeData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to import recipe');
    }

    revalidatePath('/admin/recipes');
    return data;
  } catch (error) {
    console.error('Error importing recipe:', error);
    throw new Error(error.message || 'Failed to import recipe');
  }
}
