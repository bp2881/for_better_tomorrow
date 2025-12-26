from flask import Flask, request, jsonify, render_template
import requests
import json
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app, support_credentials=True)

ADK_URL = "http://localhost:8000/run"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/generate_plan", methods=["POST"])
@cross_origin(supports_credentials=True)
def generate_plan():
    data = request.json or {}
    user_data = data.get("userData", {})
    progress_data = data.get("progressData", {})

    if not user_data:
        return jsonify({"error": "Missing userData"}), 400

    payload = {
        "app_name": "agents",   # MUST match folder name passed to `adk web`
        "user_id": "user",
        "session_id": "604ee1c7-4584-44db-a1a1-82e190a4d1e5",
        "new_message": {
            "role": "user",
            "parts": [{
                "text": (
                    "Generate a complete fitness plan.\n\n"
                    f"User data:\n{json.dumps(user_data, indent=2)}\n\n"
                    f"Progress data:\n{json.dumps(progress_data, indent=2)}\n\n"
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

        # ADK returns a LIST of events
        if isinstance(response_json, list):
            events = response_json
        elif isinstance(response_json, dict):
            events = response_json.get("events", [])
        else:
            events = []

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

        if not ui_plan:
            return jsonify({
                "error": "Agent did not return ui_plan",
                "raw": response_json
            }), 500

        return jsonify({"plan": ui_plan})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(
        debug=True,
        port=5001,
        use_reloader=False
    )
