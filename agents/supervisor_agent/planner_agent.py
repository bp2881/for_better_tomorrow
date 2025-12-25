from google.adk.agents.llm_agent import Agent

planner_agent = Agent(
    model="gemini-2.5-flash-lite",
    name="planner_agent",
    instruction="""
You generate a 7-day workout plan.

Inputs:
- user profile
- fitness level
- available equipment

Output:
Day-wise summary with:
- focus
- minutes
- calories
- protein
"""
)