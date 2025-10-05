'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

/**
 * @typedef {Object} Recipe
 * @property {string} id - Unique identifier for the recipe
 * @property {string} title - Title of the recipe
 * @property {string} description - Description of the recipe
 * @property {string[]} ingredients - Array of ingredients
 * @property {string[]} instructions - Array of cooking steps
 * @property {string} category - Category of the recipe (e.g., 'Breakfast', 'Dessert')
 * @property {number} prepTime - Preparation time in minutes
 * @property {number} cookTime - Cooking time in minutes
 * @property {number} servings - Number of servings
 * @property {string} image - URL of the recipe image
 * @property {string} dateAdded - ISO date string when recipe was added
 * @property {boolean} [isFeatured] - Whether the recipe is featured
 * @property {boolean} [isPopular] - Whether the recipe is popular
 * @property {string} [cuisine] - Cuisine type (e.g., 'Italian', 'Mexican')
 * @property {string[]} [dietaryRestrictions] - Array of dietary restrictions (e.g., 'vegetarian', 'gluten-free')
 */

/**
 * @typedef {Object} RecipeContextType
 * @property {Recipe[]} recipes - Array of all recipes
 * @property {boolean} loading - Loading state
 * @property {string[]} favorites - Array of favorite recipe IDs
 * @property {(recipe: Omit<Recipe, 'id' | 'dateAdded'>) => string} addRecipe - Add a new recipe
 * @property {(id: string, updates: Partial<Recipe>) => void} updateRecipe - Update an existing recipe
 * @property {(id: string) => void} deleteRecipe - Delete a recipe
 * @property {(id: string) => void} toggleFavorite - Toggle favorite status of a recipe
 * @property {(id: string) => boolean} isFavorite - Check if a recipe is favorited
 * @property {() => Recipe[]} getFeaturedRecipes - Get featured recipes
 * @property {() => Recipe[]} getPopularRecipes - Get popular recipes
 * @property {(limit?: number) => Recipe[]} getRecentRecipes - Get recent recipes
 * @property {(recipes: Recipe[], filters: { query?: string, category?: string, page?: number, limit?: number, cuisine?: string, dietaryRestrictions?: string[] }) => { filteredRecipes: Recipe[], total: number }} filterRecipes - Filter and paginate recipes
 * @property {number} favoritesCount - Total number of favorite recipes
 */

const RecipeContext = createContext(/** @type {RecipeContextType | undefined} */ (undefined));

