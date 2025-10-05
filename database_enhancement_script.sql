-- SavoryFlavors Database Enhancement Script
-- Apply these changes to your existing database to add advanced favorites and automation features

USE savoryflavors;

-- Add new columns to existing tables
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER email_verified;
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL AFTER is_active;

ALTER TABLE recipes ADD COLUMN is_featured BOOLEAN DEFAULT FALSE AFTER is_verified;
ALTER TABLE recipes ADD COLUMN view_count INT DEFAULT 0 AFTER review_count;
ALTER TABLE recipes ADD COLUMN favorite_count INT DEFAULT 0 AFTER view_count;
ALTER TABLE recipes ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER favorite_count;
ALTER TABLE recipes ADD COLUMN deleted_at TIMESTAMP NULL AFTER is_active;

ALTER TABLE recipe_reviews ADD COLUMN helpful_votes INT DEFAULT 0 AFTER comment;
ALTER TABLE recipe_reviews ADD COLUMN total_votes INT DEFAULT 0 AFTER helpful_votes;
ALTER TABLE recipe_reviews ADD COLUMN images JSON AFTER total_votes;
ALTER TABLE recipe_reviews ADD COLUMN is_verified_purchase BOOLEAN DEFAULT FALSE AFTER images;
ALTER TABLE recipe_reviews ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER is_verified_purchase;
ALTER TABLE recipe_reviews ADD COLUMN deleted_at TIMESTAMP NULL AFTER is_active;

-- Enhanced User Favorites table (replaces existing table)
DROP TABLE IF EXISTS user_favorites_new;
CREATE TABLE user_favorites_new (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    recipe_id VARCHAR(36) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    notes TEXT,
    tags JSON,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_viewed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    view_count INT DEFAULT 1,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_recipe (user_id, recipe_id),
    INDEX idx_user_id (user_id),
    INDEX idx_recipe_id (recipe_id),
    INDEX idx_category (category),
    INDEX idx_priority (priority),
    INDEX idx_is_pinned (is_pinned),
    INDEX idx_date_added (date_added),
    INDEX idx_user_category (user_id, category),
    INDEX idx_user_pinned (user_id, is_pinned),
    INDEX idx_user_priority (user_id, priority)
);

-- Copy data from old favorites table
INSERT INTO user_favorites_new (id, user_id, recipe_id, created_at)
SELECT id, user_id, recipe_id, created_at
FROM user_favorites;

-- Drop old table and rename new one
DROP TABLE user_favorites;
ALTER TABLE user_favorites_new RENAME TO user_favorites;

-- Favorite categories for better organization
CREATE TABLE IF NOT EXISTS favorite_categories (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(50),
    position INT DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_category (user_id, name),
    INDEX idx_user_id (user_id),
    INDEX idx_position (position),
    INDEX idx_is_default (is_default)
);

-- Review helpful votes tracking
CREATE TABLE IF NOT EXISTS review_votes (
    id VARCHAR(36) PRIMARY KEY,
    review_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    vote_type ENUM('helpful', 'not_helpful') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (review_id) REFERENCES recipe_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review_user (review_id, user_id),
    INDEX idx_review_id (review_id),
    INDEX idx_user_id (user_id),
    INDEX idx_vote_type (vote_type)
);

-- Enhanced meal entries with tags
ALTER TABLE meal_entries ADD COLUMN tags JSON AFTER is_favorite;

-- Enhanced user foods with better indexing
ALTER TABLE user_foods ADD INDEX idx_category_favorite (category, is_favorite);

-- Progress photos enhancements
ALTER TABLE progress_photos ADD COLUMN measurements JSON AFTER muscle_mass_kg;
ALTER TABLE progress_photos ADD COLUMN visibility ENUM('private', 'friends', 'public') DEFAULT 'private' AFTER notes;

-- Recipe collections enhancements
ALTER TABLE recipe_collections ADD COLUMN color VARCHAR(7) AFTER is_public;
ALTER TABLE recipe_collections ADD COLUMN icon VARCHAR(50) AFTER color;

-- Recipe collection items with position
ALTER TABLE recipe_collection_items ADD COLUMN position INT DEFAULT 0 AFTER notes;
ALTER TABLE recipe_collection_items ADD INDEX idx_collection_position (collection_id, position);

-- Shopping list items enhancements
ALTER TABLE shopping_list_items ADD INDEX idx_list_completed (shopping_list_id, is_completed);

