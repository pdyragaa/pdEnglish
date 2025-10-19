
const DEEPL_API_KEY = import.meta.env.VITE_DEEPL_API_KEY;
const DEEPL_URL = 'https://api-free.deepl.com/v2/translate';

export interface DeepLResponse {
  translations: Array<{
    detected_source_language: string;
    text: string;
  }>;
}

export async function translateWithDeepL(text: string, sourceLang: 'PL' | 'EN', targetLang: 'PL' | 'EN'): Promise<string> {
  if (!DEEPL_API_KEY) {
    throw new Error('DeepL API key is not configured');
  }

  if (!text.trim()) {
    throw new Error('Text cannot be empty');
  }

  if (sourceLang === targetLang) {
    return text;
  }

  try {
    const params = new URLSearchParams();
    params.append('auth_key', DEEPL_API_KEY);
    params.append('text', text);
    params.append('source_lang', sourceLang);
    params.append('target_lang', targetLang);

    const response = await fetch(DEEPL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepL API failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: DeepLResponse = await response.json();
    
    if (!data.translations || data.translations.length === 0) {
      throw new Error('No translation received from DeepL API');
    }

    return data.translations[0].text;
  } catch (error) {
    console.error('DeepL translation error:', error);
    throw new Error(`DeepL translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function translatePolishToEnglish(text: string): Promise<string> {
  return translateWithDeepL(text, 'PL', 'EN');
}

export async function translateEnglishToPolish(text: string): Promise<string> {
  return translateWithDeepL(text, 'EN', 'PL');
}
