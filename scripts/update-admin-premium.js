import { pool, query } from '../src/lib/db.js';

async function ensurePremiumPlanExists() {
  try {
    const plansToEnsure = [
      {
        billingCycle: 'monthly',
        price: 199.0,
        description: 'Premium subscription with full access to all features (monthly)',
      },
      {
        billingCycle: 'yearly',
        price: 1990.0,
        description: 'Premium subscription with full access to all features (yearly)',
      },
    ];

    // Ensure legacy rows have slugs/plan_ids to avoid duplicate '' violations
    await query(
      `UPDATE subscription_plans
       SET slug = CONCAT('legacy-plan-', id),
           plan_id = UPPER(CONCAT('LEGACY_PLAN_', id)),
           updated_at = NOW()
       WHERE slug IS NULL OR slug = '' OR plan_id IS NULL OR plan_id = ''`
    );

    let monthlyPlanId = null;

    const generateSlug = (cycle) => `premium-${cycle}`;

    for (const plan of plansToEnsure) {
      const slug = generateSlug(plan.billingCycle);
      const planIdValue = slug.toUpperCase();

      const [existingPlan] = await query(
        `SELECT id, price, slug FROM subscription_plans 
         WHERE (name = ? OR slug = ?) AND billing_cycle = ?
         ORDER BY slug = '' DESC, slug IS NULL DESC
         LIMIT 1`,
        ['Premium', slug, plan.billingCycle]
      );

      if (existingPlan) {
        if (Number(existingPlan.price) !== plan.price) {
          console.log(
            `Updating Premium ${plan.billingCycle} plan price from ${existingPlan.price} to ${plan.price}`
          );
          await query(
            `UPDATE subscription_plans
             SET price = ?, description = ?, slug = COALESCE(NULLIF(slug, ''), ?), plan_id = COALESCE(NULLIF(plan_id, ''), ?), updated_at = NOW()
             WHERE id = ?`,
            [plan.price, plan.description, slug, planIdValue, existingPlan.id]
          );
        } else {
          console.log(`Premium ${plan.billingCycle} plan already up to date (price ${plan.price}).`);
          if (!existingPlan.slug) {
            await query(
              `UPDATE subscription_plans
               SET slug = ?, plan_id = ?
               WHERE id = ?`,
              [slug, planIdValue, existingPlan.id]
            );
          }
        }

        if (plan.billingCycle === 'monthly') {
          monthlyPlanId = existingPlan.id;
        }

        continue;
      }

      console.log(`Creating Premium ${plan.billingCycle} subscription plan...`);
      const result = await query(
        `INSERT INTO subscription_plans 
         (name, slug, description, price, billing_cycle, features, is_active, plan_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          'Premium',
          slug,
          plan.description,
          plan.price,
          plan.billingCycle,
          JSON.stringify([
            'Unlimited recipe access',
            'Ad-free experience',
            'Exclusive content',
            'Priority support',
            plan.billingCycle === 'yearly' ? 'Yearly member badge' : 'Flexible monthly billing',
          ]),
          true,
          planIdValue,
        ]
      );

      if (plan.billingCycle === 'monthly') {
        monthlyPlanId = result.insertId;
      }
    }

    if (!monthlyPlanId) {
      throw new Error('Failed to ensure Premium monthly plan exists');
    }

    return monthlyPlanId;
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
