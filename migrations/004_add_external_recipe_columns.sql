-- Migration to add columns for external recipe imports

-- Add columns to recipes table if they don't exist
ALTER TABLE `recipes` 
ADD COLUMN IF NOT EXISTS `is_external` BOOLEAN DEFAULT FALSE AFTER `is_public`,
ADD COLUMN IF NOT EXISTS `external_source` VARCHAR(50) DEFAULT NULL AFTER `is_external`,
ADD COLUMN IF NOT EXISTS `external_id` VARCHAR(100) DEFAULT NULL AFTER `external_source`,
ADD COLUMN IF NOT EXISTS `external_url` VARCHAR(500) DEFAULT NULL AFTER `external_id`,
ADD COLUMN IF NOT EXISTS `is_approved` BOOLEAN DEFAULT TRUE AFTER `is_public`;

-- Add index for external_id if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = 'recipes';
SET @indexname = 'idx_external_source_id';
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
        WHERE `table_schema` = @dbname
        AND `table_name` = @tablename
        AND `index_name` = @indexname
    ) > 0,
    'SELECT 1',
    CONCAT('CREATE INDEX ', @indexname, ' ON ', @tablename, ' (external_source, external_id)')));

PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing recipes to be approved by default
UPDATE `recipes` SET `is_approved` = TRUE WHERE `is_approved` IS NULL;
