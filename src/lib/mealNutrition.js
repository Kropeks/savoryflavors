const nutritionAPI = require('./nutritionAPI');
const { query } = require('./db');

// Enhanced Meal Entry with Nutrition API Integration
class MealNutritionManager {
  constructor() {
    this.defaultServings = {
      'g': 100, 'gram': 100, 'grams': 100,
      'cup': 240, 'cups': 240,
      'tbsp': 15, 'tablespoon': 15, 'tablespoons': 15,
      'tsp': 5, 'teaspoon': 5, 'teaspoons': 5,
      'oz': 28.35, 'ounce': 28.35, 'ounces': 28.35,
      'piece': 1, 'slice': 1, 'medium': 1, 'large': 1, 'small': 1
    };
  }

  // Enhanced meal entry creation with automatic nutrition lookup
  async createMealEntry(userId, mealData) {
    try {
      const nutrition = await nutritionAPI.getNutritionInfoCombined(mealData.foodName);

      if (!nutrition) {
        // Insert meal entry without nutrition data
        const mealId = require('uuid').v4();
        await query(`
          INSERT INTO meal_entries (
            id, user_id, food_name, meal_type, calories_consumed,
            protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, potassium_mg,
            serving_size, serving_unit, mood_before, mood_after, energy_level,
            satisfaction_level, notes, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          mealId, userId, mealData.foodName, mealData.mealType,
          mealData.calories || 0, mealData.protein || 0, mealData.carbs || 0,
          mealData.fat || 0, mealData.fiber || 0, mealData.sugar || 0,
          mealData.sodium || 0, mealData.potassium || 0,
          mealData.servingSize, mealData.servingUnit,
          mealData.moodBefore, mealData.moodAfter, mealData.energyLevel,
          mealData.satisfactionLevel, mealData.notes
        ]);

        return { id: mealId, nutritionFound: false };
      }

      // Calculate nutrition for the specified serving
      let calculatedNutrition = nutrition;
      if (mealData.servingSize && mealData.servingUnit) {
        const servingGrams = nutritionAPI.parseMeasurement(mealData.servingUnit);
        const actualServingGrams = nutrition.servingSize * servingGrams;

        calculatedNutrition = nutritionAPI.calculateServingNutrition(
          nutrition,
          actualServingGrams,
          parseFloat(mealData.servingSize) * servingGrams
        );

        calculatedNutrition.servingSize = parseFloat(mealData.servingSize);
        calculatedNutrition.servingUnit = mealData.servingUnit;
      }

      // Insert enhanced meal entry with nutrition data
      const mealId = require('uuid').v4();
      await query(`
        INSERT INTO meal_entries (
          id, user_id, food_name, meal_type, calories_consumed,
          protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, potassium_mg,
          serving_size, serving_unit, mood_before, mood_after, energy_level,
          satisfaction_level, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        mealId, userId, calculatedNutrition.name, mealData.mealType,
        calculatedNutrition.calories, calculatedNutrition.protein, calculatedNutrition.carbs,
        calculatedNutrition.fat, calculatedNutrition.fiber, calculatedNutrition.sugar,
        calculatedNutrition.sodium, calculatedNutrition.potassium,
        calculatedNutrition.servingSize, calculatedNutrition.servingUnit,
        mealData.moodBefore, mealData.moodAfter, mealData.energyLevel,
        mealData.satisfactionLevel, mealData.notes
      ]);

      return {
        id: mealId,
        nutritionFound: true,
        originalFood: mealData.foodName,
        matchedFood: calculatedNutrition.name,
        nutrition: {
          calories: calculatedNutrition.calories,
          protein: calculatedNutrition.protein,
          carbs: calculatedNutrition.carbs,
          fat: calculatedNutrition.fat,
          fiber: calculatedNutrition.fiber,
          sugar: calculatedNutrition.sugar,
          sodium: calculatedNutrition.sodium,
          potassium: calculatedNutrition.potassium
        },
        source: calculatedNutrition.source
      };

    } catch (error) {
      console.error('Error creating meal entry:', error);
      throw error;
    }
  }

  // Quick nutrition lookup for existing meal entries
  async getNutritionForFood(foodName, servingSize = 100, servingUnit = 'g') {
    try {
      const nutrition = await nutritionAPI.getNutritionInfoCombined(foodName);

      if (!nutrition) {
        return { found: false, food: foodName };
      }

      // Calculate for custom serving
      let calculatedNutrition = nutrition;
      if (servingSize && servingUnit) {
        const servingGrams = nutritionAPI.parseMeasurement(servingUnit);
        calculatedNutrition = nutritionAPI.calculateServingNutrition(
          nutrition,
          nutrition.servingSize * servingGrams,
          parseFloat(servingSize) * servingGrams
        );
      }

      return {
        found: true,
        food: calculatedNutrition.name,
        nutrition: calculatedNutrition,
        source: calculatedNutrition.source
      };

    } catch (error) {
      console.error('Error getting nutrition for food:', error);
      return { found: false, food: foodName, error: error.message };
    }
  }

  // Batch nutrition lookup for multiple foods
  async getBatchNutrition(foods) {
    const results = [];

    for (const food of foods) {
      const result = await this.getNutritionForFood(
        food.name,
        food.servingSize,
        food.servingUnit
      );
      results.push(result);
    }

    return results;
  }

  // Recipe nutrition analysis
  async analyzeRecipeNutrition(recipeId) {
    try {
      // Get recipe ingredients
      const ingredients = await query(`
        SELECT name, amount, unit, notes
        FROM recipe_ingredients
        WHERE recipe_id = ?
      `, [recipeId]);

      const nutritionResults = [];

      for (const ingredient of ingredients) {
        const nutrition = await this.getNutritionForFood(
          ingredient.name,
          ingredient.amount,
          ingredient.unit
        );
        nutritionResults.push({
          ingredient: ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
          ...nutrition
        });
      }

      // Calculate total nutrition
      const totalNutrition = nutritionResults.reduce((total, item) => {
        if (item.found) {
          total.calories += item.nutrition.calories || 0;
          total.protein += item.nutrition.protein || 0;
          total.carbs += item.nutrition.carbs || 0;
          total.fat += item.nutrition.fat || 0;
          total.fiber += item.nutrition.fiber || 0;
          total.sugar += item.nutrition.sugar || 0;
          total.sodium += item.nutrition.sodium || 0;
          total.potassium += item.nutrition.potassium || 0;
        }
        return total;
      }, {
        calories: 0, protein: 0, carbs: 0, fat: 0,
        fiber: 0, sugar: 0, sodium: 0, potassium: 0
      });

      return {
        recipeId,
        ingredientCount: ingredients.length,
        ingredients: nutritionResults,
        totalNutrition,
        perServing: {
          ...totalNutrition,
          // Assuming 4 servings per recipe as default
          servings: 4,
          calories: Math.round(totalNutrition.calories / 4),
          protein: parseFloat((totalNutrition.protein / 4).toFixed(2)),
          carbs: parseFloat((totalNutrition.carbs / 4).toFixed(2)),
          fat: parseFloat((totalNutrition.fat / 4).toFixed(2)),
          fiber: parseFloat((totalNutrition.fiber / 4).toFixed(2)),
          sugar: parseFloat((totalNutrition.sugar / 4).toFixed(2)),
          sodium: Math.round(totalNutrition.sodium / 4),
          potassium: Math.round(totalNutrition.potassium / 4)
        }
      };

    } catch (error) {
      console.error('Error analyzing recipe nutrition:', error);
      throw error;
    }
  }

  // Daily nutrition summary with API-enhanced data
  async getDailyNutritionSummary(userId, date) {
    try {
      const meals = await query(`
        SELECT * FROM meal_entries
        WHERE user_id = ? AND DATE(created_at) = ?
        ORDER BY created_at ASC
      `, [userId, date]);

      const enhancedMeals = [];

      for (const meal of meals) {
        // Check if nutrition data exists and is accurate
        if (meal.calories_consumed === 0 || !meal.protein_g) {
          const nutrition = await this.getNutritionForFood(
            meal.food_name,
            meal.serving_size,
            meal.serving_unit
          );

          if (nutrition.found) {
            enhancedMeals.push({
              ...meal,
              apiNutrition: nutrition.nutrition,
              nutritionAccuracy: 'enhanced'
            });
          } else {
            enhancedMeals.push({
              ...meal,
              apiNutrition: null,
              nutritionAccuracy: 'manual'
            });
          }
        } else {
          enhancedMeals.push({
            ...meal,
            apiNutrition: null,
            nutritionAccuracy: 'complete'
          });
        }
      }

      // Calculate totals
      const totals = enhancedMeals.reduce((sum, meal) => {
        const calories = meal.apiNutrition?.calories || meal.calories_consumed || 0;
        const protein = meal.apiNutrition?.protein || meal.protein_g || 0;
        const carbs = meal.apiNutrition?.carbs || meal.carbs_g || 0;
        const fat = meal.apiNutrition?.fat || meal.fat_g || 0;

        return {
          calories: sum.calories + calories,
          protein: sum.protein + protein,
          carbs: sum.carbs + carbs,
          fat: sum.fat + fat,
          meals: sum.meals + 1
        };
      }, { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 });

      return {
        date,
        userId,
        meals: enhancedMeals,
        totals,
        macroDistribution: {
          protein: totals.calories > 0 ? Math.round((totals.protein * 4 / totals.calories) * 100) : 0,
          carbs: totals.calories > 0 ? Math.round((totals.carbs * 4 / totals.calories) * 100) : 0,
          fat: totals.calories > 0 ? Math.round((totals.fat * 9 / totals.calories) * 100) : 0
        },
        nutritionQuality: this.assessNutritionQuality(totals)
      };

    } catch (error) {
      console.error('Error getting daily nutrition summary:', error);
      throw error;
    }
  }

  // Assess nutrition quality
  assessNutritionQuality(totals) {
    const { calories, protein, carbs, fat } = totals;

    if (calories === 0) {
      return { score: 0, rating: 'No data', suggestions: ['Add meal entries to get nutrition analysis'] };
    }

    let score = 0;
    const suggestions = [];

    // Protein assessment (20% of score)
    const proteinPercent = (protein * 4 / calories) * 100;
    if (proteinPercent >= 15) score += 20;
    else if (proteinPercent >= 10) score += 15;
    else { score += 5; suggestions.push('Consider increasing protein intake'); }

    // Carb assessment (20% of score)
    const carbPercent = (carbs * 4 / calories) * 100;
    if (carbPercent >= 45 && carbPercent <= 65) score += 20;
    else if (carbPercent >= 35 && carbPercent <= 75) score += 15;
    else { score += 5; suggestions.push('Review carbohydrate balance'); }

    // Fat assessment (20% of score)
    const fatPercent = (fat * 9 / calories) * 100;
    if (fatPercent >= 20 && fatPercent <= 35) score += 20;
    else if (fatPercent >= 15 && fatPercent <= 40) score += 15;
    else { score += 5; suggestions.push('Consider healthy fat sources'); }

    // Calorie assessment (20% of score)
    if (calories >= 1200 && calories <= 2500) score += 20;
    else if (calories >= 800 && calories <= 3000) score += 10;
    else { suggestions.push('Calorie intake may be too extreme'); }

    // Balance assessment (20% of score)
    const balance = Math.abs(proteinPercent - 15) + Math.abs(carbPercent - 55) + Math.abs(fatPercent - 30);
    if (balance < 20) score += 20;
    else if (balance < 40) score += 10;
    else { suggestions.push('Work on macronutrient balance'); }

    return {
      score: Math.round(score),
      rating: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Improvement',
      suggestions: suggestions.slice(0, 3) // Limit to 3 suggestions
    };
  }
}

module.exports = new MealNutritionManager();
