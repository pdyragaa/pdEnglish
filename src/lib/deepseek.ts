import type { DeepSeekResponse, SentenceVariation } from '../types';

export interface WordInfo {
  definition: string;
  examples: Array<{ english: string; polish: string }>;
}

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || 'sk-bb4172be4c4c4dfba576cfe7f5485cad';
const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function generateSentenceVariations(word: string, polish: string): Promise<SentenceVariation[]> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key is not configured');
  }

  const prompt = `Generate 8 diverse English sentences using the word "${word}" with translation to Polish. 
Vary the contexts: formal, informal, questions, statements, past/present/future tense.
The word "${word}" should appear in each English sentence.
Return ONLY a valid JSON array with this exact format:
[{"english": "English sentence here", "polish": "Polish translation here"}]

Examples:
[{"english": "I love to read books every evening.", "polish": "Uwielbiam czytać książki każdego wieczoru."}]

Word: "${word}"
Polish: "${polish}"`;

  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API failed: ${response.status} ${response.statusText}`);
    }

    const data: DeepSeekResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from DeepSeek API');
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const sentences: SentenceVariation[] = JSON.parse(jsonMatch[0]);
    
    // Validate the response format
    if (!Array.isArray(sentences)) {
      throw new Error('Response is not an array');
    }

    return sentences.filter(sentence => 
      sentence.english && 
      sentence.polish && 
      typeof sentence.english === 'string' && 
      typeof sentence.polish === 'string'
    );

  } catch (error) {
    console.error('DeepSeek API error:', error);
    throw new Error(`Failed to generate sentences: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateMoreVariations(word: string, _polish: string, count: number = 5): Promise<SentenceVariation[]> {
  const prompt = `Generate ${count} more diverse English sentences using the word "${word}" with Polish translations.
Make them different from common usage patterns. Include idioms, phrasal verbs, or creative contexts.
Return ONLY a valid JSON array:
[{"english": "English sentence here", "polish": "Polish translation here"}]`;

  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API failed: ${response.status} ${response.statusText}`);
    }

    const data: DeepSeekResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from DeepSeek API');
    }

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const sentences: SentenceVariation[] = JSON.parse(jsonMatch[0]);
    
    return sentences.filter(sentence => 
      sentence.english && 
      sentence.polish && 
      typeof sentence.english === 'string' && 
      typeof sentence.polish === 'string'
    );

  } catch (error) {
    console.error('DeepSeek API error:', error);
    throw new Error(`Failed to generate additional sentences: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateWordInfo(word: string, polishTranslation: string): Promise<WordInfo> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key is not configured');
  }

  const prompt = `Provide a Polish definition and 2 example sentences for the English word "${word}" (translated as "${polishTranslation}").

Return ONLY a valid JSON object with this exact format:
{
  "definition": "Polish definition here",
  "examples": [
    {"english": "English sentence 1", "polish": "Polish translation 1"},
    {"english": "English sentence 2", "polish": "Polish translation 2"}
  ]
}

Requirements:
- Definition should be clear and concise in Polish
- Examples should be practical and show different uses of the word
- Make examples diverse (different contexts, tenses, etc.)
- Keep sentences natural and commonly used

Word: "${word}"
Polish translation: "${polishTranslation}"`;

  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API failed: ${response.status} ${response.statusText}`);
    }

    const data: DeepSeekResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from DeepSeek API');
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const wordInfo: WordInfo = JSON.parse(jsonMatch[0]);
    
    // Validate the response format
    if (!wordInfo.definition || !wordInfo.examples || !Array.isArray(wordInfo.examples)) {
      throw new Error('Invalid response format from DeepSeek API');
    }

    return wordInfo;

  } catch (error) {
    console.error('DeepSeek API error:', error);
    throw new Error(`Failed to generate word info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
