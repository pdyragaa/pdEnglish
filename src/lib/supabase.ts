import { createClient } from '@supabase/supabase-js';
import type { Category, Vocabulary, Sentence, Review, ReviewStats, QuizOptions } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database operations
export const db = {
  supabase, // Expose for debug
  // Categories
  categories: {
    async getAll(): Promise<Category[]> {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async create(name: string): Promise<Category> {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(id: string, name: string): Promise<Category> {
      const { data, error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }
  },

  // Vocabulary
  vocabulary: {
    async getAll(): Promise<Vocabulary[]> {
      const { data, error } = await supabase
        .from('vocabulary')
        .select(`
          *,
          category:categories(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async getByCategory(categoryId: string): Promise<Vocabulary[]> {
      const { data, error } = await supabase
        .from('vocabulary')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async getUncategorized(): Promise<Vocabulary[]> {
      const { data, error } = await supabase
        .from('vocabulary')
        .select(`
          *,
          category:categories(*)
        `)
        .is('category_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async create(vocab: Omit<Vocabulary, 'id' | 'created_at'> & { priority: number }): Promise<Vocabulary> {
      const { data, error } = await supabase
        .from('vocabulary')
        .insert(vocab)
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) throw error;
      return data;
    },

    async update(id: string, vocab: Partial<Vocabulary>): Promise<Vocabulary> {
      const { data, error } = await supabase
        .from('vocabulary')
        .update(vocab)
        .eq('id', id)
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) throw error;
      return data;
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase
        .from('vocabulary')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }
  },

  // Sentences
  sentences: {
    async getAll(): Promise<Sentence[]> {
      const { data, error } = await supabase
        .from('sentences')
        .select(`
          *,
          vocabulary:vocabulary(
            *,
            category:categories(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async getByVocabularyId(vocabularyId: string): Promise<Sentence[]> {
      const { data, error } = await supabase
        .from('sentences')
        .select('*')
        .eq('vocabulary_id', vocabularyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async create(sentence: Omit<Sentence, 'id' | 'created_at'>): Promise<Sentence> {
      const { data, error } = await supabase
        .from('sentences')
        .insert(sentence)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async createMany(sentences: Omit<Sentence, 'id' | 'created_at'>[]): Promise<Sentence[]> {
      const { data, error } = await supabase
        .from('sentences')
        .insert(sentences)
        .select();

      if (error) throw error;
      return data || [];
    },

    async update(id: string, updates: Partial<Omit<Sentence, 'id' | 'created_at' | 'vocabulary_id'>>): Promise<Sentence> {
      const { data, error } = await supabase
        .from('sentences')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase
        .from('sentences')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }
  },

  // Reviews
  reviews: {
    async getAll(): Promise<Review[]> {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('next_review', { ascending: true });

      if (error) throw error;
      return data || [];
    },

    async getReviewsDue(categoryFilter?: string | 'uncategorized', limit?: number): Promise<Array<Vocabulary & { review?: Review; quizOptions?: QuizOptions }>> {
      try {
        console.log('=== getReviewsDue DEBUG START ===');
        console.log('Parameters:', { categoryFilter, limit });
        console.log('Timestamp:', new Date().toISOString());

        // First get all vocabulary with category info
        let vocabQuery = supabase
          .from('vocabulary')
          .select(`
            *,
            category:categories(*)
          `)
          .order('created_at', { ascending: false });

        // Apply category filter if specified
        console.log('Applying category filter:', categoryFilter);
        if (categoryFilter === 'uncategorized') {
          console.log('Filter: uncategorized (category_id IS NULL)');
          vocabQuery = vocabQuery.is('category_id', null);
        } else if (categoryFilter && categoryFilter !== 'all') {
          console.log('Filter: specific category ID:', categoryFilter);
          vocabQuery = vocabQuery.eq('category_id', categoryFilter);
        } else {
          console.log('Filter: all categories (no filter applied)');
        }

        console.log('Executing vocabulary query...');
        const { data: allVocab, error: vocabError } = await vocabQuery;

        if (vocabError) {
          console.error('=== VOCABULARY QUERY ERROR ===');
          console.error('Error details:', vocabError);
          console.error('Error code:', vocabError.code);
          console.error('Error message:', vocabError.message);
          throw vocabError;
        }

        console.log('=== VOCABULARY QUERY RESULTS ===');
        console.log('Raw vocabulary data:', allVocab);
        console.log('Vocabulary array length:', allVocab?.length || 0);

        if (!allVocab || allVocab.length === 0) {
          console.log('=== NO VOCABULARY FOUND ===');
          console.log('Category filter:', categoryFilter);
          console.log('Returning empty array');
          return [];
        }

        console.log('Found vocabulary items:', allVocab.length);
        console.log('Sample vocabulary items:', allVocab.slice(0, 3).map(v => ({
          id: v.id,
          polish: v.polish,
          english: v.english,
          category_id: v.category_id,
          category_name: v.category?.name || 'No category'
        })));

        // Get all reviews for the vocabulary items
        const vocabularyIds = allVocab.map(v => v.id);
        console.log('=== LOADING REVIEWS ===');
        console.log('Vocabulary IDs to query:', vocabularyIds);
        console.log('Number of vocabulary IDs:', vocabularyIds.length);

        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .in('vocabulary_id', vocabularyIds);

        if (reviewsError) {
          console.error('=== REVIEWS QUERY ERROR ===');
          console.error('Error details:', reviewsError);
          console.error('Error code:', reviewsError.code);
          console.error('Error message:', reviewsError.message);
          throw reviewsError;
        }

        console.log('=== REVIEWS QUERY RESULTS ===');
        console.log('Reviews found:', reviews?.length || 0);
        console.log('Reviews data:', reviews);

        // Get all quiz options for the vocabulary items
        console.log('=== LOADING QUIZ OPTIONS ===');
        const { data: quizOptions, error: quizError } = await supabase
          .from('quiz_options')
          .select('*')
          .in('vocabulary_id', vocabularyIds);

        if (quizError) {
          console.error('=== QUIZ OPTIONS QUERY ERROR ===');
          console.error('Error details:', quizError);
          console.error('Error code:', quizError.code);
          console.error('Error message:', quizError.message);
          throw quizError;
        }

        console.log('=== QUIZ OPTIONS QUERY RESULTS ===');
        console.log('Quiz options found:', quizOptions?.length || 0);
        console.log('Quiz options data:', quizOptions);

        // Create lookup maps for efficient access
        const reviewsMap = new Map(reviews?.map(r => [r.vocabulary_id, r]) || []);
        const quizOptionsMap = new Map(quizOptions?.map(q => [q.vocabulary_id, q]) || []);

        console.log('=== LOOKUP MAPS CREATED ===');
        console.log('Reviews map size:', reviewsMap.size);
        console.log('Quiz options map size:', quizOptionsMap.size);
        console.log('Reviews map keys:', Array.from(reviewsMap.keys()));
        console.log('Quiz options map keys:', Array.from(quizOptionsMap.keys()));

        // Combine vocabulary with their reviews and quiz options
        console.log('=== ENRICHING VOCABULARY ===');
        const enrichedVocab = allVocab.map(vocab => {
          const review = reviewsMap.get(vocab.id) || undefined;
          const quizOpts = quizOptionsMap.get(vocab.id) || undefined;

          console.log(`Enriching vocab ${vocab.polish}:`, {
            hasReview: !!review,
            hasQuizOptions: !!quizOpts,
            reviewData: review,
            quizOptionsData: quizOpts
          });

          return {
            ...vocab,
            review,
            quizOptions: quizOpts
          };
        });

        console.log('=== FILTERING DUE CARDS ===');
        const now = new Date().toISOString();
        console.log('Current time for filtering:', now);

        const dueCards = enrichedVocab.filter(item => {
          // New cards (no review record)
          if (!item.review) {
            console.log('✓ New card found (no review):', item.polish, '/', item.english);
            return true;
          }

          // Cards due for review
          if (!item.review.next_review || item.review.next_review <= now) {
            console.log('✓ Due card found:', item.polish, '/', item.english, 'next review:', item.review.next_review);
            return true;
          }

          console.log('✗ Card not due:', item.polish, '/', item.english, 'next review:', item.review.next_review);
          return false;
        });

        // Apply limit if specified
        const finalCards = limit ? dueCards.slice(0, limit) : dueCards;

        console.log('=== FILTERING COMPLETE ===');
        console.log('Due cards found:', dueCards.length);
        console.log('Limit applied:', limit);
        console.log('Final cards after limit:', finalCards.length);
        console.log('Final cards data:', finalCards.map(card => ({
          id: card.id,
          polish: card.polish,
          english: card.english,
          category: card.category?.name || 'No category',
          hasReview: !!card.review,
          hasQuizOptions: !!card.quizOptions
        })));
        console.log('=== getReviewsDue DEBUG END ===');

        return finalCards;

      } catch (error) {
        console.error('=== getReviewsDue ERROR ===');
        console.error('Error in getReviewsDue:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        console.error('Error name:', error instanceof Error ? error.name : 'Unknown error type');
        console.error('Error message:', error instanceof Error ? error.message : String(error));
        throw error;
      }
    },

    async create(vocabularyId: string): Promise<Review> {
      // Use upsert to avoid conflicts
      return this.upsert(vocabularyId, {
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        next_review: new Date().toISOString()
      });
    },

    async update(vocabularyId: string, updates: Partial<Review>): Promise<Review> {
      // Use upsert to avoid conflicts
      return this.upsert(vocabularyId, updates);
    },

    async upsert(vocabularyId: string, updates: Partial<Review>): Promise<Review> {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .upsert({
            vocabulary_id: vocabularyId,
            ...updates,
            last_reviewed: new Date().toISOString()
          }, {
            onConflict: 'vocabulary_id'
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Upsert error for vocabulary_id:', vocabularyId, error);
        // If upsert fails, try to get existing record
        const { data: existing } = await supabase
          .from('reviews')
          .select('*')
          .eq('vocabulary_id', vocabularyId)
          .single();

        if (existing) {
          // Update existing record
          const { data, error: updateError } = await supabase
            .from('reviews')
            .update({
              ...updates,
              last_reviewed: new Date().toISOString()
            })
            .eq('vocabulary_id', vocabularyId)
            .select()
            .single();

          if (updateError) throw updateError;
          return data;
        }

        throw error;
      }
    },

    async getStats(): Promise<ReviewStats> {
      // Get all vocabulary and reviews
      const [vocabData, reviewsData] = await Promise.all([
        supabase.from('vocabulary').select('id'),
        supabase.from('reviews').select('*')
      ]);

      if (vocabData.error) throw vocabData.error;
      if (reviewsData.error) throw reviewsData.error;

      const allVocab = vocabData.data || [];
      const allReviews = reviewsData.data || [];

      const now = new Date().toISOString();
      const reviewedIds = new Set(allReviews.map(r => r.vocabulary_id));

      // Calculate stats
      const newCards = allVocab.filter(v => !reviewedIds.has(v.id)).length;
      const learning = allReviews.filter(r => r.repetitions === 0).length;
      const review = allReviews.filter(r => r.repetitions > 0 && (!r.next_review || r.next_review <= now)).length;

      // Find next review time
      const futureReviews = allReviews.filter(r => r.next_review && r.next_review > now);
      const nextReviewTime = futureReviews.length > 0
        ? futureReviews.sort((a, b) => a.next_review!.localeCompare(b.next_review!))[0].next_review
        : null;

      return {
        new: newCards,
        learning,
        review,
        total: newCards + learning + review,
        nextReviewTime
      };
    }
  },

  // Quiz Options
  quizOptions: {
    async getByVocabularyId(vocabularyId: string): Promise<QuizOptions | null> {
      const { data, error } = await supabase
        .from('quiz_options')
        .select('*')
        .eq('vocabulary_id', vocabularyId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        throw error;
      }
      return data;
    },

    async create(vocabularyId: string, options: {
      correct_answer: string;
      distractor_1: string;
      distractor_2: string;
      distractor_3: string;
    }): Promise<QuizOptions> {
      // Use upsert to avoid conflicts
      return this.upsert(vocabularyId, options);
    },

    async update(vocabularyId: string, options: {
      correct_answer: string;
      distractor_1: string;
      distractor_2: string;
      distractor_3: string;
    }): Promise<QuizOptions> {
      // Use upsert to avoid conflicts
      return this.upsert(vocabularyId, options);
    },

    async upsert(vocabularyId: string, options: {
      correct_answer: string;
      distractor_1: string;
      distractor_2: string;
      distractor_3: string;
    }): Promise<QuizOptions> {
      try {
        const { data, error } = await supabase
          .from('quiz_options')
          .upsert({
            vocabulary_id: vocabularyId,
            ...options
          }, {
            onConflict: 'vocabulary_id'
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Quiz options upsert error for vocabulary_id:', vocabularyId, error);
        // If upsert fails, try to get existing record
        const { data: existing } = await supabase
          .from('quiz_options')
          .select('*')
          .eq('vocabulary_id', vocabularyId)
          .single();

        if (existing) {
          // Update existing record
          const { data, error: updateError } = await supabase
            .from('quiz_options')
            .update(options)
            .eq('vocabulary_id', vocabularyId)
            .select()
            .single();

          if (updateError) throw updateError;
          return data;
        }

        throw error;
      }
    },

    async delete(vocabularyId: string): Promise<void> {
      const { error } = await supabase
        .from('quiz_options')
        .delete()
        .eq('vocabulary_id', vocabularyId);

      if (error) throw error;
    },

    async getAll(): Promise<QuizOptions[]> {
      const { data, error } = await supabase
        .from('quiz_options')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  }
};
