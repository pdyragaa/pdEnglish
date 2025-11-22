// Script to run database migrations via Supabase API
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables
let envContent = '';
try {
  envContent = readFileSync('.env', 'utf8');
} catch (err) {
  console.error('❌ .env file not found');
  process.exit(1);
}

const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// SQL migration content
const migrationSQL = `
-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vocabulary table
CREATE TABLE IF NOT EXISTS vocabulary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  polish TEXT NOT NULL,
  english TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sentences table
CREATE TABLE IF NOT EXISTS sentences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vocabulary_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  sentence_english TEXT NOT NULL,
  sentence_polish TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
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
CREATE INDEX IF NOT EXISTS idx_vocabulary_category_id ON vocabulary(category_id);
CREATE INDEX IF NOT EXISTS idx_sentences_vocabulary_id ON sentences(vocabulary_id);
CREATE INDEX IF NOT EXISTS idx_reviews_vocabulary_id ON reviews(vocabulary_id);
CREATE INDEX IF NOT EXISTS idx_reviews_next_review ON reviews(next_review);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - in production you'd want proper auth)
DROP POLICY IF EXISTS "Allow all operations on categories" ON categories;
CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on vocabulary" ON vocabulary;
CREATE POLICY "Allow all operations on vocabulary" ON vocabulary FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on sentences" ON sentences;
CREATE POLICY "Allow all operations on sentences" ON sentences FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on reviews" ON reviews;
CREATE POLICY "Allow all operations on reviews" ON reviews FOR ALL USING (true);

-- Create quiz_options table for multiple-choice quiz questions
CREATE TABLE IF NOT EXISTS quiz_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vocabulary_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  correct_answer TEXT NOT NULL,
  distractor_1 TEXT NOT NULL,
  distractor_2 TEXT NOT NULL,
  distractor_3 TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vocabulary_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_options_vocabulary_id ON quiz_options(vocabulary_id);

-- Enable Row Level Security
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;

-- Create policy (allow all operations for now - in production you'd want proper auth)
DROP POLICY IF EXISTS "Allow all operations on quiz_options" ON quiz_options;
CREATE POLICY "Allow all operations on quiz_options" ON quiz_options FOR ALL USING (true);
`;

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Execute the migration SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error.message);
      return false;
    }
    
    console.log('✅ Migrations completed successfully!');
    return true;
  } catch (err) {
    console.error('❌ Unexpected error during migration:', err.message);
    return false;
  }
}

runMigrations().then(success => {
  if (success) {
    console.log('\n🎉 Database setup is complete!');
    console.log('You can now run: npm run dev');
  } else {
    console.log('\n💡 If migrations failed, you can run them manually in Supabase Dashboard:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Copy and paste the SQL from supabase/migrations/001_initial_schema.sql');
    console.log('5. Click Run');
  }
});
