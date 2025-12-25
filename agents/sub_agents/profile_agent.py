from google.adk.agents.llm_agent import Agent

INSTRUCTION = """
You are the Profile agent.
Input: reflection output.

Output (JSON):
- "validated_updates": dict of user_profile updates (safe fields: age, weight_kg, height_cm, email, username)
- "snapshot_payload": object ready to insert into progress_snapshots (total_days, days_completed, streak_current, total_workouts, estimated_calories_burned, additional)
- "write_intent": boolean (true if writes should be performed)
- "explanation": short text why these should be persisted

Rules:
- Validate data (e.g. don't suggest negative numbers).
- Only set write_intent to true if confidence is >= 0.7 or if change is persistent/trending.
"""

profile_agent = Agent(
    model="gemini-2.5-flash-lite",
    name="profile_agent",
    instruction=INSTRUCTION,
)