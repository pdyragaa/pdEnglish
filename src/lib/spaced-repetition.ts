import type { ReviewRating, Review, MasteryLevel } from '../types';

export interface SM2State {
  ease_factor: number;
  interval: number;
  repetitions: number;
}

export interface SM2Result extends SM2State {
  next_review: string;
}

/**
 * SM-2 (SuperMemo 2) spaced repetition algorithm
 * Based on the original SuperMemo algorithm with priority adjustment
 */
export function calculateNextReview(
  rating: ReviewRating,
  currentState: SM2State | null,
  priority: number = 2
): SM2Result {
  const now = new Date();
  
  // Default values for new cards
  let ease_factor = 2.5;
  let interval = 0;
  let repetitions = 0;
  
  // Use current state if available
  if (currentState) {
    ease_factor = currentState.ease_factor;
    interval = currentState.interval;
    repetitions = currentState.repetitions;
  }
  
  // Rating values for SM-2
  const ratingValues = {
    again: 0,
    hard: 3,
    good: 4,
    easy: 5
  };
  
  const quality = ratingValues[rating];
  
  if (quality < 3) {
    // Again - reset the card
    interval = 0;
    repetitions = 0;
    ease_factor = Math.max(1.3, ease_factor - 0.2);
  } else {
    // Hard, Good, or Easy
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease_factor);
    }
    
    repetitions += 1;
    
    // Adjust ease factor based on quality
    ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    ease_factor = Math.max(1.3, ease_factor);
  }
  
  // Adjust interval based on priority
  let adjustedInterval = interval;
  if (interval > 0) {
    switch (priority) {
      case 3: // Very important - more frequent reviews
        adjustedInterval = Math.round(interval * 0.7); // 30% reduction
        break;
      case 1: // Less important - less frequent reviews
        adjustedInterval = Math.round(interval * 1.3); // 30% increase
        break;
      case 2: // Standard importance - no adjustment
      default:
        adjustedInterval = interval;
        break;
    }
  }

  // Calculate next review date
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + adjustedInterval);
  
  return {
    ease_factor: Math.round(ease_factor * 100) / 100, // Round to 2 decimal places
    interval: adjustedInterval,
    repetitions,
    next_review: nextReview.toISOString()
  };
}

/**
 * Get the rating display name
 */
export function getRatingDisplayName(rating: ReviewRating): string {
  const names = {
    again: 'Again',
    hard: 'Hard', 
    good: 'Good',
    easy: 'Easy'
  };
  return names[rating];
}

/**
 * Get the rating color for UI
 */
export function getRatingColor(rating: ReviewRating): 'error' | 'warning' | 'success' | 'info' {
  const colors = {
    again: 'error' as const,
    hard: 'warning' as const,
    good: 'success' as const,
    easy: 'info' as const
  };
  return colors[rating];
}

/**
 * Get the rating description
 */
export function getRatingDescription(rating: ReviewRating): string {
  const descriptions = {
    again: 'Forgot it completely',
    hard: 'Remembered with difficulty',
    good: 'Remembered correctly',
    easy: 'Remembered perfectly'
  };
  return descriptions[rating];
}

/**
 * Check if a review is due based on next_review time
 */
export function isReviewDue(nextReview: string | null): boolean {
  if (!nextReview) return true;
  return new Date(nextReview) <= new Date();
}

/**
 * Categorize vocabulary mastery level based on review data
 */
export function getMasteryLevel(review: Review | null): MasteryLevel {
  if (!review) return 'new';
  
  const { ease_factor, repetitions } = review;
  
  if (ease_factor >= 2.5 && repetitions >= 3) return 'known';
  if (ease_factor < 2.0 && repetitions > 0) return 'difficult';
  if (repetitions >= 1 && repetitions <= 2) return 'learning';
  
  return 'new';
}

/**
 * Format next review time in human-readable format
 */
export function formatNextReviewTime(nextReview: string | null): string {
  if (!nextReview) return 'Ready now';
  
  const now = new Date();
  const reviewDate = new Date(nextReview);
  const diffMs = reviewDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
  return `${Math.floor(diffDays / 30)} months`;
}