-- Add new indexes for better performance
ALTER TABLE recipes ADD INDEX idx_category_cuisine (category, cuisine);
ALTER TABLE recipes ADD INDEX idx_public_active (is_public, is_active);
ALTER TABLE recipes ADD INDEX idx_featured_rating (is_featured, rating);
ALTER TABLE recipes ADD INDEX idx_view_count (view_count);
ALTER TABLE recipes ADD INDEX idx_favorite_count (favorite_count);

ALTER TABLE recipe_ingredients ADD COLUMN position INT DEFAULT 0 AFTER is_optional;
ALTER TABLE recipe_ingredients ADD INDEX idx_recipe_position (recipe_id, position);

ALTER TABLE meal_entries ADD INDEX idx_user_date (user_id, entry_date);
ALTER TABLE meal_entries ADD INDEX idx_user_meal_type (user_id, meal_type);

-- Add audit trail table
CREATE TABLE IF NOT EXISTS audit_trail (
    id VARCHAR(36) PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36),
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,

    INDEX idx_table_name (table_name),
    INDEX idx_record_id (record_id),
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_changed_at (changed_at),
    INDEX idx_table_action (table_name, action)
);

-- Recipe sharing and collaboration
CREATE TABLE IF NOT EXISTS recipe_shares (
    id VARCHAR(36) PRIMARY KEY,
    recipe_id VARCHAR(36) NOT NULL,
    owner_id VARCHAR(36) NOT NULL,
    shared_with_user_id VARCHAR(36) NOT NULL,
    permission ENUM('view', 'edit', 'admin') DEFAULT 'view',
    share_message TEXT,
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,

    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_recipe_id (recipe_id),
    INDEX idx_owner_id (owner_id),
    INDEX idx_shared_with (shared_with_user_id),
    INDEX idx_is_accepted (is_accepted),
    UNIQUE KEY unique_share (recipe_id, owner_id, shared_with_user_id)
);

-- Meal planning
CREATE TABLE IF NOT EXISTS meal_plans (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft',
    total_calories INT,
    total_protein_g DECIMAL(5,2),
    total_carbs_g DECIMAL(5,2),
    total_fat_g DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_date_range (start_date, end_date)
);

-- Meal plan recipes
CREATE TABLE IF NOT EXISTS meal_plan_recipes (
    id VARCHAR(36) PRIMARY KEY,
    meal_plan_id VARCHAR(36) NOT NULL,
    recipe_id VARCHAR(36) NOT NULL,
    planned_date DATE NOT NULL,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
    servings DECIMAL(3,1) DEFAULT 1.0,
    notes TEXT,

    FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    INDEX idx_meal_plan_id (meal_plan_id),
    INDEX idx_recipe_id (recipe_id),
    INDEX idx_planned_date (planned_date),
    INDEX idx_meal_type (meal_type),
    UNIQUE KEY unique_plan_recipe_date (meal_plan_id, recipe_id, planned_date, meal_type)
);

-- User following/followers
CREATE TABLE IF NOT EXISTS user_follows (
    id VARCHAR(36) PRIMARY KEY,
    follower_id VARCHAR(36) NOT NULL,
    following_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_follower_id (follower_id),
    INDEX idx_following_id (following_id),
    UNIQUE KEY unique_follow (follower_id, following_id)
);

-- Recipe notifications
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('recipe_shared', 'new_follower', 'recipe_liked', 'new_review', 'achievement_earned', 'system') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Database triggers for automatic calculations
-- Trigger to update recipe rating when reviews are added/updated/deleted
DROP TRIGGER IF EXISTS update_recipe_rating_on_review;
DELIMITER $$
CREATE TRIGGER update_recipe_rating_on_review
    AFTER INSERT ON recipe_reviews
    FOR EACH ROW
BEGIN
    UPDATE recipes
    SET rating = (
        SELECT AVG(rating)
        FROM recipe_reviews
        WHERE recipe_id = NEW.recipe_id AND is_active = TRUE
    ),
    review_count = (
        SELECT COUNT(*)
        FROM recipe_reviews
        WHERE recipe_id = NEW.recipe_id AND is_active = TRUE
    )
    WHERE id = NEW.recipe_id;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS update_recipe_rating_on_review_update;
DELIMITER $$
CREATE TRIGGER update_recipe_rating_on_review_update
    AFTER UPDATE ON recipe_reviews
    FOR EACH ROW
