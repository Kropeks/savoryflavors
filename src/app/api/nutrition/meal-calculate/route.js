import nutritionAPI from '@/lib/nutritionAPI';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { foodName, servingSize, servingUnit } = req.body;

  if (!foodName) {
    return res.status(400).json({ message: 'Food name is required' });
  }

  try {
    const nutrition = await nutritionAPI.getNutritionInfoCombined(foodName);

    if (!nutrition) {
      return res.status(404).json({
        success: false,
        message: 'Nutrition information not found for this food',
        food: foodName
      });
    }

    // Calculate nutrition for the specified serving size
    let calculatedNutrition = nutrition;
    if (servingSize && servingUnit) {
      const servingGrams = nutritionAPI.parseMeasurement(servingUnit);
      const actualServingGrams = nutrition.servingSize * servingGrams;

      calculatedNutrition = nutritionAPI.calculateServingNutrition(
        nutrition,
        actualServingGrams,
        parseFloat(servingSize) * servingGrams
      );

      calculatedNutrition.servingSize = parseFloat(servingSize);
      calculatedNutrition.servingUnit = servingUnit;
    }

    return res.status(200).json({
      success: true,
      mealEntry: {
        foodName: calculatedNutrition.name,
        originalFoodName: foodName,
        calories: calculatedNutrition.calories,
        protein: calculatedNutrition.protein,
        carbs: calculatedNutrition.carbs,
        fat: calculatedNutrition.fat,
        fiber: calculatedNutrition.fiber,
        sugar: calculatedNutrition.sugar,
        sodium: calculatedNutrition.sodium,
        potassium: calculatedNutrition.potassium,
        servingSize: calculatedNutrition.servingSize,
        servingUnit: calculatedNutrition.servingUnit,
        source: calculatedNutrition.source,
        // Nutritional quality indicators
        nutritionScore: {
          protein: calculatedNutrition.protein >= 15 ? 'high' : calculatedNutrition.protein >= 8 ? 'medium' : 'low',
          fiber: calculatedNutrition.fiber >= 5 ? 'high' : calculatedNutrition.fiber >= 2.5 ? 'medium' : 'low',
          sugar: calculatedNutrition.sugar <= 5 ? 'low' : calculatedNutrition.sugar <= 15 ? 'medium' : 'high',
          sodium: calculatedNutrition.sodium <= 400 ? 'low' : calculatedNutrition.sodium <= 800 ? 'medium' : 'high'
        },
        // Health recommendations
        recommendations: {
          isHealthy: calculatedNutrition.fiber >= 3 && calculatedNutrition.sugar <= 10 && calculatedNutrition.sodium <= 600,
          suggestions: [
            calculatedNutrition.protein < 10 ? 'Consider adding a protein source' : null,
            calculatedNutrition.fiber < 3 ? 'Add more fiber-rich foods' : null,
            calculatedNutrition.sugar > 15 ? 'Reduce sugar intake' : null
          ].filter(Boolean)
        }
      }
    });

  } catch (error) {
    console.error('Meal nutrition calculation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate meal nutrition',
      error: error.message
    });
  }
}
