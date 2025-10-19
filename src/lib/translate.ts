import { translatePolishToEnglish as deeplTranslatePolishToEnglish, translateEnglishToPolish as deeplTranslateEnglishToPolish } from './deepl';

export async function translateText(text: string, source: 'pl' | 'en', target: 'pl' | 'en'): Promise<string> {
  if (!text.trim()) {
    throw new Error('Text cannot be empty');
  }

  if (source === target) {
    return text;
  }

  try {
    if (source === 'pl' && target === 'en') {
      return await deeplTranslatePolishToEnglish(text);
    } else if (source === 'en' && target === 'pl') {
      return await deeplTranslateEnglishToPolish(text);
    } else {
      throw new Error(`Unsupported language pair: ${source} to ${target}`);
    }
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
