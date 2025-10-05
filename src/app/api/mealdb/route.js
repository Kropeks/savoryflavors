import recipeAPI from '@/lib/recipeAPI.js'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (!type) {
      return Response.json(
        { error: 'Type parameter is required. Use "categories", "areas", "ingredients", "latest", or "test"' },
        { status: 400 }
      )
    }

    let data

    switch (type) {
      case 'categories':
        data = await recipeAPI.getCategoriesMealDB()
        break

      case 'areas':
      case 'cuisines':
        data = await recipeAPI.getAreasMealDB()
        break

      case 'ingredients':
        data = await recipeAPI.getIngredientsMealDB()
        break

      case 'latest':
        const count = parseInt(searchParams.get('count')) || 10
        data = await recipeAPI.getLatestRecipesMealDB(count)
        break

      case 'test':
        const isConnected = await recipeAPI.testConnection()
        data = { status: isConnected ? 'connected' : 'failed', message: 'API connection test' }
        break

      default:
        return Response.json(
          { error: 'Invalid type. Use "categories", "areas", "ingredients", "latest", or "test"' },
          { status: 400 }
        )
    }

    return Response.json(data)
  } catch (error) {
    console.error('Error fetching MealDB data:', error)
    return Response.json(
      {
        error: 'Failed to fetch MealDB data',
        details: error.message
      },
      { status: 500 }
    )
  }
}