/**
 * RecipeProvider component that provides recipe-related state and actions
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState(/** @type {Recipe[]} */([]));
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(/** @type {Set<string>} */(new Set()));
  const [error, setError] = useState(/** @type {string | null} */(null));

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const savedRecipes = localStorage.getItem('savoryFlavors_recipes');
      const savedFavorites = localStorage.getItem('savoryFlavors_favorites');
      
      if (savedRecipes) {
        const parsedRecipes = JSON.parse(savedRecipes);
        if (Array.isArray(parsedRecipes)) {
          setRecipes(parsedRecipes);
        } else {
          console.warn('Invalid recipes data in localStorage, initializing with empty array');
          localStorage.removeItem('savoryFlavors_recipes');
        }
      }
      
      if (savedFavorites) {
        try {
          const parsedFavorites = JSON.parse(savedFavorites);
          if (Array.isArray(parsedFavorites)) {
            setFavorites(new Set(parsedFavorites));
          }
        } catch (e) {
          console.warn('Invalid favorites data in localStorage, initializing with empty set');
          localStorage.removeItem('savoryFlavors_favorites');
        }
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      setError('Failed to load recipe data');
      toast.error('Failed to load recipe data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save to localStorage whenever recipes or favorites change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('savoryFlavors_recipes', JSON.stringify(recipes));
      } catch (error) {
        console.error('Error saving recipes to localStorage:', error);
        toast.error('Failed to save recipes');
      }
    }
  }, [recipes, loading]);

  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('savoryFlavors_favorites', JSON.stringify(Array.from(favorites)));
      } catch (error) {
        console.error('Error saving favorites to localStorage:', error);
        toast.error('Failed to save favorites');
      }
    }
  }, [favorites, loading]);

  /**
   * Add a new recipe with validation
   * @param {Omit<Recipe, 'id' | 'dateAdded'>} newRecipe - The recipe to add
   * @returns {string} The ID of the newly created recipe
   */
  const addRecipe = useCallback((newRecipe) => {
    if (!newRecipe.title?.trim()) {
      throw new Error('Recipe title is required');
    }
    
    if (!Array.isArray(newRecipe.ingredients) || newRecipe.ingredients.length === 0) {
      throw new Error('At least one ingredient is required');
    }
    
    if (!Array.isArray(newRecipe.instructions) || newRecipe.instructions.length === 0) {
      throw new Error('At least one instruction step is required');
    }
    
    const id = `recipe_${Date.now()}`;
    const recipeWithId = { 
      ...newRecipe,
      id,
      dateAdded: new Date().toISOString(),
      ingredients: newRecipe.ingredients.filter(Boolean),
      instructions: newRecipe.instructions.filter(Boolean)
    };
    
    setRecipes(prevRecipes => [recipeWithId, ...prevRecipes]);
    toast.success('Recipe added successfully!');
    return id;
  }, []);

  /**
   * Update an existing recipe
   * @param {string} id - The ID of the recipe to update
   * @param {Partial<Recipe>} updates - The updates to apply
   */
  const updateRecipe = useCallback((id, updates) => {
    setRecipes(prevRecipes => {
      const recipeExists = prevRecipes.some(recipe => recipe.id === id);
      if (!recipeExists) {
        throw new Error(`Recipe with ID ${id} not found`);
      }
      
      return prevRecipes.map(recipe => 
        recipe.id === id 
          ? { ...recipe, ...updates, lastUpdated: new Date().toISOString() }
          : recipe
      );
    });
    
    toast.success('Recipe updated successfully!');
  }, []);

  /**
   * Delete a recipe
   * @param {string} id - The ID of the recipe to delete
   */
  const deleteRecipe = useCallback((id) => {
    setRecipes(prevRecipes => {
      const recipeExists = prevRecipes.some(recipe => recipe.id === id);
      if (!recipeExists) return prevRecipes;
      
      return prevRecipes.filter(recipe => recipe.id !== id);
    });
    
    // Remove from favorites if it was there
    setFavorites(prev => {
      if (prev.has(id)) {
        const newFavorites = new Set(prev);
        newFavorites.delete(id);
        return newFavorites;
      }
      return prev;
    });
    
    toast.success('Recipe deleted successfully');
  }, []);

  /**
   * Toggle favorite status of a recipe
   * @param {string} id - The ID of the recipe to toggle
   */
  const toggleFavorite = useCallback((id) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      const recipe = recipes.find(r => r.id === id);
      
      if (!recipe) {
        toast.error('Recipe not found');
        return prev;
      }
      
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
        toast.success(`Removed ${recipe.title} from favorites`);
      } else {
        newFavorites.add(id);
        toast.success(`Added ${recipe.title} to favorites`);
      }
      
      return newFavorites;
    });
  }, [recipes]);

  /**
   * Check if a recipe is in favorites
   * @param {string} id - The recipe ID to check
   * @returns {boolean} True if the recipe is favorited
   */
  const isFavorite = useCallback((id) => favorites.has(id), [favorites]);
  
  /**
   * Get the total number of favorite recipes
   * @type {number}
   */
  const favoritesCount = favorites.size;

  /**
   * Get featured recipes
   * @returns {Recipe[]} Array of featured recipes
   */
  const getFeaturedRecipes = useCallback(() => 
    recipes.filter(recipe => recipe.isFeatured).slice(0, 6)
  , [recipes]);
  
  /**
   * Get popular recipes (sorted by favorites)
   * @returns {Recipe[]} Array of popular recipes
   */
  const getPopularRecipes = useCallback(() => 
    [...recipes]
      .sort((a, b) => {
        const aFavorites = favorites.has(a.id) ? 1 : 0;
        const bFavorites = favorites.has(b.id) ? 1 : 0;
        return bFavorites - aFavorites;
      })
      .slice(0, 6)
  , [recipes, favorites]);
  
  /**
   * Get most recent recipes
   * @param {number} [limit=4] - Maximum number of recipes to return
   * @returns {Recipe[]} Array of recent recipes
   */
  const getRecentRecipes = useCallback((limit = 4) => 
    [...recipes]
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, limit)
  , [recipes]);

  /**
   * Filter, sort, and paginate recipes
   * @param {Recipe[]} recipesToFilter - The recipes to filter
   * @param {Object} options - Filter options
   * @param {string} [options.query=''] - Search query
   * @param {string} [options.category='all'] - Category filter
   * @param {number} [options.page=1] - Page number (1-based)
   * @param {number} [options.limit=12] - Items per page
   * @param {string} [options.cuisine] - Cuisine filter
   * @param {string[]} [options.dietaryRestrictions] - Dietary restrictions filter
   * @returns {{ filteredRecipes: Recipe[], total: number }} Filtered recipes and total count
   */
  const filterRecipes = useCallback((recipesToFilter, { 
    query = '', 
    category = 'all',
    page = 1,
    limit = 12,
    cuisine,
    dietaryRestrictions = []
  } = {}) => {
    const searchLower = query.toLowerCase().trim();
    
    const filtered = recipesToFilter.filter(recipe => {
      // Search query
      const matchesSearch = 
        !searchLower ||
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.description?.toLowerCase().includes(searchLower) ||
        recipe.ingredients.some(ing => 
          typeof ing === 'string' && ing.toLowerCase().includes(searchLower)
        ) ||
        recipe.category?.toLowerCase().includes(searchLower) ||
        recipe.cuisine?.toLowerCase().includes(searchLower);
      
      // Category filter
      const matchesCategory = 
        category === 'all' || 
        recipe.category?.toLowerCase() === category.toLowerCase();
      
      // Cuisine filter
      const matchesCuisine = 
        !cuisine || 
        (recipe.cuisine && recipe.cuisine.toLowerCase() === cuisine.toLowerCase());
      
      // Dietary restrictions filter
      const matchesDietary = 
        dietaryRestrictions.length === 0 ||
        (recipe.dietaryRestrictions && 
         dietaryRestrictions.every(restriction => 
           recipe.dietaryRestrictions?.includes(restriction)
         ));
      
      return matchesSearch && matchesCategory && matchesCuisine && matchesDietary;
    });
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedRecipes = filtered.slice(startIndex, startIndex + limit);
    
    return {
      filteredRecipes: paginatedRecipes,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
      currentPage: page
    };
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = {
    recipes,
    loading,
    error,
    favorites: Array.from(favorites),
    favoritesCount,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    isFavorite,
    getFeaturedRecipes,
    getPopularRecipes,
    getRecentRecipes,
    filterRecipes,
  };

  return (
    <RecipeContext.Provider value={contextValue}>
      {children}
    </RecipeContext.Provider>
  );
};

/**
 * Custom hook to access the recipe context
 * @returns {RecipeContextType} The recipe context
 * @throws {Error} If used outside of a RecipeProvider
 */
export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
};

// Export the context type for TypeScript users
export { RecipeContext };
