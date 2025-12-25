-- sql/seed.sql
BEGIN;

-- create a sample user if not exists
INSERT INTO users (username, email, age, weight_kg, height_cm)
SELECT 'demo_user', 'demo@example.com', 30, 70, 175
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='demo_user');

-- add a sample agent
INSERT INTO agents (name, role, description, config)
SELECT 'planner_agent', 'planner', 'Generates weekly workout plans', '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM agents WHERE name='planner_agent');

-- sample program for demo_user
WITH u AS (SELECT id FROM users WHERE username='demo_user' LIMIT 1)
INSERT INTO programs (user_id, name, duration_weeks, daily_ex_minutes, equipment, goals)
SELECT u.id, 'Demo Program', 4, 30, '["No Equipment"]'::jsonb, '["General Fitness"]'::jsonb
FROM u
WHERE NOT EXISTS (SELECT 1 FROM programs WHERE name='Demo Program' AND user_id=(SELECT id FROM users WHERE username='demo_user' LIMIT 1));

COMMIT;
