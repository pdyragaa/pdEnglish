import { db } from './supabase';
import { getInitialReview } from './spaced-repetition';

export interface BackfillResult {
  totalVocabulary: number;
  totalReviews: number;
  missingReviews: number;
  createdReviews: number;
  errors: string[];
}

/**
 * Backfill missing review entries for existing vocabulary
 * This ensures all vocabulary items have corresponding review entries for spaced repetition
 */
export async function backfillMissingReviews(): Promise<BackfillResult> {
  const result: BackfillResult = {
    totalVocabulary: 0,
    totalReviews: 0,
    missingReviews: 0,
    createdReviews: 0,
    errors: []
  };

  try {
    // Get all vocabulary
    const allVocabulary = await db.vocabulary.getAll();
    result.totalVocabulary = allVocabulary.length;

    // Get all existing reviews
    const allReviews = await db.reviews.getAll();
    result.totalReviews = allReviews.length;

    // Find vocabulary without reviews
    const vocabularyWithReviews = new Set(allReviews.map(review => review.vocabulary_id));
    const missingReviewVocabulary = allVocabulary.filter(vocab => !vocabularyWithReviews.has(vocab.id));
    result.missingReviews = missingReviewVocabulary.length;

    // Create missing reviews
    const initialReview = getInitialReview();
    
    for (const vocab of missingReviewVocabulary) {
      try {
        await db.reviews.create({
          vocabulary_id: vocab.id,
          ease_factor: initialReview.easeFactor,
          interval: initialReview.interval,
          repetitions: initialReview.repetitions,
          next_review: initialReview.nextReview?.toISOString() || null,
          last_reviewed: null
        });
        result.createdReviews++;
      } catch (error) {
        const errorMsg = `Failed to create review for "${vocab.polish}": ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        console.error(errorMsg, error);
      }
    }

    return result;
  } catch (error) {
    const errorMsg = `Backfill failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    result.errors.push(errorMsg);
    console.error(errorMsg, error);
    return result;
  }
}

/**
 * Get statistics about vocabulary and reviews
 */
export async function getReviewStats(): Promise<{
  totalVocabulary: number;
  totalReviews: number;
  reviewsDue: number;
  missingReviews: number;
}> {
  try {
    const [allVocabulary, allReviews, dueReviews] = await Promise.all([
      db.vocabulary.getAll(),
      db.reviews.getAll(),
      db.reviews.getDueForReview()
    ]);

    const vocabularyWithReviews = new Set(allReviews.map(review => review.vocabulary_id));
    const missingReviews = allVocabulary.filter(vocab => !vocabularyWithReviews.has(vocab.id)).length;

    return {
      totalVocabulary: allVocabulary.length,
      totalReviews: allReviews.length,
      reviewsDue: dueReviews.length,
      missingReviews
    };
  } catch (error) {
    console.error('Failed to get review stats:', error);
    return {
      totalVocabulary: 0,
      totalReviews: 0,
      reviewsDue: 0,
      missingReviews: 0
    };
  }
}
