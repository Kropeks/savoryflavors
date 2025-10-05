'use client'

import { useState } from 'react'
import {
  Search,
  Filter,
  Plus,
  Star,
  Clock,
  Users,
  Edit,
  Trash2,
  Copy,
  Eye,
  ChefHat
} from 'lucide-react'

// Mock food data
const mockFoods = [
  {
    id: 1,
    name: 'Homemade Protein Bars',
    description: 'Healthy protein bars made with natural ingredients',
    category: 'Snack',
    calories: 180,
    protein: 12,
    carbs: 15,
    fat: 8,
    createdAt: '2024-01-10',
    servings: 12,
    rating: 4.5,
    reviews: 23,
    favorite: true,
    tags: ['High Protein', 'No Sugar', 'Gluten Free']
  },
  {
    id: 2,
    name: 'Quinoa Salad Bowl',
    description: 'Fresh quinoa salad with vegetables and herbs',
    category: 'Lunch',
    calories: 320,
    protein: 8,
    carbs: 45,
    fat: 12,
    createdAt: '2024-01-08',
    servings: 4,
    rating: 4.2,
    reviews: 15,
    favorite: false,
    tags: ['Vegetarian', 'Healthy', 'Quick']
  },
  {
    id: 3,
    name: 'Keto Chocolate Mousse',
    description: 'Low-carb chocolate dessert perfect for keto diet',
    category: 'Dessert',
    calories: 150,
    protein: 4,
    carbs: 8,
    fat: 12,
    createdAt: '2024-01-05',
    servings: 6,
    rating: 4.8,
    reviews: 31,
    favorite: true,
    tags: ['Keto', 'Low Carb', 'Dessert']
  },
  {
    id: 4,
    name: 'Green Protein Smoothie',
    description: 'Nutritious green smoothie with added protein powder',
    category: 'Beverage',
    calories: 120,
    protein: 18,
    carbs: 12,
    fat: 2,
    createdAt: '2024-01-03',
    servings: 2,
    rating: 4.0,
    reviews: 8,
    favorite: false,
    tags: ['High Protein', 'Vegetarian', 'Quick']
  }
]

const categories = [
  'All', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Beverage', 'Appetizer'
]

export default function FoodLibrary() {
  const [foods, setFoods] = useState(mockFoods)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('recent')

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         food.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'rating':
        return b.rating - a.rating
      case 'calories':
        return a.calories - b.calories
      case 'recent':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt)
    }
  })

  const handleToggleFavorite = (id) => {
    setFoods(foods.map(food =>
      food.id === id ? { ...food, favorite: !food.favorite } : food
    ))
  }

  const handleDeleteFood = (id) => {
    setFoods(foods.filter(food => food.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Food Library</h1>
          <p className="text-gray-600 mt-1">Your personal collection of recipes and foods</p>
        </div>
        <button className="bg-olive-600 text-white px-6 py-3 rounded-lg hover:bg-olive-700 transition-colors flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add New Food</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Foods</p>
              <p className="text-2xl font-bold text-gray-900">{foods.length}</p>
            </div>
            <ChefHat className="h-8 w-8 text-olive-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Favorites</p>
              <p className="text-2xl font-bold text-gray-900">
                {foods.filter(f => f.favorite).length}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {(foods.reduce((acc, f) => acc + f.rating, 0) / foods.length).toFixed(1)}
              </p>
            </div>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {foods.reduce((acc, f) => acc + f.reviews, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search foods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="name">Name A-Z</option>
              <option value="rating">Highest Rated</option>
              <option value="calories">Lowest Calories</option>
            </select>
          </div>
        </div>
      </div>

      {/* Food Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFoods.map((food) => (
          <div key={food.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{food.name}</h3>
                    {food.favorite && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{food.description}</p>

                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                    <span className="px-2 py-1 bg-olive-100 text-olive-800 rounded-full">
                      {food.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(food.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nutrition Info */}
              <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                <div className="bg-orange-50 p-2 rounded-lg">
                  <p className="text-lg font-bold text-orange-600">{food.calories}</p>
                  <p className="text-xs text-gray-500">cal</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg">
                  <p className="text-lg font-bold text-blue-600">{food.protein}g</p>
                  <p className="text-xs text-gray-500">protein</p>
                </div>
                <div className="bg-green-50 p-2 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{food.carbs}g</p>
                  <p className="text-xs text-gray-500">carbs</p>
                </div>
                <div className="bg-yellow-50 p-2 rounded-lg">
                  <p className="text-lg font-bold text-yellow-600">{food.fat}g</p>
                  <p className="text-xs text-gray-500">fat</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {food.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(food.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{food.rating}</span>
                  <span className="text-sm text-gray-500">({food.reviews})</span>
                </div>
                <span className="text-sm text-gray-500">
                  {food.servings} servings
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <button className="text-olive-600 hover:text-olive-700 text-sm font-medium flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleToggleFavorite(food.id)}
                    className={`p-1 rounded ${
                      food.favorite ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                  >
                    <Star className="h-4 w-4" fill={food.favorite ? 'currentColor' : 'none'} />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-blue-600">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-green-600">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFood(food.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFoods.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No foods found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedCategory !== 'All'
              ? 'Try adjusting your search criteria'
              : 'Start by adding your first food item'
            }
          </p>
          <button className="bg-olive-600 text-white px-6 py-3 rounded-lg hover:bg-olive-700 transition-colors">
            Add Your First Food
          </button>
        </div>
      )}
    </div>
  )
}
