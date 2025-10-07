import { query } from '@/lib/db';

function normalizeBillingCycle(cycle) {
  if (!cycle) return 'monthly';
  const value = cycle.toString().toLowerCase();
  if (value.startsWith('year')) return 'yearly';
  if (value.startsWith('month')) return 'monthly';
  return value;
}

async function hasColumn(column) {
  const rows = await query(
    'SHOW COLUMNS FROM subscriptions LIKE ?',
    [column]
  );
  return rows.length > 0;
}

export async function activateSubscription({
  userId,
  planId,
  billingCycle,
  amountCentavos,
  paymentIntentId,
  paymentMethod,
}) {
  if (!userId || !planId) {
    throw new Error('Missing user or plan information when activating subscription');
  }

  const planIdValue = Number(planId) || planId;
  const cycle = normalizeBillingCycle(billingCycle);

  const now = new Date();
  const endDate = new Date(now);
  if (cycle === 'yearly') {
    endDate.setFullYear(now.getFullYear() + 1);
  } else {
    endDate.setMonth(now.getMonth() + 1);
  }

  const amount = typeof amountCentavos === 'number' ? amountCentavos / 100 : null;

  const [existingSub] = await query(
    'SELECT id FROM subscriptions WHERE user_id = ? LIMIT 1',
    [userId]
  );

  const hasCurrentPeriodStart = await hasColumn('current_period_start');
  const hasStartDate = await hasColumn('start_date');
  const hasEndDate = await hasColumn('end_date');

  const updateAssignments = ['plan_id = ?', 'status = ?'];
  const updateValues = [String(planIdValue), 'active'];

  if (hasCurrentPeriodStart) {
    updateAssignments.push('current_period_start = ?', 'current_period_end = ?');
    updateValues.push(now, endDate);
  }

  if (hasStartDate && hasEndDate) {
    updateAssignments.push('start_date = ?', 'end_date = ?');
    updateValues.push(now, endDate);
  }

  updateAssignments.push('updated_at = NOW()');

  const insertColumns = ['user_id', 'plan_id', 'status'];
  const insertPlaceholders = ['?', '?', '?'];
  const insertValues = [userId, String(planIdValue), 'active'];

  if (hasCurrentPeriodStart) {
    insertColumns.push('current_period_start', 'current_period_end');
    insertPlaceholders.push('?', '?');
    insertValues.push(now, endDate);
  }

  if (hasStartDate && hasEndDate) {
    insertColumns.push('start_date', 'end_date');
    insertPlaceholders.push('?', '?');
    insertValues.push(now, endDate);
  }

  let subscriptionResult = { action: null, id: existingSub?.id || null };

  if (existingSub) {
    const updateSql = `UPDATE subscriptions SET ${updateAssignments.join(', ')} WHERE user_id = ?`;
    await query(updateSql, [...updateValues, userId]);
    subscriptionResult = { action: 'updated', id: existingSub.id };
  } else {
    const insertSql = `INSERT INTO subscriptions (${insertColumns.join(', ')}) VALUES (${insertPlaceholders.join(', ')})`;
    const insertResult = await query(insertSql, insertValues);
    subscriptionResult = { action: 'created', id: insertResult?.insertId || null };
  }

  if (amount !== null && paymentIntentId) {
    const existingPayment = await query(
      'SELECT id, status FROM payments WHERE payment_intent_id = ? LIMIT 1',
      [paymentIntentId]
    );

    let paymentActionResult = null;

    if (!existingPayment.length) {
      const insertResult = await query(
        `INSERT INTO payments
           (user_id, plan_id, amount, currency, payment_intent_id, status, payment_method, created_at)
         VALUES (?, ?, ?, 'PHP', ?, 'succeeded', ?, NOW())`,
        [userId, planIdValue, amount, paymentIntentId, paymentMethod || 'card']
      );
      paymentActionResult = { action: 'created', id: insertResult?.insertId || null };
    } else if (existingPayment[0].status !== 'succeeded') {
      await query(
        `UPDATE payments
           SET user_id = ?, plan_id = ?, amount = ?, status = 'succeeded', payment_method = ?, updated_at = NOW()
         WHERE id = ?`,
        [userId, planIdValue, amount, paymentMethod || 'card', existingPayment[0].id]
      );
      paymentActionResult = { action: 'updated', id: existingPayment[0].id };
    } else {
      paymentActionResult = { action: 'unchanged', id: existingPayment[0].id };
    }

    return {
      subscription: {
        id: subscriptionResult.id,
        action: subscriptionResult.action,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: endDate,
      },
      payment: {
        id: paymentActionResult?.id || null,
        action: paymentActionResult?.action || 'unchanged',
        intentId: paymentIntentId,
        amount,
        method: paymentMethod || 'card',
      },
    };
  }

  return {
    subscription: {
      id: subscriptionResult.id,
      action: subscriptionResult.action,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: endDate,
    },
    payment: null,
  };
}

