import { useState, useEffect } from 'react';
import { Edit2, Trash2, Sparkles, Filter } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { db } from '../lib/supabase';
import { generateSentenceVariations } from '../lib/deepseek';
import type { Vocabulary, Category } from '../types';

export function VocabularyList() {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ polish: '', english: '', category_id: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vocabData, categoriesData] = await Promise.all([
        db.vocabulary.getAll(),
        db.categories.getAll()
      ]);
      setVocabulary(vocabData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVocabulary = vocabulary.filter(item => {
    const matchesCategory = !selectedCategory || item.category_id === selectedCategory;
    const matchesSearch = !searchTerm || 
      item.polish.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.english.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vocabulary item?')) return;
    
    try {
      await db.vocabulary.delete(id);
      setVocabulary(vocab => vocab.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete vocabulary:', error);
    }
  };

  const handleEdit = (item: Vocabulary) => {
    setEditingId(item.id);
    setEditForm({
      polish: item.polish,
      english: item.english,
      category_id: item.category_id || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const updated = await db.vocabulary.update(editingId, {
        polish: editForm.polish,
        english: editForm.english,
        category_id: editForm.category_id || null
      });
      
      setVocabulary(vocab => 
        vocab.map(item => item.id === editingId ? updated : item)
      );
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update vocabulary:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ polish: '', english: '', category_id: '' });
  };

  const handleGenerateSentences = async (vocab: Vocabulary) => {
    setIsGenerating(vocab.id);
    try {
      const variations = await generateSentenceVariations(vocab.english, vocab.polish);
      
      const sentences = variations.map(variation => ({
        vocabulary_id: vocab.id,
        sentence_english: variation.english,
        sentence_polish: variation.polish
      }));

      await db.sentences.createMany(sentences);
      alert(`Generated ${variations.length} sentence variations for "${vocab.english}"`);
    } catch (error) {
      console.error('Failed to generate sentences:', error);
      alert('Failed to generate sentences. Please try again.');
    } finally {
      setIsGenerating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading vocabulary...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vocabulary List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search vocabulary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vocabulary Items */}
          <div className="space-y-3">
            {filteredVocabulary.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || selectedCategory 
                  ? 'No vocabulary items match your filters.' 
                  : 'No vocabulary items yet. Use the Translator to add some!'
                }
              </div>
            ) : (
              filteredVocabulary.map(item => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                  {editingId === item.id ? (
                    // Edit Form
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Polish
                          </label>
                          <Input
                            value={editForm.polish}
                            onChange={(e) => setEditForm(prev => ({ ...prev, polish: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            English
                          </label>
                          <Input
                            value={editForm.english}
                            onChange={(e) => setEditForm(prev => ({ ...prev, english: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={editForm.category_id}
                          onChange={(e) => setEditForm(prev => ({ ...prev, category_id: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">No Category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleSaveEdit} size="sm">
                          Save
                        </Button>
                        <Button onClick={handleCancelEdit} variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm font-medium text-gray-500">Polish</div>
                              <div className="text-lg">{item.polish}</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-500">English</div>
                              <div className="text-lg">{item.english}</div>
                            </div>
                          </div>
                          {item.category && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {item.category.name}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleGenerateSentences(item)}
                            disabled={isGenerating === item.id}
                            variant="outline"
                            size="sm"
                          >
                            {isGenerating === item.id ? (
                              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-1" />
                                Generate
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleEdit(item)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(item.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
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
