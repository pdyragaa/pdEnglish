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
  created_at: string;
  category?: Category;
}

export interface Sentence {
  id: string;
  vocabulary_id: string;
  sentence_english: string;
  sentence_polish: string;
  created_at: string;
}

export interface Review {
  id: string;
  vocabulary_id: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string | null;
  last_reviewed: string | null;
  vocabulary?: Vocabulary;
}

export interface TranslationRequest {
  text: string;
  source: 'pl' | 'en';
  target: 'pl' | 'en';
}

export interface TranslationResponse {
  translatedText: string;
}

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface SentenceVariation {
  english: string;
  polish: string;
}

export interface ReviewSession {
  vocabulary: Vocabulary;
  review: Review | null;
  isBack: boolean;
  quality?: number;
}

export type Language = 'pl' | 'en';
export type QualityRating = 0 | 1 | 2 | 3 | 4 | 5;
