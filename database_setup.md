# SavoryFlavors Database Setup Guide - Complete with FitSavory

## Prerequisites

1. **MySQL Server** - Install MySQL 8.0 or higher
2. **Node.js** - Install Node.js 18+ and npm
3. **Database Access** - Create a MySQL user with database creation privileges

## Environment Setup

1. **Update Environment Variables**
   Edit the `.env` file in the project root:

   ```env
   # Database
   DATABASE_URL="mysql://username:password@localhost:3306/savoryflavors"

   # Replace with your actual database credentials
   # username: your MySQL username (e.g., 'root')
   # password: your MySQL password
   # localhost: your database host
   # 3306: your MySQL port (default is 3306)
   # savoryflavors: your database name
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

## Database Setup Steps

### Option 1: Using MySQL Command Line (Recommended)

1. **Connect to MySQL**
   ```bash
   mysql -u root -p
   ```

2. **Create Database**
   ```sql
   CREATE DATABASE IF NOT EXISTS savoryflavors;
   ```

3. **Run Schema**
   ```bash
   mysql -u root -p savoryflavors < database_schema.sql
   ```

### Option 2: Using Database GUI Tools

1. Open your preferred MySQL GUI tool (MySQL Workbench, phpMyAdmin, etc.)
2. Create a new database named `savoryflavors`
3. Run the SQL from `database_schema.sql` file

### Option 3: Using Database Setup Script

1. **Make script executable**
   ```bash
   chmod +x setup_database.sh
   ```

2. **Run setup script**
   ```bash
   ./setup_database.sh
   ```

## Database Schema Overview - Complete with FitSavory

### Core Tables

1. **users** - User accounts and authentication
2. **user_profiles** - FitSavory user profiles with fitness goals, preferences, and stats
3. **sessions** - NextAuth session management
4. **accounts** - OAuth provider accounts
5. **verification_tokens** - Email verification tokens

### Recipe Management Tables

6. **recipes** - Recipe storage with enhanced features for FitSavory
7. **recipe_ingredients** - Ingredients for each recipe with nutrition data
8. **recipe_instructions** - Step-by-step instructions with timers and tips
9. **user_favorites** - User's favorite recipes
10. **recipe_reviews** - User reviews and ratings with helpful votes
11. **recipe_collections** - User recipe collections (favorites, meal plans, custom)
12. **recipe_collection_items** - Items in collections

### FitSavory Nutrition & Fitness Tables

13. **meal_entries** - Daily meal tracking with detailed nutrition and mood data
14. **diet_plans** - Comprehensive diet plans with goals, progress, and adherence tracking
15. **diet_plan_logs** - Daily logs for diet plan progress
16. **user_foods** - Personal food library with nutrition data and reviews
17. **user_food_reviews** - Reviews for foods in the library
18. **calendar_events** - Calendar events for meals, workouts, goals, reminders
19. **progress_photos** - Progress photos with body measurements
20. **user_achievements** - Achievement system for streaks, goals, and milestones
21. **workout_sessions** - Workout tracking with mood and energy levels
22. **water_intake** - Water intake tracking

### Supporting Tables

23. **shopping_lists** - Shopping lists linked to meal plans
24. **shopping_list_items** - Items in shopping lists with prices and categories

## Schema Features

### Enhanced Recipe System
- **Nutrition tracking** per ingredient and recipe
- **Recipe verification** system
- **Public/private** recipe sharing
- **Rating and review** system with helpful votes
- **Recipe collections** for organization

### Comprehensive FitSavory Features
- **User profiles** with fitness goals and preferences
- **Meal tracking** with mood and satisfaction levels
- **Diet plans** with progress monitoring and adherence rates
- **Personal food library** with barcode scanning support
- **Calendar integration** for meal and workout planning
- **Achievement system** with progress tracking
- **Progress photos** with body measurements
- **Workout sessions** with detailed tracking
- **Water intake** monitoring

### Advanced Indexing and Performance
- **Full-text search** on recipes and foods
- **Optimized indexes** for common queries
- **JSON fields** for flexible data storage
- **Foreign key constraints** for data integrity
- **Unique constraints** to prevent duplicates

## API Endpoints to Test

After setting up the database, test these API endpoints:

### Recipe Endpoints
1. **Get Cuisines**: `GET /api/mealdb?type=cuisines`
2. **Get Recipes**: `GET /api/external/recipes?source=spoonacular&number=10`
3. **Search Recipes**: `GET /api/external/recipes?source=spoonacular&query=pasta`
4. **Get Recipe by ID**: `GET /api/external/recipes?source=spoonacular&id=123`

### FitSavory Endpoints (to be implemented)
1. **Dashboard Data**: `GET /api/fitsavory/dashboard`
2. **Meal Tracking**: `GET /api/fitsavory/meals`
3. **Diet Plans**: `GET /api/fitsavory/diet-plans`
4. **Calendar Events**: `GET /api/fitsavory/calendar`

## FitSavory Data Structure Examples

### User Profile
```sql
INSERT INTO user_profiles (
    user_id, display_name, height_cm, current_weight_kg, target_weight_kg,
    fitness_goal, daily_calorie_target, protein_target_g, carb_target_g, fat_target_g
) VALUES (
    'user-123', 'John Doe', 175.5, 80.0, 75.0,
    'weight_loss', 2000, 150.0, 200.0, 67.0
);
```

### Meal Entry
```sql
INSERT INTO meal_entries (
    user_id, food_name, meal_type, entry_date, entry_time,
    calories_consumed, protein_g, carbs_g, fat_g,
    mood_before, mood_after, energy_level, satisfaction_level
) VALUES (
    'user-123', 'Grilled Chicken Salad', 'lunch', '2024-01-15', '12:30:00',
    320, 35.0, 15.0, 12.0,
    'good', 'very_good', 8, 9
);
```

### Diet Plan
```sql
INSERT INTO diet_plans (
    user_id, name, goal, plan_type, start_date, end_date,
    daily_calories, protein_g, carbs_g, fat_g
) VALUES (
    'user-123', 'Summer Weight Loss', 'weight_loss', 'standard',
    '2024-01-01', '2024-03-31',
    1800, 135.0, 180.0, 60.0
);
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure MySQL server is running
   - Check database credentials in .env file
   - Verify database host and port

