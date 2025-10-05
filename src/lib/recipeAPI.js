import axios from 'axios'
import config from '../config/app'
import { query, queryOne } from '@/lib/db'

class RecipeAPI {
  constructor() {
    this.calorieNinjasKey = config.api.calorieNinjas.key
    this.calorieNinjasBase = config.api.calorieNinjas.baseURL
    this.mealdbBase = config.api.mealdb.baseURL
  }

  // CalorieNinjas API Methods
  async getNutritionInfo(query) {
    try {
      if (!this.calorieNinjasKey) {
        console.warn('⚠️ CalorieNinjas API key not configured, skipping nutrition lookup')
        return null
      }

      console.log('🔍 Getting nutrition info for:', query)

      const response = await axios.get(`${this.calorieNinjasBase}/nutrition`, {
        params: { query },
        headers: {
          'X-Api-Key': this.calorieNinjasKey
        }
      })

      if (response.data?.items && response.data.items.length > 0) {
        const nutrition = response.data.items[0]
        console.log('✅ Nutrition info found:', {
          name: nutrition.name,
          calories: nutrition.calories,
          protein: nutrition.protein_g,
          carbs: nutrition.carbohydrates_total_g,
          fat: nutrition.fat_total_g
        })

        // Transform to match our expected format
        return {
          calories: Math.round(nutrition.calories || 0),
          protein: Math.round(nutrition.protein_g || 0),
          fat: Math.round(nutrition.fat_total_g || 0),
          carbs: Math.round(nutrition.carbohydrates_total_g || 0),
          fiber: Math.round(nutrition.fiber_g || 0),
          sugar: Math.round(nutrition.sugar_g || 0)
        }
      } else {
        console.warn('⚠️ No nutrition data found for:', query)
        return null
      }
    } catch (error) {
      console.error('❌ Error fetching nutrition info from CalorieNinjas:', error.response?.data || error.message)

      // If CalorieNinjas fails, try to return basic nutrition estimates
      if (query && query.length > 0) {
        console.log('🔄 Providing basic nutrition estimates for:', query)
        return this.getBasicNutritionEstimate(query)
      }

      return null
    }
  }

  // Fallback method to provide basic nutrition estimates when APIs fail
  getBasicNutritionEstimate(ingredients) {
    console.log('🔄 Calculating basic nutrition estimates for:', ingredients)

    // Basic estimates per ingredient type
    const estimates = {
      chicken: { calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0 },
      beef: { calories: 250, protein: 26, fat: 15, carbs: 0, fiber: 0 },
      fish: { calories: 206, protein: 22, fat: 12, carbs: 0, fiber: 0 },
      rice: { calories: 130, protein: 2.7, fat: 0.3, carbs: 28, fiber: 0.4 },
      pasta: { calories: 131, protein: 5, fat: 1, carbs: 25, fiber: 1.5 },
      bread: { calories: 265, protein: 9, fat: 3, carbs: 49, fiber: 2.7 },
      potato: { calories: 77, protein: 2, fat: 0.1, carbs: 17, fiber: 2.2 },
      tomato: { calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, fiber: 1.2 },
      onion: { calories: 40, protein: 1.1, fat: 0.1, carbs: 9.3, fiber: 1.7 },
      garlic: { calories: 149, protein: 6.4, fat: 0.5, carbs: 33, fiber: 2.1 },
      cheese: { calories: 113, protein: 7, fat: 9, carbs: 1, fiber: 0 },
      milk: { calories: 42, protein: 3.4, fat: 1, carbs: 5, fiber: 0 },
      egg: { calories: 155, protein: 13, fat: 11, carbs: 1.1, fiber: 0 },
      oil: { calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0 },
      butter: { calories: 717, protein: 0.9, fat: 81, carbs: 0.1, fiber: 0 },
      sugar: { calories: 387, protein: 0, fat: 0, carbs: 100, fiber: 0 },
      salt: { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 },
      flour: { calories: 364, protein: 10, fat: 1, carbs: 76, fiber: 2.7 },
      default: { calories: 50, protein: 1, fat: 0.5, carbs: 10, fiber: 1 }
    }

    const ingredientList = ingredients.toLowerCase().split(',').map(i => i.trim())
    let totalNutrition = { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }

    ingredientList.forEach(ingredient => {
      let found = false
      for (const [key, nutrition] of Object.entries(estimates)) {
        if (ingredient.includes(key)) {
          totalNutrition.calories += nutrition.calories
          totalNutrition.protein += nutrition.protein
          totalNutrition.fat += nutrition.fat
          totalNutrition.carbs += nutrition.carbs
          totalNutrition.fiber += nutrition.fiber
          found = true
          break
        }
      }

      if (!found) {
        // Use default values for unknown ingredients
        totalNutrition.calories += estimates.default.calories
        totalNutrition.protein += estimates.default.protein
        totalNutrition.fat += estimates.default.fat
        totalNutrition.carbs += estimates.default.carbs
        totalNutrition.fiber += estimates.default.fiber
      }
    })

    console.log('✅ Basic nutrition estimates calculated:', totalNutrition)
    return totalNutrition
  }

