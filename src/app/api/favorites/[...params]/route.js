import { query } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    try {
      const [userId, recipeId] = req.query.params;

      if (!userId || !recipeId) {
        return res.status(400).json({ error: 'User ID and Recipe ID are required' });
      }

      // Delete the favorite
      const result = await query(
        'DELETE FROM favorites WHERE userId = ? AND recipeId = ?',
        [userId, recipeId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Favorite not found' });
      }

      res.status(200).json({ message: 'Removed from favorites' });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      res.status(500).json({ error: 'Failed to remove from favorites' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
