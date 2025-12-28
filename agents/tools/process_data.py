import csv
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "..", "datasets", "GYM.csv")

def get_gym_exercises(level: str, goal: str) -> list:
    """
    Retrieve suitable gym exercises from offline CSV.
    Filters by user level and goal.
    """
    results = []

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if (
                row.get("level", "").lower() == level.lower()
                and row.get("goal", "").lower() == goal.lower()
            ):
                results.append({
                    "exercise": row.get("exercise_name"),
                    "minutes": int(row.get("minutes", 10)),
                    "notes": row.get("notes", "")
                })

    return results[:12]
