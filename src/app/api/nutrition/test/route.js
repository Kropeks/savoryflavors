import nutritionAPI from '@/lib/nutritionAPI';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { test } = req.query;

  if (!test) {
    return res.status(400).json({
      message: 'Test parameter is required',
      example: '/api/nutrition/test?test=apple'
    });
  }

  try {
    console.log(`🧪 Testing nutrition API with: ${test}`);

    // Test all APIs
    const results = {
      testFood: test,
      timestamp: new Date().toISOString(),
      apis: {}
    };

    // Test Spoonacular
    try {
      const spoonacularFoods = await nutritionAPI.searchFoods(test, 3);
      const spoonacularNutrition = spoonacularFoods.length > 0
        ? await nutritionAPI.getIngredientInfo(spoonacularFoods[0].id)
        : null;

      results.apis.spoonacular = {
        available: true,
        foodsFound: spoonacularFoods.length,
        sampleFood: spoonacularFoods[0] || null,
        nutritionData: spoonacularNutrition
      };
    } catch (error) {
      results.apis.spoonacular = {
        available: false,
        error: error.message
      };
    }

    // Test CalorieNinjas
    try {
      const calorieNinjasNutrition = await nutritionAPI.getNutritionInfo(test);
      results.apis.calorieNinjas = {
        available: true,
        nutritionData: calorieNinjasNutrition
      };
    } catch (error) {
      results.apis.calorieNinjas = {
        available: false,
        error: error.message
      };
    }

    // Test Edamam
    try {
      const edamamFoods = await nutritionAPI.searchEdamamFoods(test);
      results.apis.edamam = {
        available: true,
        foodsFound: edamamFoods.length,
        sampleFood: edamamFoods[0] || null
      };
    } catch (error) {
      results.apis.edamam = {
        available: false,
        error: error.message
      };
    }

    // Test combined search
    try {
      const combinedFoods = await nutritionAPI.searchFoodsCombined(test, 5);
      results.combinedSearch = {
        totalFoods: combinedFoods.length,
        foods: combinedFoods
      };
    } catch (error) {
      results.combinedSearch = {
        error: error.message
      };
    }

    // Test combined nutrition lookup
    try {
      const combinedNutrition = await nutritionAPI.getNutritionInfoCombined(test);
      results.combinedNutrition = {
        found: !!combinedNutrition,
        nutrition: combinedNutrition
      };
    } catch (error) {
      results.combinedNutrition = {
        found: false,
        error: error.message
      };
    }

    // Calculate serving size conversion
    if (results.combinedNutrition.nutrition) {
      const convertedNutrition = nutritionAPI.calculateServingNutrition(
        results.combinedNutrition.nutrition,
        results.combinedNutrition.nutrition.servingSize,
        150,
        'g'
      );

      results.servingConversion = {
        original: {
          serving: results.combinedNutrition.nutrition.servingSize,
          unit: results.combinedNutrition.nutrition.servingUnit,
          calories: results.combinedNutrition.nutrition.calories
        },
        converted: {
          serving: 150,
          unit: 'g',
          calories: convertedNutrition.calories
        },
        ratio: 150 / results.combinedNutrition.nutrition.servingSize
      };
    }

    return res.status(200).json({
      success: true,
      message: 'Nutrition API test completed',
      results
    });

  } catch (error) {
    console.error('Nutrition API test error:', error);
    return res.status(500).json({
      success: false,
      message: 'Nutrition API test failed',
      error: error.message
    });
  }
}
