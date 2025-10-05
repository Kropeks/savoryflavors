-- SavoryFlavors Database Constraints and Validation Enhancement
-- Apply these constraints to improve data integrity and validation

USE savoryflavors;

-- Add check constraints for data validation
ALTER TABLE users
    ADD CONSTRAINT chk_email_format CHECK (email REGEXP '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$'),
    ADD CONSTRAINT chk_name_length CHECK (CHAR_LENGTH(name) >= 2),
    ADD CONSTRAINT chk_password_length CHECK (CHAR_LENGTH(password) >= 8 OR password IS NULL);

ALTER TABLE recipes
    ADD CONSTRAINT chk_title_length CHECK (CHAR_LENGTH(title) >= 3),
    ADD CONSTRAINT chk_description_length CHECK (CHAR_LENGTH(description) <= 2000 OR description IS NULL),
    ADD CONSTRAINT chk_prep_time_positive CHECK (prep_time >= 0),
    ADD CONSTRAINT chk_cook_time_positive CHECK (cook_time >= 0),
    ADD CONSTRAINT chk_servings_positive CHECK (servings > 0),
    ADD CONSTRAINT chk_rating_range CHECK (rating >= 0 AND rating <= 5),
    ADD CONSTRAINT chk_view_count_positive CHECK (view_count >= 0),
    ADD CONSTRAINT chk_favorite_count_positive CHECK (favorite_count >= 0);

ALTER TABLE recipe_ingredients
    ADD CONSTRAINT chk_ingredient_name_length CHECK (CHAR_LENGTH(name) >= 1),
    ADD CONSTRAINT chk_amount_positive CHECK (amount >= 0 OR amount IS NULL),
    ADD CONSTRAINT chk_unit_length CHECK (CHAR_LENGTH(unit) <= 50 OR unit IS NULL);

ALTER TABLE recipe_instructions
    ADD CONSTRAINT chk_instruction_length CHECK (CHAR_LENGTH(instruction) >= 10),
    ADD CONSTRAINT chk_step_number_positive CHECK (step_number > 0),
    ADD CONSTRAINT chk_timer_positive CHECK (timer_minutes >= 0 OR timer_minutes IS NULL);

ALTER TABLE recipe_reviews
    ADD CONSTRAINT chk_review_rating_range CHECK (rating >= 1 AND rating <= 5),
    ADD CONSTRAINT chk_helpful_votes_positive CHECK (helpful_votes >= 0),
    ADD CONSTRAINT chk_total_votes_positive CHECK (total_votes >= 0),
    ADD CONSTRAINT chk_comment_length CHECK (CHAR_LENGTH(comment) <= 1000 OR comment IS NULL),
    ADD CONSTRAINT chk_energy_level_range CHECK (energy_level >= 1 AND energy_level <= 10 OR energy_level IS NULL),
    ADD CONSTRAINT chk_satisfaction_range CHECK (satisfaction_level >= 1 AND satisfaction_level <= 10 OR satisfaction_level IS NULL);

ALTER TABLE meal_entries
    ADD CONSTRAINT chk_servings_positive CHECK (servings_consumed > 0),
    ADD CONSTRAINT chk_calories_positive CHECK (calories_consumed >= 0 OR calories_consumed IS NULL),
    ADD CONSTRAINT chk_protein_positive CHECK (protein_g >= 0 OR protein_g IS NULL),
    ADD CONSTRAINT chk_carbs_positive CHECK (carbs_g >= 0 OR carbs_g IS NULL),
    ADD CONSTRAINT chk_fat_positive CHECK (fat_g >= 0 OR fat_g IS NULL),
    ADD CONSTRAINT chk_fiber_positive CHECK (fiber_g >= 0 OR fiber_g IS NULL),
    ADD CONSTRAINT chk_sugar_positive CHECK (sugar_g >= 0 OR sugar_g IS NULL);

