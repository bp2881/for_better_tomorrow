-- sql/seed.sql

INSERT OR IGNORE INTO users (
  id, username, email, age, weight_kg, height_cm
) VALUES (
  lower(hex(randomblob(16))),
  'demo_user',
  'demo@example.com',
  30,
  70,
  175
);

INSERT OR IGNORE INTO agents (
  id, name, role, description, config
) VALUES (
  lower(hex(randomblob(16))),
  'planner_agent',
  'planner',
  'Generates weekly workout plans',
  '{}'
);

INSERT OR IGNORE INTO programs (
  id, user_id, name, duration_weeks, daily_ex_minutes, equipment, goals
)
SELECT
  lower(hex(randomblob(16))),
  u.id,
  'Demo Program',
  4,
  30,
  '["No Equipment"]',
  '["General Fitness"]'
FROM users u
WHERE u.username = 'demo_user';
