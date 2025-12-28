import sqlite3

conn = sqlite3.connect('health.db')

cur = conn.cursor()

cur.execute('''
SELECT email, username FROM users''')

users = cur.fetchall()

for email, username in users:
    print(f"Email: {email}, Username: {username}")