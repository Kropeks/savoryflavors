import { query } from './db';

/**
 * Log an action to the audit log
 * @param {Object} options - The options object
 * @param {number|string} options.userId - The ID of the user performing the action
 * @param {string} options.action - The action being performed (e.g., 'create', 'update', 'delete')
 * @param {string} options.entityType - The type of entity being acted upon (e.g., 'user', 'recipe')
 * @param {number|string} options.entityId - The ID of the entity being acted upon
 * @param {Object} [options.oldValues] - The old values of the entity (for updates)
 * @param {Object} [options.newValues] - The new values of the entity (for updates/creates)
 * @param {string} [options.notes] - Additional notes about the action
 * @param {Object} [request] - The request object (optional, for logging IP and user agent)
 * @returns {Promise<void>}
 */
export async function logAction({
  userId,
  action,
  entityType,
  entityId,
  oldValues,
  newValues,
  notes,
  request,
}) {
  try {
    // Get IP and user agent from request if available
    let ipAddress = '';
    let userAgent = '';
    
    if (request) {
      // Get IP address from request headers (handles proxy/load balancer)
      ipAddress = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') ||
                 request.connection?.remoteAddress ||
                 '';
      
      // Get user agent
      userAgent = request.headers.get('user-agent') || '';
    }

    // Insert the audit log
    await query(
      `INSERT INTO audit_logs 
       (user_id, action, entity_type, entity_id, old_values, new_values, notes, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        action,
        entityType,
        entityId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        notes || null,
        ipAddress || null,
        userAgent || null,
      ]
    );
  } catch (error) {
    // Don't throw errors in audit logging as it shouldn't break the main functionality
    console.error('Error logging action to audit log:', error);
  }
}

/**
 * Get paginated audit logs with filtering options
 * @param {Object} options - The options object
 * @param {number} [options.page=1] - The page number
 * @param {number} [options.limit=50] - The number of items per page
 * @param {string} [options.action] - Filter by action
 * @param {string} [options.entityType] - Filter by entity type
 * @param {number|string} [options.userId] - Filter by user ID
 * @param {string} [options.startDate] - Filter by start date (YYYY-MM-DD)
 * @param {string} [options.endDate] - Filter by end date (YYYY-MM-DD)
 * @returns {Promise<Object>} - The paginated audit logs and metadata
 */
export async function getAuditLogs({
  page = 1,
  limit = 50,
  action,
  entityType,
  userId,
  startDate,
  endDate,
} = {}) {
  try {
    const offset = (page - 1) * limit;
    
    // Build the WHERE clause
    const whereClauses = [];
    const params = [];

    if (action) {
      whereClauses.push('a.action = ?');
      params.push(action);
    }

    if (entityType) {
      whereClauses.push('a.entity_type = ?');
      params.push(entityType);
    }

    if (userId) {
      whereClauses.push('a.user_id = ?');
      params.push(userId);
    }

    if (startDate) {
      whereClauses.push('a.created_at >= ?');
      params.push(`${startDate} 00:00:00`);
    }

    if (endDate) {
      whereClauses.push('a.created_at <= ?');
      params.push(`${endDate} 23:59:59`);
    }

    const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Get paginated audit logs
    const logs = await query(
      `SELECT 
        a.*, 
        u.name as user_name, 
        u.email as user_email,
        u.role as user_role
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Get total count for pagination
    const [total] = await queryOne(
      `SELECT COUNT(*) as count 
       FROM audit_logs a
       ${whereClause}`,
      params
    );

    // Parse the log values
    const parsedLogs = logs.map(log => ({
      ...log,
      old_values: log.old_values ? JSON.parse(log.old_values) : null,
      new_values: log.new_values ? JSON.parse(log.new_values) : null,
    }));

    return {
      data: parsedLogs,
      pagination: {
        total: total.count,
        page,
        limit,
        totalPages: Math.ceil(total.count / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
}

/**
 * Get available filter options for audit logs
 * @returns {Promise<Object>} - The available filter options
 */
export async function getAuditLogFilters() {
  try {
    const [actions] = await queryOne(
      'SELECT GROUP_CONCAT(DISTINCT action) as actions FROM audit_logs'
    );
    
    const [entityTypes] = await queryOne(
      'SELECT GROUP_CONCAT(DISTINCT entity_type) as entity_types FROM audit_logs'
    );

    // Get date range
    const [dateRange] = await queryOne(
      'SELECT MIN(created_at) as min_date, MAX(created_at) as max_date FROM audit_logs'
    );

    return {
      actions: actions.actions ? actions.actions.split(',') : [],
      entityTypes: entityTypes.entity_types ? entityTypes.entity_types.split(',').filter(Boolean) : [],
      dateRange: {
        min: dateRange.min_date,
        max: dateRange.max_date,
      },
    };
  } catch (error) {
    console.error('Error fetching audit log filters:', error);
    return {
      actions: [],
      entityTypes: [],
      dateRange: { min: null, max: null },
    };
  }
}
