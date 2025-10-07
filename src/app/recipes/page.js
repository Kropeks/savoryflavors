'use client'

import { useAuthModal } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Plus, Clock, Users, Star, Utensils } from 'lucide-react';

export default function Recipes() {
  const { requireAuth } = useAuthModal();
  const searchParams = useSearchParams();
  const [recipes, setRecipes] = useState([])
  const [categories, setCategories] = useState([])
  const [cuisines, setCuisines] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('')
  const [selectedIngredient, setSelectedIngredient] = useState('')
  const [debouncedIngredient, setDebouncedIngredient] = useState('')
  const [selectedSource, setSelectedSource] = useState('all')
  const [dietFilter, setDietFilter] = useState('')
  const [nutritionFilter, setNutritionFilter] = useState('')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const sources = [
    { value: 'all', label: 'All Sources' },
    { value: 'mealdb', label: 'MealDB' }
  ]

  const dietOptions = [
    { value: '', label: 'All Diets' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten-free', label: 'Gluten Free' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'low-carb', label: 'Low Carb' }
  ]

  const nutritionOptions = [
    { value: '', label: 'All Nutrition' },
    { value: 'high-protein', label: 'High Protein' },
    { value: 'low-calorie', label: 'Low Calorie' },
    { value: 'high-fiber', label: 'High Fiber' },
    { value: 'low-sugar', label: 'Low Sugar' }
  ]

  useEffect(() => {
    fetchInitialData()
  }, [])

  // Initialize filters from URL parameters
  useEffect(() => {
    const cuisine = searchParams.get('cuisine')
    const category = searchParams.get('category')
    const query = searchParams.get('query')
    const source = searchParams.get('source')

    if (cuisine) setSelectedCuisine(cuisine)
    if (category) setSelectedCategory(category)
    if (query) setSearchTerm(query)
    if (source && ['all', 'mealdb'].includes(source)) {
      setSelectedSource(source)
    }
  }, [searchParams])

  // Debounced ingredient search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedIngredient(selectedIngredient)
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timer)
  }, [selectedIngredient])

  useEffect(() => {
    if (searchTerm || selectedCategory || selectedCuisine || dietFilter || nutritionFilter || debouncedIngredient) {
      fetchRecipes()
    } else {
      // Load default recipes when no filters are applied
      fetchRecipes()
    }
  }, [searchTerm, selectedCategory, selectedCuisine, selectedSource, dietFilter, nutritionFilter, debouncedIngredient])

  const fetchInitialData = async () => {
    try {
      // Fetch categories from MealDB
      const categoriesResponse = await fetch('/api/mealdb?type=categories')
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      }

      // Fetch cuisines
      const cuisinesResponse = await fetch('/api/mealdb?type=cuisines')
      if (cuisinesResponse.ok) {
        const cuisinesData = await cuisinesResponse.json()
        setCuisines(cuisinesData)
      }

      // Fetch initial recipes
      await fetchRecipes()
    } catch (error) {
      console.error('Error fetching initial data:', error)
    }
  }

  const fetchRecipes = async (loadMore = false) => {
    try {
      // Set loading states
      if (loadMore) {
        setIsLoadingMore(true)
      } else {
        setRecipes([]) // Clear previous results when starting a new search
      }

      const currentPage = loadMore ? page + 1 : 1
      const itemsPerPage = 12

      const combinedResults = []
      const seen = new Set()

      console.log('🔍 Fetching recipes with params:', {
        searchTerm,
        selectedCategory,
        selectedCuisine,
        selectedSource,
        currentPage,
        itemsPerPage
      })

      const formatSourceLabel = (key) => {
        if (key === 'mealdb') return 'MealDB'
        if (key === 'community') return 'Community'
        return key.charAt(0).toUpperCase() + key.slice(1)
      }

      const addRecipes = (incoming = []) => {
        incoming.forEach((recipe = {}) => {
          const rawSourceKey = recipe.sourceKey || recipe.source || 'mealdb'
          const normalizedSourceKey = rawSourceKey.toString().toLowerCase()
          const identifier = `${normalizedSourceKey}-${recipe.id}-${recipe.title?.toLowerCase()}`
          if (seen.has(identifier)) {
            return
          }
          seen.add(identifier)

          const hasImage = typeof recipe.image === 'string' && recipe.image.trim().length > 0
          const displaySource = formatSourceLabel(normalizedSourceKey)
          const safeImage = hasImage ? recipe.image : '/placeholder-recipe.jpg'

          combinedResults.push({
            ...recipe,
            image: safeImage,
            hasImage,
            source: displaySource,
            sourceKey: normalizedSourceKey,
            readyInMinutes: recipe.readyInMinutes || recipe.prepTime || recipe.cookTime ? (Number(recipe.readyInMinutes) || Number(recipe.prepTime) || 0) + (Number(recipe.cookTime) || 0) : recipe.readyInMinutes,
            servings: recipe.servings || null
          })
        })
      }

      // Fetch community recipes if 'all' or 'community' is selected
      if (selectedSource === 'community' || selectedSource === 'all') {
        try {
          const communityParams = new URLSearchParams({
            page: currentPage,
            limit: itemsPerPage
          })
          
          // Add filters if they exist
          if (searchTerm) communityParams.append('search', searchTerm)
          if (selectedCategory) communityParams.append('category', selectedCategory)
          if (selectedCuisine) communityParams.append('cuisine', selectedCuisine)
          
          console.log('🌐 Fetching community recipes with params:', communityParams.toString())
          
          const communityResponse = await fetch(`/api/recipes?${communityParams.toString()}`)
          
          if (!communityResponse.ok) {
            const errorData = await communityResponse.text()
            console.error('❌ Error fetching community recipes:', {
              status: communityResponse.status,
              statusText: communityResponse.statusText,
              error: errorData
            })
            throw new Error(`Failed to fetch community recipes: ${communityResponse.statusText}`)
          }
          
          const communityData = await communityResponse.json()
          console.log('📦 Received community recipes:', communityData)
          
          if (communityData.recipes && Array.isArray(communityData.recipes)) {
            console.log(`✅ Found ${communityData.recipes.length} community recipes`)
            const formattedCommunityRecipes = communityData.recipes.map(recipe => {
              const formatted = {
                ...recipe,
                source: 'community',
                sourceKey: 'community',
                // Ensure required fields have default values
                title: recipe.title || 'Untitled Recipe',
                image: recipe.image || '/placeholder-recipe.jpg'
              }
              console.log('📝 Formatted recipe:', { id: recipe.id, title: recipe.title })
              return formatted
            })
            addRecipes(formattedCommunityRecipes)
          } else {
            console.warn('⚠️ No recipes array in community data:', communityData)
          }
        } catch (error) {
          console.error('Error fetching community recipes:', error)
        }
      }

      // Fetch external recipes if 'all' or 'mealdb' is selected
      let externalHasMore = false
      if (selectedSource === 'mealdb' || selectedSource === 'all') {
        try {
          const externalParams = new URLSearchParams()
          if (searchTerm) externalParams.append('query', searchTerm)
          if (selectedCategory) externalParams.append('category', selectedCategory)
          if (selectedCuisine) externalParams.append('cuisine', selectedCuisine)
          if (debouncedIngredient) externalParams.append('ingredient', debouncedIngredient)
          if (dietFilter) externalParams.append('diet', dietFilter)
          if (nutritionFilter) externalParams.append('nutrition', nutritionFilter)
          externalParams.append('source', 'mealdb')
          externalParams.append('number', itemsPerPage)
          externalParams.append('offset', String((currentPage - 1) * itemsPerPage))

          const externalResponse = await fetch(`/api/external/recipes?${externalParams.toString()}`)
          const externalData = await externalResponse.json()

          if (externalData.error) {
            console.warn('MealDB API returned error:', externalData.error)
          } else {
            addRecipes(externalData.recipes || [])
            externalHasMore = (externalData.recipes || []).length === itemsPerPage
          }
        } catch (error) {
          console.error('Error fetching external recipes:', error)
        }
      }

      // Sort by title if needed
      if (combinedResults.length > 1) {
        combinedResults.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
      }

      console.log('📊 Combined results:', {
        total: combinedResults.length,
        recipes: combinedResults.map(r => ({ id: r.id, title: r.title }))
      })

      if (loadMore) {
        setRecipes((prevRecipes) => {
          const newRecipes = [...prevRecipes, ...combinedResults]
          console.log('🔄 Updated recipes (load more):', newRecipes.length)
          return newRecipes
        })
      } else {
        console.log('🆕 Set new recipes:', combinedResults.length)
        setRecipes(combinedResults)
      }

      setPage(currentPage)
      const nextHasMore = externalHasMore
      setHasMore(nextHasMore)

      if (isInitialLoad) {
        setIsInitialLoad(false)
      }
    } catch (error) {
      console.error('Error fetching recipes:', error)
      if (!loadMore) { // Only show error message on initial load, not on 'load more'
        // Don't load demo data; instead, show an error message
        setRecipes([])
      }
    } finally {
      setIsLoadingMore(false)
    }
  }

  const loadMoreRecipes = async () => {
    if (isLoadingMore || !hasMore) return
    await fetchRecipes(true)
  }

  const toggleFavorite = async (recipeId) => {
    // This would typically require user authentication
    // For now, just update the local state
    setRecipes(recipes.map(recipe => {
      if (recipe.id === recipeId) {
        return {
          ...recipe,
          isFavorite: !recipe.isFavorite
        }
      }
      return recipe
    }))
  }

  const getNutritionBadge = (recipe) => {
    if (!recipe.nutrition) return null

    const { calories = 0, protein = 0, carbs = 0, fat = 0 } = recipe.nutrition

    if (protein >= 20) return { type: 'protein', label: 'High Protein', color: 'bg-green-100 text-green-800' }
    if (calories < 300) return { type: 'calorie', label: 'Low Cal', color: 'bg-blue-100 text-blue-800' }
    if (fat < 10) return { type: 'low-fat', label: 'Low Fat', color: 'bg-yellow-100 text-yellow-800' }
    return null
  }

  return (
    <div className="min-h-screen pt-20 bg-soft-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-olive-800 dark:text-olive-200 mb-4 font-fredoka">Recipes</h1>
            <p className="text-lg text-olive-700 dark:text-olive-200/80 font-fredoka">
              Discover amazing recipes from trusted food APIs
            </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-soft-200 dark:border-gray-800 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
            {/* Search */}
            <div className="relative xl:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-olive-500 h-5 w-5" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input w-full pl-10 pr-4 py-2 border border-soft-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-olive-500 bg-white dark:bg-gray-800 text-olive-800 dark:text-gray-100 placeholder-olive-600 dark:placeholder-gray-400 font-fredoka"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-input px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.idCategory} value={category.strCategory}>
                  {category.strCategory}
                </option>
              ))}
            </select>

            {/* Cuisine Filter */}
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="filter-input px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            >
              <option value="">All Cuisines</option>
              {cuisines.map((cuisine) => (
                <option key={cuisine.strArea} value={cuisine.strArea}>
                  {cuisine.strArea}
                </option>
              ))}
            </select>

            {/* Ingredient Filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by ingredient..."
                value={selectedIngredient}
                onChange={(e) => setSelectedIngredient(e.target.value)}
                className="filter-input px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400"
              />
              {selectedIngredient && selectedIngredient !== debouncedIngredient && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  Searching...
                </div>
              )}
            </div>

            {/* Source Filter */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="filter-input px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            >
              {sources.map((source) => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
            </select>

            {/* Diet Filter */}
            <select
              value={dietFilter}
              onChange={(e) => setDietFilter(e.target.value)}
              className="filter-input px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            >
              {dietOptions.map((diet) => (
                <option key={diet.value} value={diet.value}>
                  {diet.label}
                </option>
              ))}
            </select>
          </div>

          {/* Nutrition Filter */}
          <div className="mb-4">
            <select
              value={nutritionFilter}
              onChange={(e) => setNutritionFilter(e.target.value)}
              className="filter-input px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            >
              {nutritionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-2 items-center">
              <p className="text-olive-700 dark:text-olive-200 font-fredoka">
                {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found
                {selectedSource !== 'all' && ` from ${sources.find(s => s.value === selectedSource)?.label}`}
              </p>

              {/* Active Filters Display */}
              <div className="flex flex-wrap gap-1 ml-4">
                {searchTerm && (
                  <span className="bg-olive-100 text-olive-800 dark:bg-olive-900/40 dark:text-olive-200 px-2 py-1 rounded-full text-xs">
                    Search: "{searchTerm}"
                  </span>
                )}
                {selectedCategory && (
                  <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                    Category: {selectedCategory}
                  </span>
                )}
                {selectedCuisine && (
                  <span className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 px-2 py-1 rounded-full text-xs">
                    Cuisine: {selectedCuisine}
                  </span>
                )}
                {debouncedIngredient && (
                  <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200 px-2 py-1 rounded-full text-xs">
                    Ingredient: {debouncedIngredient}
                  </span>
                )}
                {dietFilter && (
                  <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 px-2 py-1 rounded-full text-xs">
                    Diet: {dietOptions.find(d => d.value === dietFilter)?.label}
                  </span>
                )}
                {nutritionFilter && (
                  <span className="bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200 px-2 py-1 rounded-full text-xs">
                    Nutrition: {nutritionOptions.find(n => n.value === nutritionFilter)?.label}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Link href="/cuisines" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Browse Cuisines
              </Link>
              <Link href="/recipes/create" className="bg-olive-600 text-white px-4 py-2 rounded-lg hover:bg-olive-700 transition-colors flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Recipe
              </Link>
            </div>
          </div>
        </div>

        {/* Recipes Grid */}
        {recipes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-olive-800 dark:text-olive-200 mb-2">
              {selectedSource === 'edamam' ? 'Recipes currently unavailable' : 'No recipes found'}
            </h3>
            <p className="text-olive-600 dark:text-olive-200/80 mb-4">
              {selectedSource === 'edamam'
                ? 'Unable to load recipes. This might be due to API limitations or connectivity issues.'
                : isInitialLoad
                  ? 'Unable to load recipes. Please check your internet connection or try again later.'
                  : 'Try adjusting your search criteria'
              }
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/cuisines" className="text-olive-600 hover:text-olive-700 dark:text-olive-200 dark:hover:text-olive-100 font-medium">
                Browse cuisines →
              </Link>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('')
                  setSelectedCuisine('')
                  setDietFilter('')
                  setNutritionFilter('')
                  setSelectedSource('mealdb')
                  setSelectedIngredient('')
                  setDebouncedIngredient('')
                }}
                className="text-olive-600 hover:text-olive-700 dark:text-olive-200 dark:hover:text-olive-100 font-medium"
              >
                Clear all filters →
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {recipes.map((recipe, index) => {
                const nutritionBadge = getNutritionBadge(recipe)
                const isRemoteImage = recipe.hasImage && /^https?:\/\//i.test(recipe.image)
                return (
                  <div key={`${recipe.id}-${index}`} className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-transparent dark:border-gray-800">
                    <div className="relative h-56">
                      <Image
                        src={recipe.image || '/placeholder-recipe.jpg'}
                        alt={recipe.title}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        onError={(event) => {
                          const target = event.currentTarget
                          target.onerror = null
                          target.src = '/placeholder-recipe.jpg'
                        }}
                        unoptimized={isRemoteImage}
                      />
                      <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {recipe.source || 'MealDB'}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold mb-2 line-clamp-2 h-14 text-olive-900 dark:text-olive-200">{recipe.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {/* Edamam diet labels */}
                        {recipe.dietLabels && recipe.dietLabels.length > 0 && (
                          <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 px-2 py-1 rounded-full">
                            {recipe.dietLabels[0]}
                          </span>
                        )}
                        {/* Edamam health labels */}
                        {recipe.healthLabels && recipe.healthLabels.length > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 px-2 py-1 rounded-full">
                            {recipe.healthLabels[0]}
                          </span>
                        )}
                        {/* Standard fields that work for both sources */}
                        {recipe.category && (
                          <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200 px-2 py-1 rounded-full">
                            {recipe.category}
                          </span>
                        )}
                        {recipe.cuisine && (
                          <span className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 px-2 py-1 rounded-full">
                            {recipe.cuisine}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-olive-700 dark:text-olive-200 mb-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-green-600" />
                          <span>{recipe.readyInMinutes || '30'} min</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-green-600" />
                          <span>{recipe.servings || 4} servings</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span>{recipe.healthScore ? (recipe.healthScore / 20).toFixed(1) : '4.5'}</span>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Link 
                          href={`/recipes/${recipe.slug || recipe.id}?source=${encodeURIComponent(recipe.sourceKey || recipe.source?.toLowerCase() || 'mealdb')}`} 
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium flex items-center group"
                        >
                          View Recipe
                          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Load More Button */}
            {hasMore && !isInitialLoad && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreRecipes}
                  disabled={isLoadingMore}
                  className={`px-6 py-3 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium mx-auto ${
                    isLoadingMore 
                      ? 'bg-olive-500 cursor-not-allowed' 
                      : 'bg-olive-600 hover:bg-olive-700'
                  }`}
                >
                  {isLoadingMore ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    'Load More Recipes'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
