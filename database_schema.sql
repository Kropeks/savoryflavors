-- SavoryFlavors Database Schema - Complete with FitSavory Features
-- MySQL Database for Recipe Management System with Nutrition Tracking

-- Create database
CREATE DATABASE IF NOT EXISTS savoryflavors;
USE savoryflavors;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    image VARCHAR(500),
    email_verified TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- User sessions table (for NextAuth)
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires TIMESTAMP NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_expires (expires)
);

-- User accounts table (for OAuth providers)
CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    token_type VARCHAR(50),
    scope VARCHAR(255),
    id_token TEXT,
    session_state VARCHAR(255),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_provider_account (provider, provider_account_id),
    INDEX idx_user_id (user_id)
);

-- Verification tokens table (for email verification)
CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires TIMESTAMP NOT NULL,

    PRIMARY KEY (identifier, token)
);

-- User profiles table (FitSavory specific)
CREATE TABLE IF NOT EXISTS user_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    bio TEXT,
    avatar VARCHAR(500),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    height_cm DECIMAL(5,2),
    current_weight_kg DECIMAL(5,2),
    target_weight_kg DECIMAL(5,2),
    activity_level ENUM('sedentary', 'light', 'moderate', 'active', 'very_active'),
    fitness_goal ENUM('weight_loss', 'weight_gain', 'maintain_weight', 'build_muscle', 'improve_health'),
    daily_calorie_target INT DEFAULT 2000,
    protein_target_g DECIMAL(5,2),
    carb_target_g DECIMAL(5,2),
    fat_target_g DECIMAL(5,2),
    water_target_ml INT DEFAULT 2000,
    preferred_cuisines JSON,
    dietary_restrictions JSON,
    allergies JSON,
    fitness_streak_days INT DEFAULT 0,
    longest_streak_days INT DEFAULT 0,
    total_workouts_completed INT DEFAULT 0,
    total_meals_logged INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_fitness_goal (fitness_goal),
    INDEX idx_activity_level (activity_level)
);

-- Recipes table (updated for FitSavory)
CREATE TABLE IF NOT EXISTS recipes (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(500),
    instructions TEXT,
    prep_time INT DEFAULT 0,
    cook_time INT DEFAULT 0,
    servings INT DEFAULT 4,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    category VARCHAR(100),
    cuisine VARCHAR(100),
    tags JSON,
    nutrition JSON,
    user_id VARCHAR(36),
    source VARCHAR(50) DEFAULT 'user',
    external_id VARCHAR(100),
    external_url VARCHAR(500),
    is_public BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_title (title),
    INDEX idx_category (category),
    INDEX idx_cuisine (cuisine),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_rating (rating),
    INDEX idx_is_public (is_public),
    FULLTEXT idx_search (title, description, instructions)
);

-- Recipe ingredients table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id VARCHAR(36) PRIMARY KEY,
    recipe_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2),
    unit VARCHAR(50),
    notes TEXT,
    nutrition_per_unit JSON,
    is_optional BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    INDEX idx_recipe_id (recipe_id),
    INDEX idx_name (name)
);

-- Recipe instructions table
CREATE TABLE IF NOT EXISTS recipe_instructions (
    id VARCHAR(36) PRIMARY KEY,
    recipe_id VARCHAR(36) NOT NULL,
    step_number INT NOT NULL,
    instruction TEXT NOT NULL,
    image VARCHAR(500),
    timer_minutes INT,
    tips TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    INDEX idx_recipe_id (recipe_id),
    INDEX idx_step_number (step_number),
    UNIQUE KEY unique_recipe_step (recipe_id, step_number)
);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    recipe_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_recipe (user_id, recipe_id),
    INDEX idx_user_id (user_id),
    INDEX idx_recipe_id (recipe_id)
);

