-- Create table to track admin changes to recipe moderation status
CREATE TABLE IF NOT EXISTS recipe_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id VARCHAR(191) NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'draft', 'published', 'archived') NOT NULL,
    changed_by VARCHAR(191) DEFAULT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_recipe_status_recipe_id (recipe_id),
    INDEX idx_recipe_status_status (status),
    INDEX idx_recipe_status_changed_by (changed_by)
);
