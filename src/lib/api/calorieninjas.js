/**
 * CalorieNinjas API Client
 * Provides methods to interact with CalorieNinjas Nutrition API
 */

const CALORIE_NINJAS_API_URL = 'https://api.calorieninjas.com/v1';

/**
 * Get nutrition information for a food item
 * @param {string} query - Food item to get nutrition for (e.g., '1 cup rice')
 * @returns {Promise<Object>} - Nutrition information
 */
export async function getNutritionInfo(query) {
  if (!query) {
    throw new Error('Query parameter is required');
  }

  try {
    const response = await fetch(
      `${CALORIE_NINJAS_API_URL}/nutrition?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'X-Api-Key': process.env.NEXT_PUBLIC_CALORIENINJAS_API_KEY || process.env.CALORIENINJAS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `CalorieNinjas API error: ${response.status} - ${errorData.message || 'Unknown error'}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching from CalorieNinjas API:', error);
    throw error;
  }
}

/**
 * Get nutrition information for multiple food items in a single request
 * @param {Array<string>} items - Array of food items
 * @returns {Promise<Array<Object>>} - Array of nutrition information objects
 */
export async function getBulkNutritionInfo(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Items array must contain at least one item');
  }

  // Process items in parallel
  const promises = items.map(item => getNutritionInfo(item));
  return Promise.all(promises);
}

/**
 * Get nutrition information for a recipe URL
 * @param {string} url - URL of the recipe
 * @returns {Promise<Object>} - Nutrition information for the recipe
 */
export async function getRecipeNutrition(url) {
  if (!url) {
    throw new Error('URL parameter is required');
  }

  try {
    const response = await fetch(
      `${CALORIE_NINJAS_API_URL}/nutrition?url=${encodeURIComponent(url)}`,
      {
        headers: {
          'X-Api-Key': process.env.NEXT_PUBLIC_CALORIENINJAS_API_KEY || process.env.CALORIENINJAS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `CalorieNinjas API error: ${response.status} - ${errorData.message || 'Unknown error'}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching recipe nutrition:', error);
    throw error;
  }
}
