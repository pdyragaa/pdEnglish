import type { QualityRating } from '../types';

export interface SM2Review {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date | null;
}

export interface SM2Result {
  updatedReview: SM2Review;
  shouldRepeat: boolean;
}

/**
 * SuperMemo 2 (SM-2) Algorithm Implementation
 * Based on the original algorithm by Piotr Wozniak
 */
export function calculateSM2(
  currentReview: SM2Review,
  quality: QualityRating
): SM2Result {
  let { easeFactor, interval, repetitions, nextReview } = currentReview;

  // If quality is less than 3, reset repetitions and interval
  if (quality < 3) {
    repetitions = 0;
    interval = 1;
    nextReview = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // 1 day
  } else {
    // Update repetitions
    repetitions += 1;

    // Calculate new interval
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }

    // Calculate next review date
    const daysToAdd = interval;
    nextReview = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Minimum ease factor is 1.3
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  return {
    updatedReview: {
      easeFactor: Math.round(easeFactor * 100) / 100, // Round to 2 decimal places
      interval,
      repetitions,
      nextReview
    },
    shouldRepeat: quality < 4
  };
}

/**
 * Get initial review settings for new vocabulary
 */
export function getInitialReview(): SM2Review {
  return {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: null
  };
}

/**
 * Get quality rating description
 */
export function getQualityDescription(quality: QualityRating): string {
  const descriptions = {
    0: 'Complete blackout - I don\'t remember this at all',
    1: 'Incorrect response - I recalled it with serious difficulty',
    2: 'Incorrect response - I recalled it with serious difficulty',
    3: 'Correct response - I recalled it with serious difficulty',
    4: 'Correct response - I recalled it with slight difficulty',
    5: 'Perfect response - I recalled it without any difficulty'
  };
  return descriptions[quality];
}

/**
 * Get quality button text for UI
 */
export function getQualityButtonText(quality: QualityRating): string {
  const buttons = {
    0: 'Again',
    1: 'Hard',
    2: 'Hard',
    3: 'Good',
    4: 'Good',
    5: 'Easy'
  };
  return buttons[quality];
}

/**
 * Calculate review statistics
 */
export interface ReviewStats {
  dueToday: number;
  dueThisWeek: number;
  total: number;
  mastered: number; // interval >= 30 days
  learning: number; // interval < 7 days
}

export function calculateReviewStats(reviews: Array<{ interval: number; next_review: string | null }>): ReviewStats {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  let dueToday = 0;
  let dueThisWeek = 0;
  let mastered = 0;
  let learning = 0;

  reviews.forEach(review => {
    if (review.next_review) {
      const nextReview = new Date(review.next_review);
      
      if (nextReview <= now) {
        dueToday++;
      } else if (nextReview <= weekFromNow) {
        dueThisWeek++;
      }
    }

    if (review.interval >= 30) {
      mastered++;
    } else if (review.interval < 7 && review.interval > 0) {
      learning++;
    }
  });

  return {
    dueToday,
    dueThisWeek,
    total: reviews.length,
    mastered,
    learning
  };
}
