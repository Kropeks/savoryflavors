import nutritionAPI from '@/lib/nutritionAPI';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { food, servingSize, servingUnit } = req.query;

  if (!food) {
    return res.status(400).json({ message: 'Food parameter is required' });
  }

  try {
    const nutrition = await nutritionAPI.getNutritionInfoCombined(food);

    if (!nutrition) {
      return res.status(404).json({
        success: false,
        message: 'Nutrition information not found',
        food: food
      });
    }

    // Calculate nutrition for custom serving size if provided
    let adjustedNutrition = nutrition;
    if (servingSize && servingUnit) {
      const originalServing = nutrition.servingSize;
      const newServing = servingSize;

      // Parse the serving unit to get grams
      const servingGrams = nutritionAPI.parseMeasurement(servingUnit);
      const actualServingGrams = originalServing * servingGrams;

      adjustedNutrition = nutritionAPI.calculateServingNutrition(
        nutrition,
        actualServingGrams,
        parseFloat(servingSize) * servingGrams
      );

      adjustedNutrition.servingSize = parseFloat(servingSize);
      adjustedNutrition.servingUnit = servingUnit;
    }

    return res.status(200).json({
      success: true,
      food: food,
      nutrition: {
        name: adjustedNutrition.name,
        category: adjustedNutrition.category,
        calories: adjustedNutrition.calories,
        protein: adjustedNutrition.protein,
        carbs: adjustedNutrition.carbs,
        fat: adjustedNutrition.fat,
        fiber: adjustedNutrition.fiber,
        sugar: adjustedNutrition.sugar,
        sodium: adjustedNutrition.sodium,
        potassium: adjustedNutrition.potassium,
        servingSize: adjustedNutrition.servingSize,
        servingUnit: adjustedNutrition.servingUnit,
        source: adjustedNutrition.source,
        // Macronutrient percentages
        macros: {
          protein: adjustedNutrition.calories > 0 ? Math.round((adjustedNutrition.protein * 4 / adjustedNutrition.calories) * 100) : 0,
          carbs: adjustedNutrition.calories > 0 ? Math.round((adjustedNutrition.carbs * 4 / adjustedNutrition.calories) * 100) : 0,
          fat: adjustedNutrition.calories > 0 ? Math.round((adjustedNutrition.fat * 9 / adjustedNutrition.calories) * 100) : 0
        }
      }
    });

  } catch (error) {
    console.error('Nutrition lookup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get nutrition information',
      error: error.message
    });
  }
}
