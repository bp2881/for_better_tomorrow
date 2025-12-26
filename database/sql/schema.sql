-- sql/sqlschema.sql
PRAGMA foreign_keys = ON;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
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
  equipment TEXT DEFAULT '[]', -- JSON string
  goals TEXT DEFAULT '[]',     -- JSON string
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

-- Day -> Exercises mapping
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

CREATE INDEX IF NOT EXISTS idx_dayex_day_order ON day_exercises(day_id, exercise_order);

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

-- Agents
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  role TEXT,
  description TEXT,
  config TEXT DEFAULT '{}', -- JSON string for overrides; default model is in code
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Agent runs (history)
CREATE TABLE IF NOT EXISTS agent_runs (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  user_id TEXT,
  input TEXT,
  output TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  started_at TEXT,
  finished_at TEXT,
  metadata TEXT DEFAULT '{}',
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_agent ON agent_runs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_user ON agent_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);

-- UI templates
CREATE TABLE IF NOT EXISTS ui_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
