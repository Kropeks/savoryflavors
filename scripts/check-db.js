const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Loading environment variables...');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'savoryflavors',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  connectTimeout: 10000,
};

// Log the configuration (without password)
console.log('🔧 Database Configuration:');
console.log(`   - Host: ${dbConfig.host}:${dbConfig.port}`);
console.log(`   - User: ${dbConfig.user}`);
console.log(`   - Database: ${dbConfig.database}`);
console.log('---');

async function checkDatabase() {
  let connection;
  try {
    // Test connection
    console.log('🔌 Attempting to connect to the database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Successfully connected to the database!');
    console.log(`📊 Database: ${dbConfig.database}`);
    console.log(`🌐 Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log('---');

    // Get database version
    const [version] = await connection.query('SELECT VERSION() as version');
    console.log(`🔍 MySQL Version: ${version[0].version}`);
    console.log('---');

    // Get list of tables
    console.log('📋 Database Tables:');
    try {
      const [tables] = await connection.query('SHOW TABLES');
      if (tables.length === 0) {
        console.log('   No tables found in the database.');
      } else {
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log(`   Found ${tableNames.length} tables:`);
        console.log('   ' + tableNames.join(', '));
      }
    } catch (err) {
      console.warn('⚠️ Could not list tables:', err.message);
    }
    console.log('---');

    // Check users table
    try {
      const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
      console.log(`👥 Total Users: ${users[0].count}`);
      
      // Check user roles
      try {
        const [roles] = await connection.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
        console.log('   Users by role:');
        if (roles.length === 0) {
          console.log('   No users found.');
        } else {
          roles.forEach(role => {
            console.log(`   - ${role.role || 'user'}: ${role.count} users`);
          });
        }
      } catch (err) {
        console.warn('   Could not get user roles, the role column might not exist yet.');
      }
      
      // Check admin users
      try {
        const [admins] = await connection.query(
          "SELECT id, email, name, created_at, role FROM users WHERE role = 'admin' OR role = 'admin'"
        );
        console.log(`👑 Admin Users: ${admins.length}`);
        if (admins.length > 0) {
          console.log('   Admin Accounts:');
          admins.forEach(admin => {
            console.log(`   - ${admin.email} (${admin.name || 'No name'})`);
            console.log(`     ID: ${admin.id}, Role: ${admin.role || 'user'}, Created: ${new Date(admin.created_at).toLocaleString()}`);
          });
        }
      } catch (err) {
        console.warn('   Could not query admin users:', err.message);
      }
    } catch (err) {
      console.warn('⚠️ Could not query users table. It might not exist yet.');
    }
    console.log('---');

    // Check database size and table status
    try {
      const [dbSize] = await connection.query(`
        SELECT 
          table_schema as 'Database', 
          ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as 'Size (MB)',
          COUNT(*) as 'Table Count'
        FROM information_schema.TABLES 
        WHERE table_schema = ?
        GROUP BY table_schema
      `, [dbConfig.database]);
      
      if (dbSize[0]) {
        console.log(`💾 Database Size: ${dbSize[0]['Size (MB)']} MB`);
        console.log(`📊 Table Count: ${dbSize[0]['Table Count']}`);
      }

      // Show largest tables
      console.log('\n📈 Largest Tables:');
      const [tables] = await connection.query(`
        SELECT 
          table_name,
          ROUND(((data_length + index_length) / 1024 / 1024), 2) as 'Size (MB)',
          table_rows as 'Row Count'
        FROM information_schema.TABLES 
        WHERE table_schema = ?
        ORDER BY (data_length + index_length) DESC
        LIMIT 5
      `, [dbConfig.database]);
      
      tables.forEach(table => {
        console.log(`   - ${table.table_name}: ${table['Size (MB)']} MB, ${table['Row Count']} rows`);
      });
    } catch (err) {
      console.warn('⚠️ Could not get database statistics:', err.message);
    }

  } catch (error) {
    console.error('\n❌ Database connection failed:', error.message);
    console.error('\n🔧 Please check your database configuration:');
    console.error(`   - DB_HOST: ${dbConfig.host}`);
    console.error(`   - DB_USER: ${dbConfig.user}`);
    console.error(`   - DB_NAME: ${dbConfig.database}`);
    console.error(`   - DB_PORT: ${dbConfig.port}`);
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Make sure MySQL server is running');
    console.error('   2. Verify your database credentials in .env.local');
    console.error('   3. Check if the database exists and is accessible');
    console.error('   4. Verify network connectivity to the database host');
    process.exit(1);
  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('\n🔌 Database connection closed.');
      } catch (err) {
        console.warn('⚠️ Error closing database connection:', err.message);
      }
    }
  }
}

// Run the check
console.log('🚀 Starting database check...\n');
checkDatabase()
  .then(() => console.log('\n✅ Database check completed successfully!'))
  .catch(err => {
    console.error('\n❌ Database check failed:', err);
    process.exit(1);
  });
