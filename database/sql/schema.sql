-- sql/schema.sql
-- run as the app DB owner
BEGIN;

-- extension for JSONB functions if needed
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  username text UNIQUE NOT NULL,
  email text UNIQUE,
  age int,
  weight_kg numeric(5,2),
  height_cm numeric(5,2),
  created_at timestamptz DEFAULT now()
);

-- Program (a user may have multiple programs/presets)
CREATE TABLE IF NOT EXISTS programs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  duration_weeks int NOT NULL DEFAULT 4,
  daily_ex_minutes int NOT NULL DEFAULT 30,
  equipment jsonb DEFAULT '[]'::jsonb,
  goals jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Weeks (belongs to a program)
CREATE TABLE IF NOT EXISTS weeks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
  week_number int NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(program_id, week_number)
);

-- Days (belongs to a week)
CREATE TABLE IF NOT EXISTS days (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  week_id uuid REFERENCES weeks(id) ON DELETE CASCADE,
  day_number int NOT NULL,
  completed boolean DEFAULT false,
  minutes int DEFAULT 0,
  calories_target int DEFAULT 0,
  protein_grams int DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(week_id, day_number)
);

-- Exercises master list
CREATE TABLE IF NOT EXISTS exercises (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  default_minutes int,
  calories_estimate int,
  equipment jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(name)
);

-- Mapping: day -> exercises (ordered)
CREATE TABLE IF NOT EXISTS day_exercises (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  day_id uuid REFERENCES days(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises(id) ON DELETE RESTRICT,
  "order" int NOT NULL DEFAULT 0,
  sets int,
  reps text,
  minutes int,
  notes text
);

CREATE INDEX IF NOT EXISTS idx_dayex_day_order ON day_exercises(day_id, "order");

-- Progress snapshots (optionally store metrics over time)
CREATE TABLE IF NOT EXISTS progress_snapshots (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  snapshot_at timestamptz DEFAULT now(),
  total_days int,
  days_completed int,
  streak_current int, -- days
  total_workouts int,
  estimated_calories_burned numeric,
  additional jsonb DEFAULT '{}'::jsonb
);

-- Agents (AI agents / configs referenced by UI)
CREATE TABLE IF NOT EXISTS agents (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  role text,
  description text,
  config jsonb DEFAULT '{}'::jsonb, -- store custom overrides only
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);


-- Templates (UI templates, snippets, stored versions of index.html)
CREATE TABLE IF NOT EXISTS ui_templates (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

COMMIT;
