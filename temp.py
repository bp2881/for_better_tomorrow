import sqlite3

# Connect to the database
conn = sqlite3.connect('health.db')
cursor = conn.cursor()

# Query all rows from the plans table
cursor.execute('SELECT * FROM plans')
rows = cursor.fetchall()

# Print all rows
for row in rows:
    print(row)

# Close the connection
conn.close()