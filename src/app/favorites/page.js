'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart, Clock, Users, Star, Utensils } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useFavorites } from '@/context/FavoritesContext';

export default function Favorites() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { favorites, isFavorite, removeFromFavorites } = useFavorites();
  const [isClient, setIsClient] = useState(false);
  const [isRemoving, setIsRemoving] = useState({});
  const [loading, setLoading] = useState(true);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
    setLoading(false);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/favorites');
    }
  }, [status, router]);

  const handleRemoveFavorite = async (recipeId) => {
    try {
      setIsRemoving(prev => ({ ...prev, [recipeId]: true }));
      await removeFromFavorites(recipeId);
      // Small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error removing favorite:', error);
    } finally {
      setIsRemoving(prev => ({ ...prev, [recipeId]: false }));
    }
  };

  if (status === 'loading' || !isClient || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded w-1/4 mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex items-center space-x-4 pt-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-lg shadow-md">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-50 mb-6">
            <Heart className="h-12 w-12 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No favorites yet</h2>
          <p className="text-gray-600 mb-6">Start saving your favorite recipes by clicking the heart icon on any recipe card.</p>
          <Link
            href="/recipes"
            className="inline-flex items-center justify-center px-4 py-2 bg-olive-600 text-white rounded-md hover:bg-olive-700 transition-colors"
          >
            <Utensils className="w-4 h-4 mr-2" />
            Browse Recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Favorite Recipes</h1>
          <p className="text-gray-600">All your saved recipes in one place</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((recipe) => (
            <div key={recipe.id} className="relative group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/recipes/${recipe.id}`} className="block">
                <div className="relative h-48">
                  <Image
                    src={recipe.image || '/placeholder-recipe.jpg'}
                    alt={recipe.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {recipe.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{recipe.readyInMinutes || 'N/A'} min</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{recipe.servings || 2} servings</span>
                      </div>
                    </div>
                    {recipe.healthScore && (
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm font-medium text-yellow-700">
                          {Math.round(recipe.healthScore)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveFavorite(recipe.id);
                }}
                disabled={isRemoving[recipe.id]}
                className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                  isRemoving[recipe.id]
                    ? 'bg-gray-100 text-gray-400 cursor-wait'
                    : 'bg-white/80 hover:bg-red-50 text-red-500'
                }`}
                aria-label="Remove from favorites"
              >
                <Heart className={`w-5 h-5 ${isRemoving[recipe.id] ? 'animate-pulse' : 'fill-current'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}