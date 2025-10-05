'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Clock, Users, Heart, Share2, ChefHat, Utensils, Flame } from 'lucide-react'

export default function RecipeDetail() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { id } = params
  const source = searchParams.get('source') || 'mealdb'

  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('instructions')

  useEffect(() => {
    if (id) {
      fetchRecipe()
    }
  }, [id, source])

  const fetchRecipe = async () => {
    setLoading(true)
    try {
      // Determine the correct source based on the ID format or provided source
      let effectiveSource = source;
      
      // If source is not provided, try to determine it from the ID
      if (!effectiveSource) {
        // Spoonacular IDs are typically numeric, MealDB IDs are typically numeric but could be strings
        effectiveSource = 'mealdb'; // Default to mealdb if we can't determine
      }
      
      const response = await fetch(`/api/external/recipes?source=${effectiveSource}&id=${id}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch recipe: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      if (!data) {
        throw new Error('No recipe data returned from API')
      }
      
      setRecipe(data)
    } catch (error) {
      console.error('Error fetching recipe:', error)
      // Set a fallback recipe with error message
      setRecipe({
        id,
        title: 'Recipe Not Found',
        error: error.message,
        source: source || 'unknown',
        isError: true
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async () => {
    // This would typically require user authentication
    setRecipe({
      ...recipe,
      isFavorite: !recipe.isFavorite
    })
  }

  if (loading && !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-olive-500"></div>
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

  if (!recipe) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipe...</p>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Recipe not found</h1>
          <Link href="/recipes" className="text-olive-600 hover:text-olive-700">
            ← Back to recipes
          </Link>
        </div>
      </div>
    )
  }

  const averageRating = recipe.reviews?.length > 0
    ? recipe.reviews.reduce((sum, review) => sum + review.rating, 0) / recipe.reviews.length
    : 0

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
              src={recipe.image || '/api/placeholder/800/400'}
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
                  {source.toUpperCase()}
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
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">4.8</span>
                  <span className="text-gray-600">(120 reviews)</span>
                </div>
                {recipe.totalTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <span>{recipe.totalTime} minutes</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <span>4 servings</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleFavorite}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Heart className={`h-5 w-5 ${recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('instructions')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'instructions'
                      ? 'border-olive-600 text-olive-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Instructions
                </button>
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'ingredients'
                      ? 'border-olive-600 text-olive-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Ingredients
                </button>
                <button
                  onClick={() => setActiveTab('nutrition')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'nutrition'
                      ? 'border-olive-600 text-olive-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {recipe.instructions || 'No instructions available.'}
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
                            <span className="font-medium">
                              {typeof ingredient === 'string'
                                ? ingredient
                                : ingredient.original || `${ingredient.name} ${ingredient.measure}`
                              }
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">No ingredients available for this recipe.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'nutrition' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Nutrition Information</h3>
                  {recipe.nutrition ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-olive-50 p-4 rounded-lg text-center">
                        <Flame className="h-6 w-6 text-olive-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-olive-600">{recipe.nutrition.calories || recipe.calories || 'N/A'}</div>
                        <div className="text-sm text-gray-600">Calories</div>
                      </div>
                      {recipe.nutrition.protein && (
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <Utensils className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-blue-600">{recipe.nutrition.protein}g</div>
                          <div className="text-sm text-gray-600">Protein</div>
                        </div>
                      )}
                      {recipe.nutrition.fat && (
                        <div className="bg-yellow-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-yellow-600">{recipe.nutrition.fat}g</div>
                          <div className="text-sm text-gray-600">Fat</div>
                        </div>
                      )}
                      {recipe.nutrition.carbs && (
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">{recipe.nutrition.carbs}g</div>
                          <div className="text-sm text-gray-600">Carbs</div>
                        </div>
                      )}
                      {recipe.nutrition.fiber && (
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-purple-600">{recipe.nutrition.fiber}g</div>
                          <div className="text-sm text-gray-600">Fiber</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600">Nutrition information not available for this recipe.</p>
                  )}
                </div>
              )}
            </div>

            {/* Additional info for Edamam recipes */}
            {source === 'edamam' && (
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
                        {recipe.healthLabels.slice(0, 5).map((label, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