2. **Access Denied**
   - Ensure MySQL user has proper privileges
   - Check if user exists and password is correct
   - Grant necessary permissions

3. **Table Creation Errors**
   - Check for existing tables with same name
   - Verify MySQL version compatibility
   - Ensure sufficient disk space

### Database Commands

```bash
# Check MySQL status
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql

# Connect to database
mysql -u root -p savoryflavors

# Backup database
mysqldump -u root -p savoryflavors > backup.sql

# Restore database
mysql -u root -p savoryflavors < backup.sql

# Check database size
SELECT table_name, table_rows, data_length, index_length
FROM information_schema.tables
WHERE table_schema = 'savoryflavors';
```

## Next Steps

1. **Install Dependencies**: `npm install`
2. **Run Database Setup**: Follow setup steps above
3. **Start Development Server**: `npm run dev`
4. **Test API Endpoints**: Use the endpoints listed above
5. **Set up Authentication**: Configure NextAuth providers in .env
6. **Implement FitSavory API Routes**: Create API endpoints for all FitSavory features

## Support

If you encounter issues:

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure all prerequisites are installed
4. Check the database connection string format

For additional help, refer to the Next.js and MySQL documentation.

## Database Maintenance

### Regular Tasks
- **Backup daily** using mysqldump
- **Monitor disk space** for growth
- **Update indexes** as data grows
- **Archive old data** (meal entries older than 2 years)

### Performance Optimization
- **Add indexes** for frequently queried columns
- **Partition large tables** by date
- **Implement caching** for frequently accessed data
- **Monitor slow queries** with MySQL slow query log
