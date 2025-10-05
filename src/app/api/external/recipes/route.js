import recipeAPI from '@/lib/recipeAPI.js'
import nutritionAPI from '@/lib/nutritionAPI.js'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source') || 'mealdb'
    const effectiveSource = source === 'all' ? 'mealdb' : source
    const query = searchParams.get('query')
    const category = searchParams.get('category')
    const cuisine = searchParams.get('cuisine')
    const ingredient = searchParams.get('ingredient')
    const id = searchParams.get('id')
    const diet = searchParams.get('diet')
    const nutrition = searchParams.get('nutrition')
    const number = parseInt(searchParams.get('number')) || 20

    // Validate source
    if (!['all', 'mealdb'].includes(source)) {
      return Response.json(
        { error: 'Invalid source. Supported sources: mealdb, all' },
        { status: 400 }
      )
    }

    let recipes = []

    if (id) {
      // Get single recipe by ID
      const recipe = await recipeAPI.getRecipeWithNutrition(id, effectiveSource)
      return Response.json(recipe)
    }

    if (effectiveSource === 'mealdb') {
      // Start with a base set of recipes
      let baseRecipes = []

      try {
        if (query || category || cuisine || ingredient) {
          // If any specific filter is applied, start with search results
          if (query) {
            baseRecipes = await recipeAPI.searchRecipesByNameMealDB(query)
          } else if (ingredient) {
            baseRecipes = await recipeAPI.searchByIngredientMealDB(ingredient)
          } else if (category) {
            baseRecipes = await recipeAPI.getRecipesByCategoryMealDB(category)
          } else if (cuisine) {
            baseRecipes = await recipeAPI.getRecipesByAreaMealDB(cuisine)
          }

          // Apply additional filters to the base results
          if (baseRecipes.length > 0) {
            // Helper function to apply filter with fallback
            const applyFilter = (filterFn, filterName) => {
              try {
                const filtered = filterFn()
                if (filtered.length === 0) {
                  console.warn(`No recipes matched ${filterName} filter, keeping original results`)
                  return baseRecipes
                }
                return filtered
              } catch (error) {
                console.warn(`Error applying ${filterName} filter:`, error.message)
                return baseRecipes
              }
            }

            if (category && !query && !ingredient) {
              baseRecipes = applyFilter(() =>
                baseRecipes.filter(recipe =>
                  recipe.category?.toLowerCase().includes(category.toLowerCase())
                ), 'category'
              )
            }
            if (cuisine && !query && !ingredient) {
              baseRecipes = applyFilter(() =>
                baseRecipes.filter(recipe =>
                  recipe.cuisine?.toLowerCase().includes(cuisine.toLowerCase())
                ), 'cuisine'
              )
            }
            if (ingredient && !query) {
              baseRecipes = applyFilter(() =>
                baseRecipes.filter(recipe =>
                  recipe.ingredients?.some(ing =>
                    ing.name.toLowerCase().includes(ingredient.toLowerCase())
                  )
                ), 'ingredient'
              )
            }
          }
        } else {
          // Get random recipes from MealDB
          baseRecipes = await recipeAPI.getRandomRecipesMealDB(number)
        }

        recipes = baseRecipes
      } catch (error) {
        console.error('Error fetching from MealDB:', error.message)
        // Return empty array instead of crashing
        recipes = []
      }
    }

    // Apply nutrition filters if specified
    if (nutrition && recipes.length > 0) {
      recipes = await applyNutritionFilters(recipes, nutrition)
    }

    // Limit results
    recipes = recipes.slice(0, number)

    return Response.json({
      recipes,
      source: effectiveSource,
      count: recipes.length,
      total: recipes.length,
      filters: {
        query,
        category,
        cuisine,
        ingredient,
        diet,
        nutrition
      },
      debug: {
        mealdbResults: recipes.filter(r => r.source === 'MealDB').length
      }
    })
  } catch (error) {
    console.error('Error fetching recipes from external APIs:', error)
    return Response.json(
      {
        recipes: [],
        source: effectiveSource,
        count: 0,
        total: 0,
        filters: {
          query,
          category,
          cuisine,
          ingredient,
        },
        error: 'Failed to fetch recipes from external APIs',
        debug: {
          errorMessage: error.message,
          sourceRequested: effectiveSource
        }
      },
      { status: 200 }
    )
  }
}

// Helper function to remove duplicate recipes
function removeDuplicateRecipes(recipes) {
  const seen = new Map()

  return recipes.filter(recipe => {
    // Create a unique identifier combining multiple fields
    const identifier = `${recipe.source}-${recipe.id}-${recipe.title?.toLowerCase()}`

    if (seen.has(identifier)) {
      console.log('🔄 Removing duplicate recipe:', recipe.title, 'from', recipe.source)
      return false
    }

    seen.set(identifier, true)
    return true
  })
}

// Helper function to apply nutrition filters
async function applyNutritionFilters(recipes, nutritionFilter) {
  const filteredRecipes = []

  for (const recipe of recipes) {
    let includeRecipe = true

    // Get nutrition data if not already present
    if (!recipe.nutrition) {
      try {
        const nutrition = await nutritionAPI.getNutritionInfoCombined(recipe.title)
        if (nutrition) {
          recipe.nutrition = nutrition
        }
      } catch (error) {
        console.warn('Could not get nutrition data for:', recipe.title)
      }
    }

    if (recipe.nutrition) {
      const { calories = 0, protein = 0, carbs = 0, fat = 0, fiber = 0, sugar = 0 } = recipe.nutrition

      switch (nutritionFilter) {
        case 'high-protein':
          includeRecipe = protein >= 15
          break
        case 'low-calorie':
          includeRecipe = calories < 300
          break
        case 'high-fiber':
          includeRecipe = fiber >= 5
          break
        case 'low-sugar':
          includeRecipe = sugar <= 5
          break
        default:
          includeRecipe = true
      }
    }

    if (includeRecipe) {
      filteredRecipes.push(recipe)
    }
  }

  return filteredRecipes
}
