const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'savoryflavors',
  port: process.env.DB_PORT || 3306,
};

async function checkSchema() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Check if database exists, create if not
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    console.log(`✅ Database ${dbConfig.database} exists or was created`);
    
    await connection.query(`USE \`${dbConfig.database}\``);
    
    // Required tables and their schemas
    const requiredTables = {
      users: `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role ENUM('user', 'moderator', 'admin') DEFAULT 'user',
          is_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `,
      recipes: `
        CREATE TABLE IF NOT EXISTS recipes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          user_id INT,
          rating DECIMAL(3,2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `,
      subscriptions: `
        CREATE TABLE IF NOT EXISTS subscriptions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          status ENUM('active', 'canceled', 'paused') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `,
      reports: `
        CREATE TABLE IF NOT EXISTS reports (
          id INT AUTO_INCREMENT PRIMARY KEY,
          reported_item_type ENUM('user', 'recipe', 'comment') NOT NULL,
          reported_item_id INT NOT NULL,
          reason TEXT,
          status ENUM('pending', 'reviewed', 'resolved', 'dismissed') DEFAULT 'pending',
          reported_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `,
      audit_logs: `
        CREATE TABLE IF NOT EXISTS audit_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          action VARCHAR(50) NOT NULL,
          entity_type VARCHAR(50) NOT NULL,
          entity_id INT,
          user_id INT,
          old_values JSON,
          new_values JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `
    };

    // Create tables if they don't exist
    for (const [tableName, createTableSQL] of Object.entries(requiredTables)) {
      try {
        await connection.query(createTableSQL);
        console.log(`✅ Table ${tableName} is ready`);
      } catch (error) {
        console.error(`❌ Error creating table ${tableName}:`, error.message);
      }
    }

    // Check if admin user exists
    const [admin] = await connection.query('SELECT * FROM users WHERE role = ?', ['admin']);
    if (admin.length === 0) {
      console.log('⚠️ No admin user found. Creating one...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await connection.query(
        'INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)',
        ['Admin User', 'admin@example.com', hashedPassword, 'admin', true]
      );
      console.log('✅ Admin user created');
      console.log('Email: admin@example.com');
      console.log('Password: Admin@123');
    } else {
      console.log('✅ Admin user exists');
    }

    console.log('\n✅ Database schema is ready');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Make sure your database server is running and the credentials in .env are correct');
    console.error('Required environment variables:');
    console.error('DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT');
  } finally {
    if (connection) await connection.end();
    process.exit();
  }
}

checkSchema();
