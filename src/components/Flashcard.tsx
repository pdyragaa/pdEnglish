import { useState } from 'react';
import { RotateCcw, CheckCircle, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import type { ReviewSession, QualityRating } from '../types';
// import { getQualityDescription, getQualityButtonText } from '../lib/spaced-repetition';

interface FlashcardProps {
  session: ReviewSession;
  onRate: (quality: QualityRating) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export function Flashcard({ session, onRate, onNext, onPrevious, canGoNext, canGoPrevious }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showRating, setShowRating] = useState(false);

  const { vocabulary } = session;
  
  const handleFlip = () => {
    setIsFlipped(true);
    setShowRating(true);
  };

  const handleRate = (quality: QualityRating) => {
    onRate(quality);
    setIsFlipped(false);
    setShowRating(false);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setShowRating(false);
    onNext();
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setShowRating(false);
    onPrevious();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="min-h-[400px] relative">
        <CardContent className="p-8">
          {/* Card Content */}
          <div className="text-center space-y-6">
            {!isFlipped ? (
              // Front of card
              <div className="space-y-4">
                <div className="text-sm text-gray-500 uppercase tracking-wide">
                  {session.vocabulary.category?.name || 'No Category'}
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {vocabulary.english}
                </div>
                <div className="text-lg text-gray-600">
                  What is this in Polish?
                </div>
              </div>
            ) : (
              // Back of card
              <div className="space-y-4">
                <div className="text-sm text-gray-500 uppercase tracking-wide">
                  Answer
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {vocabulary.polish}
                </div>
                <div className="text-lg text-gray-600">
                  {vocabulary.english}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!showRating ? (
              <div className="space-y-4">
                {!isFlipped ? (
                  <Button onClick={handleFlip} size="lg" className="w-full">
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Show Answer
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 mb-4">
                      How well did you know this?
                    </div>
                    
                    {/* Quality Rating Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => handleRate(0)}
                        variant="destructive"
                        className="h-12"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Again
                      </Button>
                      <Button
                        onClick={() => handleRate(1)}
                        variant="destructive"
                        className="h-12"
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Hard
                      </Button>
                      <Button
                        onClick={() => handleRate(3)}
                        variant="secondary"
                        className="h-12"
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Good
                      </Button>
                      <Button
                        onClick={() => handleRate(5)}
                        className="h-12"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Easy
                      </Button>
                    </div>

                    {/* Quality Descriptions */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Again: Complete blackout</div>
                      <div>Hard: Recalled with serious difficulty</div>
                      <div>Good: Recalled with slight difficulty</div>
                      <div>Easy: Perfect recall</div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <Button
                onClick={handlePrevious}
                variant="outline"
                disabled={!canGoPrevious}
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                variant="outline"
                disabled={!canGoNext}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
