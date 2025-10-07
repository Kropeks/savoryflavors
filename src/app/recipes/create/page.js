'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowDown, ArrowLeft, ArrowUp, Plus, X } from 'lucide-react'
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
    ingredients: [{ name: '', amount: '', unit: '' }],
    instructionSteps: [{ title: '', description: '' }],
    price: '',
    previewText: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/user/subscription', { cache: 'no-store' })
        if (!response.ok) {
          if (isMounted) {
            setHasPremiumAccess(false)
            setFormData(prev => ({ ...prev, price: '', previewText: '' }))
          }
          return
        }

        const data = await response.json()
        const planName = data?.plan?.name || data?.planName || ''
        const status = data?.status || data?.subscription?.status || ''
        const hasSubscription =
          status?.toLowerCase() === 'active' ||
          data?.hasSubscription === true ||
          planName?.toLowerCase().includes('premium')

        if (isMounted) {
          setHasPremiumAccess(hasSubscription)
          if (!hasSubscription) {
            setFormData(prev => ({ ...prev, price: '', previewText: '' }))
          }
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
        if (isMounted) {
          setHasPremiumAccess(false)
          setFormData(prev => ({ ...prev, price: '', previewText: '' }))
        }
      }
    }

    fetchSubscription()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      const payload = new FormData()
      payload.append('title', formData.title)
      payload.append('description', formData.description)
      const instructionLines = buildInstructionLines(formData.instructionSteps)
      payload.append('instructions', instructionLines.length ? instructionLines.join('\n') : formData.instructions)
      payload.append('prepTime', formData.prepTime)
      payload.append('cookTime', formData.cookTime)
      payload.append('servings', formData.servings)
      payload.append('difficulty', formData.difficulty)
      payload.append('category', formData.category)
      payload.append('cuisine', formData.cuisine)
      payload.append('ingredients', JSON.stringify(formData.ingredients))
      if (hasPremiumAccess && formData.price !== '') {
        payload.append('price', formData.price)
      }
      if (hasPremiumAccess && formData.previewText.trim() !== '') {
        payload.append('previewText', formData.previewText.trim())
      }

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

  const buildInstructionLines = (steps) =>
    steps
      .map((step, index) => {
        const title = step?.title?.trim() || ''
        const description = step?.description?.trim() || ''
        if (!title && !description) return ''
        const titlePart = title ? `${title}: ` : ''
        const body = description || ''
        return `${index + 1}. ${titlePart}${body}`.trim()
      })
      .filter(Boolean)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const syncInstructionSteps = (steps) => {
    const normalized = steps.length ? steps : [{ title: '', description: '' }]
    const instructionLines = buildInstructionLines(normalized)
    setFormData(prev => ({
      ...prev,
      instructionSteps: normalized,
      instructions: instructionLines.join('\n')
    }))
  }

  const addInstructionStep = () => {
    syncInstructionSteps([...formData.instructionSteps, { title: '', description: '' }])
  }

  const updateInstructionStep = (index, field, value) => {
    const steps = formData.instructionSteps.map((step, i) =>
      i === index ? { ...step, [field]: value } : step
    )
    syncInstructionSteps(steps)
  }

  const removeInstructionStep = (index) => {
    if (formData.instructionSteps.length === 1) {
      syncInstructionSteps([{ title: '', description: '' }])
      return
    }
    const steps = formData.instructionSteps.filter((_, i) => i !== index)
    syncInstructionSteps(steps)
  }

  const moveInstructionStep = (index, direction) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= formData.instructionSteps.length) {
      return
    }
    const steps = [...formData.instructionSteps]
    const [moved] = steps.splice(index, 1)
    steps.splice(newIndex, 0, moved)
    syncInstructionSteps(steps)
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

    if (!file.type?.startsWith('image/')) {
      setImageFile(null)
      setImagePreview(null)
      alert('Please select a valid image file.')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    const maxBytes = 5 * 1024 * 1024 // 5MB
    if (file.size > maxBytes) {
      setImageFile(null)
      setImagePreview(null)
      alert('Image must be 5MB or smaller. Please choose a smaller file.')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setImageFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : null
      setImagePreview(result)
    }
    reader.onerror = () => {
      console.error('Failed to read image file for preview')
      setImageFile(null)
      setImagePreview(null)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/recipes" className="text-olive-600 hover:text-olive-700 mb-4 inline-flex items-center gap-2 dark:text-olive-400 dark:hover:text-olive-300">
            <ArrowLeft className="h-4 w-4" />
            Back to recipes
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">Add New Recipe</h1>
          <p className="text-lg text-gray-600 dark:text-slate-300">
            Share your favorite recipe with the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-6">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                  placeholder="Enter recipe title"
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <label htmlFor="recipe-image-upload" className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                  Recipe Image (Optional)
                </label>
                <input
                  ref={fileInputRef}
                  id="recipe-image-upload"
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-700 rounded-lg cursor-pointer bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-olive-500"
                  onChange={handleImageChange}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Upload a clear photo (JPG or PNG). Maximum size 5MB.
                </p>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="relative w-full md:w-64 h-40 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Recipe preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="h-10 w-10 mb-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5V7.125A2.625 2.625 0 015.625 4.5h12.75A2.625 2.625 0 0121 7.125V16.5m-18 0A2.625 2.625 0 015.625 19.125h12.75A2.625 2.625 0 0021 16.5m-18 0l4.72-4.72a1.125 1.125 0 011.59 0L12 14.25l1.69-1.69a1.125 1.125 0 011.59 0L21 18m-9-7.875a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0z"
                          />
                        </svg>
                        <span className="text-sm">Image preview appears here</span>
                        <span className="text-xs">Ideal size 1280x720</span>
                      </div>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-200">Preview</span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-slate-100 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remove image
                      </button>
                    </div>
                  )}
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                  placeholder="Brief description of your recipe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Preparation Time (minutes) *
                </label>
                <input
                  type="number"
                  name="prepTime"
                  value={formData.prepTime}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Cooking Time (minutes) *
                </label>
                <input
                  type="number"
                  name="cookTime"
                  value={formData.cookTime}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Servings *
                </label>
                <input
                  type="number"
                  name="servings"
                  value={formData.servings}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                />
              </div>

              {hasPremiumAccess && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                      Recipe Price (₱) <span className="text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">
                        ₱
                      </span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Set the selling price for your recipe in Philippine Peso.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                      Preview Text <span className="text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      name="previewText"
                      value={formData.previewText}
                      onChange={handleInputChange}
                      rows={3}
                      maxLength={250}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                      placeholder="Give non-buyers a quick teaser about your premium recipe"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Shown to non-premium users. Maximum 250 characters.
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-olive-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Cuisine
                </label>
                <select
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-olive-500 focus:border-transparent"
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

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-6">Ingredients</h2>

            <div className="space-y-4">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                      Ingredient {index + 1} *
                    </label>
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                      placeholder="e.g. Chicken breast"
                    />
                  </div>

                  <div className="w-24">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                      min="0"
                      step="0.25"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                      placeholder="1"
                    />
                  </div>

                  <div className="w-20">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
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
              className="mt-4 flex items-center gap-2 text-olive-600 hover:text-olive-700 dark:text-olive-400 dark:hover:text-olive-300 font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Ingredient
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-6">Instructions</h2>

            <div className="space-y-4">
              {formData.instructionSteps.map((step, index) => {
                const isFirst = index === 0
                const isLast = index === formData.instructionSteps.length - 1

                return (
                  <div key={index} className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">Step {index + 1}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveInstructionStep(index, -1)}
                          disabled={isFirst}
                          className="p-2 text-gray-500 hover:text-olive-600 dark:text-gray-400 dark:hover:text-olive-300 disabled:text-gray-300 disabled:cursor-not-allowed"
                          title="Move step up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveInstructionStep(index, 1)}
                          disabled={isLast}
                          className="p-2 text-gray-500 hover:text-olive-600 dark:text-gray-400 dark:hover:text-olive-300 disabled:text-gray-300 disabled:cursor-not-allowed"
                          title="Move step down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeInstructionStep(index)}
                          disabled={formData.instructionSteps.length === 1}
                          className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 disabled:text-gray-300 disabled:cursor-not-allowed"
                          title="Remove step"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Step title (optional)
                        </label>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => updateInstructionStep(index, 'title', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-olive-500"
                          placeholder={`Step ${index + 1} title`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Step details
                        </label>
                        <textarea
                          value={step.description}
                          onChange={(e) => updateInstructionStep(index, 'description', e.target.value)}
                          rows={3}
                          required={!step.title?.trim()}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-olive-500"
                          placeholder={`Describe step ${index + 1}...`}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}

              <button
                type="button"
                onClick={addInstructionStep}
                className="inline-flex items-center gap-2 text-olive-600 hover:text-olive-700 font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Step
              </button>

              <p className="text-xs text-gray-500">
                Steps are saved automatically and sent in order. Use the arrows to reorder or remove steps as needed.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/recipes" className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
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
