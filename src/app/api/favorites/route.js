import { query, queryOne, transaction } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const favorites = await query(
        `SELECT 
           f.*,
           r.*,
           u.id as authorId, u.name as authorName,
           c.name as categoryName,
           cu.name as cuisineName,
           n.*,
           (SELECT COUNT(*) FROM reviews rv WHERE rv.recipeId = r.id) as reviewCount,
           (SELECT AVG(rating) FROM reviews rv WHERE rv.recipeId = r.id) as averageRating
         FROM favorites f
         JOIN recipes r ON f.recipeId = r.id
         LEFT JOIN users u ON r.userId = u.id
         LEFT JOIN categories c ON r.categoryId = c.id
         LEFT JOIN cuisines cu ON r.cuisineId = cu.id
         LEFT JOIN nutrition n ON n.recipeId = r.id
         WHERE f.userId = ?
         ORDER BY f.createdAt DESC`,
        [userId]
      );

      // Format the response to match the previous structure
      const formattedFavorites = favorites.map(fav => ({
        id: fav.id,
        userId: fav.userId,
        recipeId: fav.recipeId,
        createdAt: fav.createdAt,
        recipe: {
          id: fav.recipeId,
          title: fav.title,
          description: fav.description,
          image: fav.image,
          prepTime: fav.prepTime,
          cookTime: fav.cookTime,
          servings: fav.servings,
          difficulty: fav.difficulty,
          isPublic: fav.isPublic,
          createdAt: fav.createdAt,
          updatedAt: fav.updatedAt,
          userId: fav.userId,
          categoryId: fav.categoryId,
          cuisineId: fav.cuisineId,
          user: {
            id: fav.authorId,
            name: fav.authorName
          },
          category: fav.categoryName ? { name: fav.categoryName } : null,
          cuisine: fav.cuisineName ? { name: fav.cuisineName } : null,
          nutrition: fav.calories !== null ? {
            calories: fav.calories,
            protein: fav.protein,
            carbs: fav.carbs,
            fat: fav.fat,
            fiber: fav.fiber,
            sugar: fav.sugar,
            sodium: fav.sodium
          } : null,
          _count: {
            reviews: fav.reviewCount || 0
          },
          averageRating: fav.averageRating ? parseFloat(fav.averageRating).toFixed(1) : 0
        }
      }));

      res.status(200).json(formattedFavorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ error: 'Failed to fetch favorites' });
    }
  } else if (req.method === 'POST') {
    try {
      const { userId, recipeId } = req.body;

      if (!userId || !recipeId) {
        return res.status(400).json({ error: 'User ID and Recipe ID are required' });
      }

      // Check if favorite already exists
      const existingFavorite = await queryOne(
        'SELECT * FROM favorites WHERE userId = ? AND recipeId = ?',
        [userId, recipeId]
      );

      if (existingFavorite) {
        return res.status(409).json({ error: 'Recipe already in favorites' });
      }

      // Add to favorites
      await query(
        'INSERT INTO favorites (userId, recipeId, createdAt) VALUES (?, ?, NOW())',
        [userId, recipeId]
      );

      // Get the favorite with recipe details
      const favorite = await queryOne(
        `SELECT f.*, r.*, u.name as authorName
         FROM favorites f
         JOIN recipes r ON f.recipeId = r.id
         LEFT JOIN users u ON r.userId = u.id
         WHERE f.userId = ? AND f.recipeId = ?`,
        [userId, recipeId]
      );

      res.status(201).json({
        id: favorite.id,
        userId: favorite.userId,
        recipeId: favorite.recipeId,
        createdAt: favorite.createdAt,
        recipe: {
          id: favorite.recipeId,
          title: favorite.title,
          description: favorite.description,
          image: favorite.image,
          user: {
            id: favorite.userId,
            name: favorite.authorName
          }
        }
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      res.status(500).json({ error: 'Failed to add to favorites' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