  async getRecipesByCategoryMealDB(category) {
    try {
      const response = await axios.get(`${this.mealdbBase}/filter.php`, {
        params: { c: category }
      })

      if (response.data?.meals) {
        // Get full recipe details for each meal
        const detailedRecipes = await Promise.all(
          response.data.meals.slice(0, 12).map(async (meal) => {
            try {
              const detailResponse = await axios.get(`${this.mealdbBase}/lookup.php`, {
                params: { i: meal.idMeal }
              })
              return detailResponse.data?.meals?.[0]
                ? this.transformMealDBRecipe(detailResponse.data.meals[0])
                : null
            } catch (error) {
              console.error(`Could not get details for meal ${meal.idMeal}:`, error)
              return null
            }
          })
        )
        return detailedRecipes.filter(recipe => recipe !== null)
      }
      return []
    } catch (error) {
      console.error('Error fetching recipes by category from MealDB:', error)
      throw error
    }
  }

  async getRecipesByAreaMealDB(area) {
    try {
      const response = await axios.get(`${this.mealdbBase}/filter.php`, {
        params: { a: area }
      })

      if (response.data?.meals) {
        // Get full recipe details for each meal
        const detailedRecipes = await Promise.all(
          response.data.meals.slice(0, 12).map(async (meal) => {
            try {
              const detailResponse = await axios.get(`${this.mealdbBase}/lookup.php`, {
                params: { i: meal.idMeal }
              })
              return detailResponse.data?.meals?.[0]
                ? this.transformMealDBRecipe(detailResponse.data.meals[0])
                : null
            } catch (error) {
              console.error(`Could not get details for meal ${meal.idMeal}:`, error)
              return null
            }
          })
        )
        return detailedRecipes.filter(recipe => recipe !== null)
      }
      return []
    } catch (error) {
      console.error('Error fetching recipes by area from MealDB:', error)
      throw error
    }
  }
  async getRecipeByIdMealDB(id) {
    try {
      const response = await axios.get(`${this.mealdbBase}/lookup.php`, {
        params: { i: id }
      })

      if (!response.data.meals || response.data.meals.length === 0) {
        throw new Error(`No recipe found with ID: ${id}`)
      }

      return this.transformMealDBRecipe(response.data.meals[0])
    } catch (error) {
      console.error('Error fetching recipe by ID from MealDB:', error)
      throw error
    }
  }

  async getRandomRecipesMealDB(count = 10) {
    try {
      // MealDB random endpoint only returns 1 recipe per call, so we need to make multiple calls
      const promises = Array.from({ length: count }, () =>
        axios.get(`${this.mealdbBase}/random.php`)
      )

      const responses = await Promise.allSettled(promises)
      const recipes = []

      responses.forEach(response => {
        if (response.status === 'fulfilled' && response.value.data?.meals) {
          recipes.push(...response.value.data.meals.map(meal => this.transformMealDBRecipe(meal)))
        }
      })

      // Remove duplicates using a more robust method
      const uniqueRecipes = []
      const seen = new Set()

      recipes.forEach(recipe => {
        const identifier = `${recipe.source}-${recipe.id}-${recipe.title?.toLowerCase()}`
        if (!seen.has(identifier)) {
          seen.add(identifier)
          uniqueRecipes.push(recipe)
        } else {
          console.log('🔄 MealDB random: Removing duplicate recipe:', recipe.title)
        }
      })

      return uniqueRecipes.slice(0, count)
    } catch (error) {
      console.error('Error fetching random recipes from MealDB:', error)
      throw error
    }
  }

  async getCategoriesMealDB() {
    try {
      const response = await axios.get(`${this.mealdbBase}/categories.php`)
      return response.data?.categories || []
    } catch (error) {
      console.error('Error fetching categories from MealDB:', error)
      throw error
    }
  }

  async getAreasMealDB() {
    try {
      const response = await axios.get(`${this.mealdbBase}/list.php`, {
        params: { a: 'list' }
      })
      return response.data?.meals || []
    } catch (error) {
      console.error('Error fetching areas from MealDB:', error)
      throw error
    }
  }

