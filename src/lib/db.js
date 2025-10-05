import mysql from 'mysql2/promise';

if (!process.env.DB_HOST) {
  throw new Error('DB_HOST is not defined in environment variables');
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const query = async (sql, params = []) => {
  if (typeof window !== 'undefined') {
    throw new Error('Database operations can only be performed on the server side');
  }

  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } finally {
    connection.release();
  }
};

// Test database connection
const testConnection = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('✅ Database connected successfully!');
    console.log(`📊 Connected to database: ${process.env.DB_NAME}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔧 Please check your database configuration:');
    console.error('   - DB_HOST:', dbConfig.host);
    console.error('   - DB_USER:', dbConfig.user);
    console.error('   - DB_NAME:', dbConfig.database);
    console.error('   - DB_PORT:', dbConfig.port);
    return false;
  } finally {
    if (connection) connection.release();
  }
};

// Query helper functions with better error handling
const query = async (sql, params = []) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    console.error('Query error:', error.message);
    console.error('SQL:', sql);
    console.error('Params:', params);

    // Provide more specific error messages for critical connection issues
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Database connection refused. Please check if MySQL is running and accessible.');
    }

    if (error.code === 'ER_BAD_DB_ERROR') {
      throw new Error(`Database '${dbConfig.database}' does not exist. Please create the database first.`);
    }

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      throw new Error('Database access denied. Please check your database credentials.');
    }

    // Re-throw the original error so callers can decide how to handle missing tables/columns
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

// For queries that return a single row
const queryOne = async (sql, params = []) => {
  const rows = await query(sql, params);
  return rows[0] || null;
};

// For transactions with better error handling
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error('Transaction error:', error);
    throw error;
  } finally {
    connection.release();
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🔄 Closing database connection pool...');
  pool.end();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🔄 Closing database connection pool...');
  pool.end();
  process.exit(0);
});

export { pool, query, queryOne, transaction, testConnection };
