'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Plus,
  ChefHat,
  Loader2,
  ArrowRight,
  Utensils,
  Sparkles,
  Users,
  Clock
} from 'lucide-react';

export default function HomeContent() {
  const { status } = useSession();

  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [featuredError, setFeaturedError] = useState(null);

  const categories = [
    {
      id: 'main course',
      name: 'Main Course',
      description: 'Hearty entrees for family dinners and gatherings.',
      icon: <ChefHat className="w-6 h-6 text-green-600 dark:text-green-400" />
    },
    {
      id: 'dessert',
      name: 'Desserts',
      description: 'Sweet treats for every celebration and craving.',
      icon: <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
    },
    {
      id: 'salad',
      name: 'Salads',
      description: 'Fresh and vibrant bowls packed with nutrients.',
      icon: <Plus className="w-6 h-6 text-green-600 dark:text-green-400 rotate-45" />
    },
    {
      id: 'breakfast',
      name: 'Breakfast',
      description: 'Morning favorites to kick-start your day.',
      icon: <Utensils className="w-6 h-6 text-green-600 dark:text-green-400" />
    }
  ];

  useEffect(() => {
    let isMounted = true;

    const normalizeCommunityRecipe = (recipe) => ({
      id: `community-${recipe.id}`,
      title: recipe.title || 'Untitled Recipe',
      image: recipe.image || '/placeholder-recipe.jpg',
      readyInMinutes: recipe.readyInMinutes ?? null,
      servings: recipe.servings ?? null,
      sourceLabel: 'Community',
      description: recipe.previewText || recipe.description || '',
      href: `/recipes/${encodeURIComponent(recipe.slug || recipe.id)}?source=community`
    });

    const normalizeMealdbRecipe = (recipe) => {
      const originalId = recipe.originalId || recipe.id;
      return {
        id: `mealdb-${originalId}`,
        title: recipe.title || recipe.strMeal || 'Featured Recipe',
        image: recipe.image || recipe.strMealThumb || '/placeholder-recipe.jpg',
        readyInMinutes: recipe.readyInMinutes ?? null,
        servings: recipe.servings ?? null,
        sourceLabel: 'MealDB',
        description: recipe.description || recipe.category || '',
        href: originalId ? `/recipes/${encodeURIComponent(originalId)}?source=mealdb` : '/recipes'
      };
    };

    const buildFeaturedList = (community, mealdb, max = 4) => {
      const combined = [];
      let communityIndex = 0;
      let mealdbIndex = 0;

      while (combined.length < max && (communityIndex < community.length || mealdbIndex < mealdb.length)) {
        if (communityIndex < community.length) {
          combined.push(community[communityIndex]);
          communityIndex += 1;
        }
        if (combined.length >= max) break;
        if (mealdbIndex < mealdb.length) {
          combined.push(mealdb[mealdbIndex]);
          mealdbIndex += 1;
        }
      }

      while (combined.length < max && communityIndex < community.length) {
        combined.push(community[communityIndex]);
        communityIndex += 1;
      }

      while (combined.length < max && mealdbIndex < mealdb.length) {
        combined.push(mealdb[mealdbIndex]);
        mealdbIndex += 1;
      }

      return combined;
    };

    const fetchFeaturedRecipes = async () => {
      setFeaturedError(null);

      try {
        const communityPromise = fetch('/api/recipes?limit=6&page=1');
        const mealdbPromise = fetch('/api/external/recipes?source=mealdb&number=6');

        const [communityResponse, mealdbResponse] = await Promise.all([communityPromise, mealdbPromise]);

        let communityRecipes = [];
        if (communityResponse.ok) {
          const communityData = await communityResponse.json();
          communityRecipes = Array.isArray(communityData?.recipes)
            ? communityData.recipes.map(normalizeCommunityRecipe)
            : [];
        } else {
          console.warn('Community recipes request failed:', communityResponse.status, communityResponse.statusText);
        }

        let mealdbRecipes = [];
        if (mealdbResponse.ok) {
          const mealdbData = await mealdbResponse.json();
          const rawMealdbRecipes = Array.isArray(mealdbData?.recipes) ? mealdbData.recipes : [];
          mealdbRecipes = rawMealdbRecipes.map(normalizeMealdbRecipe);
        } else {
          console.warn('MealDB recipes request failed:', mealdbResponse.status, mealdbResponse.statusText);
        }

        if (!communityResponse.ok && !mealdbResponse.ok) {
          throw new Error('Unable to load featured recipes. Please try again later.');
        }

        const combinedFeatured = buildFeaturedList(communityRecipes, mealdbRecipes);

        if (isMounted) {
          setFeaturedRecipes(combinedFeatured);
        }

        if (isMounted && combinedFeatured.length === 0) {
          setFeaturedError('No featured recipes are available right now.');
        }
      } catch (error) {
        console.error('Error loading featured recipes:', error);
        if (isMounted) {
          setFeaturedRecipes([]);
          setFeaturedError(error.message || 'Failed to load featured recipes.');
        }
      }
    };

    fetchFeaturedRecipes();

    return () => {
      isMounted = false;
    };
  }, []);

  const FeaturedRecipeCard = ({ recipe }) => (
    <Link
      href={recipe.href}
      className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-48">
        <img
          src={recipe.image || '/placeholder-recipe.jpg'}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(event) => {
            event.target.onerror = null;
            event.target.src = '/placeholder-recipe.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800">
          {recipe.sourceLabel}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {recipe.description}
          </p>
        )}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-4 mb-4">
          {recipe.readyInMinutes ? (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {recipe.readyInMinutes} min
            </span>
          ) : null}
          {recipe.servings ? (
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
            </span>
          ) : null}
        </div>
        <span className="inline-flex items-center text-sm font-medium text-green-600 dark:text-green-400">
          View recipe
          <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );

  if (status === 'loading') {
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

      {/* Featured Recipes Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Recipes</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                Handpicked dishes from the SavoryFlavors community and TheMealDB to jump-start your next meal idea.
              </p>
            </div>
            <Link
              href="/recipes"
              className="inline-flex items-center font-medium text-green-600 dark:text-green-400 hover:text-green-700"
            >
              Browse all recipes
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          {featuredError ? (
            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-amber-800 dark:text-amber-200">
              {featuredError}
            </div>
          ) : featuredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredRecipes.map((recipe) => (
                <FeaturedRecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center text-gray-600 dark:text-gray-300">
              Check back soon for featured recipes.
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Browse by Category</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore curated collections tailored to every craving and occasion.
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{category.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
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

    </main>
  );
}
