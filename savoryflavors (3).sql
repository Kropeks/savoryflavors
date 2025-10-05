-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 05, 2025 at 03:15 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `savoryflavors`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_column_if_not_exists` (IN `db_name` VARCHAR(100), IN `table_name` VARCHAR(100), IN `column_name` VARCHAR(100), IN `column_definition` VARCHAR(1000))   BEGIN
    SET @db = db_name;
    SET @tab = table_name;
    SET @col = column_name;
    SET @def = column_definition;
    
    SET @preparedStatement = (SELECT IF(
        (
            SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
            WHERE (TABLE_SCHEMA = @db)
            AND (TABLE_NAME = @tab)
            AND (COLUMN_NAME = @col)
        ) = 0,
        CONCAT('ALTER TABLE ', @tab, ' ADD COLUMN ', @col, ' ', @def, ';'),
        CONCAT('SELECT "Column ', @col, ' already exists" AS message;')
    ));
    
    PREPARE stmt FROM @preparedStatement;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `add_recipe_ingredient` (IN `p_recipe_id` INT, IN `p_name` VARCHAR(255), IN `p_amount` DECIMAL(10,2), IN `p_unit` VARCHAR(50), IN `p_notes` TEXT, IN `p_position` INT)   BEGIN
    DECLARE v_ingredient_id INT;
    
    -- Check if ingredient exists
    SELECT id INTO v_ingredient_id FROM ingredients WHERE name = p_name LIMIT 1;
    
    -- Insert the recipe ingredient
    INSERT INTO recipe_ingredients (
        recipe_id,
        ingredient_id,
        name,
        amount,
        unit,
        notes,
        `order`,
        position,
        is_optional,
        updated_at
    ) VALUES (
        p_recipe_id,
        v_ingredient_id, -- Can be NULL if ingredient doesn't exist
        p_name,
        p_amount,
        p_unit,
        p_notes,
        p_position, -- Using the same value for both order and position for now
        p_position,
        0, -- is_optional = false
        CURRENT_TIMESTAMP()
    );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `create_recipe` (IN `p_title` VARCHAR(255), IN `p_description` TEXT, IN `p_instructions` TEXT, IN `p_prep_time` INT, IN `p_cook_time` INT, IN `p_servings` INT, IN `p_difficulty` ENUM('EASY','MEDIUM','HARD'), IN `p_category` VARCHAR(100), IN `p_cuisine` VARCHAR(100), IN `p_user_id` INT, OUT `p_recipe_id` INT)   BEGIN
    DECLARE v_recipe_id INT;
    DECLARE v_slug VARCHAR(255);
    
    -- Generate a slug from the title
    SET v_slug = LOWER(REPLACE(REPLACE(REPLACE(p_title, ' ', '-'), '.', ''), ',', ''));
    
    -- Insert the new recipe
    INSERT INTO recipes (
        user_id,
        title,
        slug,
        description,
        prep_time,
        cook_time,
        servings,
        difficulty,
        category,
        cuisine,
        is_public,
        status,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        p_title,
        v_slug,
        p_description,
        p_prep_time,
        p_cook_time,
        p_servings,
        p_difficulty,
        p_category,
        p_cuisine,
        0, -- is_public = false
        'DRAFT', -- status
        CURRENT_TIMESTAMP(3),
        CURRENT_TIMESTAMP(3)
    );
    
    -- Get the last insert ID
    SET v_recipe_id = LAST_INSERT_ID();
    
    -- Set the output parameter
    SET p_recipe_id = v_recipe_id;
END$$

--
-- Functions
--
CREATE DEFINER=`root`@`localhost` FUNCTION `calculate_recipe_difficulty` (`p_ingredient_count` INT, `p_step_count` INT, `p_cook_time` INT) RETURNS ENUM('easy','medium','hard') CHARSET utf8mb4 COLLATE utf8mb4_general_ci DETERMINISTIC BEGIN
    DECLARE difficulty_score INT;
    
    -- Calculate difficulty score (higher means more difficult)
    SET difficulty_score = 
        LEAST(10, p_ingredient_count) + 
        LEAST(15, p_step_count) + 
        LEAST(5, p_cook_time / 30);
    
    -- Return difficulty level based on score
    IF difficulty_score < 15 THEN
        RETURN 'easy';
    ELSEIF difficulty_score < 25 THEN
        RETURN 'medium';
    ELSE
        RETURN 'hard';
    END IF;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `provider` varchar(255) NOT NULL,
  `provider_account_id` varchar(255) NOT NULL,
  `refresh_token` text DEFAULT NULL,
  `access_token` text DEFAULT NULL,
  `expires_at` int(11) DEFAULT NULL,
  `token_type` varchar(255) DEFAULT NULL,
  `scope` varchar(255) DEFAULT NULL,
  `id_token` text DEFAULT NULL,
  `session_state` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admin_settings`
--

CREATE TABLE `admin_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`setting_value`)),
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_settings`
--

