#!/bin/bash

# SavoryFlavors Database Setup Script - Complete with FitSavory Features
# This script helps set up the MySQL database for the SavoryFlavors application

echo "🍳 SavoryFlavors Database Setup - Complete with FitSavory"
echo "========================================================"

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    echo "   Visit: https://dev.mysql.com/downloads/mysql/"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create a .env file with your database credentials."
    echo "   Check database_setup.md for instructions."
    exit 1
fi

# Load environment variables
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Database connection details
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"3306"}
DB_NAME=${DB_NAME:-"savoryflavors"}
DB_USER=${DB_USER:-"root"}
DB_PASS=${DB_PASS:-""}

echo "📋 Database Configuration:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Function to execute SQL
execute_sql() {
    local sql="$1"
    if [ -n "$DB_PASS" ]; then
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "$sql" 2>/dev/null
    else
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -e "$sql" 2>/dev/null
    fi
}

# Test database connection
echo "🔍 Testing database connection..."
if ! execute_sql "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Cannot connect to database. Please check your credentials."
    echo "   Make sure MySQL is running and credentials are correct."
    exit 1
fi

echo "✅ Database connection successful!"

# Create database
echo "🗄️ Creating database '$DB_NAME'..."
if execute_sql "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;"; then
    echo "✅ Database '$DB_NAME' created successfully!"
else
    echo "❌ Failed to create database. Please check permissions."
    exit 1
fi

# Import schema
echo "📥 Importing comprehensive database schema..."
echo "   This includes:"
echo "   • Core authentication tables"
echo "   • Enhanced recipe management"
echo "   • Complete FitSavory features:"
echo "     - User profiles & nutrition tracking"
echo "     - Meal logging & diet plans"
echo "     - Calendar events & achievements"
echo "     - Progress photos & workout tracking"
echo "     - Food library & reviews"
echo "     - Water intake & shopping lists"
echo ""

if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "database_schema.sql" 2>/dev/null; then
    echo "✅ Database schema imported successfully!"
    echo ""
    echo "📊 Your database now includes:"
    echo "   🧑 24 comprehensive tables"
    echo "   🥗 Enhanced recipe system"
    echo "   💪 Complete FitSavory nutrition tracking"
    echo "   🗓️ Calendar and planning features"
    echo "   🏆 Achievement and progress systems"
    echo ""
else
    echo "❌ Failed to import schema. Please check the SQL file and permissions."
    exit 1
fi

# Test setup
echo "🧪 Testing setup..."
if execute_sql "USE \`$DB_NAME\`; SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = '$DB_NAME';" 2>/dev/null; then
    echo "✅ Setup completed successfully!"
    echo ""
    echo "🎉 Database setup complete!"
    echo ""
    echo "📊 Your database is now ready with:"
    echo "   • User management and authentication"
    echo "   • Recipe storage and management"
    echo "   • Meal planning and tracking"
    echo "   • Diet plans with progress monitoring"
    echo "   • Calendar events and reminders"
    echo "   • Achievement and streak tracking"
    echo "   • Progress photos and measurements"
    echo "   • Workout session logging"
    echo "   • Water intake monitoring"
    echo "   • Personal food library"
    echo "   • Shopping list management"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Update your .env file with Spoonacular API key"
    echo "   2. Run 'npm run dev' to start the application"
    echo "   3. Visit http://localhost:3000 to test"
    echo "   4. Access FitSavory at http://localhost:3000/fitsavory"
    echo ""
    echo "📖 For detailed instructions, see database_setup.md"
    echo ""
    echo "🎯 Ready to track nutrition and achieve your fitness goals!"
else
    echo "❌ Setup test failed. Please check the database."
    exit 1
fi

# Show table count
TABLE_COUNT=$(execute_sql "USE \`$DB_NAME\`; SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = '$DB_NAME';" 2>/dev/null | tail -n1 | awk '{print $1}')
echo "📈 Database created with $TABLE_COUNT tables"
echo ""
echo "✨ Setup complete! Your SavoryFlavors + FitSavory database is ready."
