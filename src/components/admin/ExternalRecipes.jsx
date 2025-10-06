'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Search, Loader2, Plus, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function ExternalRecipes({ onImport }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importingId, setImportingId] = useState(null);

  const searchRecipes = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/recipes/external?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data.data || []);
    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (recipe) => {
    try {
      setImportingId(recipe.idMeal);
      
      // Get full recipe details
      const response = await fetch(`/api/admin/recipes/external?id=${recipe.idMeal}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipe details');
      }
      
      const { data } = await response.json();
      if (!data) {
        throw new Error('No recipe data received');
      }
      
      const transformedRecipe = transformMealToRecipe(data);
      
      // Call the API to import the recipe
      const importResponse = await fetch('/api/admin/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedRecipe),
      });
      
      if (!importResponse.ok) {
        const errorData = await importResponse.json();
        throw new Error(errorData.error || 'Failed to import recipe');
      }
      
      const result = await importResponse.json();
      
      // Show success message
      toast.success('Recipe imported successfully!', {
        description: `${transformedRecipe.title} has been added to the database.`
      });
      
      // Notify parent component
      if (onImport) {
        onImport(result);
      }
      
      return result;
    } catch (error) {
      console.error('Error importing recipe:', error);
      toast.error('Import failed', {
        description: error.message || 'An error occurred while importing the recipe.'
      });
      throw error;
    } finally {
      setImportingId(null);
    }
  };

  // Transform TheMealDB format to our recipe format
  const transformMealToRecipe = (meal) => {
    if (!meal) return null;
    
    // Extract ingredients and measurements
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== '') {
        // Clean up the ingredient name and measurement
        const cleanIngredient = ingredient.trim();
        let cleanMeasure = (measure || '').trim();
        
        // If measure is empty but we have an ingredient, set a default
        if (!cleanMeasure && cleanIngredient) {
          cleanMeasure = 'to taste';
        }
        
        ingredients.push({
          name: cleanIngredient,
          amount: cleanMeasure,
          unit: '',
          notes: ''
        });
      }
    }

    // Format instructions - handle both \r\n and \n line breaks
    const instructionsText = meal.strInstructions || '';
    const instructions = instructionsText
      .split(/\r\n|\n/)
      .map(step => step.trim())
      .filter(step => step !== '')
      .map((step, index) => ({
        step: index + 1,
        instruction: step
      }));
    
    // Get tags from strTags or use category as a tag
    let tags = [];
    if (meal.strTags) {
      tags = meal.strTags.split(',').map(tag => tag.trim());
    } else if (meal.strCategory) {
      tags = [meal.strCategory];
    }
    
    // Estimate prep and cook times (very rough estimate)
    const prepTime = meal.strArea?.toLowerCase().includes('quick') ? '15' : '30';
    const cookTime = meal.strCategory?.toLowerCase().includes('dessert') ? '45' : '60';
    
    return {
      title: meal.strMeal || 'Untitled Recipe',
      description: `Imported from TheMealDB: ${meal.strMeal || ''}`,
      prepTime,
      cookTime,
      servings: 4, // Default serving size
      difficulty: 'medium',
      category: meal.strCategory || 'Main Course',
      cuisine: meal.strArea || 'International',
      ingredients,
      instructions,
      imageUrl: meal.strMealThumb || '',
      tags,
      isExternal: true,
      externalSource: 'TheMealDB',
      externalId: meal.idMeal,
      externalUrl: meal.strSource || `https://www.themealdb.com/meal.php?c=${meal.idMeal}`,
      isPublic: true,
      isApproved: true
    };
  };

  return (
    <div className="space-y-4">
      <form onSubmit={searchRecipes} className="flex gap-2">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for recipes..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !query.trim()}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="ml-2">Search</span>
        </Button>
      </form>

      {isLoading && !results.length ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Searching for recipes...</span>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((recipe) => (
            <Card key={recipe.idMeal} className="flex flex-col h-full overflow-hidden">
              {recipe.strMealThumb && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={recipe.strMealThumb}
                    alt={recipe.strMeal}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-recipe.jpg';
                    }}
                  />
                </div>
              )}
              <div className="flex flex-col flex-grow">
                <CardHeader>
                  <CardTitle className="text-lg">{recipe.strMeal}</CardTitle>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {recipe.strCategory && (
                      <span className="px-2 py-1 bg-secondary rounded-full">
                        {recipe.strCategory}
                      </span>
                    )}
                    {recipe.strArea && (
                      <span className="px-2 py-1 bg-secondary rounded-full">
                        {recipe.strArea}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardFooter className="mt-auto p-4 pt-0">
                  <div className="flex flex-col w-full gap-2">
                    <Button
                      onClick={() => handleImport(recipe)}
                      disabled={isLoading && importingId === recipe.idMeal}
                      className="w-full"
                    >
                      {isLoading && importingId === recipe.idMeal ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Import Recipe
                        </>
                      )}
                    </Button>
                    {recipe.strSource && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(recipe.strSource, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Original
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-8 text-muted-foreground">
          No recipes found for "{query}"
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <div className="mb-4 text-4xl">🍳</div>
          <h3 className="text-lg font-medium mb-1">Search for recipes to import</h3>
          <p className="text-sm">Try searching for a dish, cuisine, or ingredient</p>
        </div>
      )}
    </div>
  );
}
