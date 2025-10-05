'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CreateRecipe() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'easy',
    category: 'main-course',
    cuisine: 'american',
    ingredients: [{ name: '', amount: '', unit: '' }]
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      const payload = new FormData()
      payload.append('title', formData.title)
      payload.append('description', formData.description)
      payload.append('instructions', formData.instructions)
      payload.append('prepTime', formData.prepTime)
      payload.append('cookTime', formData.cookTime)
      payload.append('servings', formData.servings)
      payload.append('difficulty', formData.difficulty)
      payload.append('category', formData.category)
      payload.append('cuisine', formData.cuisine)
      payload.append('ingredients', JSON.stringify(formData.ingredients))

      if (imageFile) {
        payload.append('image', imageFile)
      }

      const response = await fetch('/api/recipes', {
        method: 'POST',
        body: payload
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create recipe' }))
        throw new Error(errorData.error || 'Failed to create recipe')
      }

      router.push('/recipes')
    } catch (error) {
      console.error('Error submitting recipe:', error)
      alert(error.message || 'Failed to create recipe. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: '' }]
    }))
  }

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  const updateIngredient = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) =>
        i === index ? { ...ingredient, [field]: value } : ingredient
      )
    }))
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      setImageFile(null)
      setImagePreview(null)
      return
    }

    setImageFile(file)
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/recipes" className="text-olive-600 hover:text-olive-700 mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to recipes
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Add New Recipe</h1>
          <p className="text-lg text-gray-600">
            Share your favorite recipe with the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                  placeholder="Enter recipe title"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Image (Optional)
                </label>
                <div className="mt-1 flex items-center">
                  <div className="inline-block h-24 w-24 rounded-full overflow-hidden bg-gray-100">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Recipe preview" className="h-full w-full object-cover" />
                    ) : (
                      <svg
                        className="h-full w-full text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-5 flex space-x-2">
                    <div>
                      <input
                        ref={fileInputRef}
                        id="recipe-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      <label
                        htmlFor="recipe-image-upload"
                        className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-500"
                      >
                        Upload
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={!imageFile}
                      className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Recommended size: 800x600px (JPG, PNG, or WebP)</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                  placeholder="Brief description of your recipe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preparation Time (minutes) *
                </label>
                <input
                  type="number"
                  name="prepTime"
                  value={formData.prepTime}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cooking Time (minutes) *
                </label>
                <input
                  type="number"
                  name="cookTime"
                  value={formData.cookTime}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servings *
                </label>
                <input
                  type="number"
                  name="servings"
                  value={formData.servings}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                >
                  <option value="appetizer">Appetizer</option>
                  <option value="main-course">Main Course</option>
                  <option value="dessert">Dessert</option>
                  <option value="beverage">Beverage</option>
                  <option value="snack">Snack</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="salad">Salad</option>
                  <option value="soup">Soup</option>
                  <option value="side-dish">Side Dish</option>
                  <option value="bread">Bread</option>
                  <option value="sauce">Sauce</option>
                  <option value="pasta">Pasta</option>
                  <option value="seafood">Seafood</option>
                  <option value="vegan">Vegan</option>
                  <option value="vegetarian">Vegetarian</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine
                </label>
                <select
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                >
                  <option value="american">American</option>
                  <option value="italian">Italian</option>
                  <option value="chinese">Chinese</option>
                  <option value="japanese">Japanese</option>
                  <option value="mexican">Mexican</option>
                  <option value="indian">Indian</option>
                  <option value="french">French</option>
                  <option value="thai">Thai</option>
                  <option value="spanish">Spanish</option>
                  <option value="greek">Greek</option>
                  <option value="korean">Korean</option>
                  <option value="vietnamese">Vietnamese</option>
                  <option value="mediterranean">Mediterranean</option>
                  <option value="middle-eastern">Middle Eastern</option>
                  <option value="caribbean">Caribbean</option>
                  <option value="german">German</option>
                  <option value="brazilian">Brazilian</option>
                  <option value="moroccan">Moroccan</option>
                  <option value="ethiopian">Ethiopian</option>
                  <option value="cajun">Cajun</option>
                  <option value="filipino">Filipino</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Ingredients</h2>

            <div className="space-y-4">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ingredient {index + 1} *
                    </label>
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                      placeholder="e.g. Chicken breast"
                    />
                  </div>

                  <div className="w-24">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                      min="0"
                      step="0.25"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                      placeholder="1"
                    />
                  </div>

                  <div className="w-20">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                      placeholder="cups"
                    />
                  </div>

                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addIngredient}
              className="mt-4 flex items-center gap-2 text-olive-600 hover:text-olive-700 font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Ingredient
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Instructions</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Step by step instructions *
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                rows={8}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                placeholder="1. Preheat oven to 350°F&#10;2. Mix ingredients together&#10;3. Bake for 25 minutes..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/recipes" className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 bg-olive-600 text-white rounded-lg transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-olive-700'}`}
            >
              {isSubmitting ? 'Creating...' : 'Create Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
