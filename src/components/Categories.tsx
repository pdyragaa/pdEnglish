import { useState, useEffect, useMemo } from 'react';
import {
  Folder,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  CheckCircle2,
  X
} from 'lucide-react';
import { db } from '../lib/supabase';
import { useTokenTracker } from '../hooks/useTokenTracker';
import type { Category } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { cn } from '../lib/utils';

interface EditingState {
  id: string;
  name: string;
  color: string;
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Token tracking
  const { tokenUsage, formatTokens } = useTokenTracker();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const cats = await db.categories.getAll();
        setCategories(cats);
      } catch (error) {
        console.error(error);
        setFeedback({ type: 'error', message: 'Failed to load categories.' });
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const colorPalette = useMemo(
    () => ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4', '#10b981', '#eab308'],
    []
  );

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const created = await db.categories.create(newName.trim());
      setCategories((prev) => [created, ...prev]);
      setNewName('');
      setFeedback({ type: 'success', message: 'Category created.' });
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Failed to create category.' });
    }
  };

  const openEdit = (category: Category) => {
    setEditing({ id: category.id, name: category.name, color: colorPalette[0] });
  };

  const handleSave = async () => {
    if (!editing?.name.trim()) return;
    try {
      const updated = await db.categories.update(editing.id, editing.name.trim());
      setCategories((prev) => prev.map((item) => (item.id === editing.id ? updated : item)));
      setEditing(null);
      setFeedback({ type: 'success', message: 'Category updated.' });
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Failed to update category.' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await db.categories.delete(id);
      setCategories((prev) => prev.filter((item) => item.id !== id));
      setConfirmDelete(null);
      setFeedback({ type: 'success', message: 'Category removed.' });
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Failed to delete category.' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Category Library</h1>
          <p className="text-muted-foreground">Organize your vocabulary into thematic collections.</p>
        </div>

        {/* Token Usage Widget (Minimalist) */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">API Usage:</p>
            <p className="text-sm font-mono font-medium text-primary">
              {formatTokens(tokenUsage.totalTokens)} tokens
            </p>
          </div>
        </div>
      </div>

      {/* Quick Add Section */}
      <Card className="p-1 bg-card/50 backdrop-blur-sm border-white/5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Folder className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              placeholder="Create a new category..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="pl-10 border-0 bg-transparent focus-visible:ring-0 h-12"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={!newName.trim()}
            className="h-12 px-6 rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </Card>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-card/50 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
          <Folder className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No categories yet</h3>
          <p className="text-muted-foreground mt-1">Create your first category to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group relative p-5 rounded-xl bg-card border border-white/5 hover:border-primary/20 hover:bg-card/80 transition-all duration-300"
            >
              {/* Drag Handle (Visual Only for now) */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground">
                <GripVertical className="h-4 w-4" />
              </div>

              <div className="pl-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Folder className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{category.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(category.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(category)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setConfirmDelete(category.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Visual Mastery Progress (Mocked for now as per plan) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Mastery</span>
                    <span className="font-medium text-primary">0%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[0%] rounded-full" />
                  </div>
                </div>

                {/* Quick Add Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-8 border-white/5 hover:bg-white/5 hover:text-primary"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Add word to {category.name}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit Category"
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Category Name</label>
            <Input
              value={editing?.name ?? ''}
              onChange={(e) => setEditing(prev => prev ? { ...prev, name: e.target.value } : null)}
              placeholder="Enter category name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Accent Color</label>
            <div className="flex flex-wrap gap-2">
              {colorPalette.map((color) => (
                <button
                  key={color}
                  onClick={() => setEditing(prev => prev ? { ...prev, color } : null)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    editing?.color === color ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110" : "hover:scale-105"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Delete Category"
      >
        <div className="space-y-4 pt-2">
          <p className="text-muted-foreground">
            Are you sure you want to delete this category? The vocabulary words will remain but will be uncategorized.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => confirmDelete && handleDelete(confirmDelete)}>
              Delete Category
            </Button>
          </div>
        </div>
      </Modal>

      {/* Feedback Toast */}
      {feedback && (
        <div className={cn(
          "fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-bottom duration-300 flex items-center gap-3 z-50",
          feedback.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
        )}>
          {feedback.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <X className="h-5 w-5" />}
          <p className="text-sm font-medium">{feedback.message}</p>
          <button onClick={() => setFeedback(null)} className="ml-2 hover:opacity-70">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
