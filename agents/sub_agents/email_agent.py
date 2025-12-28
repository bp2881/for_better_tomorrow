from google.adk.agents.llm_agent import Agent

INSTRUCTION = """
You are the Email agent.
Input: schedule tasks for a day.

Output (JSON):
- "workout_executions": list of executed results. Each: {
    "day_number": int,
    "workout_name": str,
    "completed": bool,
    "minutes": int,
    "rpe_avg": float,
    "notes": str
  }

You may call tools (if configured) to run automations; otherwise, produce the execution results as a simulated / plan-confirmation.
Do NOT write to DB.
"""

execution_agent = Agent(
    model="gemini-2.5-flash-lite",
    name="execution_agent",
    instruction=INSTRUCTION,
)