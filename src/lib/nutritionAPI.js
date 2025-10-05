import axios from 'axios';

// Nutrition API Integration
class NutritionAPI {
  constructor() {
    this.calorieNinjasKey = process.env.CALORIENINJAS_API_KEY;
  }

  // CalorieNinjas API Integration
  async getNutritionInfo(query) {
    if (!this.calorieNinjasKey) {
      throw new Error('CalorieNinjas API key not configured');
    }

    try {
      const response = await axios.get(`${process.env.CALORIENINJAS_API_BASE}/nutrition`, {
        params: { query },
        headers: {
          'X-Api-Key': this.calorieNinjasKey
        }
      });

      if (response.data.items && response.data.items.length > 0) {
        const item = response.data.items[0];
        return {
          name: item.name,
          category: 'Food',
          calories: item.calories,
          protein: item.protein_g || 0,
          carbs: item.carbohydrates_total_g || 0,
          fat: item.fat_total_g || 0,
          fiber: item.fiber_g || 0,
          sugar: item.sugar_g || 0,
          sodium: item.sodium_mg || 0,
          potassium: item.potassium_mg || 0,
          servingSize: item.serving_size_g || 100,
          servingUnit: 'g',
          source: 'calorieninjas'
        };
      }
      return null;
    } catch (error) {
      console.error('CalorieNinjas error:', error.message);
      return null;
    }
  }

  // Combined Food Search (tries all APIs)
  async searchFoodsCombined(query, limit = 5) {
    const results = [];

    try {
      // Remove duplicates and limit
      const uniqueResults = results
        .filter((food, index, self) =>
          index === self.findIndex(f => f.name.toLowerCase() === food.name.toLowerCase())
        )
        .slice(0, limit);

      return uniqueResults;
    } catch (error) {
      console.error('Combined search error:', error.message);
      return [];
    }
  }

  // Get Nutrition Info (tries all APIs)
  async getNutritionInfoCombined(foodName) {
    try {
      // Try CalorieNinjas first (most accurate for nutrition)
      let nutrition = await this.getNutritionInfo(foodName);
      if (nutrition) return nutrition;

      return null;
    } catch (error) {
      console.error('Combined nutrition lookup error:', error.message);
      return null;
    }
  }

  // Calculate nutrition for custom serving size
  calculateServingNutrition(nutrition, originalServing, newServing, unit = 'g') {
    if (!nutrition || originalServing <= 0) return nutrition;

    const ratio = newServing / originalServing;

    return {
      ...nutrition,
      calories: Math.round(nutrition.calories * ratio),
      protein: parseFloat((nutrition.protein * ratio).toFixed(2)),
      carbs: parseFloat((nutrition.carbs * ratio).toFixed(2)),
      fat: parseFloat((nutrition.fat * ratio).toFixed(2)),
      fiber: parseFloat((nutrition.fiber * ratio).toFixed(2)),
      sugar: parseFloat((nutrition.sugar * ratio).toFixed(2)),
      sodium: Math.round(nutrition.sodium * ratio),
      potassium: Math.round(nutrition.potassium * ratio)
    };
  }

  // Parse common food measurements
  parseMeasurement(measurement) {
    const conversions = {
      'cup': 240, 'cups': 240,
      'tbsp': 15, 'tablespoon': 15, 'tablespoons': 15,
      'tsp': 5, 'teaspoon': 5, 'teaspoons': 5,
      'oz': 28.35, 'ounce': 28.35, 'ounces': 28.35,
      'lb': 453.59, 'pound': 453.59, 'pounds': 453.59,
      'g': 1, 'gram': 1, 'grams': 1,
      'kg': 1000, 'kilogram': 1000, 'kilograms': 1000,
      'ml': 1, 'milliliter': 1, 'milliliters': 1,
      'l': 1000, 'liter': 1000, 'liters': 1000
    };

    const lowerMeasurement = measurement.toLowerCase();
    for (const [key, value] of Object.entries(conversions)) {
      if (lowerMeasurement.includes(key)) {
        return value;
      }
    }
    return 100; // Default to 100g if unit not recognized
  }
}

export default new NutritionAPI();
