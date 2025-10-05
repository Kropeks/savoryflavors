'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Utensils, Clock, Check, X, AlertCircle, Eye, Plus, Download } from 'lucide-react';
import { getRecipes, updateRecipeStatus } from '@/lib/actions/admin.actions';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ExternalRecipes from '@/components/admin/ExternalRecipes';

export default function RecipesPage() {
  const [recipesData, setRecipesData] = useState({
    recipes: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importStatus, setImportStatus] = useState({ type: '', message: '' });

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRecipes({ page, limit, search, status: statusFilter });
      setRecipesData(data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  const handleImportSuccess = async (result) => {
    try {
      setIsImportDialogOpen(false);
      setImportStatus({
        type: 'success',
        message: `Successfully imported recipe "${result.recipe?.title || 'Unknown'}"`
      });
      
      await fetchRecipes();
      
      // Clear the success message after 5 seconds
      setTimeout(() => {
        setImportStatus({ type: '', message: '' });
      }, 5000);
    } catch (error) {
      console.error('Error handling import success:', error);
      setImportStatus({
        type: 'error',
        message: 'Failed to refresh recipes after import.'
      });
    }
  };

  useEffect(() => {
    // Add debounce for search
    const debounceTimer = setTimeout(() => {
      fetchRecipes();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [fetchRecipes]);

  const handleStatusChange = async (recipeDatabaseId, status) => {
    try {
      await updateRecipeStatus(recipeDatabaseId, status);
      setRecipesData(prev => ({
        ...prev,
        recipes: prev.recipes.map(recipe => 
          recipe.databaseId === recipeDatabaseId ? { ...recipe, status } : recipe
        )
      }));
      // Refresh the recipes list
      await fetchRecipes();
    } catch (error) {
      console.error('Error updating recipe status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Recipe Management</h1>
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Import from External
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Import Recipe from External Source</DialogTitle>
            </DialogHeader>
            <ExternalRecipes onImport={handleImportSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {importStatus.message && (
        <div className={`p-4 rounded-md ${importStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {importStatus.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search recipes..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All Recipes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recipe</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Cuisine</TableHead>
              <TableHead>Dietary Info</TableHead>
              <TableHead>Allergens</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading recipes...
                </TableCell>
              </TableRow>
            ) : recipesData.recipes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No recipes found
                </TableCell>
              </TableRow>
            ) : (
              recipesData.recipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {recipe.image ? (
                        <div 
                          className="h-12 w-12 rounded-md bg-cover bg-center"
                          style={{ backgroundImage: `url(${recipe.image})` }}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center">
                          <Utensils className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div>{recipe.title}</div>
                        <div className="text-sm text-gray-500">{recipe.prepTime} min • {recipe.servings} servings</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{recipe.author.name}</div>
                    <div className="text-xs text-gray-500">@{recipe.author.username}</div>
                  </TableCell>
                  <TableCell className="font-medium">{recipe.cuisine || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {recipe.dietaryInfo?.map((diet, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {diet}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {recipe.allergens?.map((allergen, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      recipe.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : recipe.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {recipe.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(recipe.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link
                          href={`/recipes/${encodeURIComponent(recipe.slug || recipe.id)}?source=community`}
                          target="_blank"
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Link>
                      </Button>
                      {recipe.status !== 'approved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(recipe.databaseId, 'approved')}
                          className="text-green-600 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      )}
                      {recipe.status !== 'rejected' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(recipe.databaseId, 'rejected')}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {recipesData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(page * limit, recipesData.pagination.total)}
            </span>{' '}
            of <span className="font-medium">{recipesData.pagination.total}</span> recipes
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, recipesData.pagination.totalPages) }, (_, i) => {
                // Show first page, last page, and pages around current page
                let pageNum;
                if (recipesData.pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= recipesData.pagination.totalPages - 2) {
                  pageNum = recipesData.pagination.totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    disabled={loading}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {recipesData.pagination.totalPages > 5 && (
                <span className="px-2 py-1 text-sm text-gray-500">...</span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(recipesData.pagination.totalPages, p + 1))}
              disabled={page === recipesData.pagination.totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
