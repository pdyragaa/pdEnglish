import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Loader2, Languages, Sparkles } from 'lucide-react';
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
    <motion.div 
      className="max-w-6xl mx-auto space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <motion.div 
        className="text-center space-y-6 py-12 px-6 rounded-3xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Smart Translator
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Translate Polish to English and vice versa with AI-powered accuracy. Every translation is automatically saved to your vocabulary.
        </p>
      </motion.div>

      <Card className="shadow-xl border-2 border-primary/10">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl text-center">Translation Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Language Toggle */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-foreground text-center">
              Translation Direction
            </label>
            <div className="flex items-center justify-center space-x-6">
              <div className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200 ${
                selectedLanguage === 'pl' 
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}>
                🇵🇱 PL → EN
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={toggleLanguage}
                disabled={isTranslating}
                className="rounded-full w-12 h-12 hover:scale-110 transition-transform duration-200"
              >
                <ArrowRightLeft className="h-5 w-5" />
              </Button>
              <div className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200 ${
                selectedLanguage === 'en' 
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}>
                🇬🇧 EN → PL
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-foreground">
              {selectedLanguage === 'en' ? 'English Text' : 'Polish Text'}
            </label>
            <div className="relative">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={selectedLanguage === 'en' ? 'Enter English text (e.g., "hello")...' : 'Wpisz polski tekst (np. "cześć")...'}
                disabled={isTranslating}
                onKeyDown={(e) => e.key === 'Enter' && handleTranslate()}
                className="text-lg py-4 px-6 rounded-xl border-2 focus:border-primary transition-colors duration-200"
              />
              {inputText && (
                <button
                  onClick={() => setInputText('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Translate Button */}
          <Button
            onClick={handleTranslate}
            disabled={!inputText.trim() || isTranslating}
            size="lg"
            className="w-full py-4 text-lg font-semibold rounded-xl hover:scale-105 transition-transform duration-200"
          >
            {isTranslating ? (
              <>
                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Languages className="h-5 w-5 mr-3" />
                Translate Now
              </>
            )}
          </Button>

          {/* Translation Result */}
          {translatedText && (
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-foreground">
                {selectedLanguage === 'en' ? 'Polish Translation' : 'English Translation'}
              </label>
              <div className="p-6 bg-primary/5 border-2 border-primary/20 rounded-xl">
                <p className="text-2xl font-semibold text-foreground text-center">{translatedText}</p>
              </div>
            </div>
          )}

          {/* Save Message */}
          {saveMessage && (
            <div className={`p-4 rounded-xl text-center font-medium ${
              saveMessage.includes('Saved') 
                ? 'bg-green-100 text-green-800 border-2 border-green-200' 
                : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-200'
            }`}>
              <div className="flex items-center justify-center space-x-2">
                {saveMessage.includes('Saved') ? '✅' : '⚠️'}
                <span>{saveMessage}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
