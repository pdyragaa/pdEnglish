export async function translateText(text: string, source: 'pl' | 'en', target: 'pl' | 'en'): Promise<string> {
  if (!text.trim()) {
    throw new Error('Text cannot be empty');
  }

  if (source === target) {
    return text;
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