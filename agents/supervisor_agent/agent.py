# agents/supervisor/agent.py
from google.adk.agents import Agent

INSTRUCTION = """
You are the Supervisor agent. Coordinate the sub-agents in this loop:
1) Call planner_agent to create a plan.
2) Call scheduler_agent to order tasks.
3) Call execution_agent to perform tasks or simulate execution.
4) Call reflection_agent to analyze outcomes.
5) Call profile_agent to validate suggested writes.

Always request JSON outputs from sub-agents using the specified schemas.
At the end, produce a final JSON object:
{
  "final_message": "<human friendly summary>",
  "planner": {...},
  "scheduler": {...},
  "execution": {...},
  "reflection": {...},
  "profile_validated": {...}
}

Do NOT directly persist anything to the DB. The backend will take profile_validated if write_intent == true and perform the write after validation.
"""
supervisor_agent = Agent(
    name="supervisor_agent",
    model="gemini-2.5-flash-lite",
    instruction=INSTRUCTION
)