ALTER TABLE user_profiles
    ADD CONSTRAINT chk_height_positive CHECK (height_cm > 0 OR height_cm IS NULL),
    ADD CONSTRAINT chk_weight_positive CHECK (current_weight_kg > 0 OR current_weight_kg IS NULL),
    ADD CONSTRAINT chk_target_weight_positive CHECK (target_weight_kg > 0 OR target_weight_kg IS NULL),
    ADD CONSTRAINT chk_calorie_target_positive CHECK (daily_calorie_target > 0),
    ADD CONSTRAINT chk_protein_target_positive CHECK (protein_target_g >= 0 OR protein_target_g IS NULL),
    ADD CONSTRAINT chk_carb_target_positive CHECK (carb_target_g >= 0 OR carb_target_g IS NULL),
    ADD CONSTRAINT chk_fat_target_positive CHECK (fat_target_g >= 0 OR fat_target_g IS NULL),
    ADD CONSTRAINT chk_water_target_positive CHECK (water_target_ml > 0),
    ADD CONSTRAINT chk_streak_days_positive CHECK (fitness_streak_days >= 0),
    ADD CONSTRAINT chk_longest_streak_positive CHECK (longest_streak_days >= 0),
    ADD CONSTRAINT chk_workouts_positive CHECK (total_workouts_completed >= 0),
    ADD CONSTRAINT chk_meals_logged_positive CHECK (total_meals_logged >= 0);

ALTER TABLE diet_plans
    ADD CONSTRAINT chk_plan_name_length CHECK (CHAR_LENGTH(name) >= 3),
    ADD CONSTRAINT chk_daily_calories_positive CHECK (daily_calories > 0),
    ADD CONSTRAINT chk_protein_plan_positive CHECK (protein_g >= 0 OR protein_g IS NULL),
    ADD CONSTRAINT chk_carbs_plan_positive CHECK (carbs_g >= 0 OR carbs_g IS NULL),
    ADD CONSTRAINT chk_fat_plan_positive CHECK (fat_g >= 0 OR fat_g IS NULL),
    ADD CONSTRAINT chk_progress_percentage_range CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    ADD CONSTRAINT chk_adherence_rate_range CHECK (adherence_rate >= 0 AND adherence_rate <= 100),
    ADD CONSTRAINT chk_total_days_positive CHECK (total_days >= 0),
    ADD CONSTRAINT chk_completed_days_positive CHECK (completed_days >= 0);

ALTER TABLE diet_plan_logs
    ADD CONSTRAINT chk_log_weight_positive CHECK (weight_kg > 0 OR weight_kg IS NULL),
    ADD CONSTRAINT chk_log_calories_consumed_positive CHECK (calories_consumed >= 0 OR calories_consumed IS NULL),
    ADD CONSTRAINT chk_log_calories_burned_positive CHECK (calories_burned >= 0 OR calories_burned IS NULL),
    ADD CONSTRAINT chk_log_protein_positive CHECK (protein_g >= 0 OR protein_g IS NULL),
    ADD CONSTRAINT chk_log_carbs_positive CHECK (carbs_g >= 0 OR carbs_g IS NULL),
    ADD CONSTRAINT chk_log_fat_positive CHECK (fat_g >= 0 OR fat_g IS NULL),
    ADD CONSTRAINT chk_log_water_positive CHECK (water_ml >= 0 OR water_ml IS NULL),
    ADD CONSTRAINT chk_log_workout_duration_positive CHECK (workout_duration_minutes >= 0 OR workout_duration_minutes IS NULL),
    ADD CONSTRAINT chk_log_sleep_hours_positive CHECK (sleep_hours >= 0 AND sleep_hours <= 24 OR sleep_hours IS NULL),
    ADD CONSTRAINT chk_log_energy_level_range CHECK (energy_level >= 1 AND energy_level <= 10 OR energy_level IS NULL);