-- Recipe reviews table
CREATE TABLE IF NOT EXISTS recipe_reviews (
    id VARCHAR(36) PRIMARY KEY,
    recipe_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    helpful_votes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_recipe_id (recipe_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    UNIQUE KEY unique_user_recipe_review (user_id, recipe_id)
);

-- Meal tracking entries
CREATE TABLE IF NOT EXISTS meal_entries (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    recipe_id VARCHAR(36),
    food_name VARCHAR(255) NOT NULL,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
    entry_date DATE NOT NULL,
    entry_time TIME NOT NULL,
    servings_consumed DECIMAL(3,1) DEFAULT 1.0,
    calories_consumed INT,
    protein_g DECIMAL(5,2),
    carbs_g DECIMAL(5,2),
    fat_g DECIMAL(5,2),
    fiber_g DECIMAL(5,2),
    sugar_g DECIMAL(5,2),
    notes TEXT,
    mood_before ENUM('very_bad', 'bad', 'neutral', 'good', 'very_good'),
    mood_after ENUM('very_bad', 'bad', 'neutral', 'good', 'very_good'),
    energy_level INT CHECK (energy_level >= 1 AND energy_level <= 10),
    satisfaction_level INT CHECK (satisfaction_level >= 1 AND satisfaction_level <= 10),
    location VARCHAR(255),
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_entry_date (entry_date),
    INDEX idx_meal_type (meal_type),
    INDEX idx_recipe_id (recipe_id)
);

-- Diet plans
CREATE TABLE IF NOT EXISTS diet_plans (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    goal ENUM('weight_loss', 'weight_gain', 'maintain_weight', 'build_muscle', 'improve_health', 'other') NOT NULL,
    plan_type ENUM('standard', 'keto', 'mediterranean', 'paleo', 'vegan', 'custom') DEFAULT 'standard',
    start_date DATE NOT NULL,
    end_date DATE,
    target_weight_kg DECIMAL(5,2),
    daily_calories INT NOT NULL,
    protein_g DECIMAL(5,2),
    carbs_g DECIMAL(5,2),
    fat_g DECIMAL(5,2),
    status ENUM('active', 'paused', 'completed', 'cancelled') DEFAULT 'active',
    progress_percentage DECIMAL(5,2) DEFAULT 0.0,
    total_days INT DEFAULT 0,
    completed_days INT DEFAULT 0,
    adherence_rate DECIMAL(5,2) DEFAULT 0.0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_goal (goal),
    INDEX idx_status (status),
    INDEX idx_date_range (start_date, end_date)
);

-- Diet plan daily logs
CREATE TABLE IF NOT EXISTS diet_plan_logs (
    id VARCHAR(36) PRIMARY KEY,
    diet_plan_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    log_date DATE NOT NULL,
    weight_kg DECIMAL(5,2),
    calories_consumed INT,
    calories_burned INT,
    protein_g DECIMAL(5,2),
    carbs_g DECIMAL(5,2),
    fat_g DECIMAL(5,2),
    water_ml INT,
    workout_duration_minutes INT,
    sleep_hours DECIMAL(3,1),
    energy_level INT CHECK (energy_level >= 1 AND energy_level <= 10),
    mood ENUM('very_bad', 'bad', 'neutral', 'good', 'very_good'),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (diet_plan_id) REFERENCES diet_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_diet_plan_id (diet_plan_id),
    INDEX idx_user_id (user_id),
    INDEX idx_log_date (log_date),
    UNIQUE KEY unique_diet_plan_log (diet_plan_id, log_date)
);

-- Calendar events
CREATE TABLE IF NOT EXISTS calendar_events (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type ENUM('meal', 'workout', 'appointment', 'reminder', 'goal', 'other') NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_all_day BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern JSON,
    location VARCHAR(255),
    reminder_minutes_before INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completion_notes TEXT,
    calories_burned INT,
    calories_consumed INT,
    nutrition_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_event_date (event_date),
    INDEX idx_event_type (event_type),
    INDEX idx_is_completed (is_completed)
);

-- User food library
CREATE TABLE IF NOT EXISTS user_foods (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    brand VARCHAR(255),
    barcode VARCHAR(100),
    serving_size_g DECIMAL(7,2),
    calories_per_serving INT,
    protein_g DECIMAL(5,2),
    carbs_g DECIMAL(5,2),
    fat_g DECIMAL(5,2),
    fiber_g DECIMAL(5,2),
    sugar_g DECIMAL(5,2),
    sodium_mg DECIMAL(7,2),
    potassium_mg DECIMAL(7,2),
    vitamins_minerals JSON,
    ingredients TEXT,
    allergens JSON,
    is_verified BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INT DEFAULT 0,
    image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_is_favorite (is_favorite),
    INDEX idx_barcode (barcode),
    FULLTEXT idx_search (name, description, ingredients)
);

-- User food reviews
CREATE TABLE IF NOT EXISTS user_food_reviews (
    id VARCHAR(36) PRIMARY KEY,
    food_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    taste_rating INT CHECK (taste_rating >= 1 AND taste_rating <= 5),
    texture_rating INT CHECK (texture_rating >= 1 AND texture_rating <= 5),
    value_rating INT CHECK (value_rating >= 1 AND value_rating <= 5),
    would_recommend BOOLEAN DEFAULT TRUE,
    helpful_votes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (food_id) REFERENCES user_foods(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_food_id (food_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    UNIQUE KEY unique_user_food_review (user_id, food_id)
);

-- Progress photos
CREATE TABLE IF NOT EXISTS progress_photos (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    image_front VARCHAR(500),
    image_side VARCHAR(500),
    image_back VARCHAR(500),
    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(5,2),
    muscle_mass_kg DECIMAL(5,2),
    notes TEXT,
    photo_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_photo_date (photo_date)
);

-- User achievements/badges
CREATE TABLE IF NOT EXISTS user_achievements (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    achievement_type ENUM('streak', 'weight', 'workout', 'nutrition', 'social', 'special') NOT NULL,
    achievement_name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    badge_color VARCHAR(7), -- Hex color
    earned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress_current INT DEFAULT 0,
    progress_target INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_achievement_type (achievement_type),
    INDEX idx_is_completed (is_completed)
);

-- Workout sessions
CREATE TABLE IF NOT EXISTS workout_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    workout_type ENUM('cardio', 'strength', 'flexibility', 'sports', 'other') NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL,
    calories_burned INT,
    exercises JSON,
    location VARCHAR(255),
    mood_before ENUM('very_bad', 'bad', 'neutral', 'good', 'very_good'),
    mood_after ENUM('very_bad', 'bad', 'neutral', 'good', 'very_good'),
    energy_level INT CHECK (energy_level >= 1 AND energy_level <= 10),
    notes TEXT,
    session_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_date (session_date),
    INDEX idx_workout_type (workout_type)
);

-- Water intake tracking
CREATE TABLE IF NOT EXISTS water_intake (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    amount_ml INT NOT NULL,
    intake_time TIME NOT NULL,
    intake_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_intake_date (intake_date),
    INDEX idx_intake_time (intake_time)
);

-- Recipe collections
CREATE TABLE IF NOT EXISTS recipe_collections (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    collection_type ENUM('favorites', 'meal_plan', 'custom', 'shared') DEFAULT 'custom',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_public (is_public),
    INDEX idx_collection_type (collection_type)
);

-- Recipe collection items
CREATE TABLE IF NOT EXISTS recipe_collection_items (
    id VARCHAR(36) PRIMARY KEY,
    collection_id VARCHAR(36) NOT NULL,
    recipe_id VARCHAR(36) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,

    FOREIGN KEY (collection_id) REFERENCES recipe_collections(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    INDEX idx_collection_id (collection_id),
    INDEX idx_recipe_id (recipe_id),
    UNIQUE KEY unique_collection_recipe (collection_id, recipe_id)
);

-- Shopping lists
CREATE TABLE IF NOT EXISTS shopping_lists (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    meal_plan_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (meal_plan_id) REFERENCES diet_plans(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id)
);

-- Shopping list items
CREATE TABLE IF NOT EXISTS shopping_list_items (
    id VARCHAR(36) PRIMARY KEY,
    shopping_list_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2),
    unit VARCHAR(50),
    is_completed BOOLEAN DEFAULT FALSE,
    category VARCHAR(100),
    estimated_price DECIMAL(8,2),
    store_aisle VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE,
    INDEX idx_shopping_list_id (shopping_list_id),
    INDEX idx_is_completed (is_completed),
    INDEX idx_category (category)
);

-- Insert default data for FitSavory
-- First, create a system user for default achievements
INSERT INTO users (id, email, name, password) VALUES
('system', 'system@savoryflavors.com', 'System User', 'system_password_hash')
ON DUPLICATE KEY UPDATE name = name;

-- Insert default achievements
INSERT INTO user_achievements (id, user_id, achievement_type, achievement_name, description, icon, badge_color, is_completed) VALUES
('default-streak-1', 'system', 'streak', 'First Steps', 'Log your first meal', '🎯', '#10B981', TRUE),
('default-streak-2', 'system', 'streak', 'Week Warrior', 'Maintain a 7-day streak', '🔥', '#F59E0B', FALSE),
('default-streak-3', 'system', 'streak', 'Consistency King', 'Maintain a 30-day streak', '👑', '#8B5CF6', FALSE),
('default-weight-1', 'system', 'weight', 'First Weigh-in', 'Record your first weight', '⚖️', '#3B82F6', FALSE),
('default-workout-1', 'system', 'workout', 'Workout Beginner', 'Complete your first workout', '💪', '#EF4444', FALSE),
('default-nutrition-1', 'system', 'nutrition', 'Macro Master', 'Hit all macro targets for a day', '🥗', '#10B981', FALSE)
ON DUPLICATE KEY UPDATE achievement_name = achievement_name;

-- Insert system recipe for default categories
INSERT INTO recipes (id, title, description, category, user_id, is_public) VALUES
('system', 'System Recipe', 'System recipe for default categories', 'Other', 'system', TRUE)
ON DUPLICATE KEY UPDATE title = title;

-- Insert sample categories
INSERT INTO recipe_ingredients (id, recipe_id, name, amount, unit, notes) VALUES
('category-breakfast', 'system', 'Breakfast', NULL, NULL, 'Default category'),
('category-lunch', 'system', 'Lunch', NULL, NULL, 'Default category'),
('category-dinner', 'system', 'Dinner', NULL, NULL, 'Default category'),
('category-snack', 'system', 'Snack', NULL, NULL, 'Default category'),
('category-dessert', 'system', 'Dessert', NULL, NULL, 'Default category'),
('category-beverage', 'system', 'Beverage', NULL, NULL, 'Default category')
ON DUPLICATE KEY UPDATE name = name;
