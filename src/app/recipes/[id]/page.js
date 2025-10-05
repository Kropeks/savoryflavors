'use client'

import { useAuthModal } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Share2, Clock, Users, ChefHat, Flame, Utensils } from 'lucide-react';

export default function RecipeDetail() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { id } = params
  const sourceParam = searchParams.get('source')
  const { requireAuth } = useAuthModal()

  const [recipe, setRecipe] = useState(null)
  const [activeTab, setActiveTab] = useState('instructions')
  const [resolvedSource, setResolvedSource] = useState(null)

  useEffect(() => {
    if (id) {
      fetchRecipe()
    }
  }, [id, sourceParam])

  const fetchRecipe = async () => {
    try {
      const normalizedSource = sourceParam?.toLowerCase()
      const initialSources = []

      if (normalizedSource) {
        initialSources.push(normalizedSource)
      } else {
        const looksNumeric = Number.isFinite(Number.parseInt(id, 10))
        if (!looksNumeric) {
          initialSources.push('community')
        }
        initialSources.push('mealdb', 'edamam', 'community')
      }

      const sourcesToTry = [...new Set(initialSources)]
      console.log('🔍 Fetching recipe with ID:', id, 'Sources to try:', sourcesToTry)

      let lastError = null
      for (const attemptSource of sourcesToTry) {
        try {
          const response = await fetch(`/api/recipes/${encodeURIComponent(id)}?source=${attemptSource}`)
          if (!response.ok) {
            lastError = {
              status: response.status,
              statusText: response.statusText,
              body: await response.text()
            }
            console.warn('⚠️ Failed fetching recipe from source', attemptSource, lastError)
            continue
          }

          const data = await response.json()
          if (!data) {
            lastError = { status: response.status, statusText: 'Empty payload' }
            continue
          }

          const resolved = {
            ...data,
            source: data.source || attemptSource
          }

          console.log('✅ Recipe data received from', attemptSource, resolved)
          setRecipe(resolved)
          setResolvedSource(resolved.source)
          return
        } catch (innerError) {
          console.error('❌ Error while trying source', attemptSource, innerError)
          lastError = { statusText: innerError.message }
        }
      }

      const triedSources = sourcesToTry.join(', ')
      throw new Error(
        lastError
          ? `Failed to fetch recipe after trying sources (${triedSources}): ${lastError.status || ''} ${lastError.statusText || ''}`
          : `Failed to fetch recipe after trying sources (${triedSources})`
      )
    } catch (error) {
      console.error('❌ Error fetching recipe:', error)
      // Set a fallback recipe with error message
      setRecipe({
        id,
        title: 'Recipe Not Found',
        error: error.message,
        source: resolvedSource || sourceParam || 'unknown',
        isError: true
      })
    }
  }

  const toggleFavorite = async () => {
    // This would typically require user authentication
    setRecipe({
      ...recipe,
      isFavorite: !recipe.isFavorite
    })
  }

  // If recipe is not yet loaded, show a minimal placeholder or nothing
  if (!recipe) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/recipes" className="text-olive-600 hover:text-olive-700 mb-6 inline-block">
            ← Back to recipes
          </Link>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <p className="text-gray-600">🔍 Fetching recipe...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (recipe?.isError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {recipe.error || 'Failed to load recipe. Please try again later.'}
              </p>
            </div>
          </div>
        </div>
        <Link 
          href="/recipes" 
          className="inline-flex items-center text-olive-600 hover:text-olive-800 font-medium"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Recipes
        </Link>
      </div>
    )
  }

  const viewSource = (recipe?.source || resolvedSource || sourceParam || 'community').toLowerCase()

  console.log('📋 Recipe data for display:', {
    id: recipe.id,
    title: recipe.title,
    source: recipe.source,
    hasInstructions: !!recipe.instructions,
    instructionsLength: recipe.instructions?.length || 0,
    hasIngredients: !!recipe.ingredients,
    ingredientsCount: recipe.ingredients?.length || 0,
    hasNutrition: !!recipe.nutrition,
    hasImage: !!recipe.image,
    category: recipe.category,
    cuisine: recipe.cuisine,
    readyInMinutes: recipe.readyInMinutes,
    servings: recipe.servings
  })

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link href="/recipes" className="text-olive-600 hover:text-olive-700 mb-6 inline-block">
          ← Back to recipes
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Recipe header */}
          <div className="relative">
            <Image
              src={recipe.image || 'https://via.placeholder.com/800x400?text=Recipe+Image'}
              alt={recipe.title || 'Recipe image'}
              width={800}
              height={400}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-olive-600 px-3 py-1 rounded-full text-sm font-medium">
                  {recipe.category}
                </span>
                {recipe.cuisine && (
                  <span className="bg-gray-900/50 px-3 py-1 rounded-full text-sm">
                    {recipe.cuisine}
                  </span>
                )}
                <span className="bg-gray-900/50 px-3 py-1 rounded-full text-sm">
                  {viewSource.toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{recipe.title}</h1>
              {recipe.description && (
                <p className="text-lg text-gray-200">{recipe.description}</p>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Recipe meta info */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-6">
                {recipe.readyInMinutes && recipe.readyInMinutes > 0 && (
                  <div className="flex items-center gap-2 text-gray-800">
                    <Clock className="h-5 w-5 text-olive-600" />
                    <span>{recipe.readyInMinutes} minutes</span>
                  </div>
                )}
                {recipe.servings && recipe.servings > 0 && (
                  <div className="flex items-center gap-2 text-gray-800">
                    <Users className="h-5 w-5 text-olive-600" />
                    <span>{recipe.servings} servings</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (requireAuth('save recipes to favorites')) {
                      toggleFavorite();
                    }
                  }}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-800"
                >
                  <Heart className={`h-5 w-5 ${recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'}`} />
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-800">
                  <Share2 className="h-5 w-5 text-gray-600 hover:text-olive-600" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('instructions')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'instructions'
                      ? 'border-olive-600 text-olive-700 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-olive-600 hover:border-gray-300'
                  }`}
                >
                  Instructions
                </button>
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'ingredients'
                      ? 'border-olive-600 text-olive-700 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-olive-600 hover:border-gray-300'
                  }`}
                >
                  Ingredients
                </button>
                <button
                  onClick={() => setActiveTab('nutrition')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'nutrition'
                      ? 'border-olive-600 text-olive-700 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-olive-600 hover:border-gray-300'
                  }`}
                >
                  Nutrition
                </button>
              </nav>
            </div>

            {/* Tab content */}
            <div className="space-y-6">
              {activeTab === 'instructions' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Instructions</h3>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                      {recipe.instructions && recipe.instructions !== 'No instructions available' && recipe.instructions.length > 0
                        ? recipe.instructions
                        : (
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                  <strong>Note:</strong> This recipe from {recipe.source} provides ingredients and nutrition information, but detailed cooking instructions may not be available. You can use the ingredients list as a guide to prepare this dish.
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      }
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ingredients' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Ingredients</h3>
                  <div className="grid gap-3">
                    {recipe.ingredients && recipe.ingredients.length > 0 ? (
                      recipe.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <ChefHat className="h-5 w-5 text-olive-600" />
                          <div>
                            <span className="font-medium text-gray-900">
                              {typeof ingredient === 'string'
                                ? ingredient
                                : ingredient.original || `${ingredient.name} ${ingredient.measure || ''}`.trim()
                              }
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              <strong>Ingredients not available:</strong> This recipe from {recipe.source} may not have detailed ingredient information. The recipe title and nutrition data are available to help you identify this dish.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'nutrition' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Nutrition Information</h3>
                  {recipe.nutrition && (recipe.nutrition.calories > 0 || recipe.nutrition.protein > 0 || recipe.nutrition.fat > 0 || recipe.nutrition.carbs > 0) ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-olive-50 p-4 rounded-lg text-center">
                        <Flame className="h-6 w-6 text-olive-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-olive-600">{recipe.nutrition.calories > 0 ? Math.round(recipe.nutrition.calories) : 'N/A'}</div>
                        <div className="text-sm text-black">Calories</div>
                      </div>
                      {recipe.nutrition.protein > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <Utensils className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-blue-600">{Math.round(recipe.nutrition.protein)}g</div>
                          <div className="text-sm text-black">Protein</div>
                        </div>
                      )}
                      {recipe.nutrition.fat > 0 && (
                        <div className="bg-yellow-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-yellow-600">{Math.round(recipe.nutrition.fat)}g</div>
                          <div className="text-sm text-black">Fat</div>
                        </div>
                      )}
                      {recipe.nutrition.carbs > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">{Math.round(recipe.nutrition.carbs)}g</div>
                          <div className="text-sm text-black">Carbs</div>
                        </div>
                      )}
                      {recipe.nutrition.fiber > 0 && (
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-purple-600">{Math.round(recipe.nutrition.fiber)}g</div>
                          <div className="text-sm text-black">Fiber</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-orange-700">
                            <strong>Nutrition data not available:</strong> This recipe from {recipe.source} may not have detailed nutrition information. However, you can still view the recipe title and other available details.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Additional info for Edamam recipes */}
            {viewSource === 'edamam' && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recipe.dietLabels && recipe.dietLabels.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Diet Labels</h4>
                      <div className="flex flex-wrap gap-2">
                        {recipe.dietLabels.map((label, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {recipe.healthLabels && recipe.healthLabels.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Health Labels</h4>
                      <div className="flex flex-wrap gap-2">
                        {recipe.healthLabels.slice(0, 8).map((label, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Original recipe source link */}
                {recipe.url && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-gray-700 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">Original Recipe Source</h4>
                          <p className="text-sm text-black mb-3">
                            This recipe is sourced from {recipe.source || 'Edamam'}. For complete cooking instructions and methods, please visit the original recipe page.
                          </p>
                          <a
                            href={recipe.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-olive-600 text-white px-4 py-2 rounded-lg hover:bg-olive-700 transition-colors font-medium"
                          >
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            </svg>
                            View Full Recipe Instructions
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
