'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (error) {
          console.error('Failed to parse favorites from localStorage', error);
        }
      }
      setLoading(false);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading) {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }, [favorites, loading]);

  const isFavorite = (recipeId) => {
    return favorites.some(fav => fav.id === recipeId);
  };

  const addToFavorites = (recipe) => {
    if (!isFavorite(recipe.id)) {
      setFavorites(prev => [...prev, recipe]);
    }
  };

  const removeFromFavorites = (recipeId) => {
    setFavorites(prev => prev.filter(fav => fav.id !== recipeId));
  };

  const toggleFavorite = (recipe) => {
    if (isFavorite(recipe.id)) {
      removeFromFavorites(recipe.id);
    } else {
      addToFavorites(recipe);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        loading
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
