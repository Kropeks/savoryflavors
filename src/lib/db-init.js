// lib/db-init.js
const { testConnection } = require('./db');

const initializeDatabase = async () => {
  console.log('🔄 Initializing database connection...');

  const isConnected = await testConnection();

  if (!isConnected) {
    console.error('❌ Failed to connect to database');
    console.log('💡 Make sure:');
    console.log('   1. XAMPP Control Panel is running');
    console.log('   2. MySQL service is started');
    console.log('   3. Database "savoryflavors" exists');
    console.log('   4. Check .env file configuration');
    process.exit(1);
  }

  console.log('✅ Database initialization successful!');
  return true;
};

module.exports = { initializeDatabase };
