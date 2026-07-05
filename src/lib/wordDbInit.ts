/**
 * 数据库初始化脚本 - 创建单词相关表
 * 
 * 在 Supabase SQL Editor 中执行以下 SQL
 */

export const CREATE_TABLES_SQL = `
-- 1. 创建 words 表（存储单词数据）
CREATE TABLE IF NOT EXISTS words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT UNIQUE NOT NULL,
  phonetic TEXT DEFAULT '',
  part_of_speech TEXT DEFAULT '',
  meaning TEXT DEFAULT '',
  example TEXT DEFAULT '',
  translation TEXT DEFAULT '',
  collocations TEXT[] DEFAULT '{}',
  synonyms TEXT[] DEFAULT '{}',
  antonyms TEXT[] DEFAULT '{}',
  frequency_level TEXT CHECK (frequency_level IN ('high', 'medium', 'low')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建单词掌握度表
CREATE TABLE IF NOT EXISTS word_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT DEFAULT 'personal-user',
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 5),
  review_count INTEGER DEFAULT 0,
  last_review TIMESTAMP WITH TIME ZONE,
  next_review TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- 3. 创建学习记录表
CREATE TABLE IF NOT EXISTS word_learning_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT DEFAULT 'personal-user',
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,
  action TEXT CHECK (action IN ('learned', 'reviewed', 'mastered', 'forgotten', 'skipped')),
  duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_words_frequency ON words(frequency_level);
CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);
CREATE INDEX IF NOT EXISTS idx_word_mastery_user ON word_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_word_mastery_word ON word_mastery(word_id);
CREATE INDEX IF NOT EXISTS idx_word_records_user ON word_learning_records(user_id);
CREATE INDEX IF NOT EXISTS idx_word_records_created ON word_learning_records(created_at);

-- 5. 启用 RLS
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_learning_records ENABLE ROW LEVEL SECURITY;

-- 6. 创建 RLS 策略（允许所有操作）
CREATE POLICY "Allow all on words" ON words FOR ALL USING (true);
CREATE POLICY "Allow all on word_mastery" ON word_mastery FOR ALL USING (true);
CREATE POLICY "Allow all on word_learning_records" ON word_learning_records FOR ALL USING (true);
`;

export default CREATE_TABLES_SQL;
