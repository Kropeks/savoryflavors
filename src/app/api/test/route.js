import { query, testConnection } from '@/lib/db';

export const dynamic = 'force-dynamic' // Ensure this route is not statically generated

export async function GET() {
  try {
    // Test the database connection first
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Database connection failed'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get database configuration from environment
    const dbConfig = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      // Don't log the actual password
      password: process.env.DB_PASSWORD ? '***' : 'Not set'
    };

    // Get recipes from database
    const recipes = await query(`
      SELECT 
        r.id,
        r.slug,
        r.title,
        r.category,
        r.cuisine,
        r.status,
        r.approval_status,
        r.is_public,
        r.created_at,
        COUNT(ri.id) as ingredient_count
      FROM 
        recipes r
      LEFT JOIN 
        recipe_ingredients ri ON r.id = ri.recipe_id
      GROUP BY 
        r.id
      ORDER BY 
        r.created_at DESC
      LIMIT 10
    `);

    // Get the first recipe's details for testing the full recipe endpoint
    const testRecipe = recipes.length > 0 ? recipes[0] : null;
    const testUrl = testRecipe 
      ? `http://localhost:3000/recipes/${testRecipe.slug || testRecipe.id}?source=community`
      : null;

    return new Response(JSON.stringify({
      success: true,
      dbConfig,
      connection: 'success',
      recipes,
      testRecipeUrl: testUrl,
      timestamp: new Date().toISOString(),
      note: testUrl ? `Try accessing the test recipe at: ${testUrl}` : 'No recipes found in the database'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// For backward compatibility with API routes
export async function handler(req, res) {
  if (req.method === 'GET') {
    const response = await GET();
    const data = await response.json();
    res.status(response.status).json(data);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
