'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Star, Clock, Users, Heart, Plus, ChefHat, Utensils, Leaf, Zap, Globe, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Discover() {
  const [featuredRecipes, setFeaturedRecipes] = useState([])
  const [latestRecipes, setLatestRecipes] = useState([])
  const [categories, setCategories] = useState([])
  const [cuisines, setCuisines] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('')
  const [selectedIngredient, setSelectedIngredient] = useState('')

  useEffect(() => {
    fetchDiscoveryData()
  }, [])

  const fetchDiscoveryData = async () => {
    setLoading(true)
    try {
      // Fetch latest recipes
      const latestResponse = await fetch('/api/mealdb?type=latest&count=12')
      if (latestResponse.ok) {
        const latestData = await latestResponse.json()
        setLatestRecipes(latestData)
      }

      // Fetch categories
      const categoriesResponse = await fetch('/api/mealdb?type=categories')
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      }

      // Fetch cuisines
      const cuisinesResponse = await fetch('/api/mealdb?type=areas')
      if (cuisinesResponse.ok) {
        const cuisinesData = await cuisinesResponse.json()
        setCuisines(cuisinesData)
      }

      // Fetch ingredients
      const ingredientsResponse = await fetch('/api/mealdb?type=ingredients')
      if (ingredientsResponse.ok) {
        const ingredientsData = await ingredientsResponse.json()
        setIngredients(ingredientsData.slice(0, 20)) // Limit to 20 ingredients
      }

      // Fetch featured recipes (random)
      const featuredResponse = await fetch('/api/external/recipes?source=mealdb&number=16')
      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json()
        setFeaturedRecipes(featuredData.recipes || [])
      }
    } catch (error) {
      console.error('Error fetching discovery data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Beef': '🥩',
      'Chicken': '🍗',
      'Seafood': '🐟',
      'Vegetarian': '🥬',
      'Dessert': '🍰',
      'Pasta': '🍝',
      'Lamb': '🍖',
      'Pork': '🥓',
      'Vegan': '🌱',
      'Breakfast': '🍳'
    }
    return iconMap[categoryName] || '🍽️'
  }

  const getCuisineFlag = (cuisineName) => {
    const flagMap = {
      'American': '🇺🇸',
      'British': '🇬🇧',
      'Canadian': '🇨🇦',
      'Chinese': '🇨🇳',
      'French': '🇫🇷',
      'Greek': '🇬🇷',
      'Indian': '🇮🇳',
      'Italian': '🇮🇹',
      'Japanese': '🇯🇵',
      'Mexican': '🇲🇽',
      'Thai': '🇹🇭',
      'Turkish': '🇹🇷',
      'Vietnamese': '🇻🇳',
      'Spanish': '🇪🇸'
    }
    return flagMap[cuisineName] || '🌍'
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Discovering amazing recipes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-olive-900 mb-4">
            Discover Amazing Recipes
          </h1>
          <p className="text-xl text-olive-700 mb-8">
            Explore thousands of recipes from around the world with our comprehensive discovery system
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
            <input
              type="text"
              placeholder="Search for recipes, ingredients, or cuisines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-olive-500 focus:border-transparent shadow-lg"
            />
          </div>
        </div>

        {/* Featured Recipes */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-olive-900">Featured Recipes</h2>
            <Link href="/recipes" className="text-olive-600 hover:text-olive-700 font-medium">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {featuredRecipes.slice(0, 10).map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Image
                    src={recipe.image || '/placeholder-recipe.jpg'}
                    alt={recipe.title || 'Recipe image'}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-recipe.jpg';
                    }}
                    unoptimized={recipe.image?.startsWith('http://') || recipe.image?.startsWith('https://')}
                  />
                  <span className="absolute top-4 right-4 px-2 py-1 bg-olive-600 text-white text-xs rounded-full">
                    {recipe.source || 'Recipe'}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    <Link
                      href={`/recipes/${recipe.id}?source=${recipe.source || 'mealdb'}`}
                      className="hover:text-olive-600 transition-colors"
                    >
                      {recipe.title}
                    </Link>
                  </h3>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      30m
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      4 servings
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Recipes */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-olive-900">Latest Recipes</h2>
            <Link href="/recipes" className="text-olive-600 hover:text-olive-700 font-medium">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {latestRecipes.slice(0, 12).map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Image
                    src={recipe.image || '/placeholder-recipe.jpg'}
                    alt={recipe.title || 'Recipe image'}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-recipe.jpg';
                    }}
                    unoptimized={recipe.image?.startsWith('http://') || recipe.image?.startsWith('https://')}
                  />
                  <span className="absolute top-4 right-4 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                    New
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-olive-600 font-medium">
                      {recipe.category || 'Recipe'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">
                    <Link
                      href={`/recipes/${recipe.id}?source=${recipe.source || 'mealdb'}`}
                      className="hover:text-olive-600 transition-colors"
                    >
                      {recipe.title}
                    </Link>
                  </h3>

                  <p className="text-gray-600 text-sm line-clamp-2">
                    {recipe.instructions?.substring(0, 100) || 'Delicious recipe from around the world'}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-olive-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.slice(0, 10).map((category) => (
              <Link
                key={category.idCategory}
                href={`/recipes?category=${encodeURIComponent(category.strCategory)}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-sm border-2 border-gray-100 p-6 transition-all group-hover:border-olive-300 group-hover:border-2 text-center hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {getCategoryIcon(category.strCategory)}
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-olive-600 transition-colors">
                    {category.strCategory}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {category.strCategoryDescription?.substring(0, 50)}...
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Cuisines */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-olive-900 mb-6">World Cuisines</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {cuisines.slice(0, 18).map((cuisine) => (
              <Link
                key={cuisine.strArea}
                href={`/recipes?cuisine=${encodeURIComponent(cuisine.strArea)}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all group-hover:border-olive-300 text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {getCuisineFlag(cuisine.strArea)}
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-olive-600 transition-colors">
                    {cuisine.strArea}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Traditional dishes
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Ingredients */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-olive-900 mb-6">Search by Ingredient</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {ingredients.slice(0, 15).map((ingredient) => (
              <Link
                key={ingredient.idIngredient}
                href={`/recipes?ingredient=${encodeURIComponent(ingredient.strIngredient)}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all group-hover:border-olive-300 text-center">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                    {ingredient.strIngredient === 'Chicken' ? '🍗' :
                     ingredient.strIngredient === 'Beef' ? '🥩' :
                     ingredient.strIngredient === 'Salmon' ? '🐟' :
                     ingredient.strIngredient === 'Rice' ? '🍚' :
                     ingredient.strIngredient === 'Pasta' ? '🍝' :
                     ingredient.strIngredient === 'Cheese' ? '🧀' :
                     ingredient.strIngredient === 'Tomato' ? '🍅' : '🥕'}
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-olive-600 transition-colors">
                    {ingredient.strIngredient}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {ingredient.strDescription?.substring(0, 40) || 'Versatile ingredient'}...
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-olive-600 to-olive-700 rounded-xl p-8 text-white text-center">
          <Sparkles className="h-16 w-16 mx-auto mb-4 text-olive-200" />
          <h2 className="text-3xl font-bold mb-4">Ready to Cook?</h2>
          <p className="text-xl mb-6 opacity-90">
            Join our community of food lovers and discover your next favorite recipe
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/recipes"
              className="bg-white text-olive-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Browse All Recipes
            </Link>
            <Link
              href="/recipes/create"
              className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-olive-600 transition-colors font-semibold"
            >
              Share Your Recipe
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