ALTER TABLE user_foods
    ADD CONSTRAINT chk_food_name_length CHECK (CHAR_LENGTH(name) >= 2),
    ADD CONSTRAINT chk_serving_size_positive CHECK (serving_size_g > 0 OR serving_size_g IS NULL),
    ADD CONSTRAINT chk_food_calories_positive CHECK (calories_per_serving >= 0 OR calories_per_serving IS NULL),
    ADD CONSTRAINT chk_food_protein_positive CHECK (protein_g >= 0 OR protein_g IS NULL),
    ADD CONSTRAINT chk_food_carbs_positive CHECK (carbs_g >= 0 OR carbs_g IS NULL),
    ADD CONSTRAINT chk_food_fat_positive CHECK (fat_g >= 0 OR fat_g IS NULL),
    ADD CONSTRAINT chk_food_fiber_positive CHECK (fiber_g >= 0 OR fiber_g IS NULL),
    ADD CONSTRAINT chk_food_sugar_positive CHECK (sugar_g >= 0 OR sugar_g IS NULL),
    ADD CONSTRAINT chk_food_sodium_positive CHECK (sodium_mg >= 0 OR sodium_mg IS NULL),
    ADD CONSTRAINT chk_food_potassium_positive CHECK (potassium_mg >= 0 OR potassium_mg IS NULL),
    ADD CONSTRAINT chk_food_rating_range CHECK (rating >= 0 AND rating <= 5);

ALTER TABLE user_food_reviews
    ADD CONSTRAINT chk_food_review_rating_range CHECK (rating >= 1 AND rating <= 5),
    ADD CONSTRAINT chk_taste_rating_range CHECK (taste_rating >= 1 AND taste_rating <= 5 OR taste_rating IS NULL),
    ADD CONSTRAINT chk_texture_rating_range CHECK (texture_rating >= 1 AND texture_rating <= 5 OR texture_rating IS NULL),
    ADD CONSTRAINT chk_value_rating_range CHECK (value_rating >= 1 AND value_rating <= 5 OR value_rating IS NULL),
    ADD CONSTRAINT chk_food_review_helpful_positive CHECK (helpful_votes >= 0),
    ADD CONSTRAINT chk_food_review_total_votes_positive CHECK (total_votes >= 0);

ALTER TABLE progress_photos
    ADD CONSTRAINT chk_photo_weight_positive CHECK (weight_kg > 0 OR weight_kg IS NULL),
    ADD CONSTRAINT chk_body_fat_percentage_range CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100 OR body_fat_percentage IS NULL),
    ADD CONSTRAINT chk_muscle_mass_positive CHECK (muscle_mass_kg >= 0 OR muscle_mass_kg IS NULL);

ALTER TABLE workout_sessions
    ADD CONSTRAINT chk_workout_duration_positive CHECK (duration_minutes > 0),
    ADD CONSTRAINT chk_workout_calories_positive CHECK (calories_burned >= 0 OR calories_burned IS NULL),
    ADD CONSTRAINT chk_workout_energy_level_range CHECK (energy_level >= 1 AND energy_level <= 10 OR energy_level IS NULL);

ALTER TABLE water_intake
    ADD CONSTRAINT chk_water_amount_positive CHECK (amount_ml > 0);

ALTER TABLE shopping_lists
    ADD CONSTRAINT chk_shopping_list_name_length CHECK (CHAR_LENGTH(name) >= 2);

ALTER TABLE shopping_list_items
    ADD CONSTRAINT chk_shopping_item_name_length CHECK (CHAR_LENGTH(name) >= 1),
    ADD CONSTRAINT chk_shopping_amount_positive CHECK (amount >= 0 OR amount IS NULL),
    ADD CONSTRAINT chk_shopping_unit_length CHECK (CHAR_LENGTH(unit) <= 50 OR unit IS NULL),
    ADD CONSTRAINT chk_shopping_price_positive CHECK (estimated_price >= 0 OR estimated_price IS NULL);

ALTER TABLE favorite_categories
    ADD CONSTRAINT chk_category_name_length CHECK (CHAR_LENGTH(name) >= 2),
    ADD CONSTRAINT chk_category_color_format CHECK (color REGEXP '^#[0-9A-Fa-f]{6}$' OR color IS NULL),
    ADD CONSTRAINT chk_category_position_positive CHECK (position >= 0);

ALTER TABLE recipe_collections
    ADD CONSTRAINT chk_collection_name_length CHECK (CHAR_LENGTH(name) >= 2);

