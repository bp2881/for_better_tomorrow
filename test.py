import requests

url = "http://localhost:8000/run"

payload = {
    "appName": "temp_agent",
    "userId": "user",
    "sessionId": "1a7b7dd7-dbdf-44ff-884a-1ee87fa700ad",
    "newMessage": {
        "role": "user",
        "parts": [
            {
                "text": "how to sleep 8 hours a day?"
            }
        ]
    }
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
events = response.json()

for event in events:
    content = event.get("content", {})
    parts = content.get("parts", [])

    for part in parts:
        if "text" in part:
            print("MODEL TEXT:\n")
            print(part["text"])
