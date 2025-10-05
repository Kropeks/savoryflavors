const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkAdminUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'savoryflavors',
    port: parseInt(process.env.DB_PORT || '3306', 10),
  });

  try {
    // Get all users with admin role
    const [users] = await connection.query("SELECT id, email, name, role, created_at FROM users WHERE role = 'admin'");
    
    console.log('🔍 Admin Users:');
    if (users.length === 0) {
      console.log('No admin users found in the database.');
    } else {
      users.forEach(user => {
        console.log(`\n👤 User: ${user.name || 'No name'} (${user.email})`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Role: ${user.role || 'user'}`);
        console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
      });
    }

    // Check if the role column exists and its values
    try {
      const [roles] = await connection.query("SHOW COLUMNS FROM users LIKE 'role'");
      if (roles.length === 0) {
        console.log('\n❌ The `role` column does not exist in the users table.');
      } else {
        console.log('\n✅ The `role` column exists in the users table.');
        
        // Check distinct role values
        const [roleValues] = await connection.query("SELECT DISTINCT role, COUNT(*) as count FROM users GROUP BY role");
        console.log('\n📊 User roles distribution:');
        roleValues.forEach(r => {
          console.log(`   - ${r.role || '[NULL]'}: ${r.count} users`);
        });
      }
    } catch (err) {
      console.error('Error checking role column:', err.message);
    }

  } catch (error) {
    console.error('Error checking admin users:', error);
  } finally {
    await connection.end();
  }
}

checkAdminUser().catch(console.error);
