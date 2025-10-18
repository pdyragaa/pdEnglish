import type { TranslationResponse } from '../types';

export async function translateText(text: string, source: 'pl' | 'en', target: 'pl' | 'en'): Promise<string> {
  if (!text.trim()) {
    throw new Error('Text cannot be empty');
  }

  if (source === target) {
    return text;
  }

  try {
    const encodedText = encodeURIComponent(text);
    const langPair = `${source}|${target}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${langPair}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.status} ${response.statusText}`);
    }

    const data: TranslationResponse = await response.json();
    
    if (data.responseStatus !== 200) {
      throw new Error(`Translation error: ${data.responseDetails || 'Unknown error'}`);
    }

    return data.responseData.translatedText;
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
