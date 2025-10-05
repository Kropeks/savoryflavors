import recipeAPI from '@/lib/recipeAPI.js'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query) {
      return Response.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    const nutrition = await recipeAPI.getNutritionInfo(query)

    return Response.json(nutrition)
  } catch (error) {
    console.error('Error fetching nutrition info:', error)
    return Response.json(
      {
        error: 'Failed to fetch nutrition information',
        details: error.message
      },
      { status: 500 }
    )
  }
}