ALTER TABLE notifications
    ADD CONSTRAINT chk_notification_title_length CHECK (CHAR_LENGTH(title) >= 3),
    ADD CONSTRAINT chk_notification_message_length CHECK (CHAR_LENGTH(message) <= 1000 OR message IS NULL);

-- Add foreign key constraints for new tables
ALTER TABLE review_votes
    ADD CONSTRAINT fk_review_votes_review_id FOREIGN KEY (review_id) REFERENCES recipe_reviews(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_review_votes_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE recipe_shares
    ADD CONSTRAINT fk_recipe_shares_recipe_id FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_recipe_shares_owner_id FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_recipe_shares_shared_with FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE meal_plans
    ADD CONSTRAINT fk_meal_plans_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE meal_plan_recipes
    ADD CONSTRAINT fk_meal_plan_recipes_plan_id FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_meal_plan_recipes_recipe_id FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE;

ALTER TABLE user_follows
    ADD CONSTRAINT fk_user_follows_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_user_follows_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE notifications
    ADD CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create views for common queries
CREATE OR REPLACE VIEW active_recipes AS
SELECT
    r.*,
    u.name as author_name,
    u.image as author_image
FROM recipes r
LEFT JOIN users u ON r.user_id = u.id
WHERE r.is_active = TRUE AND (r.deleted_at IS NULL OR r.deleted_at > NOW());

CREATE OR REPLACE VIEW recipe_stats AS
SELECT
    r.id,
    r.title,
    r.rating,
    r.review_count,
    r.view_count,
    r.favorite_count,
    r.created_at,
    COUNT(DISTINCT uf.id) as unique_favoriters,
    AVG(rr.rating) as avg_review_rating,
    COUNT(CASE WHEN rr.rating >= 4 THEN 1 END) as positive_reviews,
    COUNT(CASE WHEN rr.rating <= 2 THEN 1 END) as negative_reviews
FROM recipes r
LEFT JOIN user_favorites uf ON r.id = uf.recipe_id
LEFT JOIN recipe_reviews rr ON r.id = rr.recipe_id AND rr.is_active = TRUE
WHERE r.is_active = TRUE AND (r.deleted_at IS NULL OR r.deleted_at > NOW())
GROUP BY r.id;

CREATE OR REPLACE VIEW user_activity_summary AS
SELECT
    u.id,
    u.name,
    u.email,
    COUNT(DISTINCT r.id) as recipes_created,
    COUNT(DISTINCT uf.id) as recipes_favorited,
    COUNT(DISTINCT rr.id) as reviews_written,
    COUNT(DISTINCT me.id) as meals_logged,
    COUNT(DISTINCT ws.id) as workouts_completed,
    COUNT(DISTINCT up.id) as profile_views,
    DATEDIFF(NOW(), u.created_at) as days_active,
    u.created_at as joined_date
FROM users u
LEFT JOIN recipes r ON u.id = r.user_id AND r.is_active = TRUE
LEFT JOIN user_favorites uf ON u.id = uf.user_id
LEFT JOIN recipe_reviews rr ON u.id = rr.user_id AND rr.is_active = TRUE
LEFT JOIN meal_entries me ON u.id = me.user_id
LEFT JOIN workout_sessions ws ON u.id = ws.user_id
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.is_active = TRUE
GROUP BY u.id;

CREATE OR REPLACE VIEW nutrition_summary AS
SELECT
    me.user_id,
    DATE(me.entry_date) as date,
    SUM(me.calories_consumed) as total_calories,
    SUM(me.protein_g) as total_protein,
    SUM(me.carbs_g) as total_carbs,
    SUM(me.fat_g) as total_fat,
    SUM(me.fiber_g) as total_fiber,
    SUM(me.sugar_g) as total_sugar,
    COUNT(*) as meals_count,
    AVG(me.satisfaction_level) as avg_satisfaction,
    AVG(me.energy_level) as avg_energy
FROM meal_entries me
WHERE me.entry_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY me.user_id, DATE(me.entry_date);

-- Create stored procedures for common operations
DROP PROCEDURE IF EXISTS get_user_favorites;
DELIMITER $$
CREATE PROCEDURE get_user_favorites(IN user_id_param VARCHAR(36))
BEGIN
    SELECT
        r.*,
        uf.category,
        uf.priority,
        uf.notes,
        uf.is_pinned,
        uf.date_added,
        uf.view_count as favorite_view_count
    FROM recipes r
    JOIN user_favorites uf ON r.id = uf.recipe_id
    WHERE uf.user_id = user_id_param
    AND r.is_active = TRUE
    AND (r.deleted_at IS NULL OR r.deleted_at > NOW())
    ORDER BY
        uf.is_pinned DESC,
        uf.priority DESC,
        uf.date_added DESC;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS search_recipes_advanced;
DELIMITER $$
CREATE PROCEDURE search_recipes_advanced(
    IN search_term VARCHAR(255),
    IN category_filter VARCHAR(100),
    IN cuisine_filter VARCHAR(100),
    IN max_prep_time INT,
    IN difficulty_filter VARCHAR(20),
    IN min_rating DECIMAL(3,2),
    IN user_id_param VARCHAR(36)
)
BEGIN
    SELECT
        r.*,
        u.name as author_name,
        CASE WHEN uf.id IS NOT NULL THEN TRUE ELSE FALSE END as is_favorited,
        CASE WHEN uf.id IS NOT NULL THEN uf.category ELSE NULL END as favorite_category
    FROM recipes r
    LEFT JOIN users u ON r.user_id = u.id
    LEFT JOIN user_favorites uf ON r.id = uf.recipe_id AND uf.user_id = user_id_param
    WHERE r.is_active = TRUE
    AND (r.deleted_at IS NULL OR r.deleted_at > NOW())
    AND (search_term IS NULL OR MATCH(r.title, r.description, r.instructions) AGAINST(search_term IN NATURAL LANGUAGE MODE))
    AND (category_filter IS NULL OR r.category = category_filter)
    AND (cuisine_filter IS NULL OR r.cuisine = cuisine_filter)
    AND (max_prep_time IS NULL OR r.prep_time <= max_prep_time)
    AND (difficulty_filter IS NULL OR r.difficulty = difficulty_filter)
    AND (min_rating IS NULL OR r.rating >= min_rating)
    ORDER BY r.rating DESC, r.review_count DESC, r.created_at DESC;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS update_recipe_rating;
DELIMITER $$
CREATE PROCEDURE update_recipe_rating(IN recipe_id_param VARCHAR(36))
BEGIN
    UPDATE recipes
    SET
        rating = COALESCE((
            SELECT AVG(rating)
            FROM recipe_reviews
            WHERE recipe_id = recipe_id_param AND is_active = TRUE
        ), 0),
        review_count = COALESCE((
            SELECT COUNT(*)
            FROM recipe_reviews
            WHERE recipe_id = recipe_id_param AND is_active = TRUE
        ), 0)
    WHERE id = recipe_id_param;
END$$
DELIMITER ;

-- Create indexes for better performance
CREATE INDEX idx_recipes_search ON recipes(title, description, instructions);
CREATE INDEX idx_recipes_category_cuisine ON recipes(category, cuisine);
CREATE INDEX idx_recipes_rating_reviews ON recipes(rating, review_count);
CREATE INDEX idx_recipes_featured_rating ON recipes(is_featured, rating);
CREATE INDEX idx_user_favorites_user_category ON user_favorites(user_id, category);
CREATE INDEX idx_user_favorites_pinned ON user_favorites(is_pinned, user_id);
CREATE INDEX idx_meal_entries_user_date ON meal_entries(user_id, entry_date);
CREATE INDEX idx_recipe_reviews_recipe_active ON recipe_reviews(recipe_id, is_active);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at);

-- Create a summary of all constraints added
SELECT
    'Data validation constraints have been successfully added to all tables' as message,
    COUNT(*) as total_constraints_added
FROM information_schema.TABLE_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = 'savoryflavors'
AND CONSTRAINT_TYPE = 'CHECK';
