import { query } from './db';
import { getClientIp } from 'request-ip';
import { headers } from 'next/headers';

/**
 * Log an admin action to the audit log
 * @param {Object} options - The audit log options
 * @param {number} options.userId - The ID of the user performing the action
 * @param {string} options.action - The action being performed (e.g., 'create', 'update', 'delete')
 * @param {string} options.entityType - The type of entity being acted upon (e.g., 'user', 'recipe', 'report')
 * @param {number} [options.entityId] - The ID of the entity being acted upon
 * @param {Object} [options.oldValues] - The previous values before the action
 * @param {Object} [options.newValues] - The new values after the action
 * @param {Object} [options.req] - The request object (for getting IP and user agent)
 * @returns {Promise<Object>} The created audit log entry
 */
export const logAction = async ({
  userId,
  action,
  entityType,
  entityId = null,
  oldValues = null,
  newValues = null,
  req = null
}) => {
  try {
    let ipAddress = null;
    let userAgent = null;

    // Try to get IP and user agent from request or headers
    if (req) {
      ipAddress = getClientIp(req);
      userAgent = req.headers['user-agent'];
    } else {
      try {
        const headersList = headers();
        ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip');
        userAgent = headersList.get('user-agent');
      } catch (error) {
        // This will fail in server components, so we'll just ignore it
      }
    }

    const [result] = await query(
      `INSERT INTO audit_logs 
       (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        action,
        entityType,
        entityId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipAddress,
        userAgent
      ]
    );

    return {
      id: result.insertId,
      userId,
      action,
      entityType,
      entityId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Failed to log audit action:', error);
    // Don't throw the error to avoid breaking the main operation
    return null;
  }
};

/**
 * Get paginated audit logs with optional filtering
 * @param {Object} options - The query options
 * @param {number} [options.page=1] - The page number
 * @param {number} [options.limit=20] - The number of items per page
 * @param {number} [options.userId] - Filter by user ID
 * @param {string} [options.action] - Filter by action
 * @param {string} [options.entityType] - Filter by entity type
 * @param {number} [options.entityId] - Filter by entity ID
 * @param {Date} [options.startDate] - Filter by start date
 * @param {Date} [options.endDate] - Filter by end date
 * @returns {Promise<Object>} The paginated audit logs
 */
export const getAuditLogs = async ({
  page = 1,
  limit = 20,
  userId,
  action,
  entityType,
  entityId,
  startDate,
  endDate
} = {}) => {
  try {
    const offset = (page - 1) * limit;
    const whereClauses = [];
    const params = [];

    if (userId) {
      whereClauses.push('al.user_id = ?');
      params.push(userId);
    }

    if (action) {
      whereClauses.push('al.action = ?');
      params.push(action);
    }

    if (entityType) {
      whereClauses.push('al.entity_type = ?');
      params.push(entityType);
    }

    if (entityId) {
      whereClauses.push('al.entity_id = ?');
      params.push(entityId);
    }

    if (startDate) {
      whereClauses.push('al.created_at >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereClauses.push('al.created_at <= ?');
      params.push(endDate);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Get total count
    const [countResult] = await query(
      `SELECT COUNT(*) as total FROM audit_logs al ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Get paginated logs
    const [logs] = await query(
      `SELECT al.*, u.name as user_name, u.email as user_email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Parse JSON fields
    const parsedLogs = logs.map(log => ({
      ...log,
      old_values: log.old_values ? JSON.parse(log.old_values) : null,
      new_values: log.new_values ? JSON.parse(log.new_values) : null
    }));

    return {
      data: parsedLogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1
      }
    };
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    throw error;
  }
};

/**
 * Get a single audit log by ID
 * @param {number} id - The ID of the audit log to retrieve
 * @returns {Promise<Object|null>} The audit log or null if not found
 */
export const getAuditLogById = async (id) => {
  try {
    const [logs] = await query(
      `SELECT al.*, u.name as user_name, u.email as user_email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.id = ?`,
      [id]
    );

    if (logs.length === 0) {
      return null;
    }

    const log = logs[0];
    
    return {
      ...log,
      old_values: log.old_values ? JSON.parse(log.old_values) : null,
      new_values: log.new_values ? JSON.parse(log.new_values) : null
    };
  } catch (error) {
    console.error(`Failed to fetch audit log with ID ${id}:`, error);
    throw error;
  }
};
