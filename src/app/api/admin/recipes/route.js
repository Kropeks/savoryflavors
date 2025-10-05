import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userRole = session.user.role?.toUpperCase();
    const isAdmin = userRole === 'ADMIN' || session.user.email === 'savoryadmin@example.com';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const recipeData = await request.json();
    
    // Start transaction
    const connection = await query.getConnection();
    await connection.beginTransaction();

    try {
      // Insert recipe
      const [recipeResult] = await query(
        `INSERT INTO recipes (
          title, description, prep_time, cook_time, servings, difficulty, 
          category, cuisine, image_url, is_approved, user_id, is_external, 
          external_source, external_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recipeData.title,
          recipeData.description,
          recipeData.prepTime || 0,
          recipeData.cookTime || 0,
          recipeData.servings || 1,
          recipeData.difficulty || 'medium',
          recipeData.category || 'Other',
          recipeData.cuisine || 'International',
          recipeData.imageUrl || null,
          true, // Auto-approve imported recipes
          session.user.id,
          true, // is_external
          recipeData.externalSource || 'TheMealDB',
          recipeData.externalId || null
        ]
      );

      const recipeId = recipeResult.insertId;

      // Insert ingredients
      if (recipeData.ingredients && recipeData.ingredients.length > 0) {
        const ingredientValues = recipeData.ingredients.map(ing => [
          recipeId,
          ing.name,
          ing.amount || '',
          ing.unit || '',
          ing.notes || ''
        ]);

        await query(
          `INSERT INTO recipe_ingredients 
          (recipe_id, name, amount, unit, notes) 
          VALUES ?`,
          [ingredientValues]
        );
      }

      // Insert instructions
      if (recipeData.instructions && recipeData.instructions.length > 0) {
        const instructionValues = recipeData.instructions.map((inst, index) => [
          recipeId,
          index + 1,
          inst.instruction || inst
        ]);

        await query(
          `INSERT INTO recipe_instructions 
          (recipe_id, step_number, instruction) 
          VALUES ?`,
          [instructionValues]
        );
      }

      // Insert tags
      if (recipeData.tags && recipeData.tags.length > 0) {
        // First, get or create tags
        const tagInserts = [];
        const tagValues = [];
        
        for (const tagName of recipeData.tags) {
          const [existingTag] = await query(
            'SELECT id FROM tags WHERE name = ?',
            [tagName]
          );

          if (existingTag) {
            tagInserts.push([recipeId, existingTag.id]);
          } else {
            const [tagResult] = await query(
              'INSERT INTO tags (name) VALUES (?)',
              [tagName]
            );
            tagInserts.push([recipeId, tagResult.insertId]);
          }
        }

        if (tagInserts.length > 0) {
          await query(
            'INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ?',
            [tagInserts]
          );
        }
      }

      await connection.commit();

      // Log the import
      await query(
        `INSERT INTO audit_logs 
        (user_id, action, entity_type, entity_id, new_values) 
        VALUES (?, ?, ?, ?, ?)`,
        [
          session.user.id,
          'IMPORT_RECIPE',
          'recipe',
          recipeId,
          JSON.stringify({
            title: recipeData.title,
            source: recipeData.externalSource || 'TheMealDB',
            externalId: recipeData.externalId
          })
        ]
      );

      return NextResponse.json({
        success: true,
        recipeId,
        message: 'Recipe imported successfully'
      });

    } catch (error) {
      await connection.rollback();
      console.error('Error importing recipe:', error);
      return NextResponse.json(
        { error: 'Failed to import recipe', details: error.message },
        { status: 500 }
      );
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error in recipe import API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
