'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  TrendingUp,
  Target,
  Flame,
  Apple,
  Beef,
  Wheat,
  Droplets,
  Clock,
  Award,
  Plus,
  ChefHat,
  Utensils
} from 'lucide-react'

// Mock data for demonstration
const mockData = {
  weeklyProgress: [
    { day: 'Mon', calories: 1850, protein: 120, carbs: 180, fat: 65 },
    { day: 'Tue', calories: 2100, protein: 140, carbs: 200, fat: 70 },
    { day: 'Wed', calories: 1950, protein: 135, carbs: 190, fat: 68 },
    { day: 'Thu', calories: 2200, protein: 145, carbs: 210, fat: 72 },
    { day: 'Fri', calories: 2000, protein: 130, carbs: 195, fat: 69 },
    { day: 'Sat', calories: 1800, protein: 125, carbs: 175, fat: 63 },
    { day: 'Sun', calories: 1900, protein: 128, carbs: 185, fat: 66 }
  ],
  recentMeals: [
    { id: 1, name: 'Grilled Chicken Salad', calories: 320, protein: 35, time: '2 hours ago' },
    { id: 2, name: 'Quinoa Bowl', calories: 450, protein: 18, time: '4 hours ago' },
    { id: 3, name: 'Protein Shake', calories: 180, protein: 25, time: '6 hours ago' }
  ],
  goals: {
    calories: { current: 1247, target: 2000, percentage: 62 },
    protein: { current: 89, target: 150, percentage: 59 },
    carbs: { current: 156, target: 250, percentage: 62 },
    fat: { current: 42, target: 67, percentage: 63 }
  }
}

