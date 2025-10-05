'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Utensils,
  FileText,
  Upload,
  BookOpen,
  Calendar,
  Settings,
  Target,
  TrendingUp,
  Activity,
  User
} from 'lucide-react'

export default function FitSavoryLayout({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard')

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, href: '/fitsavory' },
    { id: 'meals', name: 'Meal Tracking', icon: Utensils, href: '/fitsavory/meals' },
    { id: 'plans', name: 'Diet Plans', icon: FileText, href: '/fitsavory/plans' },
    { id: 'upload', name: 'Upload Recipe', icon: Upload, href: '/fitsavory/upload' },
    { id: 'foods', name: 'My Foods', icon: BookOpen, href: '/fitsavory/foods' },
    { id: 'calendar', name: 'Calendar', icon: Calendar, href: '/fitsavory/calendar' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/fitsavory" className="flex items-center space-x-3">
                <div className="bg-olive-600 p-2 rounded-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">FitSavory</h1>
                  <p className="text-sm text-gray-500">Nutrition & Fitness Tracker</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-olive-600" />
                <span className="text-sm font-medium text-gray-700">Goal: Weight Loss</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">7 Day Streak</span>
              </div>
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                <User className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-olive-100 text-olive-700 border-l-4 border-olive-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Quick Stats */}
            <div className="mt-8 p-4 bg-olive-50 rounded-lg">
              <h3 className="text-sm font-semibold text-olive-800 mb-3">Today's Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-olive-600">Calories</span>
                  <span className="font-medium">1,247 / 2,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-olive-600">Protein</span>
                  <span className="font-medium">89g / 150g</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-olive-600">Carbs</span>
                  <span className="font-medium">156g / 250g</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-olive-600">Fat</span>
                  <span className="font-medium">42g / 67g</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
