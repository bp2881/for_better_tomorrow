from google.adk.agents.llm_agent import Agent

INSTRUCTION = """
You are the Planner agent for a fitness coach.
Input: the user goal + user_memory.

Output (JSON only) with keys:
- "plan": list of steps (each step: { "week", "day", "workout_name", "minutes", "notes" })
- "rationale": short bullet points (strings)
Constraints:
- Use user_memory['progress_snapshots'] and user_memory['user'] to adapt intensity.
- Do NOT write to any DB.

NEVER IGNORE PLAN 

"""

planner_agent = Agent(
    model="gemini-2.5-flash-lite",
    name="planner_agent",
    instruction=INSTRUCTION,
)