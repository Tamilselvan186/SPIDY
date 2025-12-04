/*
  # Create SPIDY Assistant Tables
  
  1. New Tables
    - `notes` - Store user notes with multilingual support
      - `id` (uuid, primary key)
      - `content` (text, note content)
      - `language` (text, English/Tamil/Thanglish)
      - `created_at` (timestamp)
    - `reminders` - Store user reminders and tasks
      - `id` (uuid, primary key)
      - `title` (text, reminder title)
      - `description` (text, reminder details)
      - `due_date` (timestamp)
      - `completed` (boolean)
      - `language` (text, language preference)
      - `created_at` (timestamp)
    - `voice_logs` - Track voice interactions
      - `id` (uuid, primary key)
      - `recognized_text` (text, what was heard)
      - `language` (text, detected language)
      - `confidence` (numeric, recognition confidence)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Add anonymous user policies for read/write operations
*/

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  language text DEFAULT 'english',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  due_date timestamptz,
  completed boolean DEFAULT false,
  language text DEFAULT 'english',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS voice_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recognized_text text NOT NULL,
  language text NOT NULL,
  confidence numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read notes"
  ON notes FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous create notes"
  ON notes FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update notes"
  ON notes FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete notes"
  ON notes FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous read reminders"
  ON reminders FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous create reminders"
  ON reminders FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update reminders"
  ON reminders FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete reminders"
  ON reminders FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous read voice logs"
  ON voice_logs FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous create voice logs"
  ON voice_logs FOR INSERT
  TO anon
  WITH CHECK (true);
