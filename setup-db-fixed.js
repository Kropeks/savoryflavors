const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'savoryflavors',
  port: process.env.DB_PORT || 3306,
  multipleStatements: true
};

async function setupDatabase() {
  let connection;

  try {
    console.log('🍳 Setting up SavoryFlavors database...');

    // Create connection without database first
    const tempConfig = { ...dbConfig };
    delete tempConfig.database;

    connection = await mysql.createConnection(tempConfig);

    // Create database if it doesn't exist
    console.log('📁 Creating database...');
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    console.log('✅ Database created successfully!');

    // Switch to the database
    await connection.execute(`USE \`${dbConfig.database}\``);

    // Read and execute schema
    console.log('📥 Importing database schema...');
    const schemaPath = path.join(__dirname, 'database_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await connection.execute(schema);
    console.log('✅ Database schema imported successfully!');

    // Test the setup
    console.log('🧪 Testing database setup...');
    const [tables] = await connection.execute(
      'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?',
      [dbConfig.database]
    );

    console.log(`📊 Database created with ${tables[0].count} tables`);

    if (tables[0].count > 0) {
      console.log('✅ Database setup completed successfully!');
      console.log('🎉 Ready to use SavoryFlavors!');
    } else {
      throw new Error('No tables were created');
    }

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('🔧 Please check:');
    console.error('   - MySQL is running');
    console.error('   - Database credentials are correct');
    console.error('   - database_schema.sql exists');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
