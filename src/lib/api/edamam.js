/**
 * Edamam API Client
 * Provides methods to interact with Edamam's various APIs
 */

const EDAMAM_BASE_URL = 'https://api.edamam.com/api';

/**
 * Search for recipes using Edamam's Search API
 * @param {string} query - Search query (e.g., 'chicken', 'pasta')
 * @param {Object} options - Additional search options
 * @returns {Promise<Object>} - Search results
 */
export async function searchRecipes(query, options = {}) {
  const {
    from = 0,
    to = 20,
    diet = null,
    health = [],
    cuisineType = [],
    mealType = [],
    dishType = [],
  } = options;

  const params = new URLSearchParams({
    q: query,
    app_id: process.env.NEXT_PUBLIC_EDAMAM_SEARCH_APP_ID || process.env.EDAMAM_SEARCH_APP_ID,
    app_key: process.env.NEXT_PUBLIC_EDAMAM_SEARCH_API_KEY || process.env.EDAMAM_SEARCH_API_KEY,
    from,
    to,
    type: 'public',
  });

  // Add optional parameters if provided
  if (diet) params.append('diet', diet);
  if (health.length) params.append('health', health.join(','));
  if (cuisineType.length) params.append('cuisineType', cuisineType.join(','));
  if (mealType.length) params.append('mealType', mealType.join(','));
  if (dishType.length) params.append('dishType', dishType.join(','));

  try {
    const response = await fetch(`${EDAMAM_BASE_URL}/recipes/v2?${params}`);
    if (!response.ok) {
      throw new Error(`Edamam API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw error;
  }
}

/**
 * Get recipe information by ID
 * @param {string} id - Recipe ID
 * @returns {Promise<Object>} - Recipe details
 */
export async function getRecipeById(id) {
  const params = new URLSearchParams({
    type: 'public',
    app_id: process.env.NEXT_PUBLIC_EDAMAM_SEARCH_APP_ID || process.env.EDAMAM_SEARCH_APP_ID,
    app_key: process.env.NEXT_PUBLIC_EDAMAM_SEARCH_API_KEY || process.env.EDAMAM_SEARCH_API_KEY,
  });

  try {
    const response = await fetch(`${EDAMAM_BASE_URL}/recipes/v2/${id}?${params}`);
    if (!response.ok) {
      throw new Error(`Edamam API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipe by ID:', error);
    throw error;
  }
}

/**
 * Get nutrition analysis for a list of ingredients
 * @param {Array<string>} ingredients - List of ingredients with quantities (e.g., ['1 cup rice', '2 eggs'])
 * @returns {Promise<Object>} - Nutrition analysis results
 */
export async function getNutritionAnalysis(ingredients) {
  try {
    const response = await fetch('/api/edamam/nutrition', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients }),
    });

    if (!response.ok) {
      throw new Error(`Nutrition analysis failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting nutrition analysis:', error);
    throw error;
  }
}

/**
 * Search for food items in the Edamam Food Database
 * @param {string} query - Food item to search for
 * @returns {Promise<Object>} - Search results from the food database
 */
export async function searchFoodDatabase(query) {
  const params = new URLSearchParams({
    ingr: query,
    app_id: process.env.NEXT_PUBLIC_EDAMAM_FOOD_DB_APP_ID || process.env.EDAMAM_FOOD_DB_APP_ID,
    app_key: process.env.NEXT_PUBLIC_EDAMAM_FOOD_DB_API_KEY || process.env.EDAMAM_FOOD_DB_API_KEY,
  });

  try {
    const response = await fetch(`https://api.edamam.com/api/food-database/v2/parser?${params}`);
    if (!response.ok) {
      throw new Error(`Edamam Food Database API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching food database:', error);
    throw error;
  }
}
