import sqlite3

DB_PATH = "health.db"

def get_db():
    # Opens a connection to SQLite
    return sqlite3.connect(DB_PATH, check_same_thread=False)

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        age INTEGER,
        weight INTEGER,
        height INTEGER,
        program_days INTEGER,
        goals TEXT,
        equipment TEXT,
        start_date TEXT,
        created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        plan_json TEXT,
        created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS progress_days (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        day INTEGER,
        completed INTEGER,
        completed_at TEXT,
        UNIQUE(user_id, day)
    );
    """)

    conn.commit()
    conn.close()
