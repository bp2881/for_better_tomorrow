import sqlite3

DB_PATH = "health.db"

def get_db():
<<<<<<< HEAD
=======
    # Opens a connection to SQLite
>>>>>>> fbf0f574421055968a69aea1b4777bfc9e3afdba
    return sqlite3.connect(DB_PATH, check_same_thread=False)

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
<<<<<<< HEAD

        -- auth
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,

        -- fitness profile (filled later)
=======
>>>>>>> fbf0f574421055968a69aea1b4777bfc9e3afdba
        age INTEGER,
        weight INTEGER,
        height INTEGER,
        program_days INTEGER,
        goals TEXT,
        equipment TEXT,
        start_date TEXT,
<<<<<<< HEAD

        created_at TEXT NOT NULL
=======
        created_at TEXT
>>>>>>> fbf0f574421055968a69aea1b4777bfc9e3afdba
    );

    CREATE TABLE IF NOT EXISTS plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
<<<<<<< HEAD
        user_id TEXT NOT NULL,
        plan_json TEXT NOT NULL,
        created_at TEXT NOT NULL
=======
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
>>>>>>> fbf0f574421055968a69aea1b4777bfc9e3afdba
    );
    """)

    conn.commit()
    conn.close()