export default function FitSavoryDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [mealPlan, setMealPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch('/api/user/subscription')
        const data = await response.json()
        
        if (response.ok) {
          setSubscriptionStatus(data.status === 'active')
        } else {
          setError(data.error || 'Failed to check subscription status')
        }
      } catch (err) {
        console.error('Subscription check error:', err)
        setError('An error occurred while checking your subscription')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      checkSubscription()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-soft-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-fredoka">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-soft-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-soft-100 max-w-md">
            <h1 className="text-2xl font-fredoka font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 font-fredoka mb-6">You need to be logged in to access the FitSavory dashboard.</p>
            <button
              onClick={() => router.push(`/auth/login?callbackUrl=${encodeURIComponent('/fitsavory')}`)}
              className="bg-olive-600 text-white py-2 px-4 rounded-lg hover:bg-olive-700 transition-colors font-fredoka font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (subscriptionStatus === false) {
    return (
      <div className="min-h-screen bg-soft-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-soft-100 max-w-md">
            <div className="bg-yellow-100 p-4 rounded-lg mb-6">
              <h2 className="text-xl font-fredoka font-bold text-yellow-800">Premium Feature</h2>
            </div>
            <h1 className="text-2xl font-fredoka font-bold text-gray-900 mb-4">Upgrade Required</h1>
            <p className="text-gray-600 font-fredoka mb-6">
              FitSavory is a premium feature. Please upgrade your account to access this content.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/pricing')}
                className="w-full bg-olive-600 text-white py-2 px-4 rounded-lg hover:bg-olive-700 transition-colors font-fredoka font-medium"
              >
                View Subscription Plans
              </button>
              <button
                onClick={() => router.back()}
                className="text-sm text-gray-600 hover:text-gray-800 font-fredoka"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const macroDistribution = [
    { name: 'Protein', value: mockData.goals.protein.current, color: 'bg-blue-500', percentage: 45 },
    { name: 'Carbs', value: mockData.goals.carbs.current, color: 'bg-green-500', percentage: 35 },
    { name: 'Fat', value: mockData.goals.fat.current, color: 'bg-yellow-500', percentage: 20 }
  ]

  const generateMealPlan = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/meal-planner?calories=2000&protein=150&carbs=250&fat=67&days=7')
      if (!response.ok) throw new Error('Failed to generate meal plan')
      const data = await response.json()
      setMealPlan(data)
    } catch (error) {
      console.error('Error generating meal plan:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-soft-50">
      {/* Header spacer */}
      <div className="h-20 md:h-24"></div>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-soft-100 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-olive-600 to-matte-600 p-3 rounded-xl">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-fredoka font-bold text-gray-900">FitSavory Dashboard</h1>
                <p className="text-gray-600 mt-1 font-fredoka">Track your cooking journey and nutrition goals</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-fredoka font-medium text-gray-600">Current Streak</p>
                <p className="text-2xl font-fredoka font-bold text-olive-600">7 Days</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-soft-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-fredoka font-medium text-gray-600">Calories</p>
                <p className="text-2xl font-fredoka font-bold text-gray-900">
                  {mockData.goals.calories.current.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 font-fredoka">
                  {mockData.goals.calories.target.toLocaleString()} goal
                </p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-soft-200 rounded-full h-2">
                <div
                  className="bg-olive-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${mockData.goals.calories.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-fredoka">
                {mockData.goals.calories.percentage}% of daily goal
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-soft-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-fredoka font-medium text-gray-600">Protein</p>
                <p className="text-2xl font-fredoka font-bold text-gray-900">
                  {mockData.goals.protein.current}g
                </p>
                <p className="text-sm text-gray-500 font-fredoka">
                  {mockData.goals.protein.target}g goal
                </p>
              </div>
              <Beef className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-soft-200 rounded-full h-2">
                <div
                  className="bg-matte-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${mockData.goals.protein.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-soft-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-fredoka font-medium text-gray-600">Carbs</p>
                <p className="text-2xl font-fredoka font-bold text-gray-900">
                  {mockData.goals.carbs.current}g
                </p>
                <p className="text-sm text-gray-500 font-fredoka">
                  {mockData.goals.carbs.target}g goal
                </p>
              </div>
              <Wheat className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-soft-200 rounded-full h-2">
                <div
                  className="bg-light-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${mockData.goals.carbs.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-soft-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-fredoka font-medium text-gray-600">Fat</p>
                <p className="text-2xl font-fredoka font-bold text-gray-900">
                  {mockData.goals.fat.current}g
                </p>
                <p className="text-sm text-gray-500 font-fredoka">
                  {mockData.goals.fat.target}g goal
                </p>
              </div>
              <Droplets className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-soft-200 rounded-full h-2">
                <div
                  className="bg-soft-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${mockData.goals.fat.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Overview Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-soft-100">
            <h3 className="text-lg font-fredoka font-semibold text-gray-900 mb-4">Weekly Overview</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {mockData.weeklyProgress.map((day, index) => (
                <div key={day.day} className="flex flex-col items-center space-y-2">
                  <div className="flex flex-col items-center space-y-1">
                    <div
                      className="w-8 bg-olive-600 rounded-t hover:bg-olive-700 transition-colors cursor-pointer"
                      style={{ height: `${(day.calories / 2500) * 200}px` }}
                    ></div>
                    <span className="text-xs text-gray-500 font-fredoka">{day.day}</span>
                    <span className="text-xs font-fredoka font-medium">{day.calories}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Macro Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-soft-100">
            <h3 className="text-lg font-fredoka font-semibold text-gray-900 mb-4">Macro Distribution</h3>
            <div className="space-y-4">
              {macroDistribution.map((macro) => (
                <div key={macro.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${macro.color}`}></div>
                    <span className="font-fredoka font-medium">{macro.name}</span>
                    <span className="text-sm text-gray-500 font-fredoka">{macro.value}g</span>
                  </div>
                  <span className="text-sm font-fredoka font-medium">{macro.percentage}%</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex h-32 rounded-lg overflow-hidden shadow-inner">
                {macroDistribution.map((macro, index) => (
                  <div
                    key={macro.name}
                    className={`${macro.color} flex items-end justify-center hover:opacity-80 transition-opacity cursor-pointer`}
                    style={{ width: `${macro.percentage}%` }}
                  >
                    <span className="text-white text-xs font-fredoka font-bold pb-2">
                      {macro.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Meal Plan Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-soft-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-fredoka font-semibold text-gray-900">Meal Plan</h3>
            <button
              onClick={generateMealPlan}
              disabled={loading}
              className="bg-olive-600 text-white py-2 px-4 rounded-lg hover:bg-olive-700 transition-colors flex items-center space-x-2 font-fredoka font-medium disabled:opacity-50"
            >
              <ChefHat className="h-4 w-4" />
              <span>{loading ? 'Generating...' : 'Generate Plan'}</span>
            </button>
          </div>
          {mealPlan ? (
            <div className="space-y-4">
              {mealPlan.mealPlan.map((day) => (
                <div key={day.day} className="border border-soft-200 rounded-lg p-4">
                  <h4 className="font-fredoka font-semibold text-gray-900 mb-2">Day {day.day}</h4>
                  <div className="space-y-2">
                    {day.breakfast && (
                      <div className="flex justify-between items-center">
                        <span className="font-fredoka">Breakfast: {day.breakfast.title}</span>
                        <span className="text-sm text-gray-500 font-fredoka">{day.breakfast.nutrition?.calories || 0} cal</span>
                      </div>
                    )}
                    {day.lunch && (
                      <div className="flex justify-between items-center">
                        <span className="font-fredoka">Lunch: {day.lunch.title}</span>
                        <span className="text-sm text-gray-500 font-fredoka">{day.lunch.nutrition?.calories || 0} cal</span>
                      </div>
                    )}
                    {day.dinner && (
                      <div className="flex justify-between items-center">
                        <span className="font-fredoka">Dinner: {day.dinner.title}</span>
                        <span className="text-sm text-gray-500 font-fredoka">{day.dinner.nutrition?.calories || 0} cal</span>
                      </div>
                    )}
                    {day.snacks.length > 0 && (
                      <div>
                        <span className="font-fredoka">Snacks:</span>
                        <div className="ml-4 space-y-1">
                          {day.snacks.map((snack, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm font-fredoka">{snack.title}</span>
                              <span className="text-xs text-gray-500 font-fredoka">{snack.nutrition?.calories || 0} cal</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 pt-2 border-t border-soft-200">
                    <div className="flex justify-between text-sm font-fredoka">
                      <span>Total Calories: {day.totals.calories}</span>
                      <span>Protein: {day.totals.protein}g</span>
                      <span>Carbs: {day.totals.carbs}g</span>
                      <span>Fat: {day.totals.fat}g</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 font-fredoka">Click "Generate Plan" to create your meal plan.</p>
          )}
        </div>

        {/* Recent Meals & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Meals */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-soft-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-fredoka font-semibold text-gray-900">Recent Meals</h3>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {mockData.recentMeals.map((meal) => (
                <div key={meal.id} className="flex justify-between items-center p-3 bg-soft-50 rounded-lg hover:bg-soft-100 transition-colors">
                  <div>
                    <p className="font-fredoka font-medium text-gray-900">{meal.name}</p>
                    <p className="text-sm text-gray-500 font-fredoka">{meal.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-fredoka font-medium">{meal.calories} cal</p>
                    <p className="text-sm text-matte-600 font-fredoka">{meal.protein}g protein</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 bg-olive-600 text-white py-2 px-4 rounded-lg hover:bg-olive-700 transition-colors flex items-center justify-center space-x-2 font-fredoka font-medium hover:scale-105 transform">
              <Plus className="h-4 w-4" />
              <span>Add Meal</span>
            </button>
          </div>

          {/* Nutrition Profile */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-soft-100">
            <h3 className="text-lg font-fredoka font-semibold text-gray-900 mb-4">Nutrition Profile</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-24 h-24 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="h-12 w-12 text-olive-600" />
                </div>
                <h4 className="font-fredoka font-semibold text-gray-900">Weight Loss Goal</h4>
                <p className="text-sm text-gray-600 font-fredoka">Target: -2 lbs/week</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 font-fredoka">Age</span>
                  <span className="font-fredoka font-medium">28 years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 font-fredoka">Height</span>
                  <span className="font-fredoka font-medium">5'8"</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 font-fredoka">Current Weight</span>
                  <span className="font-fredoka font-medium">165 lbs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 font-fredoka">Target Weight</span>
                  <span className="font-fredoka font-medium">150 lbs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-soft-100">
            <h3 className="text-lg font-fredoka font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-olive-600 text-white py-3 px-4 rounded-lg hover:bg-olive-700 transition-colors flex items-center space-x-2 font-fredoka font-medium hover:scale-105 transform">
                <Calendar className="h-4 w-4" />
                <span>Plan Tomorrow's Meals</span>
              </button>
              <button className="w-full bg-matte-600 text-white py-3 px-4 rounded-lg hover:bg-matte-700 transition-colors flex items-center space-x-2 font-fredoka font-medium hover:scale-105 transform">
                <TrendingUp className="h-4 w-4" />
                <span>View Progress Report</span>
              </button>
              <button className="w-full bg-soft-600 text-white py-3 px-4 rounded-lg hover:bg-soft-700 transition-colors flex items-center space-x-2 font-fredoka font-medium hover:scale-105 transform">
                <Apple className="h-4 w-4" />
                <span>Log Water Intake</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
