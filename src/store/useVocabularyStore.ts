import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, Flashcard, SessionSize } from '../types';

interface SessionStats {
  total: number;
  completed: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
  streak: number;
  maxStreak: number;
  correct?: number; // Keeping for backward compatibility if needed, or remove
  wrong?: number;   // Keeping for backward compatibility if needed, or remove
}

interface ReviewSessionState {
  cards: Flashcard[];
  currentIndex: number;
  isFlipped: boolean;
  sessionStats: SessionStats;
  currentReviewStats: any; // Simplify or properly type if needed
  selectedCategory: string;
  sessionSize: SessionSize;
  timestamp: string;
  quizCards?: any[]; // Deprecated
  selectedOption?: any; // Deprecated
  showFeedback?: boolean; // Deprecated
  isCorrect?: boolean; // Deprecated
}

interface VocabularyState {
  // UI state
  selectedLanguage: Language;
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;

  // Review session state
  reviewSession: ReviewSessionState | null;

  // Actions
  setSelectedLanguage: (language: Language) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Review session actions
  setReviewSession: (session: ReviewSessionState) => void;
  updateReviewSession: (updates: Partial<ReviewSessionState>) => void;
  clearReviewSession: () => void;
}

export const useVocabularyStore = create<VocabularyState>()(
  persist(
    (set) => ({
      // Initial state
      selectedLanguage: 'pl',
      selectedCategory: null,
      isLoading: false,
      error: null,
      reviewSession: null,

      // Basic setters
      setSelectedLanguage: (language) => set({ selectedLanguage: language }),
      setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Review session actions
      setReviewSession: (session) => set({ reviewSession: session as any }), // Temporary cast to avoid strict type checking during migration
      updateReviewSession: (updates) =>
        set((state) => ({
          reviewSession: state.reviewSession
            ? { ...state.reviewSession, ...updates }
            : null,
        })),
      clearReviewSession: () => {
        localStorage.removeItem('reviewSession');
        set({ reviewSession: null });
      },
    }),
    {
      name: 'vocabulary-storage',
      partialize: (state) => ({
        reviewSession: state.reviewSession,
        selectedLanguage: state.selectedLanguage,
        selectedCategory: state.selectedCategory,
      }),
    }
  )
);
