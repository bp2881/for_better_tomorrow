from flask import Flask, request, jsonify, render_template
import requests
import json
from flask_cors import CORS, cross_origin
from init_db import init_db, get_db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
#from test import get_agent_url
from agents.tools.motivational import send_motivational_emails
import threading
import uuid

app = Flask(__name__)
CORS(app)
init_db()

'''def worker():
    global session_result
    session_result = get_agent_url()'''

def sessionid():
    return str(uuid.uuid4())
def adkurl(user_id):
    session_id = sessionid()
    ADK_URL = (
        f"http://localhost:8000/apps/agents"
        f"/users/{user_id}"
        f"/sessions/{session_id}:run"
    )
    return ADK_URL, session_id

@app.route("/")
def index():
    return render_template("login.html")

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Missing fields"}), 400

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO users (id, username, email, password, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (
            str(uuid.uuid4()),
            username,
            email,
            generate_password_hash(password),
            datetime.utcnow().isoformat()
        ))
        conn.commit()
    except Exception:
        return jsonify({"error": "Username or email already exists"}), 400
    finally:
        conn.close()

    return jsonify({"message": "Registered successfully"}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT id, password FROM users WHERE username = ?", (username,))
    user = cur.fetchone()
    conn.close()

    if not user or not check_password_hash(user[1], password):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "user_id": user[0]
    })

@app.route("/home")
def home():
    return render_template("index.html")

@app.route("/generate_plan", methods=["POST"])
@cross_origin(supports_credentials=True)
def generate_plan():
    data = request.get_json()

    user_id = data.get("user_id")
    user_data = data.get("userData")
    progress_data = data.get("progressData", {})
    ADK_URL,session_id = adkurl(user_id)

    if not user_id or not user_data:
        return jsonify({"error": "Missing data"}), 400

    conn = get_db()
    cursor = conn.cursor()

    # UPDATE fitness profile
    cursor.execute("""
        UPDATE users SET
            age = ?,
            weight = ?,
            height = ?,
            program_days = ?,
            goals = ?,
            equipment = ?,
            start_date = ?
        WHERE id = ?
    """, (
        user_data.get("age"),
        user_data.get("weight"),
        user_data.get("height"),
        user_data.get("programDays"),
        ",".join(user_data.get("goals", [])),
        ",".join(user_data.get("equipment", [])),
        user_data.get("startDate"),
        user_id
    ))

    conn.commit()

    if not user_data:
        return jsonify({"error": "Missing userData"}), 400
    print("User Data:", user_data)

    payload = {
        "app_name": "agents",  
        "user_id": "user",
        "session_id": f"{session_id}",
        "new_message": {
            "role": "user",
            "parts": [{
                "text": (
                    "Generate a complete fitness plan.\n\n"
                    f"User data:\n{json.dumps(user_data, indent=2)}\n\n"
                    f"Progress data:\n{json.dumps(progress_data, indent=2)}\n\n"
                    f"Preferences: {json.dumps(user_data.get('preferences', []), indent=2)}\n\n"
                    "Return JSON only."
                )
            }]
        }
    }

    try:
        response = requests.post(
            ADK_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        response.raise_for_status()

        response_json = response.json()
        print("ADK Response JSON:", response_json)
        # ADK returns a LIST of events
        if isinstance(response_json, list):
            events = response_json
        elif isinstance(response_json, dict):
            events = response_json.get("events", [])
        else:
            events = []
        print("ADK Response Events:", events)
        ui_plan = None

        for event in events:
            content = event.get("content")
            if not content:
                continue

            for part in content.get("parts", []):
                text = part.get("text")
                if not text:
                    continue

                text = text.strip()

                # Supervisor must return JSON
                if text.startswith("{"):
                    try:
                        parsed = json.loads(text)
                        if "ui_plan" in parsed:
                            ui_plan = parsed["ui_plan"]
                            break
                    except json.JSONDecodeError:
                        pass

            if ui_plan:
                break
        print("UI Plan:", ui_plan)
        if not ui_plan:
            conn.close()
            return jsonify({
                "error": "Agent did not return ui_plan",
                "raw": response_json
            }), 500
    
        cursor.execute("""
            INSERT INTO plans (user_id, plan_json, created_at)
            VALUES (?, ?, ?)
            """, (
                user_id,
                json.dumps(ui_plan),
                datetime.utcnow().isoformat()
            ))

        conn.commit()
        conn.close()

        return jsonify({
            "user_id": user_id,
            "plan": ui_plan
        })

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    email_thread = threading.Thread(
        target=send_motivational_emails,
        daemon=True
    )
    email_thread.start()

    app.run(
        debug=True,
        port=5001,
        use_reloader=False
    )

