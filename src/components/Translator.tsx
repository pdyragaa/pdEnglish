import React, { useState } from 'react';
import { ArrowRightLeft, Save, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { translatePolishToEnglish, translateEnglishToPolish } from '../lib/translate';
import { db } from '../lib/supabase';
import { useVocabularyStore } from '../store/useVocabularyStore';
// import type { Language } from '../types';

export function Translator() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  const { selectedLanguage, setSelectedLanguage, setError } = useVocabularyStore();
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await db.categories.getAll();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    setError(null);

    try {
      const result = selectedLanguage === 'en' 
        ? await translateEnglishToPolish(inputText)
        : await translatePolishToEnglish(inputText);
      
      setTranslatedText(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    if (!inputText.trim() || !translatedText.trim() || !selectedCategoryId) return;

    setIsSaving(true);
    setError(null);

    try {
      const vocabulary = {
        polish: selectedLanguage === 'en' ? translatedText : inputText,
        english: selectedLanguage === 'en' ? inputText : translatedText,
        category_id: selectedCategoryId
      };

      await db.vocabulary.create(vocabulary);
      
      // Clear the form
      setInputText('');
      setTranslatedText('');
      setSelectedCategoryId(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save vocabulary');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLanguage = () => {
    setSelectedLanguage(selectedLanguage === 'en' ? 'pl' : 'en');
    // Swap the texts when switching languages
    const temp = inputText;
    setInputText(translatedText);
    setTranslatedText(temp);
  };

  const canSave = inputText.trim() && translatedText.trim() && selectedCategoryId;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Translator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <div className={`px-4 py-2 rounded-md ${selectedLanguage === 'pl' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
              Polish
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              disabled={isTranslating}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
            <div className={`px-4 py-2 rounded-md ${selectedLanguage === 'en' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
              English
            </div>
          </div>

          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedLanguage === 'en' ? 'English' : 'Polish'} Text
            </label>
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Enter ${selectedLanguage === 'en' ? 'English' : 'Polish'} text...`}
              disabled={isTranslating}
              onKeyDown={(e) => e.key === 'Enter' && handleTranslate()}
            />
          </div>

          {/* Translate Button */}
          <Button
            onClick={handleTranslate}
            disabled={!inputText.trim() || isTranslating}
            className="w-full"
          >
            {isTranslating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              'Translate'
            )}
          </Button>

          {/* Translation Result */}
          {translatedText && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectedLanguage === 'en' ? 'Polish' : 'English'} Translation
              </label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <p className="text-gray-900">{translatedText}</p>
              </div>
            </div>
          )}

          {/* Category Selection */}
          {translatedText && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Save to Category
              </label>
              <select
                value={selectedCategoryId || ''}
                onChange={(e) => setSelectedCategoryId(e.target.value || null)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Save Button */}
          {canSave && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              variant="secondary"
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save to Vocabulary
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
