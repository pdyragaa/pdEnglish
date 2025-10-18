import { createClient } from '@supabase/supabase-js';
import type { Category, Vocabulary, Sentence, Review } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database operations
export const db = {
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

    async create(vocab: Omit<Vocabulary, 'id' | 'created_at'>): Promise<Vocabulary> {
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
    async getByVocabularyId(vocabularyId: string): Promise<Review | null> {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          vocabulary:vocabulary(*)
        `)
        .eq('vocabulary_id', vocabularyId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },

    async getDueForReview(): Promise<Review[]> {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          vocabulary:vocabulary(*)
        `)
        .or(`next_review.is.null,next_review.lte.${new Date().toISOString()}`)
        .order('next_review', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },

    async create(review: Omit<Review, 'id'>): Promise<Review> {
      const { data, error } = await supabase
        .from('reviews')
        .insert(review)
        .select(`
          *,
          vocabulary:vocabulary(*)
        `)
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id: string, review: Partial<Review>): Promise<Review> {
      const { data, error } = await supabase
        .from('reviews')
        .update(review)
        .eq('id', id)
        .select(`
          *,
          vocabulary:vocabulary(*)
        `)
        .single();
      
      if (error) throw error;
      return data;
    },

    async upsert(review: Omit<Review, 'id'>): Promise<Review> {
      const { data, error } = await supabase
        .from('reviews')
        .upsert(review, { onConflict: 'vocabulary_id' })
        .select(`
          *,
          vocabulary:vocabulary(*)
        `)
        .single();
      
      if (error) throw error;
      return data;
    }
  }
};
