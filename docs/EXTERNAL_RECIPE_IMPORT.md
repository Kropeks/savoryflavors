# External Recipe Import Feature

This document provides an overview of the external recipe import functionality in the SavoryFlavors application.

## Overview

The external recipe import feature allows administrators to search for and import recipes from external sources (currently TheMealDB) directly into the application. This feature is accessible from the admin recipes page.

## Components

1. **Admin Recipes Page** (`/admin/recipes`)
   - Displays a list of recipes with filtering and pagination
   - Includes an "Import from External" button to open the import dialog
   - Shows import status messages

2. **ExternalRecipes Component** (`/components/admin/ExternalRecipes.jsx`)
   - Provides a search interface for external recipes
   - Displays search results with recipe cards
   - Handles the import process

3. **API Routes**
   - `/api/admin/recipes/external` - Fetches recipes from external sources
   - `/api/admin/recipes` - Handles importing recipes into the database

4. **Utility Functions**
   - `mealdb.js` - Handles API calls to TheMealDB
   - `admin.actions.js` - Contains the `importRecipe` function

## Database Schema Updates

The following columns were added to the `recipes` table:

- `is_external` (BOOLEAN) - Whether the recipe was imported from an external source
- `external_source` (VARCHAR) - The source of the external recipe (e.g., 'TheMealDB')
- `external_id` (VARCHAR) - The ID of the recipe in the external system
- `external_url` (VARCHAR) - URL to the original recipe
- `is_approved` (BOOLEAN) - Whether the recipe has been approved by an admin

## How It Works

1. **Searching for Recipes**
   - The admin enters a search term in the import dialog
   - The application queries TheMealDB API via the `/api/admin/recipes/external` endpoint
   - Results are displayed as cards with recipe images and basic information

2. **Importing a Recipe**
   - The admin clicks the "Import" button on a recipe card
   - The application fetches the full recipe details from TheMealDB
   - The recipe data is transformed to match the application's data model
   - The recipe is saved to the database via the `/api/admin/recipes` endpoint
   - The admin receives a success/error message

3. **Data Transformation**
   - The `transformMealToRecipe` function in `ExternalRecipes.jsx` maps TheMealDB's data structure to the application's recipe format
   - Ingredients, instructions, and other recipe details are extracted and formatted

## Security Considerations

- Only users with the 'ADMIN' role can access the import feature
- All API routes include authentication and authorization checks
- External API calls are rate-limited and include error handling
- User input is properly sanitized before being used in database queries

## Future Enhancements

1. Support for additional external recipe sources
2. Batch import of multiple recipes
3. Preview of the recipe before import
4. Option to edit the recipe during import
5. Support for importing recipe images to local storage
6. User feedback on imported recipes

## Dependencies

- TheMealDB API (https://www.themealdb.com/api.php)
- Next.js API Routes
- MySQL database with the updated schema
