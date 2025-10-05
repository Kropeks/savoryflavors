'use client'

import { useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  Clock,
  Calendar,
  Trash2,
  Edit,
  Copy,
  Star,
  Utensils
} from 'lucide-react'

// Mock meal data
const mockMeals = [
  {
    id: 1,
    name: 'Grilled Chicken Breast',
    type: 'lunch',
    calories: 320,
    protein: 35,
    carbs: 8,
    fat: 12,
    time: '12:30 PM',
    date: '2024-01-15',
    favorite: true
  },
  {
    id: 2,
    name: 'Quinoa Bowl with Veggies',
    type: 'dinner',
    calories: 450,
    protein: 18,
    carbs: 65,
    fat: 15,
    time: '7:00 PM',
    date: '2024-01-15',
    favorite: false
  },
  {
    id: 3,
    name: 'Protein Shake',
    type: 'snack',
    calories: 180,
    protein: 25,
    carbs: 12,
    fat: 3,
    time: '3:00 PM',
    date: '2024-01-15',
    favorite: true
  },
  {
    id: 4,
    name: 'Greek Yogurt Parfait',
    type: 'breakfast',
    calories: 280,
    protein: 22,
    carbs: 35,
    fat: 8,
    time: '8:00 AM',
    date: '2024-01-15',
    favorite: false
  }
]

const mealTypes = [
  { id: 'breakfast', name: 'Breakfast', icon: '🍳', color: 'bg-orange-100 text-orange-800' },
  { id: 'lunch', name: 'Lunch', icon: '🥗', color: 'bg-green-100 text-green-800' },
  { id: 'dinner', name: 'Dinner', icon: '🍽️', color: 'bg-blue-100 text-blue-800' },
  { id: 'snack', name: 'Snack', icon: '🍎', color: 'bg-purple-100 text-purple-800' }
]

export default function MealTracking() {
  const [meals, setMeals] = useState(mockMeals)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAddMeal, setShowAddMeal] = useState(false)

  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !selectedType || meal.type === selectedType
    const matchesDate = meal.date === selectedDate
    return matchesSearch && matchesType && matchesDate
  })

  const todayMeals = meals.filter(meal => meal.date === selectedDate)
  const totalNutrition = todayMeals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  const handleDeleteMeal = (id) => {
    setMeals(meals.filter(meal => meal.id !== id))
  }

  const handleToggleFavorite = (id) => {
    setMeals(meals.map(meal =>
      meal.id === id ? { ...meal, favorite: !meal.favorite } : meal
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meal Tracking</h1>
          <p className="text-gray-600 mt-1">Track your daily nutrition and meals</p>
        </div>
        <button
          onClick={() => setShowAddMeal(true)}
          className="bg-olive-600 text-white px-6 py-3 rounded-lg hover:bg-olive-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Meal</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Calories</p>
              <p className="text-2xl font-bold text-gray-900">{totalNutrition.calories}</p>
            </div>
            <Utensils className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Protein</p>
              <p className="text-2xl font-bold text-gray-900">{totalNutrition.protein}g</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">P</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Carbs</p>
              <p className="text-2xl font-bold text-gray-900">{totalNutrition.carbs}g</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">C</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fat</p>
              <p className="text-2xl font-bold text-gray-900">{totalNutrition.fat}g</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 font-bold">F</span>
            </div>
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
                placeholder="Search meals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
            >
              <option value="">All Meal Types</option>
              {mealTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Meal List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Today's Meals</h2>
          <p className="text-gray-600 mt-1">{filteredMeals.length} meals logged</p>
        </div>

        <div className="divide-y">
          {filteredMeals.map((meal) => {
            const mealType = mealTypes.find(type => type.id === meal.type)
            return (
              <div key={meal.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${mealType?.color}`}>
                      <span className="mr-2">{mealType?.icon}</span>
                      {mealType?.name}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{meal.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {meal.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">{meal.calories} cal</p>
                      <p className="text-sm text-gray-500">
                        P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleFavorite(meal.id)}
                        className={`p-1 rounded ${
                          meal.favorite ? 'text-yellow-500' : 'text-gray-400'
                        }`}
                      >
                        <Star className="h-4 w-4" fill={meal.favorite ? 'currentColor' : 'none'} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-blue-600">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredMeals.length === 0 && (
          <div className="p-12 text-center">
            <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No meals found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedType ? 'Try adjusting your filters' : 'Start by adding your first meal'}
            </p>
            <button
              onClick={() => setShowAddMeal(true)}
              className="bg-olive-600 text-white px-6 py-3 rounded-lg hover:bg-olive-700 transition-colors"
            >
              Add Your First Meal
            </button>
          </div>
        )}
      </div>

      {/* Add Meal Modal Placeholder */}
      {showAddMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Meal</h3>
            <p className="text-gray-600 mb-4">Meal tracking form would go here...</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddMeal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button className="bg-olive-600 text-white px-4 py-2 rounded hover:bg-olive-700">
                Add Meal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
