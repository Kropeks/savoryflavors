import { query } from '@/lib/db';

// Simple test endpoint to verify API and database connectivity
export async function GET() {
  // Initialize test results
  const results = {
    status: 'success',
    timestamp: new Date().toISOString(),
    database: {
      connection: { success: false, error: null },
      tables: [],
      usersTable: { exists: false, count: 0, sample: [], error: null },
      queryTest: { success: false, error: null, result: null }
    },
    environment: process.env.NODE_ENV
  };

  try {
    // Test 1: Basic database connection
    try {
      const [connectionTest] = await query('SELECT 1 as test_value');
      results.database.connection = {
        success: connectionTest?.test_value === 1,
        error: connectionTest?.test_value === 1 ? null : 'Unexpected test result',
        serverVersion: null
      };

      // Get database version if connection is successful
      if (results.database.connection.success) {
        try {
          const [version] = await query('SELECT VERSION() as version');
          results.database.connection.serverVersion = version?.version || 'Unknown';
        } catch (e) {
          console.warn('Could not get database version:', e.message);
        }
      }
    } catch (dbError) {
      results.database.connection = {
        success: false,
        error: dbError.message,
        code: dbError.code,
        sqlMessage: dbError.sqlMessage
      };
    }

    // Only proceed with other tests if the basic connection works
    if (results.database.connection.success) {
      // Test 2: List all tables
      try {
        const tables = await query('SHOW TABLES');
        results.database.tables = tables.map(t => ({
          name: Object.values(t)[0],
          type: 'table'
        }));
      } catch (tablesError) {
        console.error('Error listing tables:', tablesError);
        results.database.tablesError = tablesError.message;
      }

      // Test 3: Check users table specifically
      try {
        const usersExist = await query("SHOW TABLES LIKE 'users'");
        results.database.usersTable.exists = usersExist.length > 0;
        
        if (results.database.usersTable.exists) {
          // Get sample users
          const users = await query('SELECT id, email, name, role, status, created_at FROM users LIMIT 5');
          results.database.usersTable.count = users.length;
          results.database.usersTable.sample = users;
          
          // Test a more complex query
          try {
            const [userCount] = await query('SELECT COUNT(*) as total FROM users');
            results.database.usersTable.totalCount = userCount?.total || 0;
          } catch (countError) {
            console.warn('Could not get total user count:', countError.message);
          }
        }
      } catch (usersError) {
        results.database.usersTable.error = usersError.message;
        console.error('Error checking users table:', usersError);
      }

      // Test 4: Run a test query with parameters
      try {
        const [testQuery] = await query('SELECT ? as test_param, NOW() as current_time', ['test_value']);
        results.database.queryTest = {
          success: true,
          result: testQuery
        };
      } catch (queryError) {
        results.database.queryTest = {
          success: false,
          error: queryError.message,
          code: queryError.code,
          sql: queryError.sql
        };
      }
    }

    return new Response(JSON.stringify(results, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
    
  } catch (error) {
    console.error('Unexpected error in test endpoint:', error);
    results.status = 'error';
    results.error = {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
    
    return new Response(JSON.stringify(results, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }
}
