import nutritionAPI from '@/lib/nutritionAPI';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { query, limit = 10 } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    const foods = await nutritionAPI.searchFoodsCombined(query, parseInt(limit));

    return res.status(200).json({
      success: true,
      query: query,
      count: foods.length,
      foods: foods.map(food => ({
        id: food.id || food.name.toLowerCase().replace(/\s+/g, '-'),
        name: food.name,
        image: food.image,
        category: food.category || 'Food',
        source: food.source
      }))
    });

  } catch (error) {
    console.error('Food search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search foods',
      error: error.message
    });
  }
}
