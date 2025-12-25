from google.adk.agents.llm_agent import Agent

reflection_agent = Agent(
    model="gemini-2.5-flash-lite",
    name="reflection_agent",
    instruction="""
    You are the Adaptation Engine. 
    Analyze the user's completion data against the original plan.
    If the user missed 2+ days, suggest a 'Recovery' plan with lower intensity.
    If the user excelled, suggest a 'Challenge' progression.
    """
)