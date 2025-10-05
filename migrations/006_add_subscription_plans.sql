-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    billing_cycle ENUM('monthly', 'yearly') NOT NULL,
    features JSON NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_plan (name, billing_cycle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default subscription plans if they don't exist
INSERT INTO subscription_plans (name, description, price, billing_cycle, features, is_active)
VALUES 
    ('Basic', 'Basic plan with essential features', 0.00, 'monthly', 
    '["Browse all public recipes", "Post in community", "Create recipes", "Basic support"]', TRUE),
    
    ('Premium', 'Premium plan with all features', 199.00, 'monthly', 
    '["All Basic features", "Access to FitSavory", "Save favorite recipes", "Sell your own recipes", "Priority support"]', TRUE),
    
    ('Premium', 'Premium plan with all features (Yearly)', 1990.00, 'yearly', 
    '["All Basic features", "Access to FitSavory", "Save favorite recipes", "Sell your own recipes", "Priority support", "2 months free compared to monthly"]', TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Update recipes table to support premium content
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS preview_text TEXT DEFAULT NULL;

-- Update subscriptions table to reference subscription_plans
ALTER TABLE subscriptions
MODIFY COLUMN plan_id INT,
ADD CONSTRAINT fk_subscription_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOTENDS AT '2025-12-31 23:59:59';

-- Create a table to track user purchases of premium recipes
CREATE TABLE IF NOT EXISTS recipe_purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_purchase (user_id, recipe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX idx_recipe_purchases_user ON recipe_purchases(user_id);
CREATE INDEX idx_recipe_purchases_recipe ON recipe_purchases(recipe_id);
CREATE INDEX idx_recipes_premium ON recipes(is_premium, price);