  async getIngredientsMealDB() {
    try {
      const response = await axios.get(`${this.mealdbBase}/list.php`, {
        params: { i: 'list' }
      })
      return response.data?.meals || []
    } catch (error) {
      console.error('Error fetching ingredients from MealDB:', error)
      throw error
    }
  }

  async searchByIngredientMealDB(ingredient) {
    try {
      const response = await axios.get(`${this.mealdbBase}/filter.php`, {
        params: { i: ingredient }
      })

      if (response.data?.meals) {
        // Get full recipe details for each meal
        const detailedRecipes = await Promise.all(
          response.data.meals.slice(0, 12).map(async (meal) => {
            try {
              const detailResponse = await axios.get(`${this.mealdbBase}/lookup.php`, {
                params: { i: meal.idMeal }
              })
              return detailResponse.data?.meals?.[0]
                ? this.transformMealDBRecipe(detailResponse.data.meals[0])
                : null
            } catch (error) {
              console.error(`Could not get details for meal ${meal.idMeal}:`, error)
              return null
            }
          })
        )
        return detailedRecipes.filter(recipe => recipe !== null)
      }
      return []
    } catch (error) {
      console.error('Error searching by ingredient from MealDB:', error)
      throw error
    }
  }

  async searchRecipesByNameMealDB(name) {
    try {
      const response = await axios.get(`${this.mealdbBase}/search.php`, {
        params: { s: name }
      })

      if (response.data?.meals) {
        // Get full recipe details for each meal
        const detailedRecipes = await Promise.all(
          response.data.meals.slice(0, 10).map(async (meal) => {
            try {
              const detailResponse = await axios.get(`${this.mealdbBase}/lookup.php`, {
                params: { i: meal.idMeal }
              })
              return detailResponse.data?.meals?.[0]
                ? this.transformMealDBRecipe(detailResponse.data.meals[0])
                : null
            } catch (error) {
              console.error(`Could not get details for meal ${meal.idMeal}:`, error)
              return null
            }
          })
        )
        return detailedRecipes.filter(recipe => recipe !== null)
      }
      return []
    } catch (error) {
      console.error('Error searching recipes by name from MealDB:', error)
      throw error
    }
  }

  async getPopularRecipesMealDB(count = 10) {
    try {
      // Get random recipes as popular (MealDB doesn't have a popularity endpoint)
      return await this.getRandomRecipesMealDB(count)
    } catch (error) {
      console.error('Error fetching popular recipes from MealDB:', error)
      throw error
    }
  }

  // Transform functions to standardize recipe data
  transformMealDBRecipe(meal) {
    // Extract and clean instructions
    let instructions = meal.strInstructions || ''
    if (instructions) {
      // Clean up the instructions - remove extra whitespace and normalize line breaks
      instructions = instructions
        .replace(/\r\n/g, '\n') // Normalize line breaks
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .trim()

      // Split into steps if it looks like a numbered list
      if (instructions.match(/^\d+\./m)) {
        instructions = instructions
          .split(/\n/)
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .filter(line => line.length > 0)
          .join('\n')
      }
    }

    // Extract ingredients with measures
    const ingredients = this.extractIngredients(meal)

    console.log('🔄 Transforming MealDB recipe:', {
      id: meal.idMeal,
      title: meal.strMeal,
      hasInstructions: !!instructions && instructions.length > 0,
      instructionsLength: instructions.length,
      ingredientsCount: ingredients.length,
      category: meal.strCategory,
      cuisine: meal.strArea
    })

    return {
      id: meal.idMeal,
      title: meal.strMeal,
      category: meal.strCategory,
      cuisine: meal.strArea,
      instructions: instructions || 'No detailed instructions available for this recipe.',
      image: meal.strMealThumb,
      tags: meal.strTags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
      video: meal.strYoutube,
      ingredients: ingredients,
      source: 'MealDB',
      originalId: meal.idMeal,
      // Add placeholder nutrition data that will be enhanced later
      nutrition: {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0
      }
    }
  }

