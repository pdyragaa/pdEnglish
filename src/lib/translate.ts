import type { TranslationResponse } from '../types';

const LIBRETRANSLATE_URL = import.meta.env.VITE_LIBRETRANSLATE_URL || 'https://libretranslate.com';

export async function translateText(text: string, source: 'pl' | 'en', target: 'pl' | 'en'): Promise<string> {
  if (!text.trim()) {
    throw new Error('Text cannot be empty');
  }

  if (source === target) {
    return text;
  }

  try {
    const response = await fetch(`${LIBRETRANSLATE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: source,
        target: target,
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.status} ${response.statusText}`);
    }

    const data: TranslationResponse = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function translatePolishToEnglish(text: string): Promise<string> {
  return translateText(text, 'pl', 'en');
}

export async function translateEnglishToPolish(text: string): Promise<string> {
  return translateText(text, 'en', 'pl');
}
