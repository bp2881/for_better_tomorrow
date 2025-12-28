# For Better Tomorrow

A project dedicated to building a better future for individuals through healthcare and fitness.

---

## Table of Contents

-   [Features](#features)
-   [Prerequisites](#prerequisites)
-   [Installation](#installation)
-   [Environment Variables](#environment-variables)
-   [Running the Project](#running-the-project)
-   [Testing](#testing)
-   [Contributing](#contributing)
-   [License](#license)

---

## Features

-   Personalized diet and workout plans based on user weight, height, age, gender, and workout days per week
-   Streak tracking to keep users motivated
-   Workout and meal reminders via notifications
-   AI-powered scheduling using Gemini agents with a highly accurate dataset
-   Built-in workout timers that can be followed directly on the website
-   Consistent motivational notifications

---

## Prerequisites

Ensure you have the following installed on your system:

-   Python **3.13 or higher**
-   Linux (Preffered) or Windows

---

## Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/bp2881/for_better_tomorrow.git
    cd for_better_tomorrow
    ```

2. **Create and activate a virtual environment**

    ```bash
    python -m venv .venv

    # macOS / Linux
    source .venv/bin/activate

    # Windows (PowerShell)
    .\.venv\Scripts\Activate.ps1
    ```

3. **Install dependencies**

    ```bash
    pip install --upgrade pip
    pip install -r requirements.txt
    ```

---

## Environment Variables

Create a `.env` file in the root directory:

```
GOOGLE_GENAI_USE_VERTEXAI=0
GOOGLE_API_KEY=yourkey
EMAIL_ADDRESS=youremail
EMAIL_PASSWORD=yourpass
```

---

## Running the Project

It invloves running both of the below in the root directory

### Flask

```bash
python app.py
```

### ADK

```bash
adk web --port 8000
```

Open your browser and navigate to:

```
http://127.0.0.1:5001
```

Create a planner accordingly

---
