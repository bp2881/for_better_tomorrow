from init_db import get_db
from agents.tools.email_utils import send_email
from time import sleep

def send_motivational_emails():
    while True:
        print('Sending motivational emails to all users...')
        conn = get_db()
        cur = conn.cursor()

        cur.execute("SELECT email, username FROM users")
        users = cur.fetchall()
        conn.close()
        for email, username in users:
            body = f"""
Hey {username} 💪,

Consistency beats motivation.
You showed up once — now show up again.

🔥 One workout today.
🥗 One healthy meal.
😴 One good sleep.

You’re building a future you’ll thank yourself for.

— Your Fitness AI
"""
            send_email(
                to_email=email,
                subject="🔥 Small steps today = Big results tomorrow",
                body=body
            )
        sleep(600)

