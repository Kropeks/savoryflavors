import { NextResponse } from 'next/server'
import path from 'path'
import { mkdir, writeFile } from 'fs/promises'
import { randomUUID } from 'crypto'

import { auth } from '@/auth'
import { query, queryOne, transaction } from '@/lib/db'
import { checkUserSubscription } from '@/lib/subscription'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'recipes')

const toNumberOrNull = (value, parser = Number.parseInt) => {
  if (value === null || value === undefined || value === '') return null
  const parsed = parser(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

const toDecimalOrNull = (value) => {
  if (value === null || value === undefined) return null
  const stringValue = value?.toString().trim()
  if (!stringValue) return null
  const parsed = Number.parseFloat(stringValue)
  return Number.isFinite(parsed) ? parsed : null
}


const mapRecipeRow = (row) => {
  const prepTime = toNumberOrNull(row.prep_time)
  const cookTime = toNumberOrNull(row.cook_time)
  const totalTime = (prepTime ?? 0) + (cookTime ?? 0)
  const readyInMinutes = totalTime > 0 ? totalTime : null

  return {
    id: row.id,
    slug: row.slug || `recipe-${row.id}`,
    title: row.title || 'Untitled Recipe',
    description: row.description || '',
    instructions: row.instructions || 'No instructions provided',
    prepTime: prepTime ?? 0,
    cookTime: cookTime ?? 0,
    readyInMinutes,
    servings: row.servings || 0,
    difficulty: row.difficulty || 'easy',
    category: row.category || 'other',
    cuisine: row.cuisine || '',
    image: row.image || '/placeholder-recipe.jpg',
    isPremium: Boolean(row.is_premium),
    price: row.price !== null && row.price !== undefined ? Number.parseFloat(row.price) : null,
    previewText: row.preview_text || null,
    status: row.status || 'draft',
    isPublic: Boolean(row.is_public),
    approvalStatus: row.approval_status || 'pending',
    creator: {
      id: row.user_id,
      name: row.creator_name || 'Anonymous'
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')?.trim()
    const cuisine = searchParams.get('cuisine')?.trim()
    const search = searchParams.get('query')?.trim() || searchParams.get('search')?.trim()
    const mine = searchParams.get('mine') === 'true'
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get('limit') || '12', 10)))
    const offset = (page - 1) * limit

    const conditions = []
    const params = []

    let userIdFilter = null
    if (mine) {
      const session = await auth()
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const parsedUserId = Number.parseInt(session.user.id, 10)
      if (!Number.isInteger(parsedUserId)) {
        throw new Error('Authenticated user does not have a numeric ID required by this database schema.')
      }
      userIdFilter = parsedUserId
      conditions.push('r.user_id = ?')
      params.push(parsedUserId)
    } else {
      conditions.push('r.is_public = 1')
      conditions.push("r.status = 'PUBLISHED'")
      conditions.push("r.approval_status = 'approved'")
    }

    if (category) {
      conditions.push('r.category = ?')
      params.push(category)
    }

    if (cuisine) {
      conditions.push('r.cuisine = ?')
      params.push(cuisine)
    }

    if (search) {
      conditions.push('(r.title LIKE ? OR r.description LIKE ? OR r.slug LIKE ?)')
      const likeTerm = `%${search}%`
      params.push(likeTerm, likeTerm, likeTerm)
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const recipes = await query(
      `SELECT
         r.id,
         r.slug,
         r.title,
         r.description,
         r.instructions,
         r.image,
         r.is_premium,
         r.price,
         r.preview_text,
         r.prep_time,
         r.cook_time,
         r.servings,
         r.difficulty,
         r.category,
         r.cuisine,
         r.user_id,
         r.status,
         r.is_public,
         r.approval_status,
         r.submitted_at,
         u.name AS creator_name,
         r.created_at,
         r.updated_at
       FROM recipes r
       LEFT JOIN users u ON u.id = r.user_id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    const countResult = await queryOne(
      `SELECT COUNT(r.id) AS total
       FROM recipes r
       ${whereClause}`,
      params
    )

    const total = countResult?.total ?? 0

    return NextResponse.json({
      recipes: recipes.map(mapRecipeRow),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        mine,
        userId: userIdFilter
      }
    })
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch recipes',
        message: error.message
      },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()

    const title = formData.get('title')?.toString().trim()
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const description = formData.get('description')?.toString().trim() || null
    const instructionsText = formData.get('instructions')?.toString().trim() || ''
    if (!instructionsText) {
      return NextResponse.json({ error: 'Instructions are required' }, { status: 400 })
    }

    const prepTime = toNumberOrNull(formData.get('prepTime'))
    const cookTime = toNumberOrNull(formData.get('cookTime'))
    const servings = toNumberOrNull(formData.get('servings'))
    const difficulty = formData.get('difficulty')?.toString().trim() || 'medium'
    const category = formData.get('category')?.toString().trim() || null
    const cuisine = formData.get('cuisine')?.toString().trim() || null
    const priceInput = toDecimalOrNull(formData.get('price'))
    const previewTextRaw = formData.get('previewText')?.toString().trim() || ''
    const previewText = previewTextRaw ? previewTextRaw.slice(0, 250) : null

    const ingredientsRaw = formData.get('ingredients')?.toString() || '[]'
    let ingredients = []
    try {
      const parsed = JSON.parse(ingredientsRaw)
      if (Array.isArray(parsed)) {
        ingredients = parsed
      }
    } catch (error) {
      console.warn('Unable to parse ingredients payload:', error)
    }

    const imageUrl = formData.get('imageUrl')?.toString().trim() || null
    const imageFile = formData.get('image')
    let storedImagePath = imageUrl || null

    if (imageFile && typeof imageFile === 'object' && 'arrayBuffer' in imageFile && imageFile.size > 0) {
      await mkdir(UPLOAD_DIR, { recursive: true })
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const extension = path.extname(imageFile.name || '') || '.png'
      const fileName = `${randomUUID()}${extension}`
      await writeFile(path.join(UPLOAD_DIR, fileName), buffer)
      storedImagePath = `/uploads/recipes/${fileName}`
    }

    const instructionSteps = instructionsText
      .split(/\r?\n/)
      .map((step) => step.trim())
      .filter(Boolean)

    const now = new Date()
    const normalizedDifficulty = normalizeDifficulty(difficulty)
    const normalizedCategory = category || null
    const normalizedCuisine = cuisine || null

    const parsedUserId = Number.parseInt(session.user.id, 10)
    if (!Number.isInteger(parsedUserId)) {
      throw new Error('Authenticated user does not have a numeric ID required by this database schema.')
    }

    const slug = generateSlug(title)

    const subscription = await checkUserSubscription(parsedUserId)
    const hasPremiumAccess = Boolean(subscription?.isPremium)

    let monetization = {
      isPremium: false,
      price: null,
      previewText: null
    }

    if (priceInput !== null) {
      if (!hasPremiumAccess) {
        return NextResponse.json({ error: 'Premium subscription required to set a price' }, { status: 403 })
      }

      if (priceInput < 0) {
        return NextResponse.json({ error: 'Price must be zero or greater' }, { status: 400 })
      }

      monetization = {
        isPremium: priceInput > 0,
        price: priceInput,
        previewText: null
      }
    }

    if (previewText) {
      if (!hasPremiumAccess) {
        return NextResponse.json({ error: 'Premium subscription required to set preview text' }, { status: 403 })
      }
      monetization.previewText = previewText
    }

    await transaction(async (connection) => {
      const insertValues = [
        parsedUserId,
        title,
        slug,
        description,
        prepTime ?? null,
        cookTime ?? null,
        servings ?? null,
        normalizedDifficulty,
        normalizedCategory,
        normalizedCuisine,
        storedImagePath ?? null,
        monetization.isPremium ? 1 : 0,
        0,
        0,
        0,
        monetization.price,
        monetization.previewText,
        'PUBLISHED',
        0,
        'pending',
        now,
        now,
        now
      ].map(sanitizeValue)

      const [recipeResult] = await connection.query(
        `INSERT INTO recipes (
          user_id,
          title,
          slug,
          description,
          prep_time,
          cook_time,
          servings,
          difficulty,
          category,
          cuisine,
          image,
          is_premium,
          is_public,
          is_private,
          is_featured,
          price,
          preview_text,
          status,
          views,
          approval_status,
          created_at,
          updated_at,
          submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        insertValues
      )
      const recipeId = recipeResult.insertId

      await connection.query(
        `INSERT INTO recipe_status_history (
          recipe_id,
          status,
          changed_by,
          notes
        ) VALUES (?, ?, ?, ?)` ,
        [recipeId.toString(), 'pending', parsedUserId, 'Recipe submitted for moderation']
      )

      if (ingredients.length) {
        let position = 1
        for (const ingredient of ingredients) {
          if (!ingredient?.name?.trim()) {
            continue
          }

          const rawAmount = ingredient.amount ? Number.parseFloat(ingredient.amount) : null
          const ingredientValues = [
            recipeId,
            ingredient.name.trim(),
            Number.isFinite(rawAmount) ? rawAmount : null,
            ingredient.unit?.trim() || null,
            ingredient.notes?.trim() || null,
            position,
            position,
            ingredient.optional ? 1 : 0,
            now
          ].map(sanitizeValue)

          await connection.query(
            `INSERT INTO recipe_ingredients (
              recipe_id,
              name,
              amount,
              unit,
              notes,
              \`order\`,
              position,
              is_optional,
              updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
            ingredientValues
          )

          position += 1
        }
      }

      if (instructionSteps.length) {
        let stepNumber = 1
        for (const instruction of instructionSteps) {
          const instructionValues = [
            recipeId,
            stepNumber++,
            instruction,
            null,
            null,
            now,
            now
          ].map(sanitizeValue)

          await connection.query(
            `INSERT INTO instructions (
              recipe_id,
              step_number,
              instruction,
              image,
              created_at,
              updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)` ,
            instructionValues
          )
        }
      }
    })

    return NextResponse.json(
      {
        success: true,
        recipeId: slug,
        imagePath: storedImagePath,
        approvalStatus: 'pending'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating recipe:', error)
    return NextResponse.json(
      {
        error: 'Failed to create recipe',
        message: error.message
      },
      { status: 500 }
    )
  }
}
