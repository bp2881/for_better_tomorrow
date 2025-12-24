from flask import Flask, render_template, request, jsonify, session
import requests
from flask_cors import CORS,cross_origin

app = Flask(__name__)
CORS(app, support_credentials=True)

# ADK endpoint
ADK_URL = "http://127.0.0.1:8000/run"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/send_message", methods=["POST", "GET"])
@cross_origin(supports_credentials=True)
def send_message():
    user_message = request.json.get("message")
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    payload = {
        "app_name": "temp_agent",
        "user_id": "user",
        "session_id": "1a7b7dd7-dbdf-44ff-884a-1ee87fa700ad",
        "new_message": {
            "role": "user",
            "parts": [{"text": user_message}]
        }
    }

    try:
        response = requests.post(
            ADK_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        response.raise_for_status()

        events = response.json()
        final_answer = ""

        for event in events:
            content = event.get("content")
            if not content:
                continue
            for part in content.get("parts", []):
                if "text" in part:
                    final_answer += part["text"]

        if not final_answer:
            final_answer = "No response from agent."
        
        
        return jsonify({"reply": final_answer})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port = 5001, threaded=True, non_reloader=True)
