'use client'

import { useState, useEffect } from 'react'
import { Search, Globe, ChefHat, Clock, Users, Star, ArrowRight, Utensils } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Cuisines() {
  const [cuisines, setCuisines] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [featuredCuisinesCounts, setFeaturedCuisinesCounts] = useState({})
  const [allCuisinesCounts, setAllCuisinesCounts] = useState({})
  const [countsLoading, setCountsLoading] = useState(false)

  // Map cuisine name -> cuisine hero image in /public/images
  const getCuisineImage = (name) => {
    const map = {
      'Italian': '/images/italian.png',
      'Mexican': '/images/mexican.png',
      'Chinese': '/images/china.png',
      'Indian': '/images/indian.png',
      'Japanese': '/images/japanese.png',
      'Thai': '/images/thailand.png',
    }
    return map[name] || '/placeholder-recipe.jpg'
  }

  // Map cuisine (area) -> flag image in /public/images
  const getCuisineFlagImage = (name) => {
    const map = {
      'American': '/images/USFlag.png',
      'British': '/images/BritFlag.png',
      'Canadian': '/images/CanFlag.png',
      'Chinese': '/images/CHFlag.png',
      'Croatian': '/images/CroatiaFlag.png',
      'Dutch': '/images/DutchFlag.png',
      'Egyptian': '/images/EgyptFlag.png',
      'French': '/images/FrenchFlag.png',
      'Greek': '/images/GreekFlag.png',
      'Indian': '/images/IndianFlag.png',
      'Irish': '/images/IrishFlag.png',
      'Italian': '/images/ItalyFlag.png',
      'Jamaican': '/images/JamaicaFlag.png',
      'Japanese': '/images/JapFlag.png',
      'Kenyan': '/images/KenyaFlag.png',
      'Malaysian': '/images/MalayFlag.png',
      'Mexican': '/images/MexicoFlag.png',
      'Moroccan': '/images/MoroccanFlag.png',
      'Polish': '/images/Polish.png',
      'Portuguese': '/images/PortugueseFlag.png',
      'Russian': '/images/RussianFlag.png',
      'Spanish': '/images/SpanishFlag.png',
      'Thai': '/images/ThaiFlag.png',
      'Tunisian': '/images/TunisiaFlag.png',
      'Turkish': '/images/TurksFlag.png',
      'Vietnamese': '/images/VietnamFlag.png',
      'Filipino': '/images/PHFlag.png',
      // Newly added
      'Ukrainian': '/images/UkraineFlag.png',
      'Uruguayan': '/images/UruguayFlag.png',
      // Fallback aliases if API returns country instead of demonym
      'Ukraine': '/images/UkraineFlag.png',
      'Uruguay': '/images/UruguayFlag.png',
    }
    return map[name] || null
  }

  const [featuredCuisines, setFeaturedCuisines] = useState([
    {
      name: 'Italian',
      description: 'Pasta, pizza, and Mediterranean flavors',
      color: 'bg-red-50 border-red-200',
      textColor: 'text-red-700',
      recipeCount: 'Loading...' // Will be updated with actual count
    },
    {
      name: 'Mexican',
      description: 'Spicy, vibrant, and full of flavor',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-700',
      recipeCount: 'Loading...' // Will be updated with actual count
    },
    {
      name: 'Chinese',
      description: 'Ancient techniques and diverse regional cuisines',
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-700',
      recipeCount: 'Loading...' // Will be updated with actual count
    },
    {
      name: 'Indian',
      description: 'Aromatic spices and rich curries',
      color: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-700',
      recipeCount: 'Loading...' // Will be updated with actual count
    },
    {
      name: 'Japanese',
      description: 'Fresh, delicate, and artfully presented',
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700',
      recipeCount: 'Loading...' // Will be updated with actual count
    },
    {
      name: 'Thai',
      description: 'Sweet, sour, salty, and spicy harmony',
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-700',
      recipeCount: 'Loading...' // Will be updated with actual count
    }
  ])

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      // Fetch cuisines
      const cuisinesResponse = await fetch('/api/mealdb?type=cuisines')
      if (cuisinesResponse.ok) {
        const cuisinesData = await cuisinesResponse.json()
        setCuisines(cuisinesData)
      } else {
        // Fallback to mock data if API fails
        console.warn('MealDB API failed, using fallback data')
        setCuisines(getMockCuisines())
      }

      // Fetch categories for additional filtering
      const categoriesResponse = await fetch('/api/mealdb?type=categories')
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      } else {
        // Fallback to mock data
        console.warn('Categories API failed, using fallback data')
        setCategories(getMockCategories())
      }
    } catch (error) {
      console.error('Error fetching cuisines data:', error)
      // Use fallback data on any error
      setCuisines(getMockCuisines())
      setCategories(getMockCategories())
    } finally {
      setLoading(false)
    }
  }

  const fetchCuisineCounts = async () => {
    setCountsLoading(true)
    const counts = {}
    const allCuisines = [...featuredCuisines, ...cuisines]

    for (const cuisine of allCuisines) {
      const cuisineName = cuisine.name || cuisine.strArea

      // Initialize counts for this cuisine
      counts[cuisineName] = {
        mealdb: 0,
        edamam: 0,
        total: 0
      }

      try {
        // Fetch from MealDB
        const mealdbResponse = await fetch(`/api/mealdb?type=filter&a=${encodeURIComponent(cuisineName)}`)
        if (mealdbResponse.ok) {
          const mealdbData = await mealdbResponse.json()
          counts[cuisineName].mealdb = mealdbData.meals ? mealdbData.meals.length : 0
        }
      } catch (error) {
        console.warn(`Failed to fetch MealDB count for ${cuisineName}:`, error.message)
      }

      try {
        // Fetch from Edamam using the external recipes API
        const edamamResponse = await fetch(`/api/external/recipes?source=edamam&cuisine=${encodeURIComponent(cuisineName)}&number=100`)
        if (edamamResponse.ok) {
          const edamamData = await edamamResponse.json()
          counts[cuisineName].edamam = edamamData.count || 0
        }
      } catch (error) {
        console.warn(`Failed to fetch Edamam count for ${cuisineName}:`, error.message)
      }

      // Calculate total
      counts[cuisineName].total = counts[cuisineName].mealdb + counts[cuisineName].edamam

      console.log(`📊 ${cuisineName}: MealDB=${counts[cuisineName].mealdb}, Edamam=${counts[cuisineName].edamam}, Total=${counts[cuisineName].total}`)
    }

    setFeaturedCuisinesCounts(counts)
    setCountsLoading(false)
  }

  // Separate function to get counts for all cuisines (for the grid display)
  const fetchAllCuisinesCounts = async () => {
    if (cuisines.length === 0) return

    setCountsLoading(true)
    const counts = {}
    for (const cuisine of cuisines) {
      const cuisineName = cuisine.strArea

      // Initialize counts for this cuisine
      counts[cuisineName] = {
        mealdb: 0,
        edamam: 0,
        total: 0
      }

      try {
        // Fetch from MealDB
        const mealdbResponse = await fetch(`/api/mealdb?type=filter&a=${encodeURIComponent(cuisineName)}`)
        if (mealdbResponse.ok) {
          const mealdbData = await mealdbResponse.json()
          counts[cuisineName].mealdb = mealdbData.meals ? mealdbData.meals.length : 0
        }
      } catch (error) {
        console.warn(`Failed to fetch MealDB count for ${cuisineName}:`, error.message)
      }

      try {
        // Fetch from Edamam using the external recipes API
        const edamamResponse = await fetch(`/api/external/recipes?source=edamam&cuisine=${encodeURIComponent(cuisineName)}&number=100`)
        if (edamamResponse.ok) {
          const edamamData = await edamamResponse.json()
          counts[cuisineName].edamam = edamamData.count || 0
        }
      } catch (error) {
        console.warn(`Failed to fetch Edamam count for ${cuisineName}:`, error.message)
      }

      // Calculate total
      counts[cuisineName].total = counts[cuisineName].mealdb + counts[cuisineName].edamam
    }

    setAllCuisinesCounts(counts)
    setCountsLoading(false)
  }

  useEffect(() => {
    if (!loading) {
      fetchCuisineCounts()
    }
  }, [loading])

  useEffect(() => {
    // Fetch counts for all cuisines when cuisines data is loaded
    if (cuisines.length > 0) {
      fetchAllCuisinesCounts()
    }
  }, [cuisines])

  useEffect(() => {
    // Update featuredCuisines with actual counts from both sources
    if (Object.keys(featuredCuisinesCounts).length > 0) {
      const updatedCuisines = featuredCuisines.map(cuisine => {
        const counts = featuredCuisinesCounts[cuisine.name]
        if (counts) {
          const { mealdb, edamam, total } = counts
          let displayText = `${total} recipes`

          // If both sources have recipes, show breakdown
          if (mealdb > 0 && edamam > 0) {
            displayText = `${total} recipes (${mealdb} + ${edamam})`
          } else if (mealdb > 0) {
            displayText = `${mealdb} recipes`
          } else if (edamam > 0) {
            displayText = `${edamam} recipes`
          }

          return {
            ...cuisine,
            recipeCount: displayText
          }
        }
        return cuisine
      })
      setFeaturedCuisines(updatedCuisines)
    }
  }, [featuredCuisinesCounts])

  // Mock cuisines data as fallback
  const getMockCuisines = () => {
    return [
      { strArea: 'Italian', strAreaCode: 'IT' },
      { strArea: 'Mexican', strAreaCode: 'MX' },
      { strArea: 'Chinese', strAreaCode: 'CN' },
      { strArea: 'Indian', strAreaCode: 'IN' },
      { strArea: 'Japanese', strAreaCode: 'JP' },
      { strArea: 'Thai', strAreaCode: 'TH' },
      { strArea: 'French', strAreaCode: 'FR' },
      { strArea: 'Greek', strAreaCode: 'GR' },
      { strArea: 'Spanish', strAreaCode: 'ES' },
      { strArea: 'Turkish', strAreaCode: 'TR' },
      { strArea: 'American', strAreaCode: 'US' },
      { strArea: 'British', strAreaCode: 'GB' }
    ]
  }

  // Mock categories data as fallback
  const getMockCategories = () => {
    return [
      { idCategory: 'Beef', strCategory: 'Beef' },
      { idCategory: 'Chicken', strCategory: 'Chicken' },
      { idCategory: 'Seafood', strCategory: 'Seafood' },
      { idCategory: 'Vegetarian', strCategory: 'Vegetarian' },
      { idCategory: 'Dessert', strCategory: 'Dessert' },
      { idCategory: 'Pasta', strCategory: 'Pasta' }
    ]
  }

  const filteredCuisines = cuisines.filter(cuisine =>
    cuisine.strArea.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Legacy helper replaced with image-based flags (kept if needed elsewhere)
  const getCuisineFlag = (cuisineName) => getCuisineFlagImage(cuisineName) || '🌍'

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cuisines...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">World Cuisines</h1>
          <p className="text-lg text-gray-600">
            Explore authentic recipes from around the globe
          </p>
        </div>

        {/* Featured Cuisines */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Cuisines</h2>
          {countsLoading && (
            <div className="flex items-center justify-center mb-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-olive-600 mr-2"></div>
              <span className="text-gray-600">Loading recipe counts...</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCuisines.map((cuisine) => (
              <div key={cuisine.name} className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border-2 ${cuisine.color}`}>
                <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center">
                  <Image
                    src={getCuisineImage(cuisine.name)}
                    alt={`${cuisine.name} cuisine`}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    priority={cuisine.name === 'Italian'}
                  />
                  {getCuisineFlagImage(cuisine.name) && (
                    <div className="absolute top-4 left-4 drop-shadow-lg">
                      <Image src={getCuisineFlagImage(cuisine.name)} alt={`${cuisine.name} flag`} width={36} height={24} className="rounded shadow-sm" />
                    </div>
                  )}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium text-gray-900 shadow-lg ${cuisine.color.replace('bg-', 'bg-').replace('border-', '')}`}>
                    {cuisine.recipeCount}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className={`text-xl font-bold mb-2 ${cuisine.textColor}`}>
                    {cuisine.name} Cuisine
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {cuisine.description}
                  </p>
                  <Link
                    href={`/recipes?cuisine=${encodeURIComponent(cuisine.name)}&source=all`}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${cuisine.color} hover:opacity-90 text-white font-medium`}
                  >
                    <ChefHat className="h-4 w-4" />
                    Explore Recipes
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search cuisines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-input px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.idCategory} value={category.strCategory}>
                  {category.strCategory}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* All Cuisines Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Cuisines</h2>

          {filteredCuisines.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Globe className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No cuisines found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search criteria
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-olive-600 hover:text-olive-700 font-medium"
              >
                Clear search →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredCuisines.map((cuisine) => (
                <Link
                  key={cuisine.strArea}
                  href={`/recipes?cuisine=${encodeURIComponent(cuisine.strArea)}&source=all`}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all group-hover:border-olive-300">
                    <div className="text-center">
                      <div className="mb-3 group-hover:scale-110 transition-transform flex items-center justify-center h-10">
                        {getCuisineFlagImage(cuisine.strArea) ? (
                          <Image src={getCuisineFlagImage(cuisine.strArea)} alt={`${cuisine.strArea} flag`} width={40} height={28} className="rounded shadow-sm" />
                        ) : (
                          <Globe className="h-6 w-6 text-gray-500" />
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-olive-600 transition-colors">
                        {cuisine.strArea}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {(() => {
                          const counts = allCuisinesCounts[cuisine.strArea]
                          if (counts) {
                            const { mealdb, edamam, total } = counts
                            if (total > 0) {
                              if (mealdb > 0 && edamam > 0) {
                                return `${total} recipes (${mealdb} + ${edamam})`
                              } else if (mealdb > 0) {
                                return `${mealdb} recipes`
                              } else if (edamam > 0) {
                                return `${edamam} recipes`
                              }
                            }
                          }
                          return 'Traditional dishes'
                        })()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-olive-600 to-olive-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Discover Your Next Favorite Dish</h2>
          <p className="text-lg mb-6 opacity-90">
            Explore authentic recipes from {cuisines.length} different cuisines around the world
            {Object.keys(allCuisinesCounts).length > 0 && (
              <span className="block mt-2 text-sm">
                Total recipes available: {
                  Object.values(allCuisinesCounts).reduce((total, counts) => total + (counts?.total || 0), 0)
                } across {Object.values(allCuisinesCounts).filter(counts => counts?.total > 0).length} cuisines
              </span>
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/recipes"
              className="bg-white text-olive-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Browse All Recipes
            </Link>
            <Link
              href="/recipes/create"
              className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-olive-600 transition-colors font-semibold"
            >
              Share Your Recipe
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
