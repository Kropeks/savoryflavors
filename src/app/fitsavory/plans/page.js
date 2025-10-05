'use client'

import { useState } from 'react'
import {
  Plus,
  Calendar,
  Target,
  Clock,
  Users,
  TrendingUp,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

// Mock diet plan data
const mockDietPlans = [
  {
    id: 1,
    name: 'Weight Loss Program',
    description: 'A comprehensive 12-week program designed to help you lose weight safely and sustainably',
    goal: 'Weight Loss',
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-03-25',
    dailyCalories: 1800,
    weeklyGoal: 'Lose 1-2 lbs per week',
    progress: 75,
    mealsPerDay: 3,
    restrictions: ['Low Carb', 'High Protein']
  },
  {
    id: 2,
    name: 'Muscle Building Plan',
    description: 'High-protein diet plan to support muscle growth and strength training',
    goal: 'Muscle Gain',
    status: 'inactive',
    startDate: '2024-02-01',
    endDate: '2024-04-30',
    dailyCalories: 2500,
    weeklyGoal: 'Maintain caloric surplus',
    progress: 0,
    mealsPerDay: 5,
    restrictions: ['High Protein', 'Calorie Surplus']
  },
  {
    id: 3,
    name: 'Mediterranean Diet',
    description: 'Heart-healthy diet rich in fruits, vegetables, whole grains, and healthy fats',
    goal: 'Heart Health',
    status: 'completed',
    startDate: '2023-11-01',
    endDate: '2023-12-31',
    dailyCalories: 2000,
    weeklyGoal: 'Improve cardiovascular health',
    progress: 100,
    mealsPerDay: 3,
    restrictions: ['Mediterranean Style', 'Anti-inflammatory']
  }
]

const dietGoals = [
  { id: 'weight-loss', name: 'Weight Loss', icon: '⚖️', color: 'bg-blue-100 text-blue-800' },
  { id: 'muscle-gain', name: 'Muscle Gain', icon: '💪', color: 'bg-green-100 text-green-800' },
  { id: 'maintenance', name: 'Weight Maintenance', icon: '🔄', color: 'bg-gray-100 text-gray-800' },
  { id: 'heart-health', name: 'Heart Health', icon: '❤️', color: 'bg-red-100 text-red-800' },
  { id: 'energy', name: 'Energy Boost', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' }
]

export default function DietPlans() {
  const [plans, setPlans] = useState(mockDietPlans)
  const [showCreatePlan, setShowCreatePlan] = useState(false)

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4 text-green-600" />
      case 'inactive':
        return <Pause className="h-4 w-4 text-gray-400" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Diet Plans</h1>
          <p className="text-gray-600 mt-1">Create and manage your personalized diet plans</p>
        </div>
        <button
          onClick={() => setShowCreatePlan(true)}
          className="bg-olive-600 text-white px-6 py-3 rounded-lg hover:bg-olive-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Plan</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Plans</p>
              <p className="text-2xl font-bold text-gray-900">
                {plans.filter(p => p.status === 'active').length}
              </p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {plans.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Plans</p>
              <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">85%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Diet Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 mt-1 text-sm">{plan.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                    {getStatusIcon(plan.status)}
                    <span className="ml-1 capitalize">{plan.status}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold">
                    {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Daily Calories</p>
                  <p className="font-semibold">{plan.dailyCalories.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Goal</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {dietGoals.find(g => g.id === plan.goal.toLowerCase().replace(' ', '-'))?.icon}
                    </span>
                    <span className="font-semibold">{plan.goal}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Meals/Day</p>
                  <p className="font-semibold">{plan.mealsPerDay}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium">{plan.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-olive-600 h-2 rounded-full"
                    style={{ width: `${plan.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {plan.restrictions.map((restriction, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {restriction}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Weekly Goal: {plan.weeklyGoal}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {plan.status === 'active' && (
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Plan Modal Placeholder */}
      {showCreatePlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Diet Plan</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Summer Weight Loss"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent">
                    <option value="">Select Goal</option>
                    {dietGoals.map(goal => (
                      <option key={goal.id} value={goal.id}>{goal.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your diet plan goals and approach..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Calories
                  </label>
                  <input
                    type="number"
                    placeholder="2000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreatePlan(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button className="bg-olive-600 text-white px-6 py-2 rounded-lg hover:bg-olive-700">
                Create Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
