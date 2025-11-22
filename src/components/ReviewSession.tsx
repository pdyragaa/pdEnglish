import { useState, useEffect, useCallback } from 'react';
import {
  School,
  AlertCircle,
  Flame,
  Repeat,
  Brain,
  Trophy,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { db } from '../lib/supabase';
import { generateWordInfo, generateQuizOptions } from '../lib/deepseek';
import { calculateNextReview } from '../lib/spaced-repetition';
import type { ReviewRating, Flashcard, Category, SessionSize } from '../types';
import { useVocabularyStore } from '../store/useVocabularyStore';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';

export function ReviewSession() {
  // Store hooks
  const { reviewSession, setReviewSession, clearReviewSession } = useVocabularyStore();

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generatingInfo, setGeneratingInfo] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [sessionStats, setSessionStats] = useState({
    total: 0,
    completed: 0,
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
    streak: 0,
    maxStreak: 0,
  });

  const [showCompletion, setShowCompletion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | 'all' | 'uncategorized'>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [sessionSize, setSessionSize] = useState<SessionSize>(() => {
    const saved = localStorage.getItem('reviewSessionSize');
    return (saved as SessionSize) || 'all';
  });

  // Helper function to save session state to store
  const saveSessionState = useCallback(() => {
    setReviewSession({
      cards: flashcards,
      currentIndex,
      isFlipped,
      sessionStats,
      selectedCategory,
      sessionSize,
      timestamp: new Date().toISOString(),
      currentReviewStats: null // Placeholder
    });
  }, [flashcards, currentIndex, isFlipped, sessionStats, selectedCategory, sessionSize, setReviewSession]);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await db.categories.getAll();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  const generateOptions = useCallback((correctWord: string, allVocab: any[]) => {
    if (allVocab.length < 4) return [correctWord]; // Not enough words for distractors

    const distractors = allVocab
      .filter(v => v.english.toLowerCase() !== correctWord.toLowerCase())
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(v => v.english);

    return [...distractors, correctWord].sort(() => 0.5 - Math.random());
  }, []);

  const generateAndSaveOptions = useCallback(async (vocab: any) => {
    try {
      // Don't generate if we already have options (double check)
      const existing = await db.quizOptions.getByVocabularyId(vocab.id);
      if (existing) return;

      console.log(`🧠 Generating smart distractors for: ${vocab.english}`);
      const result = await generateQuizOptions(vocab.english, vocab.polish);

      await db.quizOptions.create(vocab.id, {
        correct_answer: result.correct,
        distractor_1: result.distractors[0],
        distractor_2: result.distractors[1],
        distractor_3: result.distractors[2]
      });
      console.log(`✅ Saved smart distractors for: ${vocab.english}`);
    } catch (e) {
      console.error(`❌ Failed to generate options for ${vocab.english}:`, e);
    }
  }, []);

  const loadCards = useCallback(async (categoryFilter: string | 'all' | 'uncategorized' = selectedCategory) => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== ReviewSession: LOADING CARDS START ===');
      const limit = sessionSize === 'all' ? undefined : sessionSize;

      const dueCards = await db.reviews.getReviewsDue(categoryFilter, limit);

      // Fetch all vocabulary for distractors
      const allVocab = await db.vocabulary.getAll();

      // Always show available cards for learning, not just "due" cards
      let cardsToReview = dueCards;

      // If no cards due, get vocabulary for learning based on category filter
      if (dueCards.length === 0) {
        let filteredVocab;
        try {
          if (categoryFilter === 'uncategorized') {
            filteredVocab = await db.vocabulary.getUncategorized();
          } else if (categoryFilter === 'all') {
            filteredVocab = allVocab;
          } else {
            filteredVocab = await db.vocabulary.getByCategory(categoryFilter);
          }

        } catch (vocabError) {
          console.error('Error loading vocabulary:', vocabError);
          setError(`Failed to load vocabulary: ${vocabError instanceof Error ? vocabError.message : 'Unknown error'}`);
          setLoading(false);
          return;
        }

        if (filteredVocab.length === 0) {
          setFlashcards([]);
          setLoading(false);
          const categoryName = categoryFilter === 'all' ? 'all categories' :
            categoryFilter === 'uncategorized' ? 'uncategorized words' :
              'the selected category';
          setError(`No vocabulary available for ${categoryName}. Please add some words in the Vocabulary section first.`);
          return;
        }

        cardsToReview = filteredVocab; // Use vocabulary for learning
      } else {
        // If there are due cards, also add some additional cards for variety if needed
        // For now, just use due cards + fill up if limit not reached
        if (limit && dueCards.length < limit) {
          let filteredVocab;
          if (categoryFilter === 'uncategorized') {
            filteredVocab = await db.vocabulary.getUncategorized();
          } else if (categoryFilter === 'all') {
            filteredVocab = allVocab;
          } else {
            filteredVocab = await db.vocabulary.getByCategory(categoryFilter);
          }

          const additional = filteredVocab.filter(v => !dueCards.some(d => d.id === v.id))
            .slice(0, limit - dueCards.length);
          cardsToReview = [...dueCards, ...additional];
        }
      }

      // Fetch all quiz options to ensure we have them even for non-due cards
      const allQuizOptions = await db.quizOptions.getAll();
      const quizOptionsMap = new Map(allQuizOptions.map(q => [q.vocabulary_id, q]));

      // Map to Flashcard format and generate options
      const flashcardsData = cardsToReview.map(card => {
        // Check if we have smart distractors
        // Priority: 1. From getReviewsDue (attached to card), 2. From allQuizOptions map
        const smartOptions = (card as any).quizOptions || quizOptionsMap.get(card.id);

        let options: string[];

        if (smartOptions) {
          // Use smart distractors
          options = [
            smartOptions.correct_answer,
            smartOptions.distractor_1,
            smartOptions.distractor_2,
            smartOptions.distractor_3
          ].sort(() => 0.5 - Math.random());
        } else {
          // Fallback to random distractors
          options = generateOptions(card.english, allVocab);

          // Trigger background generation for next time
          generateAndSaveOptions(card);
        }

        return {
          vocabulary: card,
          review: card.review,
          options
        } as Flashcard;
      });

      setFlashcards(flashcardsData);
      setSessionStats(prev => ({ ...prev, total: flashcardsData.length }));
    } catch (err) {
      console.error('Error loading cards:', err);
      const errorMessage = `Failed to load review cards: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sessionSize, categories, generateOptions]);

  // Restore session state on mount if it exists
  useEffect(() => {
    if (reviewSession && reviewSession.cards && reviewSession.cards.length > 0) {
      setFlashcards(reviewSession.cards);
      setCurrentIndex(reviewSession.currentIndex);
      setIsFlipped(reviewSession.isFlipped);
      setSessionStats({
        ...reviewSession.sessionStats,
        streak: reviewSession.sessionStats.streak || 0,
        maxStreak: reviewSession.sessionStats.maxStreak || 0
      });
      setSelectedCategory(reviewSession.selectedCategory);
      setSessionSize(reviewSession.sessionSize as SessionSize);
      setLoading(false);
    } else {
      loadCards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear session when category or session size changes
  useEffect(() => {
    if (reviewSession && (reviewSession.selectedCategory !== selectedCategory || reviewSession.sessionSize !== sessionSize)) {
      clearReviewSession();
    }
  }, [selectedCategory, sessionSize, reviewSession, clearReviewSession]);

  // Save session state whenever it changes
  useEffect(() => {
    if (flashcards.length > 0 && !loading) {
      saveSessionState();
    }
  }, [flashcards, currentIndex, isFlipped, sessionStats, selectedCategory, sessionSize, loading, saveSessionState]);

  // Generate AI content if missing when card is flipped
  useEffect(() => {
    const currentCard = flashcards[currentIndex];
    if (isFlipped && currentCard && !currentCard.vocabulary.definition) {
      const generateContent = async () => {
        setGeneratingInfo(true);
        try {
          const info = await generateWordInfo(currentCard.vocabulary.english, currentCard.vocabulary.polish);

          // Update vocabulary in DB
          await db.vocabulary.update(currentCard.vocabulary.id, {
            definition: info.definition,
            example_sentence: info.examples[0]?.english,
            example_sentence_polish: info.examples[0]?.polish
          });

          // Update local state
          setFlashcards(prev => prev.map((card, idx) => {
            if (idx === currentIndex) {
              return {
                ...card,
                vocabulary: {
                  ...card.vocabulary,
                  definition: info.definition,
                  example_sentence: info.examples[0]?.english,
                  example_sentence_polish: info.examples[0]?.polish
                }
              };
            }
            return card;
          }));
        } catch (err) {
          console.error('Failed to generate word info:', err);
        } finally {
          setGeneratingInfo(false);
        }
      };
      generateContent();
    }
  }, [isFlipped, currentIndex, flashcards]);

  const handleOptionClick = (option: string) => {
    if (isFlipped) return;

    const currentCard = flashcards[currentIndex];
    const correct = option.toLowerCase() === currentCard.vocabulary.english.toLowerCase();

    setSelectedOption(option);
    setIsCorrect(correct);
    setIsFlipped(true);
  };

  const handleRating = useCallback(async (rating: ReviewRating) => {
    if (!flashcards[currentIndex]) return;

    try {
      const currentCard = flashcards[currentIndex];
      const currentReview = currentCard.review;

      const newState = calculateNextReview(rating, currentReview ? {
        ease_factor: currentReview.ease_factor,
        interval: currentReview.interval,
        repetitions: currentReview.repetitions,
      } : null, currentCard.vocabulary.priority || 2);

      if (currentReview) {
        await db.reviews.update(currentCard.vocabulary.id, {
          ease_factor: newState.ease_factor,
          interval: newState.interval,
          repetitions: newState.repetitions,
          next_review: newState.next_review,
        });
      } else {
        await db.reviews.create(currentCard.vocabulary.id);
        await db.reviews.update(currentCard.vocabulary.id, {
          ease_factor: newState.ease_factor,
          interval: newState.interval,
          repetitions: newState.repetitions,
          next_review: newState.next_review,
        });
      }

      setSessionStats(prev => ({
        ...prev,
        completed: prev.completed + 1,
        [rating]: prev[rating] + 1,
        streak: rating === 'again' ? 0 : prev.streak + 1,
        maxStreak: rating === 'again' ? prev.maxStreak : Math.max(prev.maxStreak, prev.streak + 1)
      }));

      if (currentIndex + 1 < flashcards.length) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setShowCompletion(true);
        setTimeout(() => {
          clearReviewSession();
        }, 0);
      }
    } catch (err) {
      console.error('Error updating review:', err);
      setError('Failed to save review. Please try again.');
    }
  }, [flashcards, currentIndex, clearReviewSession]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading || showCompletion) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isFlipped) {
          // In hybrid mode, space just flips without selecting an option (like "I don't know")
          setIsFlipped(true);
        }
      }

      if (isFlipped) {
        if (e.key === '1') handleRating('again');
        if (e.key === '2') handleRating('hard');
        if (e.key === '3') handleRating('good');
        if (e.key === '4') handleRating('easy');
      } else {
        // Option selection via 1-4
        const currentCard = flashcards[currentIndex];
        if (currentCard && currentCard.options) {
          if (e.key === '1') handleOptionClick(currentCard.options[0]);
          if (e.key === '2') handleOptionClick(currentCard.options[1]);
          if (e.key === '3') handleOptionClick(currentCard.options[2]);
          if (e.key === '4') handleOptionClick(currentCard.options[3]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, showCompletion, isFlipped, handleRating, flashcards, currentIndex]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">Loading flashcards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadCards()} className="border-red-500/30 hover:bg-red-500/10 text-red-500">
          Retry
        </Button>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center">
        <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center">
          <School className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">No vocabulary available for learning!</h3>
          <p className="text-muted-foreground">Please add some words in the Vocabulary section first.</p>
        </div>
        <Button onClick={() => loadCards()}>
          Refresh
        </Button>
      </div>
    );
  }

  if (showCompletion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8 animate-in zoom-in duration-300">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">Session Complete!</h2>
          <p className="text-muted-foreground">You've reviewed {sessionStats.total} cards.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <div className="bg-secondary/30 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-2">
              <Flame className="w-5 h-5" />
              {sessionStats.maxStreak}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Max Streak</div>
          </div>
          <div className="bg-secondary/30 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-emerald-500">
              {Math.round(((sessionStats.good + sessionStats.easy) / sessionStats.total) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Retention</div>
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => {
            setShowCompletion(false);
            loadCards();
          }}
          className="w-full max-w-xs"
        >
          Start New Session
        </Button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = sessionStats.total > 0 ? (sessionStats.completed / sessionStats.total) * 100 : 0;

  return (
    <div className="space-y-4 animate-in fade-in duration-500 max-w-2xl mx-auto">
      {/* Progress Header */}
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono">{currentIndex + 1} / {sessionStats.total}</span>
          {sessionStats.streak > 1 && (
            <span className="flex items-center gap-1 text-orange-500 font-medium">
              <Flame className="w-3 h-3 fill-orange-500" />
              {sessionStats.streak}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>{sessionStats.again}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>{sessionStats.hard}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{sessionStats.good}</span>
          </div>
        </div>
      </div>

      <div className="h-1 bg-secondary rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Flashcard Area */}
      <div className="relative perspective-1000 min-h-[500px]">
        <div className={cn(
          "relative w-full h-full transition-all duration-500 transform-style-3d",
          isFlipped ? "rotate-y-180" : ""
        )}>

          {/* Front of Card (Polish + Options) */}
          <div className="absolute inset-0 backface-hidden bg-background">
            <Card className="w-full h-full flex flex-col p-8">
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Translate to English</span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">{currentCard.vocabulary.polish}</h2>

                {/* Options Grid */}
                <div className="grid grid-cols-1 gap-3 w-full max-w-md">
                  {currentCard.options?.map((option, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full py-6 text-lg hover:bg-primary/10 hover:border-primary/50 transition-all"
                      onClick={() => handleOptionClick(option)}
                    >
                      <span className="mr-auto opacity-50 text-sm">{idx + 1}.</span>
                      {option}
                    </Button>
                  ))}
                </div>

                {currentCard.vocabulary.category && (
                  <span className="inline-block px-3 py-1 rounded-full bg-secondary/50 text-xs text-muted-foreground mt-4">
                    {currentCard.vocabulary.category.name}
                  </span>
                )}
              </div>
            </Card>
          </div>

          {/* Back of Card (English + Details) - Rotated 180deg to match flip */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-background">
            <Card className="w-full h-full flex flex-col p-8">
              <div className="flex-1 flex flex-col items-center text-center space-y-6">
                {/* Result Feedback */}
                {isCorrect !== null && (
                  <div className="flex flex-col items-center gap-4 mb-6">
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold",
                      isCorrect ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
                    )}>
                      {isCorrect ? (
                        <><CheckCircle2 className="w-4 h-4" /> Correct!</>
                      ) : (
                        <><XCircle className="w-4 h-4" /> Incorrect</>
                      )}
                    </div>
                    {selectedOption && !isCorrect && (
                      <div className="text-sm text-muted-foreground">
                        You chose: <span className="text-red-400 line-through">{selectedOption}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">English Translation</span>
                  <h2 className="text-4xl font-bold text-primary">{currentCard.vocabulary.english}</h2>
                </div>

                <div className="w-full h-px bg-white/10 my-4" />

                {generatingInfo ? (
                  <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                    <Brain className="w-4 h-4" />
                    <span className="text-sm">AI is generating context...</span>
                  </div>
                ) : (
                  <div className="space-y-6 text-left w-full max-w-lg">
                    {currentCard.vocabulary.definition && (
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Definition</span>
                        <p className="text-lg leading-relaxed">{currentCard.vocabulary.definition}</p>
                      </div>
                    )}

                    {currentCard.vocabulary.example_sentence && (
                      <div className="space-y-2 bg-secondary/20 p-4 rounded-lg border border-white/5">
                        <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                          <Repeat className="w-3 h-3" /> Example
                        </span>
                        <p className="text-base italic text-white">"{currentCard.vocabulary.example_sentence}"</p>
                        {currentCard.vocabulary.example_sentence_polish && (
                          <p className="text-sm text-muted-foreground">{currentCard.vocabulary.example_sentence_polish}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Grading Controls */}
              <div className="grid grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10">
                <Button
                  variant="ghost"
                  className="flex flex-col gap-1 h-auto py-3 hover:bg-red-500/10 hover:text-red-500"
                  onClick={() => handleRating('again')}
                >
                  <span className="text-sm font-bold">Again</span>
                  <span className="text-[10px] opacity-60">1</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex flex-col gap-1 h-auto py-3 hover:bg-orange-500/10 hover:text-orange-500"
                  onClick={() => handleRating('hard')}
                >
                  <span className="text-sm font-bold">Hard</span>
                  <span className="text-[10px] opacity-60">2</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex flex-col gap-1 h-auto py-3 hover:bg-emerald-500/10 hover:text-emerald-500"
                  onClick={() => handleRating('good')}
                >
                  <span className="text-sm font-bold">Good</span>
                  <span className="text-[10px] opacity-60">3</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex flex-col gap-1 h-auto py-3 hover:bg-blue-500/10 hover:text-blue-500"
                  onClick={() => handleRating('easy')}
                >
                  <span className="text-sm font-bold">Easy</span>
                  <span className="text-[10px] opacity-60">4</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
