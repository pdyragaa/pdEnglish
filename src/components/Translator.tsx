import { useEffect, useState, useRef } from 'react';
import {
  ArrowRightLeft,
  Check,
  AlertCircle,
  BookOpen,
  MessageSquare,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { translatePolishToEnglish, translateEnglishToPolish } from '../lib/translate';
import { generateWordInfo, type WordInfo } from '../lib/deepseek';
import { db } from '../lib/supabase';
import { useVocabularyStore } from '../store/useVocabularyStore';
import type { Category, TranslationResult } from '../types';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { cn } from '../lib/utils';

export function Translator() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | null>(null);
  const [wordInfo, setWordInfo] = useState<WordInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [_categories, setCategories] = useState<Category[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { selectedLanguage, setSelectedLanguage, setError, error } = useVocabularyStore();

  // Auto-focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const ensureDefaultCategory = async () => {
      try {
        const loadedCategories = await db.categories.getAll();
        setCategories(loadedCategories);

        let generalCategory = loadedCategories.find((cat) => cat.name === 'General');
        if (!generalCategory) {
          generalCategory = await db.categories.create('General');
          setCategories((prev: Category[]) => [generalCategory!, ...prev]);
        }
        setDefaultCategoryId(generalCategory.id);
      } catch (err) {
        console.error('Failed to ensure default category', err);
        setError('Failed to prepare default category');
      }
    };

    void ensureDefaultCategory();
  }, [setError]);

  // Instant Context: Auto-fetch word info when translation completes
  useEffect(() => {
    if (translatedText && inputText.trim().split(/\s+/).length <= 4) {
      handleShowMoreInfo();
    }
  }, [translatedText]);

  const handleDirectionChange = (lang: 'pl' | 'en') => {
    if (lang === selectedLanguage) return;
    setSelectedLanguage(lang);
    setInputText(translatedText?.main || '');
    setTranslatedText(null);
    setError(null);
    setWordInfo(null);
    setIsSaved(false);
    inputRef.current?.focus();
  };

  const handleShowMoreInfo = async () => {
    if (!inputText.trim() || !translatedText?.main) return;

    const wordCount = inputText.trim().split(/\s+/).length;
    if (wordCount > 4) return;

    setIsLoadingInfo(true);
    setWordInfo(null);

    try {
      const word = selectedLanguage === 'en' ? inputText.trim() : translatedText.main;
      const polishTranslation = selectedLanguage === 'en' ? translatedText.main : inputText.trim();

      const info = await generateWordInfo(word, polishTranslation);
      setWordInfo(info);
    } catch (err) {
      console.error("Failed to load word info", err);
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    setError(null);
    setWordInfo(null);
    setIsSaved(false);

    try {
      const result =
        selectedLanguage === 'en'
          ? await translateEnglishToPolish(inputText)
          : await translatePolishToEnglish(inputText);

      setTranslatedText(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Translation failed');
      }
    } finally {
      setIsTranslating(false);
    }
  };

  // Smart Save: Quick save to default category
  const handleSmartSave = async () => {
    if (!translatedText || !defaultCategoryId) return;

    try {
      const existingVocabulary = await db.vocabulary.getAll();
      const alreadyExists = existingVocabulary.some(
        (vocab) =>
          (vocab.polish === inputText && vocab.english === translatedText.main) ||
          (vocab.polish === translatedText.main && vocab.english === inputText)
      );

      if (alreadyExists) {
        setError('Word already exists in vocabulary');
        return;
      }

      const vocabulary = {
        polish: selectedLanguage === 'en' ? translatedText.main : inputText,
        english: selectedLanguage === 'en' ? inputText : translatedText.main,
        category_id: defaultCategoryId,
        priority: 2, // Default priority
      };

      await db.vocabulary.create(vocabulary);
      setIsSaved(true);
    } catch (err) {
      console.error('Failed to auto-save vocabulary:', err);
      setError('Failed to save to vocabulary');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleTranslate();
    }
    if (e.key === 'Escape') {
      setInputText('');
      setTranslatedText(null);
      setWordInfo(null);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Language Toggle (Minimalist) */}
      <div className="flex justify-center">
        <div className="flex gap-2 p-1 bg-white/5 rounded-full border border-white/10">
          <button
            onClick={() => handleDirectionChange('pl')}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
              selectedLanguage === 'pl'
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="text-xs opacity-70">Input:</span> Polski
          </button>
          <button
            onClick={() => handleDirectionChange('en')}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
              selectedLanguage === 'en'
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="text-xs opacity-70">Input:</span> English
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="relative group">
        <textarea
          ref={inputRef}
          placeholder={selectedLanguage === 'pl' ? 'Wpisz polskie zdanie…' : 'Enter English sentence…'}
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[160px] bg-transparent text-3xl md:text-4xl font-medium placeholder:text-muted-foreground/30 border-b border-white/10 focus:border-primary focus:outline-none resize-none py-8 transition-colors leading-tight"
        />
        <div className="absolute bottom-4 right-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          Cmd + Enter to translate
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleTranslate}
          disabled={!inputText.trim() || isTranslating}
          className="flex-1 h-14 text-lg rounded-xl shadow-lg shadow-primary/10"
        >
          {isTranslating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Translating...
            </>
          ) : (
            <>
              Translate <ArrowRightLeft className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Translation Result */}
      {translatedText && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-transparent rounded-full" />
            <div className="pl-6 space-y-2">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                Translation
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                {translatedText.main}
              </h2>

              {translatedText.alternatives.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-2">
                  {translatedText.alternatives.map((alt, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground text-sm hover:bg-white/10 transition-colors cursor-default"
                    >
                      {alt}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Smart Save Button */}
            <div className="absolute top-0 right-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSmartSave}
                disabled={isSaved}
                className={cn(
                  "h-10 px-4 transition-all duration-300",
                  isSaved ? "text-emerald-500 bg-emerald-500/10" : "text-muted-foreground hover:text-primary"
                )}
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 mr-2" /> Saved
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Quick Save
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* AI Insights (Instant Context) */}
          {(isLoadingInfo || wordInfo) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
              {isLoadingInfo ? (
                <>
                  <div className="h-32 rounded-2xl bg-card/50 animate-pulse" />
                  <div className="h-32 rounded-2xl bg-card/50 animate-pulse" />
                </>
              ) : wordInfo ? (
                <>
                  <Card className="bg-card/30 border-white/5 hover:bg-card/50 transition-colors">
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center gap-2 text-primary mb-1">
                        <BookOpen className="w-4 h-4" />
                        <h3 className="font-semibold text-sm uppercase tracking-wider">Definition</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {wordInfo.definition}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/30 border-white/5 hover:bg-card/50 transition-colors">
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center gap-2 text-primary mb-1">
                        <MessageSquare className="w-4 h-4" />
                        <h3 className="font-semibold text-sm uppercase tracking-wider">Context</h3>
                      </div>
                      <div className="space-y-3">
                        {wordInfo.examples.slice(0, 2).map((example, index) => (
                          <div key={index} className="space-y-1">
                            <p className="font-medium text-foreground">{example.english}</p>
                            <p className="text-xs text-muted-foreground">{example.polish}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-6 right-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 z-50 backdrop-blur-md">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
          <button onClick={() => setError(null)} className="ml-2 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
