-- sql/schema.sql
PRAGMA foreign_keys = ON;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,            -- UUID as text
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  age INTEGER,
  weight_kg REAL,
  height_cm REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Programs
CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  duration_weeks INTEGER DEFAULT 4,
  daily_ex_minutes INTEGER DEFAULT 30,
  equipment TEXT DEFAULT '[]',     -- JSON string
  goals TEXT DEFAULT '[]',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Weeks
CREATE TABLE IF NOT EXISTS weeks (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (program_id, week_number),
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

-- Days
CREATE TABLE IF NOT EXISTS days (
  id TEXT PRIMARY KEY,
  week_id TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  completed INTEGER DEFAULT 0,
  minutes INTEGER DEFAULT 0,
  calories_target INTEGER DEFAULT 0,
  protein_grams INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (week_id, day_number),
  FOREIGN KEY (week_id) REFERENCES weeks(id) ON DELETE CASCADE
);

-- Exercises
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  default_minutes INTEGER,
  calories_estimate INTEGER,
  equipment TEXT DEFAULT '[]',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Day → Exercises mapping
CREATE TABLE IF NOT EXISTS day_exercises (
  id TEXT PRIMARY KEY,
  day_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  exercise_order INTEGER DEFAULT 0,
  sets INTEGER,
  reps TEXT,
  minutes INTEGER,
  notes TEXT,
  FOREIGN KEY (day_id) REFERENCES days(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

-- Progress snapshots
CREATE TABLE IF NOT EXISTS progress_snapshots (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  snapshot_at TEXT DEFAULT CURRENT_TIMESTAMP,
  total_days INTEGER,
  days_completed INTEGER,
  streak_current INTEGER,
  total_workouts INTEGER,
  estimated_calories_burned REAL,
  additional TEXT DEFAULT '{}',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Agents (model NOT stored; default handled in code)
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  role TEXT,
  description TEXT,
  config TEXT DEFAULT '{}',
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- UI templates
CREATE TABLE IF NOT EXISTS ui_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
