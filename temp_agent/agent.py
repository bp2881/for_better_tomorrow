from google.adk.agents.llm_agent import Agent

# Health and wellness tools
def get_exercise_recommendations(activity_type: str, fitness_level: str) -> dict:
    """Provides exercise recommendations based on activity type and fitness level."""
    recommendations = {
        "beginner": {
            "cardio": "Start with 20-30 minutes of brisk walking, 3-4 times per week",
            "strength": "2-3 bodyweight exercises per session, 2-3 times per week",
            "yoga": "Gentle yoga, 20-30 minutes, 2-3 times per week"
        },
        "intermediate": {
            "cardio": "30-45 minutes of jogging/cycling, 4-5 times per week",
            "strength": "Weighted exercises with 3 sets of 8-12 reps, 3-4 times per week",
            "yoga": "Vinyasa flow, 45-60 minutes, 3-4 times per week"
        },
        "advanced": {
            "cardio": "45-60 minutes of high-intensity training, 5-6 times per week",
            "strength": "Progressive overload with 4 sets of 6-10 reps, 4-5 times per week",
            "yoga": "Advanced yoga, 60+ minutes, 4-5 times per week"
        }
    }
    return {
        "status": "success",
        "activity": activity_type,
        "level": fitness_level,
        "recommendation": recommendations.get(fitness_level, {}).get(activity_type, "General guidance: consult a fitness trainer")
    }

def get_nutrition_info(meal_type: str, dietary_preference: str) -> dict:
    """Provides nutritional guidance and meal suggestions."""
    return {
        "status": "success",
        "meal_type": meal_type,
        "preference": dietary_preference,
        "guidance": f"Focus on balanced {meal_type} with adequate protein, carbs, and healthy fats. Consider {dietary_preference} options."
    }

def get_health_tips(topic: str) -> dict:
    """Provides general health and wellness tips."""
    tips = {
        "sleep": "Maintain 7-9 hours of quality sleep. Keep a consistent sleep schedule and avoid screens 30 minutes before bed.",
        "stress_management": "Practice meditation, deep breathing, or yoga. Take regular breaks and maintain work-life balance.",
        "hydration": "Drink at least 8-10 glasses of water daily. Increase intake during exercise or hot weather.",
        "mental_health": "Regular physical activity, social connection, and professional support can improve mental well-being.",
        "immunity": "Eat nutrient-rich foods, exercise regularly, get adequate sleep, and manage stress to boost immunity."
    }
    return {
        "status": "success",
        "topic": topic,
        "tip": tips.get(topic, "General wellness tip: prioritize consistent healthy habits")
    }

def get_wellness_assessment(category: str) -> dict:
    """Assesses different wellness dimensions."""
    return {
        "status": "success",
        "category": category,
        "message": f"Consider evaluating your {category} wellness through regular check-ups, goal setting, and consistent monitoring."
    }

root_agent = Agent(
    model='gemini-2.5-flash-lite',
    name='wellness_agent',
    description="A health and wellness advisor that provides guidance on physical fitness, nutrition, and overall wellness.",
    instruction="""You are a dedicated Health and Wellness Agent. Your ONLY purpose is to help users with:
1. Physical fitness and exercise recommendations
2. Nutrition and dietary guidance
3. General health and wellness tips
4. Mental and physical well-being advice
5. Sleep, stress management, and healthy lifestyle habits

IMPORTANT RULES:
- ONLY respond to questions related to health, fitness, nutrition, and wellness
- IGNORE and REJECT all other topics (politics, entertainment, technical help, weather, time, etc.)
- When a non-health query is received, politely decline by saying: "I can only help with health and wellness topics. Please ask me about fitness, nutrition, mental health, or other wellness-related questions."
- Use the available tools to provide evidence-based recommendations
- Always encourage users to consult healthcare professionals for serious health concerns
- Be helpful, supportive, and knowledgeable about wellness topics only
- Provide clear, concise, and actionable advice within your scope of expertise
- Maintain user privacy and confidentiality at all times
- Strive to promote a balanced and healthy lifestyle in all responses""",
    tools=[
        get_exercise_recommendations,
        get_nutrition_info,
        get_health_tips,
        get_wellness_assessment
    ],
)
