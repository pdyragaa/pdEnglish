import type { TranslationResult } from '../types';
import { generateTranslationAlternatives } from './deepseek';

export async function translateText(text: string, source: 'pl' | 'en', target: 'pl' | 'en'): Promise<TranslationResult> {
  if (!text.trim()) {
    throw new Error('Text cannot be empty');
  }

  if (source === target) {
    return {
      main: text,
      alternatives: []
    };
  }

  try {
    const sourceLang = source === 'pl' ? 'PL' : 'EN';
    const targetLang = target === 'pl' ? 'PL' : 'EN';

    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLang,
        targetLang,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const mainTranslation = data.translatedText || data.main;

    // Generate alternatives asynchronously (don't block the main translation)
    let alternatives: string[] = [];
    try {
      alternatives = await generateTranslationAlternatives(text, mainTranslation, source, target);
    } catch (altError) {
      console.warn('Failed to generate translation alternatives:', altError);
      // Continue without alternatives - don't break the translation flow
    }

    return {
      main: mainTranslation,
      alternatives
    };

  } catch (error) {
    console.error('Translation error:', error);
    throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function translatePolishToEnglish(text: string): Promise<TranslationResult> {
  return translateText(text, 'pl', 'en');
}

export async function translateEnglishToPolish(text: string): Promise<TranslationResult> {
  return translateText(text, 'en', 'pl');
}