import { NextResponse } from 'next/server'
import recipeAPI from '@/lib/recipeAPI.js'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const decodedId = decodeURIComponent(id)
    const { searchParams } = new URL(request.url)
    const sourceParam = searchParams.get('source')?.toLowerCase()
    const source = sourceParam || 'community'

    console.log('🔍 API Route - Recipe request:', { id: decodedId, source })

    if (!decodedId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      )
    }

    console.log('🔍 API Route - Checking community database first...')
    const communityRecipe = await recipeAPI.getCommunityRecipeById(decodedId)
    if (communityRecipe) {
      console.log('✅ API Route - Found community recipe:', {
        id: communityRecipe.id,
        title: communityRecipe.title
      })

      return NextResponse.json({
        ...communityRecipe,
        source: 'community',
        sourceKey: 'community'
      })
    }

    if (source === 'community') {
      console.warn('⚠️ API Route - Community recipe not found:', decodedId)
      return NextResponse.json(
        {
          error: 'Recipe not found',
          message: 'This recipe was not found in the community database.',
          debug: { id: decodedId, source }
        },
        { status: 404 }
      )
    }

    if (!['mealdb', 'edamam'].includes(source)) {
      return NextResponse.json(
        { error: 'Invalid source. Supported sources: mealdb, edamam, community' },
        { status: 400 }
      )
    }

    console.log('🔍 API Route - Fetching from external source:', source)
    const recipe = await recipeAPI.getRecipeWithNutrition(decodedId, source)

    if (!recipe) {
      console.warn('⚠️ API Route - No recipe found in external source')
      return NextResponse.json(
        {
          error: 'Recipe not found',
          message: 'No recipe was found using the provided identifier.',
          debug: { id: decodedId, source }
        },
        { status: 404 }
      )
    }

    console.log('✅ API Route - Recipe found successfully:', {
      id: recipe.id,
      title: recipe.title,
      source: recipe.source,
      hasInstructions: !!recipe.instructions && recipe.instructions.length > 0,
      hasIngredients: !!recipe.ingredients?.length,
      hasNutrition: !!recipe.nutrition
    })

    return NextResponse.json(recipe)
  } catch (error) {
    console.error('❌ API Route - Error fetching recipe:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch recipe',
        details: error.message,
        debug: {
          id: params.id,
          source: request.nextUrl.searchParams.get('source') || 'mealdb',
          stack: error.stack
        }
      },
      { status: 500 }
    )
  }
}
