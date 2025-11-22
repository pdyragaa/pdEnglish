-- Create quiz_options table for multiple-choice quiz questions
CREATE TABLE quiz_options (
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
CREATE INDEX idx_quiz_options_vocabulary_id ON quiz_options(vocabulary_id);

-- Enable Row Level Security
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;

-- Create policy (allow all operations for now - in production you'd want proper auth)
CREATE POLICY "Allow all operations on quiz_options" ON quiz_options FOR ALL USING (true);
