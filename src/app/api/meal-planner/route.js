import { NextResponse } from 'next/server'
import recipeAPI from '@/lib/recipeAPI.js'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const calories = parseInt(searchParams.get('calories')) || 2000
    const protein = parseInt(searchParams.get('protein')) || 150
    const carbs = parseInt(searchParams.get('carbs')) || 250
    const fat = parseInt(searchParams.get('fat')) || 67
    const days = parseInt(searchParams.get('days')) || 7

    // Generate meal plan
    const mealPlan = await generateMealPlan(calories, protein, carbs, fat, days)

    return NextResponse.json(mealPlan)
  } catch (error) {
    console.error('Error generating meal plan:', error)
    return NextResponse.json(
      { error: 'Failed to generate meal plan', details: error.message },
      { status: 500 }
    )
  }
}

async function generateMealPlan(targetCalories, targetProtein, targetCarbs, targetFat, days) {
  const mealPlan = []

  for (let day = 1; day <= days; day++) {
    const dayMeals = {
      day,
      breakfast: null,
      lunch: null,
      dinner: null,
      snacks: [],
      totals: { calories: 0, protein: 0, carbs: 0, fat: 0 }
    }

    // Get random recipes for each meal
    try {
      const breakfastRecipes = await recipeAPI.getRandomRecipesMealDB(1)
      if (breakfastRecipes.length > 0) {
        dayMeals.breakfast = breakfastRecipes[0]
        dayMeals.totals.calories += breakfastRecipes[0].nutrition?.calories || 0
        dayMeals.totals.protein += breakfastRecipes[0].nutrition?.protein || 0
        dayMeals.totals.carbs += breakfastRecipes[0].nutrition?.carbs || 0
        dayMeals.totals.fat += breakfastRecipes[0].nutrition?.fat || 0
      }

      const lunchRecipes = await recipeAPI.getRandomRecipesMealDB(1)
      if (lunchRecipes.length > 0) {
        dayMeals.lunch = lunchRecipes[0]
        dayMeals.totals.calories += lunchRecipes[0].nutrition?.calories || 0
        dayMeals.totals.protein += lunchRecipes[0].nutrition?.protein || 0
        dayMeals.totals.carbs += lunchRecipes[0].nutrition?.carbs || 0
        dayMeals.totals.fat += lunchRecipes[0].nutrition?.fat || 0
      }

      const dinnerRecipes = await recipeAPI.getRandomRecipesMealDB(1)
      if (dinnerRecipes.length > 0) {
        dayMeals.dinner = dinnerRecipes[0]
        dayMeals.totals.calories += dinnerRecipes[0].nutrition?.calories || 0
        dayMeals.totals.protein += dinnerRecipes[0].nutrition?.protein || 0
        dayMeals.totals.carbs += dinnerRecipes[0].nutrition?.carbs || 0
        dayMeals.totals.fat += dinnerRecipes[0].nutrition?.fat || 0
      }

      // Add snacks
      const snackRecipes = await recipeAPI.getRandomRecipesMealDB(2)
      dayMeals.snacks = snackRecipes
      snackRecipes.forEach(snack => {
        dayMeals.totals.calories += snack.nutrition?.calories || 0
        dayMeals.totals.protein += snack.nutrition?.protein || 0
        dayMeals.totals.carbs += snack.nutrition?.carbs || 0
        dayMeals.totals.fat += snack.nutrition?.fat || 0
      })

      mealPlan.push(dayMeals)
    } catch (error) {
      console.warn(`Could not generate meal for day ${day}:`, error.message)
    }
  }

  return { mealPlan, targets: { calories: targetCalories, protein: targetProtein, carbs: targetCarbs, fat: targetFat } }
}