BEGIN
    UPDATE recipes
    SET rating = (
        SELECT AVG(rating)
        FROM recipe_reviews
        WHERE recipe_id = NEW.recipe_id AND is_active = TRUE
    ),
    review_count = (
        SELECT COUNT(*)
        FROM recipe_reviews
        WHERE recipe_id = NEW.recipe_id AND is_active = TRUE
    )
    WHERE id = NEW.recipe_id;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS update_recipe_rating_on_review_delete;
DELIMITER $$
CREATE TRIGGER update_recipe_rating_on_review_delete
    AFTER DELETE ON recipe_reviews
    FOR EACH ROW
BEGIN
    UPDATE recipes
    SET rating = (
        SELECT AVG(rating)
        FROM recipe_reviews
        WHERE recipe_id = OLD.recipe_id AND is_active = TRUE
    ),
    review_count = (
        SELECT COUNT(*)
        FROM recipe_reviews
        WHERE recipe_id = OLD.recipe_id AND is_active = TRUE
    )
    WHERE id = OLD.recipe_id;
END$$
DELIMITER ;

-- Trigger to update favorite count
DROP TRIGGER IF EXISTS update_recipe_favorite_count;
DELIMITER $$
CREATE TRIGGER update_recipe_favorite_count
    AFTER INSERT ON user_favorites
    FOR EACH ROW
BEGIN
    UPDATE recipes
    SET favorite_count = favorite_count + 1
    WHERE id = NEW.recipe_id;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS update_recipe_favorite_count_delete;
DELIMITER $$
CREATE TRIGGER update_recipe_favorite_count_delete
    AFTER DELETE ON user_favorites
    FOR EACH ROW
BEGIN
    UPDATE recipes
    SET favorite_count = favorite_count - 1
    WHERE id = OLD.recipe_id;
END$$
DELIMITER ;

-- Trigger to update user food rating
DROP TRIGGER IF EXISTS update_user_food_rating;
DELIMITER $$
CREATE TRIGGER update_user_food_rating
    AFTER INSERT ON user_food_reviews
    FOR EACH ROW
BEGIN
    UPDATE user_foods
    SET rating = (
        SELECT AVG(rating)
        FROM user_food_reviews
        WHERE food_id = NEW.food_id
    ),
    review_count = (
        SELECT COUNT(*)
        FROM user_food_reviews
        WHERE food_id = NEW.food_id
    )
    WHERE id = NEW.food_id;
END$$
DELIMITER ;

-- Insert default favorite categories
INSERT INTO favorite_categories (id, user_id, name, description, color, icon, is_default) VALUES
('default-general', 'system', 'General', 'General favorites', '#6B7280', '⭐', TRUE),
('default-quick-meals', 'system', 'Quick Meals', 'Recipes under 30 minutes', '#10B981', '⚡', TRUE),
('default-healthy', 'system', 'Healthy Options', 'Low calorie, nutritious meals', '#3B82F6', '🥗', TRUE),
('default-date-night', 'system', 'Date Night', 'Special occasion recipes', '#EC4899', '💕', TRUE),
('default-meal-prep', 'system', 'Meal Prep', 'Good for batch cooking', '#F59E0B', '🍱', TRUE)
ON DUPLICATE KEY UPDATE name = name;

-- Create a stored procedure to migrate existing favorites to categories
DROP PROCEDURE IF EXISTS migrate_favorites_to_categories;
DELIMITER $$
CREATE PROCEDURE migrate_favorites_to_categories()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE user_id_val VARCHAR(36);
    DECLARE recipe_id_val VARCHAR(36);
    DECLARE cur CURSOR FOR SELECT user_id, recipe_id FROM user_favorites WHERE category = 'General';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO user_id_val, recipe_id_val;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Update with a random category for demo purposes
        UPDATE user_favorites
        SET category = CASE
            WHEN RAND() < 0.2 THEN 'Quick Meals'
            WHEN RAND() < 0.4 THEN 'Healthy Options'
            WHEN RAND() < 0.6 THEN 'Date Night'
            WHEN RAND() < 0.8 THEN 'Meal Prep'
            ELSE 'General'
        END
        WHERE user_id = user_id_val AND recipe_id = recipe_id_val;

    END LOOP;

    CLOSE cur;
END$$
DELIMITER ;

-- Call the migration procedure
CALL migrate_favorites_to_categories();

-- Drop the procedure
DROP PROCEDURE IF EXISTS migrate_favorites_to_categories;