INSERT INTO `admin_settings` (`id`, `setting_key`, `setting_value`, `description`, `created_at`, `updated_at`) VALUES
(1, 'site_maintenance', '{\"enabled\": false, \"message\": \"\"}', 'Whether the site is in maintenance mode', '2025-09-29 10:10:41', '2025-09-29 10:10:41'),
(2, 'registration_enabled', 'true', 'Whether new user registration is enabled', '2025-09-29 10:10:41', '2025-09-29 10:10:41'),
(3, 'default_user_role', '\"user\"', 'Default role for new users', '2025-09-29 10:10:41', '2025-09-29 10:10:41'),
(4, 'verification_required', 'false', 'Whether email verification is required', '2025-09-29 10:10:41', '2025-09-29 10:10:41');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 76, 'UPDATE_RECIPE_STATUS', 'recipe', 0, NULL, '{\"status\":\"approved\",\"feedback\":\"Recipe approved\"}', NULL, NULL, '2025-10-04 23:11:45'),
(2, 76, 'UPDATE_RECIPE_STATUS', 'recipe', 0, NULL, '{\"status\":\"approved\",\"feedback\":\"Recipe approved\"}', NULL, NULL, '2025-10-04 23:12:36'),
(3, 76, 'UPDATE_RECIPE_STATUS', 'recipe', 0, NULL, '{\"status\":\"approved\",\"feedback\":\"Recipe approved\"}', NULL, NULL, '2025-10-04 23:12:39'),
(4, 76, 'UPDATE_RECIPE_STATUS', 'recipe', 0, NULL, '{\"status\":\"approved\",\"feedback\":\"Recipe approved\"}', NULL, NULL, '2025-10-04 23:12:40'),
(5, 76, 'UPDATE_RECIPE_STATUS', 'recipe', 0, NULL, '{\"status\":\"approved\",\"feedback\":\"Recipe approved\"}', NULL, NULL, '2025-10-04 23:12:41'),
(6, 76, 'UPDATE_RECIPE_STATUS', 'recipe', 0, NULL, '{\"status\":\"approved\",\"feedback\":\"Recipe approved\"}', NULL, NULL, '2025-10-04 23:12:42'),
(7, 76, 'UPDATE_RECIPE_STATUS', 'recipe', 0, NULL, '{\"status\":\"approved\",\"feedback\":\"Recipe approved\"}', NULL, NULL, '2025-10-04 23:12:43'),
(8, 76, 'UPDATE_RECIPE_STATUS', 'recipe', 0, NULL, '{\"status\":\"approved\",\"feedback\":\"Recipe approved\"}', NULL, NULL, '2025-10-04 23:12:44'),
(9, 76, 'UPDATE_RECIPE_STATUS', 'recipe', 6, NULL, '{\"status\":\"approved\",\"feedback\":\"Recipe approved\"}', NULL, NULL, '2025-10-04 23:25:24');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image`, `created_at`, `updated_at`) VALUES
(1, 'Breakfast', 'breakfast', 'Morning meals to start your day right', NULL, '2025-09-28 13:42:04.000', '2025-09-28 13:42:04.000'),
(2, 'Lunch', 'lunch', 'Midday meals for energy', NULL, '2025-09-28 13:42:04.000', '2025-09-28 13:42:04.000'),
(3, 'Dinner', 'dinner', 'Evening meals to enjoy', NULL, '2025-09-28 13:42:04.000', '2025-09-28 13:42:04.000'),
(4, 'Dessert', 'dessert', 'Sweet treats and desserts', NULL, '2025-09-28 13:42:04.000', '2025-09-28 13:42:04.000'),
(5, 'Appetizer', 'appetizer', 'Starters and snacks', NULL, '2025-09-28 13:42:04.000', '2025-09-28 13:42:04.000'),
(6, 'Salad', 'salad', 'Fresh and healthy salads', NULL, '2025-09-28 13:42:04.000', '2025-09-28 13:42:04.000'),
(7, 'Soup', 'soup', 'Warm and comforting soups', NULL, '2025-09-28 13:42:04.000', '2025-09-28 13:42:04.000'),
(8, 'Main Course', 'main-course', 'Hearty main dishes', NULL, '2025-09-28 13:42:04.000', '2025-09-28 13:42:04.000'),
(9, 'Side Dish', 'side-dish', 'Perfect accompaniments', NULL, '2025-09-28 13:42:04.000', '2025-09-28 13:42:04.000'),
(10, 'Beverage', 'beverage', 'Drinks and beverages', NULL, '2025-09-28 13:42:04.000', '2025-09-28 13:42:04.000');

-- --------------------------------------------------------

--
-- Table structure for table `collections`
--

CREATE TABLE `collections` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 0,
  `cover_image` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `collection_recipes`
--

CREATE TABLE `collection_recipes` (
  `collection_id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `added_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL COMMENT 'For nested comments',
  `content` text NOT NULL,
  `is_edited` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cuisines`
--

