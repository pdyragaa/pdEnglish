import { useState, useEffect } from 'react';
import { Play, Trophy, Clock, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Flashcard } from './Flashcard';
import { db } from '../lib/supabase';
import { calculateSM2, getInitialReview } from '../lib/spaced-repetition';
import { useVocabularyStore } from '../store/useVocabularyStore';
import type { QualityRating } from '../types';

export function ReviewSession() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    completed: 0,
    correct: 0
  });

  const {
    currentSession,
    startReviewSession,
    nextCard,
    previousCard,
    rateCard,
    endSession,
    getCurrentCard,
    isLastCard,
    isFirstCard,
    getSessionProgress,
    setError
  } = useVocabularyStore();

  useEffect(() => {
    loadDueReviews();
  }, []);

  const loadDueReviews = async () => {
    setIsLoading(true);
    try {
      const dueReviews = await db.reviews.getDueForReview();
      
      if (dueReviews.length === 0) {
        setError('No cards are due for review right now. Great job! 🎉');
        return;
      }

      const vocabulary = dueReviews.map(review => review.vocabulary!);
      const reviews = dueReviews.map(review => ({
        ...review,
        vocabulary: undefined // Remove vocabulary from review objects
      }));

      startReviewSession(vocabulary, reviews);
      setSessionStats({
        total: vocabulary.length,
        completed: 0,
        correct: 0
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = () => {
    setHasStarted(true);
  };

  const handleRate = async (quality: QualityRating) => {
    const currentCard = getCurrentCard();
    if (!currentCard) return;

    try {
      const currentReview = currentCard.review || getInitialReview();
      const sm2Input = currentCard.review ? {
        easeFactor: (currentReview as any).ease_factor || 2.5,
        interval: (currentReview as any).interval || 0,
        repetitions: (currentReview as any).repetitions || 0,
        nextReview: (currentReview as any).next_review ? new Date((currentReview as any).next_review) : null
      } : getInitialReview();
      
      const sm2Result = calculateSM2(sm2Input, quality);

      // Update the review in the database
      const updatedReview = {
        vocabulary_id: currentCard.vocabulary.id,
        ease_factor: sm2Result.updatedReview.easeFactor,
        interval: sm2Result.updatedReview.interval,
        repetitions: sm2Result.updatedReview.repetitions,
        next_review: sm2Result.updatedReview.nextReview?.toISOString() || null,
        last_reviewed: new Date().toISOString()
      };

      await db.reviews.upsert(updatedReview);

      // Update local state
      rateCard(quality);

      // Update session stats
      setSessionStats(prev => ({
        ...prev,
        completed: prev.completed + 1,
        correct: prev.correct + (quality >= 3 ? 1 : 0)
      }));

      // If this was the last card, end the session
      if (isLastCard()) {
        setTimeout(() => {
          setHasStarted(false);
          endSession();
        }, 2000);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save review');
    }
  };

  const handleNext = () => {
    nextCard();
  };

  const handlePrevious = () => {
    previousCard();
  };

  const handleEndSession = () => {
    setHasStarted(false);
    endSession();
  };

  const currentCard = getCurrentCard();
  const progress = getSessionProgress();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading reviews...</div>
      </div>
    );
  }

  if (!hasStarted && currentSession.length > 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-6 w-6" />
              <span>Review Session</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-gray-900">
                {currentSession.length} cards due for review
              </div>
              <div className="text-gray-600">
                Ready to practice your vocabulary with spaced repetition?
              </div>
              <div className="flex justify-center">
                <Button onClick={handleStart} size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Start Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasStarted && currentCard) {
    return (
      <div className="space-y-6">
        {/* Progress Bar */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium">
                  Card {progress.current} of {progress.total}
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>{sessionStats.correct}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{sessionStats.completed}</span>
                </div>
                <Button onClick={handleEndSession} variant="outline" size="sm">
                  End Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flashcard */}
        <Flashcard
          session={currentCard}
          onRate={handleRate}
          onNext={handleNext}
          onPrevious={handlePrevious}
          canGoNext={!isLastCard()}
          canGoPrevious={!isFirstCard()}
        />
      </div>
    );
  }

  if (currentSession.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span>All Caught Up!</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-lg text-gray-600">
                No cards are due for review right now.
              </div>
              <div className="text-gray-500">
                Great job staying on top of your studies! 🎉
              </div>
              <Button onClick={loadDueReviews} variant="outline">
                Check for New Reviews
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
