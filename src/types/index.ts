export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Vocabulary {
  id: string;
  polish: string;
  english: string;
  category_id: string | null;
  priority?: number;
  created_at: string;
  category?: Category;
  definition?: string;
  example_sentence?: string;
  example_sentence_polish?: string;
}

export interface Sentence {
  id: string;
  vocabulary_id: string;
  sentence_english: string;
  sentence_polish: string;
  created_at: string;
}

export interface TranslationRequest {
  text: string;
  source: 'pl' | 'en';
  target: 'pl' | 'en';
}

export interface TranslationResponse {
  responseData: {
    translatedText: string;
    match: number;
  };
  responseStatus: number;
  responseDetails?: string;
}

export interface TranslationResult {
  main: string;
  alternatives: string[];
}

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface SentenceVariation {
  english: string;
  polish: string;
}

export type Language = 'pl' | 'en';

export interface Review {
  id: string;
  vocabulary_id: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string | null;
  last_reviewed: string | null;
  fsrs_state?: Record<string, unknown>;
}

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface ReviewSession {
  cards: Array<Flashcard>;
  currentIndex: number;
  isFlipped: boolean;
  sessionStats: {
    total: number;
    completed: number;
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
}

export interface ReviewStats {
  new: number;
  learning: number;
  review: number;
  total: number;
  nextReviewTime: string | null;
}

export interface QuizOptions {
  id: string;
  vocabulary_id: string;
  correct_answer: string;
  distractor_1: string;
  distractor_2: string;
  distractor_3: string;
  created_at: string;
}

export interface Flashcard {
  vocabulary: Vocabulary;
  review?: Review;
  options?: string[]; // For Hybrid Quiz mode
}

export interface QuizOptionsResponse {
  correct: string;
  distractors: string[];
}

export interface TokenUsage {
  totalTokens: number;
  totalCost: number;
  requests: number;
  lastUpdated: string;
}

export interface TokenStats {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
}

export type MasteryLevel = 'new' | 'learning' | 'difficult' | 'known';

export type SessionSize = 10 | 20 | 50 | 100 | 'all';
