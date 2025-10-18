import { create } from 'zustand';
import type { Vocabulary, Review, ReviewSession, Language } from '../types';

interface VocabularyState {
  // Current session state
  currentSession: ReviewSession[];
  currentIndex: number;
  isBack: boolean;
  
  // UI state
  selectedLanguage: Language;
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSelectedLanguage: (language: Language) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Review session actions
  startReviewSession: (vocabulary: Vocabulary[], reviews: Review[]) => void;
  nextCard: () => void;
  previousCard: () => void;
  flipCard: () => void;
  rateCard: (quality: number) => void;
  endSession: () => void;
  
  // Current card helpers
  getCurrentCard: () => ReviewSession | null;
  isLastCard: () => boolean;
  isFirstCard: () => boolean;
  getSessionProgress: () => { current: number; total: number };
}

export const useVocabularyStore = create<VocabularyState>((set, get) => ({
  // Initial state
  currentSession: [],
  currentIndex: 0,
  isBack: false,
  selectedLanguage: 'pl',
  selectedCategory: null,
  isLoading: false,
  error: null,

  // Basic setters
  setSelectedLanguage: (language) => set({ selectedLanguage: language }),
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Review session actions
  startReviewSession: (vocabulary, reviews) => {
    const session: ReviewSession[] = vocabulary.map(vocab => {
      const review = reviews.find(r => r.vocabulary_id === vocab.id);
      return {
        vocabulary: vocab,
        review: review || null,
        isBack: false,
        quality: undefined
      };
    });

    // Shuffle the session
    const shuffled = session.sort(() => Math.random() - 0.5);
    
    set({
      currentSession: shuffled,
      currentIndex: 0,
      isBack: false,
      error: null
    });
  },

  nextCard: () => {
    const state = get();
    if (state.currentIndex < state.currentSession.length - 1) {
      set({ 
        currentIndex: state.currentIndex + 1,
        isBack: false
      });
    }
  },

  previousCard: () => {
    const state = get();
    if (state.currentIndex > 0) {
      set({ 
        currentIndex: state.currentIndex - 1,
        isBack: false
      });
    }
  },

  flipCard: () => {
    const state = get();
    if (state.currentSession[state.currentIndex]) {
      const updatedSession = [...state.currentSession];
      updatedSession[state.currentIndex] = {
        ...updatedSession[state.currentIndex],
        isBack: !updatedSession[state.currentIndex].isBack
      };
      set({ currentSession: updatedSession });
    }
  },

  rateCard: (quality) => {
    const state = get();
    const currentCard = state.currentSession[state.currentIndex];
    
    if (currentCard) {
      const updatedSession = [...state.currentSession];
      updatedSession[state.currentIndex] = {
        ...currentCard,
        quality
      };
      
      set({ currentSession: updatedSession });
      
      // Auto-advance to next card
      setTimeout(() => {
        const newState = get();
        if (newState.currentIndex < newState.currentSession.length - 1) {
          newState.nextCard();
        }
      }, 500);
    }
  },

  endSession: () => {
    set({
      currentSession: [],
      currentIndex: 0,
      isBack: false,
      error: null
    });
  },

  // Helper functions
  getCurrentCard: () => {
    const state = get();
    return state.currentSession[state.currentIndex] || null;
  },

  isLastCard: () => {
    const state = get();
    return state.currentIndex >= state.currentSession.length - 1;
  },

  isFirstCard: () => {
    const state = get();
    return state.currentIndex === 0;
  },

  getSessionProgress: () => {
    const state = get();
    return {
      current: state.currentIndex + 1,
      total: state.currentSession.length
    };
  }
}));
