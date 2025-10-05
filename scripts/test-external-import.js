/**
 * Test script to verify external recipe import functionality
 * Run with: node scripts/test-external-import.js
 */

const axios = require('axios');
const { query } = require('../src/lib/db');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_RECIPE_ID = '52772'; // Spaghetti Carbonara

async function testExternalRecipeImport() {
  console.log('Starting external recipe import test...');
  
  try {
    // 1. Test search for recipes
    console.log('\n1. Testing recipe search...');
    const searchResponse = await axios.get(`${API_BASE_URL}/admin/recipes/external?query=pasta`);
    console.log(`Found ${searchResponse.data.data?.length || 0} recipes`);
    
    if (!searchResponse.data.data || searchResponse.data.data.length === 0) {
      throw new Error('No recipes found in search results');
    }
    
    // 2. Test getting recipe details
    console.log('\n2. Testing recipe details...');
    const recipeId = searchResponse.data.data[0].idMeal || TEST_RECIPE_ID;
    const detailsResponse = await axios.get(`${API_BASE_URL}/admin/recipes/external?id=${recipeId}`);
    
    if (!detailsResponse.data.data) {
      throw new Error('Failed to get recipe details');
    }
    
    console.log(`Retrieved details for: ${detailsResponse.data.data.strMeal}`);
    
    // 3. Test importing the recipe
    console.log('\n3. Testing recipe import...');
    const recipeData = detailsResponse.data.data;
    const transformedRecipe = transformMealToRecipe(recipeData);
    
    const importResponse = await axios.post(
      `${API_BASE_URL}/admin/recipes`,
      transformedRecipe,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    console.log(`Successfully imported recipe with ID: ${importResponse.data.recipeId}`);
    
    // 4. Verify the recipe was saved in the database
    console.log('\n4. Verifying database entry...');
    const [savedRecipe] = await query(
      'SELECT * FROM recipes WHERE external_id = ?',
      [recipeId]
    );
    
    if (!savedRecipe) {
      throw new Error('Recipe was not saved to the database');
    }
    
    console.log('✅ Test completed successfully!');
    console.log(`Recipe "${savedRecipe.title}" was imported with ID: ${savedRecipe.id}`);
    
    // 5. Clean up (optional)
    // await query('DELETE FROM recipes WHERE id = ?', [savedRecipe.id]);
    // console.log('Cleaned up test data');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
    }
    process.exit(1);
  }
}

// Helper function to transform TheMealDB format to our recipe format
function transformMealToRecipe(meal) {
  if (!meal) return null;
  
  // Extract ingredients and measurements
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== '') {
      ingredients.push({
        name: ingredient,
        amount: measure || 'to taste',
        unit: '',
        notes: ''
      });
    }
  }

  // Format instructions
  const instructionsText = meal.strInstructions || '';
  const instructions = instructionsText
    .split(/\r\n|\n/)
    .map(step => step.trim())
    .filter(step => step !== '')
    .map((step, index) => ({
      step: index + 1,
      instruction: step
    }));
  
  // Get tags
  let tags = [];
  if (meal.strTags) {
    tags = meal.strTags.split(',').map(tag => tag.trim());
  } else if (meal.strCategory) {
    tags = [meal.strCategory];
  }
  
  return {
    title: meal.strMeal || 'Untitled Recipe',
    description: `Imported from TheMealDB: ${meal.strMeal || ''}`,
    prepTime: '30',
    cookTime: '60',
    servings: 4,
    difficulty: 'medium',
    category: meal.strCategory || 'Main Course',
    cuisine: meal.strArea || 'International',
    ingredients,
    instructions,
    imageUrl: meal.strMealThumb || '',
    tags,
    isExternal: true,
    externalSource: 'TheMealDB',
    externalId: meal.idMeal,
    externalUrl: meal.strSource || `https://www.themealdb.com/meal.php?c=${meal.idMeal}`,
    isPublic: true,
    isApproved: true
  };
}

// Run the test
testExternalRecipeImport();
