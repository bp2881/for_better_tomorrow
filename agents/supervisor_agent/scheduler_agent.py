from google.adk.agents.llm_agent import Agent

scheduler_agent = Agent(
    model="gemini-2.5-flash-lite",
    name="scheduler_agent",
    instruction="""
Convert weekly plan into UI day cards.

Mark:
- today
- upcoming

Return array of days.
"""
)