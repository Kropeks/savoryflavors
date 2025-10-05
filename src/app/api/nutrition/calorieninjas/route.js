import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const apiKey = process.env.CALORIENINJAS_API_KEY;

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' }, 
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `CalorieNinjas API error: ${response.status} - ${errorData.message || 'Unknown error'}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from CalorieNinjas API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch nutrition data',
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}
