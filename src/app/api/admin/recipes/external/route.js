import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { searchMeals, getMealById } from '@/lib/api/mealdb';

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const id = searchParams.get('id');

    if (id) {
      const meal = await getMealById(id);
      return NextResponse.json({ data: meal });
    }

    const meals = await searchMeals(query);
    return NextResponse.json({ data: meals });
  } catch (error) {
    console.error('Error in external recipes API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}