  transformSpoonacularRecipe(recipe) {
    return {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      category: recipe.dishTypes?.[0] || 'Main Course',
      cuisine: recipe.cuisines?.[0] || 'International',
      instructions: recipe.instructions || recipe.summary,
      ingredients: recipe.extendedIngredients?.map(ing => ({
        id: ing.id,
        name: ing.name,
        measure: ing.measures?.us?.amount + ' ' + ing.measures?.us?.unitShort || ing.amount + ' ' + ing.unit,
        original: ing.original
      })) || [],
      nutrition: recipe.nutrition?.nutrients ? {
        calories: Math.round(recipe.nutrition.nutrients.find(n => n.name === 'Calories')?.amount || 0),
        protein: Math.round(recipe.nutrition.nutrients.find(n => n.name === 'Protein')?.amount || 0),
        fat: Math.round(recipe.nutrition.nutrients.find(n => n.name === 'Fat')?.amount || 0),
        carbs: Math.round(recipe.nutrition.nutrients.find(n => n.name === 'Carbohydrates')?.amount || 0),
        fiber: Math.round(recipe.nutrition.nutrients.find(n => n.name === 'Fiber')?.amount || 0)
      } : null,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      healthScore: recipe.healthScore,
      pricePerServing: recipe.pricePerServing,
      diets: recipe.diets,
      occasions: recipe.occasions,
      source: 'Spoonacular',
      originalId: recipe.id
    }
  }

  getCountryFlag(countryName) {
    const flagMap = {
      'African': '🇿🇦',
      'American': '🇺🇸',
      'British': '🇬🇧',
      'Cajun': '🇺🇸',
      'Caribbean': '🇯🇲',
      'Chinese': '🇨🇳',
      'Eastern European': '🇷🇺',
      'European': '🇪🇺',
      'French': '🇫🇷',
      'German': '🇩🇪',
      'Greek': '🇬🇷',
      'Indian': '🇮🇳',
      'Irish': '🇮🇪',
      'Italian': '🇮🇹',
      'Japanese': '🇯🇵',
      'Jewish': '🇮🇱',
      'Korean': '🇰🇷',
      'Latin American': '🇲🇽',
      'Mediterranean': '🇮🇹',
      'Mexican': '🇲🇽',
      'Middle Eastern': '🇸🇦',
      'Nordic': '🇸🇪',
      'Southern': '🇺🇸',
      'Spanish': '🇪🇸',
      'Thai': '🇹🇭',
      'Vietnamese': '🇻🇳'
    }

    return flagMap[countryName] || '🌍'
  }

