import { query } from '@/lib/db';

export async function GET() {
  try {
    // Check if users table exists
    const [tableCheck] = await query(`
      SELECT TABLE_NAME, TABLE_ROWS 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'users'
    `);

    if (!tableCheck) {
      return Response.json({ 
        success: false, 
        error: 'Users table does not exist',
        tables: await query('SHOW TABLES')
      });
    }

    // First, get the table structure
    const tableStructure = await query('DESCRIBE users');
    
    // Build the SELECT query based on actual columns
    const columns = tableStructure.map(col => `u.${col.Field}`).join(', ');
    
    // Get users with the correct columns
    const users = await query(`
      SELECT ${columns} 
      FROM users u
      LIMIT 10
    `);
    
    return Response.json({
      success: true,
      tableExists: true,
      tableStructure,
      userCount: users.length,
      users,
      tableInfo: tableCheck
    });

  } catch (error) {
    console.error('Debug error:', error);
    return Response.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