CREATE TABLE `cuisines` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `country_code` char(2) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cuisines`
--

INSERT INTO `cuisines` (`id`, `name`, `slug`, `description`, `image`, `country_code`, `created_at`, `updated_at`) VALUES
(1, 'American', 'american', NULL, NULL, 'US', '2025-09-28 13:42:04.000', '2025-09-28 13:42:04.000'),
(2, 'Italian', 'italian', NULL, NULL, 'IT', '2025-09-28 13:42:04.000', '2025-09-28 13:42:04.000'),
(3, 'Mexican', 'mexican', NULL, NULL, 'MX', '2025-09-28 13:42:04.000', '2025-09-28 13:42:04.000'),
(4, 'Chinese', 'chinese', NULL, NULL, 'CN', '2025-09-28 13:42:04.000', '2025-09-28 13:42:04.000'),
(5, 'Indian', 'indian', NULL, NULL, 'IN', '2025-09-28 13:42:04.000', '2025-09-28 13:42:04.000'),
(6, 'Japanese', 'japanese', NULL, NULL, 'JP', '2025-09-28 13:42:04.000', '2025-09-28 13:42:04.000'),
(7, 'Thai', 'thai', NULL, NULL, 'TH', '2025-09-28 13:42:04.000', '2025-09-28 13:42:04.000'),
(8, 'French', 'french', NULL, NULL, 'FR', '2025-09-28 13:42:04.000', '2025-09-28 13:42:04.000'),
(9, 'Mediterranean', 'mediterranean', NULL, NULL, NULL, '2025-09-28 13:42:04.000', '2025-09-28 13:42:04.000'),
(10, 'Middle Eastern', 'middle-eastern', NULL, NULL, NULL, '2025-09-28 13:42:04.000', '2025-09-28 13:42:04.000'),
(11, 'Filipino', '', NULL, NULL, NULL, '2025-10-02 17:37:00.499', '0000-00-00 00:00:00.000');

-- --------------------------------------------------------

--
-- Table structure for table `ingredients`
--

CREATE TABLE `ingredients` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `instructions`
--

CREATE TABLE `instructions` (
  `id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `step_number` int(11) NOT NULL,
  `instruction` text NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `instructions`
--