  extractIngredients(meal) {
    const ingredients = []

    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`]
      const measure = meal[`strMeasure${i}`]

      if (ingredient && ingredient.trim() && ingredient.toLowerCase() !== 'null' && ingredient.toLowerCase() !== 'undefined') {
        const cleanIngredient = ingredient.trim()
        const cleanMeasure = measure?.trim() || ''

        ingredients.push({
          id: i,
          name: cleanIngredient,
          measure: cleanMeasure,
          original: `${cleanMeasure} ${cleanIngredient}`.trim()
        })
      }
    }

    console.log('🔄 Extracted ingredients:', {
      count: ingredients.length,
      ingredients: ingredients.map(ing => ing.original)
    })

    return ingredients
  }

  // Utility method to get combined recipe data
  async getRecipeWithNutrition(id, source = 'mealdb') {
    try {
      let recipe

      console.log(`🔍 Getting recipe with ID: ${id} from source: ${source}`)

      if (source === 'community') {
        recipe = await this.getCommunityRecipeById(id)
        if (!recipe) {
          console.warn('⚠️ Community recipe not found:', id)
          return null
        }
        console.log('✅ Found community recipe:', recipe.title)
        return recipe
      }

      if (source === 'mealdb') {
        try {
          // First try to get by ID directly
          recipe = await this.getRecipeByIdMealDB(id)
          console.log('✅ Found MealDB recipe by ID:', recipe.title)
        } catch (error) {
          console.warn('⚠️ Could not fetch MealDB recipe by ID:', error.message)

          // If that fails, try searching by name (extract from ID)
          try {
            const searchTerm = id.replace(/[^a-zA-Z0-9\s]/g, ' ').trim()
            console.log('🔍 Searching MealDB by name:', searchTerm)

            const searchResults = await this.searchRecipesByNameMealDB(searchTerm)
            if (searchResults.length > 0) {
              recipe = searchResults[0] // Take the first result
              console.log('✅ Found MealDB recipe by search:', recipe.title)
            } else {
              console.warn('⚠️ No MealDB recipes found by search')
              return null
            }
          } catch (searchError) {
            console.warn('⚠️ MealDB search also failed:', searchError.message)
            return null
          }
        }
      } else {
        console.warn('⚠️ Unsupported source:', source)
        return null
      }

      // For MealDB recipes, try to get nutrition info using ingredients
      if (source === 'mealdb' && recipe?.ingredients && recipe.ingredients.length > 0) {
        try {
          console.log('🔍 Getting nutrition info for MealDB recipe...')

          // Use CalorieNinjas API to get nutrition info
          const ingredientQuery = recipe.ingredients
            .slice(0, 5) // Limit to first 5 ingredients to avoid API limits
            .map(ing => ing.name)
            .join(', ')

          console.log('🔍 Querying nutrition for ingredients:', ingredientQuery)

          const nutrition = await this.getNutritionInfo(ingredientQuery)
          if (nutrition) {
            recipe.nutrition = nutrition
            console.log('✅ Added nutrition data to MealDB recipe')
          } else {
            console.warn('⚠️ No nutrition data returned from CalorieNinjas')
          }
        } catch (error) {
          console.warn('⚠️ Could not fetch nutrition info for MealDB recipe:', error.message)
        }
      }

      console.log('✅ Recipe with nutrition ready:', {
        id: recipe.id,
        title: recipe.title,
        source: recipe.source,
        hasInstructions: !!recipe.instructions,
        hasIngredients: !!recipe.ingredients?.length,
        hasNutrition: !!recipe.nutrition,
        nutritionCalories: recipe.nutrition?.calories || 'N/A'
      })

      return recipe
    } catch (error) {
      console.error('❌ Error getting recipe with nutrition:', error)
      return null
    }
  }
  async getCommunityRecipeById(rawId) {
    try {
      const numericId = Number.parseInt(rawId, 10)
      const fallbackNumericId = Number.isNaN(numericId) ? -1 : numericId

      const recipe = await queryOne(
        `SELECT
           r.id,
           r.slug,
           r.title,
           r.description,
           r.image,
           r.prep_time,
           r.cook_time,
           r.servings,
           r.difficulty,
           r.category,
           r.cuisine,
           r.status,
           r.approval_status,
           r.is_public,
           r.created_at,
           r.updated_at
         FROM recipes r
         WHERE r.slug = ? OR r.id = ?`,
        [rawId, fallbackNumericId]
      )
      console.log('🔍 Community lookup result:', { rawId, fallbackNumericId, recipe })
      if (!recipe) {
        return null
      }

      let ingredients = []
      try {
        ingredients = await query(
          `SELECT
             ri.name,
             ri.amount,
             ri.unit,
             ri.notes,
             ri.position
           FROM recipe_ingredients ri
           WHERE ri.recipe_id = ?
           ORDER BY ri.position ASC`,
          [recipe.id]
        )
      } catch (error) {
        console.warn('⚠️ Unable to load recipe ingredients, returning empty list.', {
          recipeId: recipe.id,
          error: error.message
        })
        ingredients = []
      }

      let steps = []
      try {
        steps = await query(
          `SELECT
             instr.step_number,
             instr.instruction
           FROM instructions instr
           WHERE instr.recipe_id = ?
           ORDER BY instr.step_number ASC`,
          [recipe.id]
        )
      } catch (error) {
        console.warn('⚠️ Unable to load recipe instructions, returning empty list.', {
          recipeId: recipe.id,
          error: error.message
        })
        steps = []
      }

      const combinedInstructions =
        steps.length > 0
          ? steps
              .sort((a, b) => (a.step_number ?? 0) - (b.step_number ?? 0))
              .map((step) => step.instruction || '')
              .filter((instruction) => instruction && instruction.trim().length > 0)
              .join('\n\n')
          : recipe.instructions || ''

      const readyInMinutes =
        (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0) > 0
          ? (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)
          : null

      return {
        id: recipe.slug || recipe.id,
        databaseId: recipe.id,
        slug: recipe.slug,
        title: recipe.title,
        description: recipe.description,
        image: recipe.image,
        instructions: combinedInstructions,
        ingredients: ingredients.map((ingredient) => ({
          name: ingredient.name,
          amount: ingredient.amount !== null ? Number(ingredient.amount) : null,
          unit: ingredient.unit,
          notes: ingredient.notes,
          position: ingredient.position
        })),
        prepTime: recipe.prep_time,
        cookTime: recipe.cook_time,
        readyInMinutes,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        category: recipe.category,
        cuisine: recipe.cuisine,
        approvalStatus: recipe.approval_status,
        status: recipe.status,
        isPublic: recipe.is_public === 1,
        source: 'community',
        sourceKey: 'community',
        submittedAt: recipe.created_at,
        createdAt: recipe.created_at,
        updatedAt: recipe.updated_at,
        nutrition: {
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          fiber: 0
        }
      }
    } catch (error) {
      console.error('❌ Failed to load community recipe from database.', {
        rawId,
        message: error.message,
        code: error.code
      })
      return null
    }
  }
}

export default new RecipeAPI()
