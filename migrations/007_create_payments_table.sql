-- Migration: Create payments table for subscription transactions
-- Run this after migrations 001-006 to support PayMongo integration

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_id INT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'PHP',
    payment_intent_id VARCHAR(255) NOT NULL,
    status ENUM('pending', 'requires_action', 'succeeded', 'failed', 'canceled') DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT NULL,
    error_message TEXT DEFAULT NULL,
    metadata JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_payment_intent (payment_intent_id),
    INDEX idx_user_id (user_id),
    INDEX idx_plan_id (plan_id),
    INDEX idx_status (status),

    CONSTRAINT fk_payments_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_payments_plan
        FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
        ON DELETE SET NULL
);
