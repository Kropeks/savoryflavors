'use client'

import { useState } from 'react'
import {
  Upload,
  Save,
  X,
  Plus,
  Trash2,
  Camera,
  FileText,
  Calculator
} from 'lucide-react'

export default function UploadRecipe() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    cuisine: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'medium',
    ingredients: [{ name: '', amount: '', unit: '' }],
    instructions: [{ step: 1, instruction: '' }],
    nutrition: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      sugar: ''
    },
    tags: [],
    image: null
  })

  const [currentStep, setCurrentStep] = useState(1)
  const steps = [
    { id: 1, name: 'Basic Info', icon: FileText },
    { id: 2, name: 'Ingredients', icon: Plus },
    { id: 3, name: 'Instructions', icon: FileText },
    { id: 4, name: 'Nutrition', icon: Calculator },
    { id: 5, name: 'Review', icon: Upload }
  ]

  const categories = [
    'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Beverage', 'Appetizer', 'Main Course', 'Side Dish'
  ]

  const cuisines = [
    'American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian', 'French', 'Mediterranean', 'Other'
  ]

  const difficulties = [
    { value: 'easy', label: 'Easy', description: '30 mins or less' },
    { value: 'medium', label: 'Medium', description: '30-60 mins' },
    { value: 'hard', label: 'Hard', description: '60+ mins' }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...formData.ingredients]
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      ingredients: updatedIngredients
    }))
  }

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: '' }]
    }))
  }

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }))
    }
  }

  const handleInstructionChange = (index, value) => {
    const updatedInstructions = [...formData.instructions]
    updatedInstructions[index] = {
      step: index + 1,
      instruction: value
    }
    setFormData(prev => ({
      ...prev,
      instructions: updatedInstructions
    }))
  }

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, { step: prev.instructions.length + 1, instruction: '' }]
    }))
  }

  const removeInstruction = (index) => {
    if (formData.instructions.length > 1) {
      setFormData(prev => ({
        ...prev,
        instructions: prev.instructions.filter((_, i) => i !== index).map((inst, i) => ({
          ...inst,
          step: i + 1
        }))
      }))
    }
  }

  const handleNutritionChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        [field]: value
      }
    }))
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }))
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.description && formData.category && formData.cuisine
      case 2:
        return formData.ingredients.every(ing => ing.name && ing.amount)
      case 3:
        return formData.instructions.every(inst => inst.instruction)
      case 4:
        return formData.nutrition.calories && formData.nutrition.protein
      default:
        return true
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Recipe</h1>
        <p className="text-gray-600 mt-1">Share your favorite recipes with nutrition information</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id

            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isActive ? 'bg-olive-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <span>✓</span>
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`mt-2 text-xs font-medium ${
                  isActive ? 'text-olive-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
              </div>
            )
          })}
        </div>
        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div
            className="bg-olive-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Grandma's Chocolate Chip Cookies"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your recipe, its origin, or why you love it..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine *
                </label>
                <select
                  value={formData.cuisine}
                  onChange={(e) => handleInputChange('cuisine', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                >
                  <option value="">Select Cuisine</option>
                  {cuisines.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                >
                  {difficulties.map(diff => (
                    <option key={diff.value} value={diff.value}>
                      {diff.label} - {diff.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prep Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.prepTime}
                  onChange={(e) => handleInputChange('prepTime', e.target.value)}
                  placeholder="15"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cook Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.cookTime}
                  onChange={(e) => handleInputChange('cookTime', e.target.value)}
                  placeholder="30"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servings
                </label>
                <input
                  type="number"
                  value={formData.servings}
                  onChange={(e) => handleInputChange('servings', e.target.value)}
                  placeholder="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Image (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <div className="text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-olive-600 hover:text-olive-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-olive-500"
                    >
                      <span>Upload an image</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e)}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB (Recommended: 800x600px)
                  </p>
                  {formData.image && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => handleInputChange('image', null)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove image
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                A default image will be used if none is provided
              </p>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Ingredients</h3>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ingredient Name *
                  </label>
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    placeholder="e.g., All-purpose flour"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="text"
                    value={ingredient.amount}
                    onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                    placeholder="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                  />
                </div>
                <div className="w-20">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    placeholder="cups"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                  />
                </div>
                {formData.ingredients.length > 1 && (
                  <button
                    onClick={() => removeIngredient(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addIngredient}
              className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-olive-500 hover:text-olive-600 transition-colors"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Add Ingredient
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Instructions</h3>
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-olive-100 text-olive-800 rounded-full flex items-center justify-center text-sm font-medium">
                  {instruction.step}
                </div>
                <div className="flex-1">
                  <textarea
                    rows={3}
                    value={instruction.instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    placeholder={`Step ${instruction.step}: Describe what to do...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                  />
                </div>
                {formData.instructions.length > 1 && (
                  <button
                    onClick={() => removeInstruction(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg self-start"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addInstruction}
              className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-olive-500 hover:text-olive-600 transition-colors"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Add Step
            </button>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Nutrition Information</h3>
            <p className="text-gray-600">Enter the nutritional values per serving</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calories *
                </label>
                <input
                  type="number"
                  value={formData.nutrition.calories}
                  onChange={(e) => handleNutritionChange('calories', e.target.value)}
                  placeholder="250"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Protein (g) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.nutrition.protein}
                  onChange={(e) => handleNutritionChange('protein', e.target.value)}
                  placeholder="12.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carbohydrates (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.nutrition.carbs}
                  onChange={(e) => handleNutritionChange('carbs', e.target.value)}
                  placeholder="35.2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fat (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.nutrition.fat}
                  onChange={(e) => handleNutritionChange('fat', e.target.value)}
                  placeholder="8.7"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiber (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.nutrition.fiber}
                  onChange={(e) => handleNutritionChange('fiber', e.target.value)}
                  placeholder="3.2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sugar (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.nutrition.sugar}
                  onChange={(e) => handleNutritionChange('sugar', e.target.value)}
                  placeholder="15.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Review Your Recipe</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">{formData.title}</h4>
              <p className="text-gray-600 mb-4">{formData.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Category:</span>
                  <p className="font-medium">{formData.category}</p>
                </div>
                <div>
                  <span className="text-gray-500">Cuisine:</span>
                  <p className="font-medium">{formData.cuisine}</p>
                </div>
                <div>
                  <span className="text-gray-500">Prep Time:</span>
                  <p className="font-medium">{formData.prepTime} min</p>
                </div>
                <div>
                  <span className="text-gray-500">Servings:</span>
                  <p className="font-medium">{formData.servings}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-6 py-2 rounded-lg ${
            currentStep === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          Previous
        </button>

        <div className="flex space-x-3">
          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className={`px-6 py-2 rounded-lg ${
                isStepValid()
                  ? 'bg-olive-600 text-white hover:bg-olive-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          ) : (
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Save Recipe</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
