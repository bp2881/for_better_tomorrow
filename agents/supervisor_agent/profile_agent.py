from google.adk.agents.llm_agent import Agent

profile_agent = Agent(
    model="gemini-2.5-flash-lite",
    name="profile_agent",
    instruction="""
You receive structured fitness form data.

Extract:
- age
- weight
- height
- daily exercise time
- equipment
- primary goal

Infer fitness level.

Return JSON only.
"""
)