import React, { useState } from 'react';
import { ArrowRightLeft, Loader2 } from 'lucide-react';
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
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  
  const { selectedLanguage, setSelectedLanguage, setError } = useVocabularyStore();

  React.useEffect(() => {
    ensureDefaultCategory();
  }, []);

  const ensureDefaultCategory = async () => {
    try {
      // Check if "General" category exists
      const categories = await db.categories.getAll();
      let generalCategory = categories.find(cat => cat.name === 'General');
      
      // If not, create it
      if (!generalCategory) {
        generalCategory = await db.categories.create('General');
      }
      
      setDefaultCategoryId(generalCategory.id);
    } catch (error) {
      console.error('Failed to ensure default category:', error);
      setError('Failed to setup default category');
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    setError(null);
    setSaveMessage(null);

    try {
      const result = selectedLanguage === 'en' 
        ? await translateEnglishToPolish(inputText)
        : await translatePolishToEnglish(inputText);
      
      setTranslatedText(result);
      
      // Auto-save to vocabulary
      await autoSaveToVocabulary(inputText, result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const autoSaveToVocabulary = async (originalText: string, translatedText: string) => {
    if (!defaultCategoryId) return;

    try {
      // Check if vocabulary already exists
      const existingVocabulary = await db.vocabulary.getAll();
      const alreadyExists = existingVocabulary.some(vocab => 
        (vocab.polish === originalText && vocab.english === translatedText) ||
        (vocab.polish === translatedText && vocab.english === originalText)
      );

      if (alreadyExists) {
        setSaveMessage('Word already exists in vocabulary');
        return;
      }

      // Save to vocabulary
      const vocabulary = {
        polish: selectedLanguage === 'en' ? translatedText : originalText,
        english: selectedLanguage === 'en' ? originalText : translatedText,
        category_id: defaultCategoryId
      };

      await db.vocabulary.create(vocabulary);
      setSaveMessage('Saved to vocabulary automatically!');
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Failed to auto-save vocabulary:', error);
      setSaveMessage('Failed to save to vocabulary');
    }
  };


  const toggleLanguage = () => {
    setSelectedLanguage(selectedLanguage === 'en' ? 'pl' : 'en');
    // Swap the texts when switching languages
    const temp = inputText;
    setInputText(translatedText);
    setTranslatedText(temp);
  };


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

          {/* Save Message */}
          {saveMessage && (
            <div className={`p-3 rounded-md text-sm ${
              saveMessage.includes('Saved') 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
            }`}>
              {saveMessage}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
