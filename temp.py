import sqlite3

# Connect to the database
conn = sqlite3.connect('./database/health.db')
cursor = conn.cursor()

# Query all usernames from the users table
cursor.execute('SELECT email FROM users')
usernames = cursor.fetchall()

# Print the results
for username in usernames:
    print(username[0])

# Close the connection
conn.close()