INSERT INTO `instructions` (`id`, `recipe_id`, `step_number`, `instruction`, `image`, `video_url`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Marinate', NULL, NULL, '2025-10-05 02:26:48.302', '2025-10-05 02:26:48.302'),
(2, 6, 1, 'Thaw Pork meat', NULL, NULL, '2025-10-05 04:17:03.484', '2025-10-05 04:17:03.484'),
(3, 7, 1, 'grill', NULL, NULL, '2025-10-05 08:28:48.639', '2025-10-05 08:28:48.639');

-- --------------------------------------------------------

--
-- Table structure for table `meal_plans`
--

CREATE TABLE `meal_plans` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meal_plan_days`
--

CREATE TABLE `meal_plan_days` (
  `id` int(11) NOT NULL,
  `meal_plan_id` int(11) NOT NULL,
  `day_number` int(11) NOT NULL,
  `date` date DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meal_plan_meals`
--

CREATE TABLE `meal_plan_meals` (
  `id` int(11) NOT NULL,
  `day_id` int(11) NOT NULL,
  `meal_type` enum('BREAKFAST','LUNCH','DINNER','SNACK') NOT NULL,
  `recipe_id` int(11) DEFAULT NULL,
  `custom_meal_name` varchar(255) DEFAULT NULL,
  `custom_meal_description` text DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `related_id` int(11) DEFAULT NULL COMMENT 'ID of the related entity (recipe, comment, etc.)',
  `related_type` varchar(50) DEFAULT NULL COMMENT 'Type of the related entity',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nutritional_info`
--

CREATE TABLE `nutritional_info` (
  `recipe_id` int(11) NOT NULL,
  `calories` decimal(10,2) DEFAULT NULL,
  `protein` decimal(10,2) DEFAULT NULL COMMENT 'in grams',
  `carbs` decimal(10,2) DEFAULT NULL COMMENT 'in grams',
  `fats` decimal(10,2) DEFAULT NULL COMMENT 'in grams',
  `fiber` decimal(10,2) DEFAULT NULL COMMENT 'in grams',
  `sugar` decimal(10,2) DEFAULT NULL COMMENT 'in grams',
  `sodium` decimal(10,2) DEFAULT NULL COMMENT 'in mg',
  `cholesterol` decimal(10,2) DEFAULT NULL COMMENT 'in mg',
  `is_auto_calculated` tinyint(1) NOT NULL DEFAULT 1,
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `recipes`
--

CREATE TABLE `recipes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `is_public` tinyint(1) DEFAULT 0 COMMENT 'Whether the recipe is visible to public',
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `prep_time` int(11) DEFAULT NULL COMMENT 'in minutes',
  `cook_time` int(11) DEFAULT NULL COMMENT 'in minutes',
  `servings` int(11) DEFAULT NULL,
  `difficulty` enum('EASY','MEDIUM','HARD') DEFAULT 'MEDIUM' COMMENT 'Recipe difficulty level',
  `category` varchar(100) DEFAULT NULL COMMENT 'Recipe category',
  `cuisine` varchar(100) DEFAULT NULL COMMENT 'Cuisine type',
  `image` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `is_private` tinyint(1) NOT NULL DEFAULT 0,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `views` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `approval_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `approved_by` varchar(36) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejected_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `submitted_at` datetime(3) DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `recipes`
--

INSERT INTO `recipes` (`id`, `user_id`, `is_public`, `title`, `slug`, `description`, `prep_time`, `cook_time`, `servings`, `difficulty`, `category`, `cuisine`, `image`, `video_url`, `is_private`, `is_featured`, `status`, `views`, `created_at`, `updated_at`, `approval_status`, `admin_notes`, `approved_by`, `approved_at`, `rejected_at`, `rejection_reason`, `submitted_at`) VALUES
(1, 76, 1, 'Adobo', 'adobo-mgclubn2', 'adobo', 15, 50, 3, 'MEDIUM', 'main-course', 'american', NULL, NULL, 0, 0, 'PUBLISHED', 0, '2025-10-05 02:26:48.302', '2025-10-05 02:26:48.302', 'approved', NULL, NULL, NULL, NULL, NULL, '2025-10-05 02:26:48.306'),
(6, 76, 0, 'Sinigang', 'sinigang-mgcps3y4', 'baboy', 15, 60, 6, 'EASY', 'main-course', 'american', NULL, NULL, 0, 0, 'DRAFT', 0, '2025-10-05 04:17:03.484', '2025-10-05 07:25:24.000', 'approved', NULL, NULL, NULL, NULL, NULL, '2025-10-05 04:17:03.484'),
(7, 76, 1, 'Grilled Chicken Penne al Fresco', 'grilled chicken penne al fresco-mgcyrv5r', 'chicken', 20, 90, 6, 'HARD', 'main-course', 'french', NULL, NULL, 0, 0, 'PUBLISHED', 0, '2025-10-05 08:28:48.639', '2025-10-05 08:28:48.639', 'approved', NULL, NULL, NULL, NULL, NULL, '2025-10-05 08:28:48.639');

--
-- Triggers `recipes`
--
DELIMITER $$
CREATE TRIGGER `before_recipe_update` BEFORE UPDATE ON `recipes` FOR EACH ROW BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `recipe_categories`
--

CREATE TABLE `recipe_categories` (
  `recipe_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `recipe_cuisines`
--

CREATE TABLE `recipe_cuisines` (
  `recipe_id` int(11) NOT NULL,
  `cuisine_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `recipe_ingredients`
--

CREATE TABLE `recipe_ingredients` (
  `id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `ingredient_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `amount` decimal(10,2) DEFAULT NULL COMMENT 'Amount of the ingredient',
  `unit` varchar(50) DEFAULT NULL COMMENT 'Unit of measurement',
  `notes` varchar(255) DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `position` int(11) DEFAULT 0 COMMENT 'Order of the ingredient in the list',
  `is_optional` tinyint(1) DEFAULT 0 COMMENT 'Whether the ingredient is optional',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Last update timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores ingredients for each recipe with amounts and units';

--
-- Dumping data for table `recipe_ingredients`
--

INSERT INTO `recipe_ingredients` (`id`, `recipe_id`, `ingredient_id`, `name`, `amount`, `unit`, `notes`, `order`, `position`, `is_optional`, `updated_at`) VALUES
(31, 1, NULL, 'chicken', 1.00, 'kg', NULL, 1, 1, 0, '2025-10-04 18:26:48'),
(32, 6, NULL, 'Pork meat', 1.00, 'kg', NULL, 1, 1, 0, '2025-10-04 20:17:03'),
(33, 7, NULL, 'Chicken', 1.00, 'kg', NULL, 1, 1, 0, '2025-10-05 00:28:48');

--
-- Triggers `recipe_ingredients`
--
DELIMITER $$
CREATE TRIGGER `before_recipe_ingredient_update` BEFORE UPDATE ON `recipe_ingredients` FOR EACH ROW BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `recipe_status_history`
--

CREATE TABLE `recipe_status_history` (
  `id` int(11) NOT NULL,
  `recipe_id` varchar(191) NOT NULL,
  `status` enum('pending','approved','rejected','draft','published','archived') NOT NULL,
  `changed_by` varchar(191) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `recipe_status_history`
--

INSERT INTO `recipe_status_history` (`id`, `recipe_id`, `status`, `changed_by`, `notes`, `created_at`) VALUES
(2, 'sinigang-mgcps3y4', 'approved', '76', 'Status changed to approved', '2025-10-04 23:11:45'),
(3, 'sinigang-mgcps3y4', 'approved', '76', 'Status changed to approved', '2025-10-04 23:12:36'),
(4, 'sinigang-mgcps3y4', 'approved', '76', 'Status changed to approved', '2025-10-04 23:12:39'),
(5, 'sinigang-mgcps3y4', 'approved', '76', 'Status changed to approved', '2025-10-04 23:12:40'),
(6, 'sinigang-mgcps3y4', 'approved', '76', 'Status changed to approved', '2025-10-04 23:12:41'),
(7, 'sinigang-mgcps3y4', 'approved', '76', 'Status changed to approved', '2025-10-04 23:12:42'),
(8, 'sinigang-mgcps3y4', 'approved', '76', 'Status changed to approved', '2025-10-04 23:12:43'),
(9, 'sinigang-mgcps3y4', 'approved', '76', 'Status changed to approved', '2025-10-04 23:12:44'),
(10, '6', 'approved', '76', 'Status changed to approved', '2025-10-04 23:25:24');

-- --------------------------------------------------------

--
-- Table structure for table `recipe_tags`
--

CREATE TABLE `recipe_tags` (
  `recipe_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `reporter_id` int(11) NOT NULL,
  `reported_item_id` int(11) NOT NULL,
  `reported_item_type` enum('recipe','comment','user') NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','reviewed','resolved','dismissed') NOT NULL DEFAULT 'pending',
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schema_migrations`
--

CREATE TABLE `schema_migrations` (
  `version` varchar(255) NOT NULL,
  `applied_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schema_migrations`
--

INSERT INTO `schema_migrations` (`version`, `applied_at`) VALUES
('005_add_recipe_creation_columns', '2025-09-30 17:56:23');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `expires` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shopping_lists`
--

CREATE TABLE `shopping_lists` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shopping_list_items`
--

CREATE TABLE `shopping_list_items` (
  `id` int(11) NOT NULL,
  `shopping_list_id` int(11) NOT NULL,
  `ingredient_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `is_purchased` tinyint(1) NOT NULL DEFAULT 0,
  `notes` varchar(255) DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `status` enum('active','canceled','expired','past_due') NOT NULL DEFAULT 'active',
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `canceled_at` datetime DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `last_payment_date` datetime DEFAULT NULL,
  `next_billing_date` datetime DEFAULT NULL,
  `stripe_subscription_id` varchar(100) DEFAULT NULL,
  `stripe_customer_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `subscriptions`
--
DELIMITER $$
CREATE TRIGGER `after_subscription_update` AFTER UPDATE ON `subscriptions` FOR EACH ROW BEGIN
    IF NEW.status = 'active' THEN
        UPDATE `users` 
        SET `subscription_status` = 'active',
            `current_subscription_id` = NEW.id
        WHERE `id` = NEW.user_id;
    ELSEIF NEW.status IN ('canceled', 'expired') THEN
        UPDATE `users` 
        SET `subscription_status` = NEW.status
        WHERE `id` = NEW.user_id AND `current_subscription_id` = NEW.id;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `subscription_invoices`
--

CREATE TABLE `subscription_invoices` (
  `id` int(11) NOT NULL,
  `subscription_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'USD',
  `status` enum('paid','pending','failed','refunded') NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `stripe_payment_intent_id` varchar(255) DEFAULT NULL,
  `stripe_invoice_id` varchar(255) DEFAULT NULL,
  `billing_period_start` datetime DEFAULT NULL,
  `billing_period_end` datetime DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscription_payments`
--

CREATE TABLE `subscription_payments` (
  `id` int(11) NOT NULL,
  `subscription_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'USD',
  `status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `receipt_url` varchar(255) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `billing_cycle` enum('monthly','yearly') NOT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `plan_id` varchar(50) NOT NULL COMMENT 'Unique identifier for the plan (e.g., basic, premium)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `role` enum('USER','ADMIN') NOT NULL DEFAULT 'USER',
  `email_verified` tinyint(1) DEFAULT 0,
  `subscription_status` enum('active','canceled','expired','none') NOT NULL DEFAULT 'none',
  `current_subscription_id` int(11) DEFAULT NULL,
  `verification_token` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `image`, `role`, `email_verified`, `subscription_status`, `current_subscription_id`, `verification_token`, `reset_token`, `reset_token_expires`, `created_at`, `updated_at`, `is_verified`) VALUES
(6, 'Matty', 'test@example.com', '$2a$12$PZmy2y8YnHkuOvFb4Z8IM.fKEwWTpqjzJ42zbsSvN2JsIdRTaUWoG', NULL, 'USER', 127, 'none', NULL, NULL, NULL, NULL, '2025-09-28 21:51:12.129', '2025-10-05 08:59:25.905', 1),
(7, 'Test User', 'test-1759067601307@example.com', NULL, NULL, 'USER', 127, 'none', NULL, NULL, NULL, NULL, '2025-09-28 21:53:21.309', '0000-00-00 00:00:00.000', 0),
(9, 'Test User', 'test-1759067776395@example.com', '$2a$12$KxG8NxY3nX1MqB8zL5kQkOQ5VQ1X9JcX9JcX9JcX9JcX9JcX9Jc', NULL, 'USER', 127, 'none', NULL, NULL, NULL, NULL, '2025-09-28 21:56:16.396', '0000-00-00 00:00:00.000', 0),
(73, 'JOhn Doe', 'admin1@example.com', '$2a$12$oQDoS65ajhJyl5VGqsrIRe/4GwcdlwIgEvQnJ3/waW3gw7UNbMthq', NULL, 'USER', 127, 'none', NULL, NULL, NULL, NULL, '2025-09-28 22:00:01.000', '2025-09-28 22:00:01.000', 0),
(76, 'Admin User', 'savoryadmin@example.com', '$2a$10$Z67wwG4ZRJWVxmlUVArm3OANk./kOLqa/xZsj981q90WJF8EPmKZ6', NULL, 'ADMIN', 0, 'none', NULL, NULL, NULL, NULL, '2025-09-29 19:46:22.175', '0000-00-00 00:00:00.000', 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_auth_providers`
--

CREATE TABLE `user_auth_providers` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `provider` enum('GOOGLE','GITHUB','FACEBOOK','CREDENTIALS') NOT NULL,
  `provider_user_id` varchar(255) NOT NULL,
  `access_token` text DEFAULT NULL,
  `refresh_token` text DEFAULT NULL,
  `expires_at` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_favorites`
--

CREATE TABLE `user_favorites` (
  `user_id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_followers`
--

CREATE TABLE `user_followers` (
  `follower_id` int(11) NOT NULL,
  `following_id` int(11) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `user_id` int(11) NOT NULL,
  `bio` text DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `social_links` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`social_links`)),
  `dietary_preferences` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dietary_preferences`)),
  `notifications_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `email_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_subscriptions`
--

CREATE TABLE `user_subscriptions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `paymongo_subscription_id` varchar(255) NOT NULL,
  `status` enum('active','past_due','unpaid','canceled','incomplete','incomplete_expired','trialing') NOT NULL,
  `current_period_start` datetime NOT NULL,
  `current_period_end` datetime NOT NULL,
  `cancel_at_period_end` tinyint(1) DEFAULT 0,
  `canceled_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_subscription_features`
--

CREATE TABLE `user_subscription_features` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `feature` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `verification_requests`
--

CREATE TABLE `verification_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `document_url` varchar(255) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `verification_tokens`
--

CREATE TABLE `verification_tokens` (
  `id` int(11) NOT NULL,
  `identifier` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_recipe_details`
-- (See below for the actual view)
--
CREATE TABLE `vw_recipe_details` (
`id` int(11)
,`user_id` int(11)
,`is_public` tinyint(1)
,`title` varchar(255)
,`slug` varchar(255)
,`description` text
,`prep_time` int(11)
,`cook_time` int(11)
,`servings` int(11)
,`difficulty` enum('EASY','MEDIUM','HARD')
,`category` varchar(100)
,`cuisine` varchar(100)
,`image` varchar(255)
,`video_url` varchar(255)
,`is_private` tinyint(1)
,`is_featured` tinyint(1)
,`status` enum('DRAFT','PUBLISHED','ARCHIVED')
,`views` int(11)
,`created_at` datetime(3)
,`updated_at` datetime(3)
,`author_name` varchar(100)
,`author_image` varchar(255)
,`favorite_count` bigint(21)
,`average_rating` decimal(14,4)
,`rating_count` bigint(21)
,`comment_count` bigint(21)
,`primary_category` varchar(100)
,`primary_cuisine` varchar(100)
);

-- --------------------------------------------------------

--
-- Structure for view `vw_recipe_details`
--
DROP TABLE IF EXISTS `vw_recipe_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_recipe_details`  AS SELECT `r`.`id` AS `id`, `r`.`user_id` AS `user_id`, `r`.`is_public` AS `is_public`, `r`.`title` AS `title`, `r`.`slug` AS `slug`, `r`.`description` AS `description`, `r`.`prep_time` AS `prep_time`, `r`.`cook_time` AS `cook_time`, `r`.`servings` AS `servings`, `r`.`difficulty` AS `difficulty`, `r`.`category` AS `category`, `r`.`cuisine` AS `cuisine`, `r`.`image` AS `image`, `r`.`video_url` AS `video_url`, `r`.`is_private` AS `is_private`, `r`.`is_featured` AS `is_featured`, `r`.`status` AS `status`, `r`.`views` AS `views`, `r`.`created_at` AS `created_at`, `r`.`updated_at` AS `updated_at`, `u`.`name` AS `author_name`, `u`.`image` AS `author_image`, (select count(0) from `user_favorites` where `user_favorites`.`recipe_id` = `r`.`id`) AS `favorite_count`, (select avg(`reviews`.`rating`) from `reviews` where `reviews`.`recipe_id` = `r`.`id`) AS `average_rating`, (select count(0) from `reviews` where `reviews`.`recipe_id` = `r`.`id`) AS `rating_count`, (select count(0) from `comments` where `comments`.`recipe_id` = `r`.`id`) AS `comment_count`, (select `c`.`name` from (`categories` `c` join `recipe_categories` `rc` on(`c`.`id` = `rc`.`category_id`)) where `rc`.`recipe_id` = `r`.`id` limit 1) AS `primary_category`, (select `c`.`name` from (`cuisines` `c` join `recipe_cuisines` `rc` on(`c`.`id` = `rc`.`cuisine_id`)) where `rc`.`recipe_id` = `r`.`id` limit 1) AS `primary_cuisine` FROM (`recipes` `r` left join `users` `u` on(`r`.`user_id` = `u`.`id`)) WHERE `r`.`status` = 'PUBLISHED' ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `provider_provider_account_id` (`provider`,`provider_account_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `admin_settings`
--
ALTER TABLE `admin_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_logs_user_id` (`user_id`),
  ADD KEY `idx_audit_logs_entity` (`entity_type`,`entity_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_slug_key` (`slug`);

--
-- Indexes for table `collections`
--
ALTER TABLE `collections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `collection_recipes`
--
ALTER TABLE `collection_recipes`
  ADD PRIMARY KEY (`collection_id`,`recipe_id`),
  ADD KEY `recipe_id` (`recipe_id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `recipe_id` (`recipe_id`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Indexes for table `cuisines`
--
ALTER TABLE `cuisines`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cuisines_slug_key` (`slug`);

--
-- Indexes for table `ingredients`
--
ALTER TABLE `ingredients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ingredients_slug_key` (`slug`);

--
-- Indexes for table `instructions`
--
ALTER TABLE `instructions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `recipe_id` (`recipe_id`);

--
-- Indexes for table `meal_plans`
--
ALTER TABLE `meal_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `meal_plan_days`
--
ALTER TABLE `meal_plan_days`
  ADD PRIMARY KEY (`id`),
  ADD KEY `meal_plan_id` (`meal_plan_id`);

--
-- Indexes for table `meal_plan_meals`
--
ALTER TABLE `meal_plan_meals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `day_id` (`day_id`),
  ADD KEY `recipe_id` (`recipe_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `is_read` (`is_read`),
  ADD KEY `related` (`related_type`,`related_id`);

--
-- Indexes for table `nutritional_info`
--
ALTER TABLE `nutritional_info`
  ADD PRIMARY KEY (`recipe_id`);

--
-- Indexes for table `recipes`
--
ALTER TABLE `recipes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `recipes_slug_key` (`slug`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `status` (`status`),
  ADD KEY `idx_recipes_user_public` (`user_id`,`is_public`),
  ADD KEY `idx_approval_status` (`approval_status`);

--
-- Indexes for table `recipe_categories`
--
ALTER TABLE `recipe_categories`
  ADD PRIMARY KEY (`recipe_id`,`category_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `recipe_cuisines`
--
ALTER TABLE `recipe_cuisines`
  ADD PRIMARY KEY (`recipe_id`,`cuisine_id`),
  ADD KEY `cuisine_id` (`cuisine_id`);

--
-- Indexes for table `recipe_ingredients`
--
ALTER TABLE `recipe_ingredients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `recipe_id` (`recipe_id`),
  ADD KEY `ingredient_id` (`ingredient_id`),
  ADD KEY `idx_ingredients_recipe` (`recipe_id`,`position`);

--
-- Indexes for table `recipe_status_history`
--
ALTER TABLE `recipe_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_recipe_status_recipe_id` (`recipe_id`),
  ADD KEY `idx_recipe_status_status` (`status`),
  ADD KEY `idx_recipe_status_changed_by` (`changed_by`);

--
-- Indexes for table `recipe_tags`
--
ALTER TABLE `recipe_tags`
  ADD PRIMARY KEY (`recipe_id`,`tag_id`),
  ADD KEY `tag_id` (`tag_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reporter_id` (`reporter_id`),
  ADD KEY `reviewed_by` (`reviewed_by`),
  ADD KEY `idx_reports_status` (`status`),
  ADD KEY `idx_reports_reported_item` (`reported_item_type`,`reported_item_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reviews_user_id_recipe_id_key` (`user_id`,`recipe_id`),
  ADD KEY `recipe_id` (`recipe_id`);

--
-- Indexes for table `schema_migrations`
--
ALTER TABLE `schema_migrations`
  ADD PRIMARY KEY (`version`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `shopping_lists`
--
ALTER TABLE `shopping_lists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `shopping_list_items`
--
ALTER TABLE `shopping_list_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `shopping_list_id` (`shopping_list_id`),
  ADD KEY `ingredient_id` (`ingredient_id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_plan_id` (`plan_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_stripe_subscription_id` (`stripe_subscription_id`);

--
-- Indexes for table `subscription_invoices`
--
ALTER TABLE `subscription_invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscription_id` (`subscription_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `subscription_payments`
--
ALTER TABLE `subscription_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_subscription_id` (`subscription_id`),
  ADD KEY `idx_transaction_id` (`transaction_id`);

--
-- Indexes for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `plan_id` (`plan_id`),
  ADD KEY `idx_plan_slug` (`slug`),
  ADD KEY `idx_plan_active` (`is_active`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tags_slug_key` (`slug`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `users_verification_token_key` (`verification_token`),
  ADD UNIQUE KEY `users_reset_token_key` (`reset_token`),
  ADD KEY `fk_user_current_subscription` (`current_subscription_id`),
  ADD KEY `idx_user_subscription` (`subscription_status`,`current_subscription_id`);

--
-- Indexes for table `user_auth_providers`
--
ALTER TABLE `user_auth_providers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_auth_providers_provider_provider_user_id_key` (`provider`,`provider_user_id`),
  ADD KEY `user_auth_providers_user_id_fkey` (`user_id`);

--
-- Indexes for table `user_favorites`
--
ALTER TABLE `user_favorites`
  ADD PRIMARY KEY (`user_id`,`recipe_id`),
  ADD KEY `recipe_id` (`recipe_id`);

--
-- Indexes for table `user_followers`
--
ALTER TABLE `user_followers`
  ADD PRIMARY KEY (`follower_id`,`following_id`),
  ADD KEY `following_id` (`following_id`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `plan_id` (`plan_id`),
  ADD KEY `idx_user_subscription` (`user_id`,`status`),
  ADD KEY `idx_paymongo_id` (`paymongo_subscription_id`);

--
-- Indexes for table `user_subscription_features`
--
ALTER TABLE `user_subscription_features`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_user_feature` (`user_id`,`feature`);

--
-- Indexes for table `verification_requests`
--
ALTER TABLE `verification_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `reviewed_by` (`reviewed_by`),
  ADD KEY `idx_verification_requests_status` (`status`);

--
-- Indexes for table `verification_tokens`
--
ALTER TABLE `verification_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD UNIQUE KEY `identifier_token` (`identifier`,`token`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts`
--
ALTER TABLE `accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `admin_settings`
--
ALTER TABLE `admin_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `collections`
--
ALTER TABLE `collections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cuisines`
--
ALTER TABLE `cuisines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `ingredients`
--
ALTER TABLE `ingredients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `instructions`
--
ALTER TABLE `instructions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `meal_plans`
--
ALTER TABLE `meal_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `meal_plan_days`
--
ALTER TABLE `meal_plan_days`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `meal_plan_meals`
--
ALTER TABLE `meal_plan_meals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `recipes`
--
ALTER TABLE `recipes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `recipe_ingredients`
--
ALTER TABLE `recipe_ingredients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `recipe_status_history`
--
ALTER TABLE `recipe_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shopping_lists`
--
ALTER TABLE `shopping_lists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shopping_list_items`
--
ALTER TABLE `shopping_list_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscription_invoices`
--
ALTER TABLE `subscription_invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscription_payments`
--
ALTER TABLE `subscription_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT for table `user_auth_providers`
--
ALTER TABLE `user_auth_providers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_subscription_features`
--
ALTER TABLE `user_subscription_features`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `verification_requests`
--
ALTER TABLE `verification_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `verification_tokens`
--
ALTER TABLE `verification_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accounts`
--
ALTER TABLE `accounts`
  ADD CONSTRAINT `accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `collections`
--
ALTER TABLE `collections`
  ADD CONSTRAINT `collections_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `collection_recipes`
--
ALTER TABLE `collection_recipes`
  ADD CONSTRAINT `collection_recipes_collection_id_fkey` FOREIGN KEY (`collection_id`) REFERENCES `collections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `collection_recipes_recipe_id_fkey` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `comments_recipe_id_fkey` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `comments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `instructions`
--
ALTER TABLE `instructions`
  ADD CONSTRAINT `instructions_recipe_id_fkey` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `meal_plans`
--
ALTER TABLE `meal_plans`
  ADD CONSTRAINT `meal_plans_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `meal_plan_days`
--
ALTER TABLE `meal_plan_days`
  ADD CONSTRAINT `meal_plan_days_meal_plan_id_fkey` FOREIGN KEY (`meal_plan_id`) REFERENCES `meal_plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `meal_plan_meals`
--
ALTER TABLE `meal_plan_meals`
  ADD CONSTRAINT `meal_plan_meals_day_id_fkey` FOREIGN KEY (`day_id`) REFERENCES `meal_plan_days` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `meal_plan_meals_recipe_id_fkey` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `nutritional_info`
--
ALTER TABLE `nutritional_info`
  ADD CONSTRAINT `nutritional_info_recipe_id_fkey` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `recipes`
--
ALTER TABLE `recipes`
  ADD CONSTRAINT `recipes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `recipe_categories`
--
ALTER TABLE `recipe_categories`
  ADD CONSTRAINT `recipe_categories_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `recipe_categories_recipe_id_fkey` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `recipe_cuisines`
--
ALTER TABLE `recipe_cuisines`
  ADD CONSTRAINT `recipe_cuisines_cuisine_id_fkey` FOREIGN KEY (`cuisine_id`) REFERENCES `cuisines` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `recipe_cuisines_recipe_id_fkey` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `recipe_ingredients`
--
ALTER TABLE `recipe_ingredients`
  ADD CONSTRAINT `recipe_ingredients_ingredient_id_fkey` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `recipe_ingredients_recipe_id_fkey` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `recipe_tags`
--
ALTER TABLE `recipe_tags`
  ADD CONSTRAINT `recipe_tags_recipe_id_fkey` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `recipe_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_recipe_id_fkey` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shopping_lists`
--
ALTER TABLE `shopping_lists`
  ADD CONSTRAINT `shopping_lists_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `shopping_list_items`
--
ALTER TABLE `shopping_list_items`
  ADD CONSTRAINT `shopping_list_items_ingredient_id_fkey` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `shopping_list_items_shopping_list_id_fkey` FOREIGN KEY (`shopping_list_id`) REFERENCES `shopping_lists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `fk_subscription_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`),
  ADD CONSTRAINT `fk_subscription_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subscription_invoices`
--
ALTER TABLE `subscription_invoices`
  ADD CONSTRAINT `subscription_invoices_ibfk_1` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subscription_invoices_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subscription_payments`
--
ALTER TABLE `subscription_payments`
  ADD CONSTRAINT `fk_payment_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_current_subscription` FOREIGN KEY (`current_subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `user_auth_providers`
--
ALTER TABLE `user_auth_providers`
  ADD CONSTRAINT `user_auth_providers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_favorites`
--
ALTER TABLE `user_favorites`
  ADD CONSTRAINT `user_favorites_recipe_id_fkey` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_favorites_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_followers`
--
ALTER TABLE `user_followers`
  ADD CONSTRAINT `user_followers_follower_id_fkey` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_followers_following_id_fkey` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `user_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD CONSTRAINT `user_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_subscriptions_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`);

--
-- Constraints for table `user_subscription_features`
--
ALTER TABLE `user_subscription_features`
  ADD CONSTRAINT `fk_feature_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `verification_requests`
--
ALTER TABLE `verification_requests`
  ADD CONSTRAINT `verification_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `verification_requests_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
