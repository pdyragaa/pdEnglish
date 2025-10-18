import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderOpen } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { db } from '../lib/supabase';
import type { Category } from '../types';

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [isCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const cats = await db.categories.getAll();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const category = await db.categories.create(newCategoryName.trim());
      setCategories(prev => [category, ...prev]);
      setNewCategoryName('');
    } catch (error) {
      console.error('Failed to create category:', error);
      alert('Failed to create category. Please try again.');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;

    try {
      const updated = await db.categories.update(editingId, editName.trim());
      setCategories(prev => 
        prev.map(cat => cat.id === editingId ? updated : cat)
      );
      setEditingId(null);
      setEditName('');
    } catch (error) {
      console.error('Failed to update category:', error);
      alert('Failed to update category. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will not delete vocabulary items, but they will no longer be categorized.')) return;

    try {
      await db.categories.delete(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Create New Category */}
          <div className="flex space-x-2">
            <Input
              placeholder="Category name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button onClick={handleCreate} disabled={!newCategoryName.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No categories yet. Create your first one above!
              </div>
            ) : (
              categories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                  {editingId === category.id ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                        className="flex-1"
                      />
                      <Button onClick={handleSaveEdit} size="sm">
                        Save
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3">
                        <FolderOpen className="h-5 w-5 text-gray-400" />
                        <span className="text-lg font-medium">{category.name}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEdit(category)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(category.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
