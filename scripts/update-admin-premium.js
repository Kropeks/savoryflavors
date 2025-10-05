import { pool, query } from '../src/lib/db.js';

async function ensurePremiumPlanExists() {
  try {
    // Check if any subscription plan exists
    const [existingPlan] = await query('SELECT id FROM subscription_plans WHERE name = ?', ['Premium']);
    
    if (existingPlan) {
      console.log('Premium plan already exists with ID:', existingPlan.id);
      return existingPlan.id;
    }
    
    // Create a premium plan if it doesn't exist
    console.log('Creating Premium subscription plan...');
    const result = await query(
      `INSERT INTO subscription_plans 
       (name, description, price, billing_cycle, features, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        'Premium',
        'Premium subscription with full access to all features',
        9.99,  // Price in USD
        'monthly',
        JSON.stringify([
          'Unlimited recipe access',
          'Ad-free experience',
          'Exclusive content',
          'Priority support'
        ]),
        true
      ]
    );
    
    console.log('Created Premium plan with ID:', result.insertId);
    return result.insertId;
    
  } catch (error) {
    console.error('Error ensuring premium plan exists:', error);
    throw error;
  }
}

async function updateAdminToPremium() {
  try {
    // 1. Find the admin user
    const [adminUser] = await query(
      'SELECT id FROM users WHERE email = ? OR role = ? LIMIT 1',
      ['savoryadmin@example.com', 'admin']
    );

    if (!adminUser) {
      console.error('No admin user found. Please make sure an admin user exists.');
      return;
    }

    console.log(`Found admin user with ID: ${adminUser.id}`);

    // 2. Update user role to admin if not already
    await query(
      'UPDATE users SET role = ? WHERE id = ?',
      ['admin', adminUser.id]
    );

    // 3. Ensure premium plan exists and get its ID
    const premiumPlanId = await ensurePremiumPlanExists();

    // 4. Check if user already has an active subscription
    const [existingSub] = await query(
      'SELECT id FROM subscriptions WHERE user_id = ? AND status = ?',
      [adminUser.id, 'active']
    );

    const now = new Date();
    const oneHundredYearsLater = new Date();
    oneHundredYearsLater.setFullYear(now.getFullYear() + 100);

    if (existingSub) {
      console.log('Admin already has an active subscription. Updating to premium...');
      
      // Update existing subscription to premium
      await query(
        `UPDATE subscriptions 
         SET plan_id = ?,
             status = 'active',
             start_date = ?,
             end_date = ?,
             next_billing_date = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [premiumPlanId, now, oneHundredYearsLater, oneHundredYearsLater, existingSub.id]
      );
    } else {
      console.log('Creating new premium subscription for admin...');
      
      await query(
        `INSERT INTO subscriptions 
         (user_id, plan_id, status, start_date, end_date, next_billing_date, payment_method, created_at, updated_at)
         VALUES (?, ?, 'active', ?, ?, ?, 'admin_granted', NOW(), NOW())`,
        [adminUser.id, premiumPlanId, now, oneHundredYearsLater, oneHundredYearsLater]
      );
    }

    console.log('Successfully updated admin to have premium access!');
    console.log('The premium subscription is set until ' + oneHundredYearsLater.toISOString().split('T')[0] + ' (100 years from now)');
  } catch (error) {
    console.error('Error updating admin to premium:', error);
  } finally {
    // Close the database connection
    pool.end();
  }
}

// Run the function and handle any unhandled promise rejections
updateAdminToPremium().catch(console.error);
