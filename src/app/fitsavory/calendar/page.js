'use client'

import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Utensils,
  Target,
  Activity,
  Clock,
  MapPin
} from 'lucide-react'

// Mock calendar data
const mockEvents = [
  {
    id: 1,
    date: '2024-01-15',
    type: 'meal',
    title: 'High Protein Breakfast',
    description: 'Greek yogurt with berries and granola',
    time: '8:00 AM',
    calories: 320,
    completed: true
  },
  {
    id: 2,
    date: '2024-01-15',
    type: 'workout',
    title: 'Upper Body Strength',
    description: 'Focus on chest, shoulders, and arms',
    time: '6:00 PM',
    calories: 200,
    completed: false
  },
  {
    id: 3,
    date: '2024-01-16',
    type: 'meal',
    title: 'Grilled Chicken Salad',
    description: 'Mixed greens with grilled chicken breast',
    time: '12:00 PM',
    calories: 380,
    completed: false
  },
  {
    id: 4,
    date: '2024-01-17',
    type: 'goal',
    title: 'Weight Check-in',
    description: 'Weekly progress measurement',
    time: '9:00 AM',
    calories: null,
    completed: false
  }
]

const mealTypes = {
  breakfast: { name: 'Breakfast', icon: '🍳', color: 'bg-orange-100 text-orange-800' },
  lunch: { name: 'Lunch', icon: '🥗', color: 'bg-green-100 text-green-800' },
  dinner: { name: 'Dinner', icon: '🍽️', color: 'bg-blue-100 text-blue-800' },
  snack: { name: 'Snack', icon: '🍎', color: 'bg-purple-100 text-purple-800' }
}

const eventTypes = {
  meal: { icon: Utensils, color: 'bg-green-500', textColor: 'text-green-700' },
  workout: { icon: Activity, color: 'bg-blue-500', textColor: 'text-blue-700' },
  goal: { icon: Target, color: 'bg-purple-500', textColor: 'text-purple-700' }
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [view, setView] = useState('month') // month, week, day

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getEventsForDate = (dateString) => {
    return mockEvents.filter(event => event.date === dateString)
  }

  const isToday = (dateString) => {
    const today = new Date().toISOString().split('T')[0]
    return dateString === today
  }

  const isSelected = (dateString) => {
    return dateString === selectedDate
  }

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      days.push(dateString)
    }

    return days
  }

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const selectedDateEvents = getEventsForDate(selectedDate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">Plan your meals, workouts, and health goals</p>
        </div>
        <button className="bg-olive-600 text-white px-6 py-3 rounded-lg hover:bg-olive-700 transition-colors flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border">
            {/* Calendar Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-2 text-sm bg-olive-600 text-white rounded-lg hover:bg-olive-700"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex justify-center space-x-1 mb-4">
                {['month', 'week', 'day'].map((viewOption) => (
                  <button
                    key={viewOption}
                    onClick={() => setView(viewOption)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                      view === viewOption
                        ? 'bg-olive-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {viewOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((dateString, index) => {
                  if (!dateString) {
                    return <div key={index} className="p-2"></div>
                  }

                  const events = getEventsForDate(dateString)
                  const today = isToday(dateString)
                  const selected = isSelected(dateString)

                  return (
                    <button
                      key={dateString}
                      onClick={() => setSelectedDate(dateString)}
                      className={`p-2 min-h-[80px] border rounded-lg text-left transition-colors ${
                        today ? 'bg-olive-50 border-olive-300' :
                        selected ? 'bg-olive-100 border-olive-400' :
                        'hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {new Date(dateString).getDate()}
                      </div>
                      <div className="space-y-1">
                        {events.slice(0, 2).map((event) => {
                          const EventIcon = eventTypes[event.type].icon
                          return (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded flex items-center space-x-1 ${
                                event.completed
                                  ? 'bg-green-100 text-green-700'
                                  : eventTypes[event.type].textColor
                              }`}
                            >
                              <EventIcon className="h-3 w-3" />
                              <span className="truncate">{event.title}</span>
                            </div>
                          )
                        })}
                        {events.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{events.length - 2} more
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Selected Date Details */}
        <div className="space-y-6">
          {/* Selected Date Info */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {formatDate(new Date(selectedDate))}
            </h3>

            <div className="space-y-4">
              {selectedDateEvents.map((event) => {
                const EventIcon = eventTypes[event.type].icon
                return (
                  <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${eventTypes[event.type].color}`}>
                      <EventIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        {event.completed && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            ✓ Done
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{event.time}</span>
                        </div>
                        {event.calories && (
                          <div className="flex items-center space-x-1">
                            <span>{event.calories} cal</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {selectedDateEvents.length === 0 && (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No events scheduled</p>
                  <button className="mt-3 text-olive-600 hover:text-olive-700 text-sm font-medium">
                    Add Event
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Meals Planned</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Workout</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Calories</span>
                <span className="font-medium">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Goals</span>
                <span className="font-medium">2</span>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h3>
            <div className="space-y-3">
              {mockEvents.slice(0, 3).map((event) => {
                const EventIcon = eventTypes[event.type].icon
                return (
                  <div key={event.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className={`p-1 rounded ${eventTypes[event.type].color}`}>
                      <EventIcon className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {event.date} at {event.time}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
