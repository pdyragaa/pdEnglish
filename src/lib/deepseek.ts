import type { DeepSeekResponse, SentenceVariation, TokenStats } from '../types';

export interface WordInfo {
  definition: string;
  examples: Array<{ english: string; polish: string }>;
}

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || 'sk-bb4172be4c4c4dfba576cfe7f5485cad';
const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';

// DeepSeek pricing (as of 2024)
const DEEPSEEK_PRICING = {
  input: 0.00014, // $0.00014 per 1K tokens
  output: 0.00028, // $0.00028 per 1K tokens
};

// Function to estimate tokens (rough approximation)
function estimateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English
  return Math.ceil(text.length / 4);
}

// Function to calculate cost from DeepSeek response
export function calculateTokenStats(response: DeepSeekResponse): TokenStats {
  const usage = response.usage;
  if (!usage) {
    // Fallback estimation if usage is not provided
    const prompt = response.choices[0]?.message?.content || '';
    const estimatedTokens = estimateTokens(prompt);
    const cost = (estimatedTokens / 1000) * DEEPSEEK_PRICING.output;

    return {
      inputTokens: 0,
      outputTokens: estimatedTokens,
      totalTokens: estimatedTokens,
      cost,
    };
  }

  const inputCost = (usage.prompt_tokens / 1000) * DEEPSEEK_PRICING.input;
  const outputCost = (usage.completion_tokens / 1000) * DEEPSEEK_PRICING.output;
  const totalCost = inputCost + outputCost;

  return {
    inputTokens: usage.prompt_tokens,
    outputTokens: usage.completion_tokens,
    totalTokens: usage.total_tokens,
    cost: totalCost,
  };
}

export async function generateSentenceVariations(word: string, polish: string): Promise<{ variations: SentenceVariation[]; tokenStats: TokenStats }> {
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

    // Calculate token stats
    const tokenStats = calculateTokenStats(data);

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

    const filteredSentences = sentences.filter(sentence =>
      sentence.english &&
      sentence.polish &&
      typeof sentence.english === 'string' &&
      typeof sentence.polish === 'string'
    );

    return { variations: filteredSentences, tokenStats };

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

export async function generateTranslationAlternatives(originalText: string, mainTranslation: string, sourceLang: 'pl' | 'en', targetLang: 'pl' | 'en'): Promise<string[]> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key is not configured');
  }

  const sourceLangName = sourceLang === 'pl' ? 'Polish' : 'English';
  const targetLangName = targetLang === 'pl' ? 'Polish' : 'English';

  const prompt = `Generate 3-5 alternative translations of "${originalText}" from ${sourceLangName} to ${targetLangName}.
Main translation: "${mainTranslation}"

Requirements:
- Provide alternative ways to translate this text
- Include variations in style (formal/informal), context, or nuance
- All alternatives should be valid translations
- Keep them concise (short phrases or single words)
- Return ONLY a valid JSON array of strings: ["alternative1", "alternative2", "alternative3"]

Example:
Original: "hello"
Main translation: "cześć"
Alternatives: ["witaj", "hej", "dzień dobry"]

Original: "${originalText}"
Main translation: "${mainTranslation}"
${targetLangName} alternatives:`;

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
        max_tokens: 500
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

    // Extract JSON array from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      // Fallback: try to extract alternatives from text
      const lines = content.split('\n').filter(line => line.trim());
      const alternatives = lines
        .map(line => line.replace(/^[-•\d.\s]+/, '').trim())
        .filter(line => line.length > 0 && line !== mainTranslation)
        .slice(0, 5);

      return alternatives.length > 0 ? alternatives : [];
    }

    const alternatives: string[] = JSON.parse(jsonMatch[0]);

    // Validate and filter
    const validAlternatives = alternatives
      .filter((alt): alt is string =>
        typeof alt === 'string' &&
        alt.trim().length > 0 &&
        alt.toLowerCase() !== mainTranslation.toLowerCase()
      )
      .map(alt => alt.trim())
      .slice(0, 5); // Limit to 5 alternatives

    return validAlternatives;

  } catch (error) {
    console.error('DeepSeek API error:', error);
    // Return empty array on error - don't break the translation flow
    return [];
  }
}

export async function generateWordInfo(word: string, polishTranslation: string): Promise<WordInfo> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key is not configured');
  }

  const prompt = `You are an expert English teacher. Create a flashcard content for the word "${word}" (Polish: "${polishTranslation}").
  
Return ONLY a valid JSON object with this exact format:
{
  "definition": "A clear, simple English definition suitable for learners.",
  "examples": [
    {"english": "Example sentence 1 using the word.", "polish": "Polish translation of sentence 1."},
    {"english": "Example sentence 2 using the word in a different context.", "polish": "Polish translation of sentence 2."}
  ]
}

Requirements:
- Definition MUST be in English (not Polish) to encourage immersion.
- Examples should be natural, modern, and practical.
- If the word has multiple common meanings, try to capture the most relevant one or both in examples.
- Ensure the Polish translations are accurate and natural, not machine-translated literal nonsense.

Word: "${word}"
Polish: "${polishTranslation}"`;

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

export interface QuizOptionsResult {
  correct: string;
  distractors: string[];
}

export async function generateQuizOptions(word: string, polishTranslation: string): Promise<QuizOptionsResult> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key is not configured');
  }

  const prompt = `Generate 3 "smart distractors" for a multiple-choice quiz for the word "${word}" (Polish: "${polishTranslation}").
  
  The correct answer is "${word}".
  The distractors should be:
  1. English words.
  2. Same part of speech as "${word}".
  3. Semantically related but CLEARLY different meaning (e.g. if word is "Apple", distractors could be "Pear", "Orange", "Grape").
  4. NOT synonyms that could be considered correct translations.
  5. Common enough to be known by a learner.
  
  Return ONLY a valid JSON object with this exact format:
  {
    "correct": "${word}",
    "distractors": ["distractor1", "distractor2", "distractor3"]
  }`;

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
        max_tokens: 500
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

    const result: QuizOptionsResult = JSON.parse(jsonMatch[0]);

    // Validate
    if (!result.distractors || !Array.isArray(result.distractors) || result.distractors.length !== 3) {
      // Fallback if AI fails to generate exactly 3
      console.warn('AI did not generate exactly 3 distractors, using raw result:', result);
    }

    return result;

  } catch (error) {
    console.error('DeepSeek API error:', error);
    throw new Error(`Failed to generate quiz options: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

