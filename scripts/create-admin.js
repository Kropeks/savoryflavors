const bcrypt = require('bcryptjs');
const { query } = require('../src/lib/db');

async function createAdmin() {
  const email = 'savoryadmin@example.com'; // Change this to your desired admin email
  const password = 'adminsavory123'; // Change this to a strong password
  const name = 'Admin User'; // Change this to the admin's name
  
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert the admin user
    const result = await query(
      `INSERT INTO users (name, email, password, role, is_verified) 
       VALUES (?, ?, ?, 'admin', TRUE)
       ON DUPLICATE KEY UPDATE 
         name = VALUES(name),
         password = VALUES(password),
         role = 'admin',
         is_verified = TRUE`,
      [name, email, hashedPassword]
    );
    
    console.log('Admin account created/updated successfully!');
    console.log(`Email: ${email}`);
    console.log('Role: admin');
  } catch (error) {
    console.error('Error creating admin account:', error);
  } finally {
    process.exit();
  }
}

createAdmin();
