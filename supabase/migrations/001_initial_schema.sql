-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vocabulary table
CREATE TABLE vocabulary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  polish TEXT NOT NULL,
  english TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sentences table
CREATE TABLE sentences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vocabulary_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  sentence_english TEXT NOT NULL,
  sentence_polish TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vocabulary_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  ease_factor REAL DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  next_review TIMESTAMP WITH TIME ZONE,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  UNIQUE(vocabulary_id)
);

-- Create indexes for better performance
CREATE INDEX idx_vocabulary_category_id ON vocabulary(category_id);
CREATE INDEX idx_sentences_vocabulary_id ON sentences(vocabulary_id);
CREATE INDEX idx_reviews_vocabulary_id ON reviews(vocabulary_id);
CREATE INDEX idx_reviews_next_review ON reviews(next_review);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - in production you'd want proper auth)
CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all operations on vocabulary" ON vocabulary FOR ALL USING (true);
CREATE POLICY "Allow all operations on sentences" ON sentences FOR ALL USING (true);
CREATE POLICY "Allow all operations on reviews" ON reviews FOR ALL USING (true);
