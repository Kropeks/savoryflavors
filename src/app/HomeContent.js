'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Search, 
  Star, 
  Clock, 
  Users as UsersIcon, 
  Heart, 
  Plus, 
  ChefHat, 
  Loader2, 
  ArrowRight, 
  Utensils, 
  Sparkles,
  Users
} from 'lucide-react';

export default function HomeContent() {
  const { data: session, status } = useSession();
  const allRecipes = [
    {
      id: 1,
      title: 'Classic Spaghetti Carbonara',
      image: '/images/recipes/carbonara.jpg',
      readyInMinutes: 30,
      servings: 4,
      category: 'main course',
      rating: 4.7,
      isFavorite: false,
      isFeatured: true,
      isPopular: true,
      dateAdded: '2023-10-15',
      ingredients: ['pasta', 'eggs', 'pancetta', 'parmesan', 'black pepper']
    },
    {
      id: 2,
      title: 'Fresh Garden Salad',
      image: '/images/recipes/salad.jpg',
      readyInMinutes: 15,
      servings: 2,
      category: 'salad',
      rating: 4.5,
      isFavorite: true,
      isFeatured: true,
      isPopular: true,
      dateAdded: '2023-10-20',
      ingredients: ['mixed greens', 'cherry tomatoes', 'cucumber', 'olive oil', 'lemon']
    },
    {
      id: 3,
      title: 'Chocolate Lava Cake',
      image: '/images/recipes/chocolate-cake.jpg',
      readyInMinutes: 25,
      servings: 4,
      category: 'dessert',
      rating: 4.9,
      isFavorite: false,
      isFeatured: true,
      isPopular: true,
      dateAdded: '2023-10-18',
      ingredients: ['chocolate', 'butter', 'eggs', 'sugar', 'flour']
    },
    {
      id: 4,
      title: 'Vegetable Stir Fry',
      image: '/images/recipes/stir-fry.jpg',
      readyInMinutes: 20,
      servings: 2,
      category: 'main course',
      rating: 4.3,
      isFavorite: false,
      isFeatured: false,
      isPopular: true,
      dateAdded: '2023-10-22',
      ingredients: ['mixed vegetables', 'tofu', 'soy sauce', 'ginger', 'garlic']
    },
    {
      id: 5,
      title: 'Creamy Mushroom Risotto',
      image: '/images/recipes/risotto.jpg',
      readyInMinutes: 45,
      servings: 3,
      category: 'main course',
      rating: 4.6,
      isFavorite: false,
      isFeatured: true,
      isPopular: false,
      dateAdded: '2023-10-21',
      ingredients: ['arborio rice', 'mushrooms', 'white wine', 'parmesan', 'vegetable stock']
    },
    {
      id: 6,
      title: 'Berry Smoothie Bowl',
      image: '/images/recipes/smoothie-bowl.jpg',
      readyInMinutes: 10,
      servings: 1,
      category: 'breakfast',
      rating: 4.8,
      isFavorite: true,
      isFeatured: true,
      isPopular: false,
      dateAdded: '2023-10-23',
      ingredients: ['mixed berries', 'banana', 'yogurt', 'granola', 'honey']
    }
  ];

  const [featuredRecipes, setFeaturedRecipes] = useState(allRecipes.filter(recipe => recipe.isFeatured));
  const [popularRecipes, setPopularRecipes] = useState(allRecipes.filter(recipe => recipe.isPopular));
  const [recentRecipes, setRecentRecipes] = useState([...allRecipes].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 4));
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Categories for display
  const categories = [
    { id: 'main course', name: 'Main Course', icon: <ChefHat className="w-6 h-6 text-green-600 dark:text-green-400" /> },
    { id: 'dessert', name: 'Desserts', icon: <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" /> },
    { id: 'salad', name: 'Salads', icon: <Plus className="w-6 h-6 text-green-600 dark:text-green-400 rotate-45" /> },
    { id: 'breakfast', name: 'Breakfast', icon: <Utensils className="w-6 h-6 text-green-600 dark:text-green-400" /> },
  ];

  // Toggle favorite status
  const toggleFavorite = (recipeId) => {
    const updateRecipeState = (recipes) => 
      recipes.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, isFavorite: !recipe.isFavorite } 
          : recipe
      );
      
    setFeaturedRecipes(updateRecipeState);
    setPopularRecipes(updateRecipeState);
    setRecentRecipes(updateRecipeState);
  };
  
  // Require authentication for certain actions
  const requireAuth = (feature) => {
    if (!session) {
      const confirmLogin = confirm(`Please sign in to ${feature}. Do you want to log in now?`);
      if (confirmLogin) {
        window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      }
      return false;
    }
    return true;
  };
  
  // Recipe Card Component
  const RecipeCard = ({ recipe, onToggleFavorite }) => (
    <div className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 z-10"></div>
        <img
          src={recipe.image || '/placeholder-recipe.jpg'}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.onerror = null;
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 300;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#f3f4f6';
            ctx.fillRect(0, 0, 400, 300);
            ctx.fillStyle = '#6b7280';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Recipe Image', 200, 150);
            e.target.src = canvas.toDataURL();
          }}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (requireAuth('save recipes to favorites')) {
              onToggleFavorite(recipe.id);
            }
          }}
          className={`absolute top-3 right-3 p-2 rounded-full z-20 ${
            recipe.isFavorite 
              ? 'bg-red-100 text-red-500 hover:bg-red-200' 
              : 'bg-white/90 text-gray-700 hover:bg-red-50 hover:text-red-500'
          } transition-colors shadow-md`}
          aria-label={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart 
            className={`w-5 h-5 ${recipe.isFavorite ? 'fill-current' : ''}`} 
          />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <span className="inline-block px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
            {recipe.category}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
            {recipe.title}
          </h3>
          <div className="flex items-center text-amber-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-sm font-medium text-gray-600 dark:text-gray-300">
              {recipe.rating}
            </span>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {recipe.readyInMinutes} min
          </div>
          <div className="flex items-center">
            <UsersIcon className="w-4 h-4 mr-1" />
            {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Link
            href={`/recipes/${recipe.id}`}
            onClick={(e) => {
              if (!requireAuth('view detailed recipes')) {
                e.preventDefault();
              }
            }}
            className="relative inline-flex items-center overflow-hidden font-medium transition-all rounded-lg group px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:text-white"
          >
            <span className="relative z-10 flex items-center">
              View Recipe
              <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-0 transition-all duration-500 ease-out transform rounded-full bg-green-600 group-hover:w-32 group-hover:h-32 group-hover:-ml-2 group-hover:translate-x-full group-hover:translate-y-full"></span>
          </Link>
        </div>
      </div>
    </div>
  );
  
  // No Results Component
  const NoResults = ({ onClearFilters }) => (
    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30">
        <Search className="h-6 w-6 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">No recipes found</h3>
      <p className="mt-1 text-gray-600 dark:text-gray-400">Try adjusting your search or filter to find what you're looking for.</p>
      <div className="mt-6">
        <button
          onClick={onClearFilters}
          className="relative inline-flex items-center justify-center overflow-hidden font-medium transition-all rounded-lg group px-6 py-2.5 text-sm text-white bg-green-600 hover:text-white"
        >
          <span className="relative z-10">Clear all filters</span>
          <span className="absolute bottom-0 left-0 w-0 h-0 transition-all duration-500 ease-out transform rounded-full bg-green-700 group-hover:w-40 group-hover:h-40 group-hover:-ml-2 group-hover:translate-x-full group-hover:translate-y-full"></span>
        </button>
      </div>
    </div>
  );

  // Filter recipes based on search query
  const filterRecipes = (recipes) => {
    if (!searchQuery) return recipes;
    
    const searchLower = searchQuery.toLowerCase();
    return recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchLower) ||
      recipe.ingredients.some(ing => ing.toLowerCase().includes(searchLower))
    );
  };

  const filteredFeaturedRecipes = filterRecipes(featuredRecipes);
  const filteredPopularRecipes = filterRecipes(popularRecipes);
  const filteredRecentRecipes = filterRecipes(recentRecipes);

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-green-600 dark:text-green-400 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 pt-0 m-0">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-700 via-green-600 to-green-800 text-white pt-20 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-green-800/20 to-green-600/20"></div>
        </div>
        <div className="absolute -bottom-1 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-4">
              <Sparkles className="w-5 h-5 mr-2 text-yellow-300" />
              <span className="text-sm font-medium">Discover your next favorite meal</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight max-w-4xl mx-auto">
              Discover & Share{' '}
              <span className="relative">
                <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-200">
                  Amazing Recipes
                </span>
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-green-100/90 leading-relaxed">
              Find the perfect recipe for any occasion. Cook like a pro with our easy-to-follow recipes and cooking guides.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/recipes"
                className="relative inline-flex items-center justify-center overflow-hidden font-medium transition-all rounded-xl group px-8 py-4 text-lg text-green-700 bg-white hover:text-white"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Utensils className="w-5 h-5" />
                  Explore Recipes
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0 transition-all duration-500 ease-out transform rounded-full bg-green-600 group-hover:w-64 group-hover:h-64 group-hover:-ml-2 group-hover:translate-x-full group-hover:translate-y-full"></span>
              </Link>
              <Link
                href="/community"
                className="relative inline-flex items-center justify-center overflow-hidden font-medium transition-all rounded-xl group px-8 py-4 text-lg text-white border-2 border-white/30 hover:border-transparent"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Join Community
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0 transition-all duration-500 ease-out transform rounded-full bg-white/10 group-hover:w-64 group-hover:h-64 group-hover:-ml-2 group-hover:translate-x-full group-hover:translate-y-full"></span>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">500+</div>
                <div className="text-green-100/80">Recipes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">50+</div>
                <div className="text-green-100/80">Chefs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">10K+</div>
                <div className="text-green-100/80">Community Members</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Search for recipes, ingredients, or categories..."
                />
              </div>
            </div>
          </div>

          {/* Featured Recipes Section */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Recipes</h2>
              <Link href="/recipes" className="relative inline-flex items-center justify-center overflow-hidden font-medium transition-all rounded-lg group text-green-600 dark:text-green-400 text-sm">
                <span className="relative z-10 flex items-center">
                  View all recipes
                  <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 ease-out bg-green-600 dark:bg-green-400 group-hover:w-full"></span>
              </Link>
            </div>
            
            {filteredFeaturedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredFeaturedRecipes.slice(0, 4).map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            ) : (
              <NoResults onClearFilters={() => setSearchQuery('')} />
            )}
          </div>

          {/* Categories Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Browse by Category</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Explore our diverse collection of recipes organized by category
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link 
                  key={category.id}
                  href={`/recipes?category=${category.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="bg-green-50 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
                    {category.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {allRecipes.filter(r => r.category === category.id).length} recipes
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Recipes Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Popular Recipes</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover what others are cooking right now
            </p>
          </div>
          
          {filteredPopularRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPopularRecipes.slice(0, 4).map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          ) : (
            <NoResults onClearFilters={() => setSearchQuery('')} />
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Why Choose SavoryFlavors?
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300 sm:mt-4">
              We make cooking enjoyable and accessible for everyone
            </p>
          </div>
          
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <ChefHat className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Expert Recipes</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Handpicked recipes from professional chefs and home cooks around the world.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Community Driven</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Join a community of food lovers, share your recipes, and get feedback.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Endless Inspiration</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Find new recipes based on your preferences, dietary needs, and ingredients you have.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link
              href="/about"
              className="relative inline-flex items-center justify-center overflow-hidden font-medium transition-all rounded-xl group px-8 py-4 text-lg text-green-700 border-2 border-green-600 hover:text-white"
            >
              <span className="relative z-10 flex items-center gap-2">
                Learn more about us
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0 transition-all duration-500 ease-out transform rounded-full bg-green-600 group-hover:w-full group-hover:h-full"></span>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Recipes Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recently Added</h2>
            <Link href="/recipes" className="relative inline-flex items-center justify-center overflow-hidden font-medium transition-all rounded-lg group text-green-600 dark:text-green-400 text-sm">
              <span className="relative z-10 flex items-center">
                View all recipes
                <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 ease-out bg-green-600 dark:bg-green-400 group-hover:w-full"></span>
            </Link>
          </div>
          
          {filteredRecentRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRecentRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          ) : (
            <NoResults onClearFilters={() => setSearchQuery('')} />
          )}
        </div>
      </section>
    </main>
  );
}
