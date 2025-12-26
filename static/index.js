let userData = {
    age: 20, weight: 100, height: 188,
    duration: 60, programDays: 30,
    equipment: [], goals: [],
    startDate: new Date()
};

let progressData = {
    completedDays: [], currentStreak: 0, totalWorkouts: 0
};

let currentWeek = 1;
let currentDay = 1;
let currentTimers = {};
let breakInterval = null;
let completedExercises = 0;

// UI STATE CONTROLLER
const UIState = {
    getActive(groupId) {
        return [...document.querySelectorAll(`#${groupId} .option-btn.active`)].map(b => b.dataset.value);
    },
    setSingle(groupId, btn) {
        document.querySelectorAll(`#${groupId} .option-btn`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
};

function loadProgress() {
    try {
        const saved = localStorage.getItem('healthPlannerProgress');
        if (saved) progressData = JSON.parse(saved);
    } catch (e) {
        console.log('Progress loading skipped');
    }
}

function saveProgress() {
    try {
        localStorage.setItem('healthPlannerProgress', JSON.stringify(progressData));
    } catch (e) {
        console.log('Progress saving skipped');
    }
}

// Option button handlers
document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const parent = this.parentElement;
        if (parent.id === 'durationGroup') {
            userData.duration = parseInt(this.dataset.value);
        } else if (parent.id === 'programDurationGroup') {
            userData.programDays = parseInt(this.dataset.value);
        }
        
        // Single select for duration and program
        if (parent.id === 'durationGroup' || parent.id === 'programDurationGroup') {
            parent.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        }
    });
});

// Primary Goal click logic
document.querySelectorAll('#goalsGroup .option-btn').forEach(btn => {
    btn.addEventListener('click', () => UIState.setSingle('goalsGroup', btn));
});

// Equipment click logic
document.querySelectorAll('#equipmentGroup .option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const isNone = this.dataset.value === 'none';
        const noneBtn = document.querySelector('#equipmentGroup [data-value="none"]');
        if (isNone) {
            UIState.setSingle('equipmentGroup', this);
        } else {
            noneBtn.classList.remove('active');
            this.classList.toggle('active');
        }
    });
});

async function generatePlan() {
    userData.age = parseInt(document.getElementById('age').value) || 20;
    userData.weight = parseInt(document.getElementById('weight').value) || 100;
    userData.height = parseInt(document.getElementById('height').value) || 188;
    userData.equipment = UIState.getActive('equipmentGroup');
    userData.goals = UIState.getActive('goalsGroup');

    if (userData.goals.length !== 1) {
        alert('Please select exactly one primary goal.');
        return;
    }
    if (userData.equipment.length === 0) {
        alert('Please select equipment.');
        return;
    }

    loadProgress();

    try {
        const res = await fetch("/generate_plan", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ userData, progressData })
        });
        const data = await res.json();

        if (data.error) {
            alert("Planner agent error: " + data.error);
            return;
        }
        // 🔐 Persist backend identity
        userData.id = data.user_id;

        // Save planner output for later use
        userData.plannerOutput = data.plan;

        // Move UI to week selection page
        document.getElementById('userDetailsPage').classList.remove('active');
        document.getElementById('weekSelectionPage').classList.add('active');
        document.getElementById('profileBtn').style.display = 'flex';

        generateWeekGrid();
        updateProgressStats();

    } catch (err) {
        console.error(err);
        alert("Failed to generate plan.");
    }
}


function generateWeekGrid() {
    const totalWeeks = Math.ceil(userData.programDays / 7);
    const weekGrid = document.getElementById('weekGrid');
    weekGrid.innerHTML = '';
    
    const programText = userData.programDays === 7 ? '1 Week' :
                        userData.programDays === 30 ? '1 Month' :
                        userData.programDays === 90 ? '3 Months' : '6 Months';
    document.getElementById('programSummary').textContent = `${programText} Program - ${totalWeeks} weeks of transformation`;
    
    for (let i = 1; i <= totalWeeks; i++) {
        const weekBtn = document.createElement('div');
        weekBtn.className = 'week-btn';
        const weekStart = (i - 1) * 7 + 1;
        const weekEnd = Math.min(i * 7, userData.programDays);
        const daysInWeek = weekEnd - weekStart + 1;
        const completedInWeek = progressData.completedDays.filter(d => d >= weekStart && d <= weekEnd).length;
        
        if (completedInWeek === daysInWeek) weekBtn.classList.add('completed');
        
        weekBtn.innerHTML = `
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">Week ${i}</div>
            <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem;">
                ${completedInWeek}/${daysInWeek} days
            </div>
        `;
        weekBtn.onclick = () => showWeek(i);
        weekGrid.appendChild(weekBtn);
    }
}

function showWeek(week) {
    currentWeek = week;
    document.getElementById('weekSelectionPage').classList.remove('active');
    document.getElementById('daySelectionPage').classList.add('active');
    document.getElementById('weekTitle').textContent = `Week ${week}`;
    
    const dayGrid = document.getElementById('dayGrid');
    dayGrid.innerHTML = '';
    const weekStart = (week - 1) * 7 + 1;
    const weekEnd = Math.min(week * 7, userData.programDays);
    
    for (let i = weekStart; i <= weekEnd; i++) {
        const dayBtn = document.createElement('div');
        dayBtn.className = 'day-btn';
        if (progressData.completedDays.includes(i)) dayBtn.classList.add('completed');
        
        dayBtn.innerHTML = `
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">${getDayEmoji(i)}</div>
            <div>Day ${i}</div>
            <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem;">
                ${getDayLabel(i)}
            </div>
        `;
        dayBtn.onclick = () => showDay(i);
        dayGrid.appendChild(dayBtn);
    }
}

function getDayEmoji(day) {
    const emojis = ['🌙', '🔥', '💪', '🏃', '🧘', '❤️', '⭐'];
    return emojis[(day - 1) % 7];
}

function getDayLabel(day) {
    if (progressData.completedDays.includes(day)) return 'Completed';
    const today = Math.floor((new Date() - userData.startDate) / (1000 * 60 * 60 * 24)) + 1;
    if (day === today) return 'Today';
    else if (day < today) return 'Missed';
    else return 'Upcoming';
}

function showDay(day) {
    currentDay = day;

    document.getElementById('daySelectionPage').classList.remove('active');
    document.getElementById('planPage').classList.add('active');
    document.getElementById('dayTitle').textContent = `Day ${day} - Week ${currentWeek}`;

    const workoutDay = userData.plannerOutput.workout.find(d => d.day === day);
    const dietDay = userData.plannerOutput.diet.find(d => d.day === day);

    if (!workoutDay || !dietDay) {
        alert("No plan found for this day");
        return;
    }

    console.log("Workout:", workoutDay);
    console.log("Diet:", dietDay);

    renderWorkout(workoutDay.exercises);
    renderDiet(dietDay.meals);
    updateStatsFromPlan(workoutDay);
}


function renderWorkout(exercises) {
    const workoutList = document.getElementById('workoutList');
    workoutList.innerHTML = '';

    exercises.forEach((exercise, index) => {
        const seconds = exercise.duration_seconds || 60;
        const duration = `${Math.round(seconds / 60)} min`;

        const card = document.createElement('div');
        card.className = 'workout-card';
        card.innerHTML = `
            <div class="exercise-header">
                <div class="exercise-name">${exercise.name}</div>
                <div class="exercise-duration">${duration}</div>
            </div>
            <div class="exercise-details">${exercise.description || ''}</div>
            <div class="timer-display" id="timer-${index}">${duration}</div>
            <div class="timer-controls">
                <button onclick="startTimer(${index})">Start</button>
                <button onclick="pauseTimer(${index})">Pause</button>
                <button onclick="resetTimer(${index}, '${duration}')">Reset</button>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" id="progress-${index}"></div>
            </div>
        `;
        workoutList.appendChild(card);
    });
}

function renderDiet(meals) {
    const dietList = document.getElementById('dietList');
    dietList.innerHTML = '';

    meals.forEach(meal => {
        const card = document.createElement('div');
        card.className = 'meal-card';
        card.innerHTML = `
            <div class="meal-time">${meal.time}</div>
            <div class="meal-name">${meal.name}</div>
            <div class="meal-items">
                ${meal.items.map(i => `<div>${i}</div>`).join('')}
            </div>
            <div class="nutrition-info">
                <span>${meal.calories} kcal</span>
                <span>${meal.protein}g protein</span>
            </div>
        `;
        dietList.appendChild(card);
    });
}


function updateStatsFromPlan(plan) {
    const totalSeconds = plan.exercises.reduce(
        (s, e) => s + (e.duration_seconds || 60),
        0
    );

    document.getElementById('totalExercises').textContent = plan.exercises.length;
    document.getElementById('totalDuration').textContent = Math.round(totalSeconds / 60);

    const bmr = 10 * userData.weight + 6.25 * userData.height - 5 * userData.age + 5;
    const calories = Math.round(bmr * 1.5);
    const protein = Math.round(userData.weight * 2);

    document.getElementById('calorieTarget').textContent = calories;
    document.getElementById('proteinTarget').textContent = `${protein}g`;
    
    const bmi = (userData.weight / ((userData.height/100) ** 2)).toFixed(1);
    document.getElementById('userSummary').textContent = `Age: ${userData.age} | Weight: ${userData.weight}kg | Height: ${userData.height}cm | BMI: ${bmi}`;
}


function updateProgressStats() {
    document.getElementById('totalDays').textContent = userData.programDays;
    document.getElementById('completedDays').textContent = progressData.completedDays.length;
    document.getElementById('streakDays').textContent = calculateStreak();
    const percentComplete = Math.round((progressData.completedDays.length / userData.programDays) * 100);
    document.getElementById('percentComplete').textContent = `${percentComplete}%`;
}

function calculateStreak() {
    if (progressData.completedDays.length === 0) return 0;
    const sortedDays = [...progressData.completedDays].sort((a, b) => b - a);
    let streak = 1;
    for (let i = 0; i < sortedDays.length - 1; i++) {
        if (sortedDays[i] - sortedDays[i + 1] === 1) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

function completeDay() {
    if (!progressData.completedDays.includes(currentDay)) {
        progressData.completedDays.push(currentDay);
        const workoutDay = userData.plannerOutput.workout.find(d => d.day === currentDay);
        if (workoutDay) {
            progressData.totalWorkouts += workoutDay.exercises.length;
        }
        saveProgress();
        alert(`Congratulations! Day ${currentDay} completed!`);
        goToDaySelection();
    } else {
        alert('This day is already marked as complete!');
    }
}

function showProfile() {
    document.getElementById('profileModal').classList.add('active');
    document.getElementById('modalTotalDays').textContent = userData.programDays;
    document.getElementById('modalCompletedDays').textContent = progressData.completedDays.length;
    document.getElementById('modalStreak').textContent = calculateStreak();
    document.getElementById('modalWorkouts').textContent = progressData.totalWorkouts;
    const completion = Math.round((progressData.completedDays.length / userData.programDays) * 100);
    document.getElementById('modalCompletion').textContent = `${completion}%`;
    const caloriesPerWorkout = userData.duration * 5;
    document.getElementById('modalCalories').textContent = `${(progressData.completedDays.length * caloriesPerWorkout).toLocaleString()}`;
    
    const weeklyProgress = document.getElementById('weeklyProgress');
    weeklyProgress.innerHTML = '';
    const totalWeeks = Math.ceil(userData.programDays / 7);
    
    for (let i = 1; i <= totalWeeks; i++) {
        const weekStart = (i - 1) * 7 + 1;
        const weekEnd = Math.min(i * 7, userData.programDays);
        const completedInWeek = progressData.completedDays.filter(d => d >= weekStart && d <= weekEnd).length;
        const totalDaysInWeek = weekEnd - weekStart + 1;
        
        const weekBar = document.createElement('div');
        weekBar.style.cssText = 'margin-bottom: 1rem;';
        weekBar.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Week ${i}</span>
                <span style="color: var(--primary);">${completedInWeek}/${totalDaysInWeek}</span>
            </div>
            <div style="width: 100%; height: 10px; background: var(--bg-dark); border-radius: 10px; overflow: hidden;">
                <div style="width: ${completedInWeek/totalDaysInWeek*100}%; height: 100%; background: var(--primary); border-radius: 10px;"></div>
            </div>
        `;
        weeklyProgress.appendChild(weekBar);
    }
}

function closeProfile() {
    document.getElementById('profileModal').classList.remove('active');
}

function startTimer(index) {
    if (currentTimers[index]) clearInterval(currentTimers[index].interval);

    const workoutDay = userData.plannerOutput.workout.find(d => d.day === currentDay);
    if (!workoutDay) return;

    const exercises = workoutDay.exercises;

    const totalSeconds = exercises[index].duration_seconds || 60;
    let remainingSeconds = currentTimers[index]?.remaining || totalSeconds;

    currentTimers[index] = {
        interval: setInterval(() => {
            remainingSeconds--;
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;

            document.getElementById(`timer-${index}`).textContent =
                `${minutes}:${seconds.toString().padStart(2, '0')}`;

            const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
            document.getElementById(`progress-${index}`).style.width = `${progress}%`;

            if (remainingSeconds <= 0) {
                clearInterval(currentTimers[index].interval);
                delete currentTimers[index];
                document.getElementById(`timer-${index}`).textContent = 'Complete!';
                document.getElementById(`progress-${index}`).style.width = '100%';
            }
        }, 1000),
        remaining: remainingSeconds
    };
}


function pauseTimer(index) {
    if (currentTimers[index]) {
        clearInterval(currentTimers[index].interval);
    }
}

function resetTimer(index, durationStr) {
    if (currentTimers[index]) {
        clearInterval(currentTimers[index].interval);
        delete currentTimers[index];
    }
    document.getElementById(`timer-${index}`).textContent = durationStr;
    document.getElementById(`progress-${index}`).style.width = '0%';
}

function showBreak() {
    const overlay = document.getElementById('breakOverlay');
    overlay.classList.add('active');
    let breakTime = 15;
    document.getElementById('breakTimer').textContent = breakTime;
    
    breakInterval = setInterval(() => {
        breakTime--;
        document.getElementById('breakTimer').textContent = breakTime;
        if (breakTime <= 0) {
            clearInterval(breakInterval);
            overlay.classList.remove('active');
        }
    }, 1000);
}

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    if (tab === 'workout') {
        document.querySelector('.tab:nth-child(1)').classList.add('active');
        document.getElementById('workoutTab').classList.add('active');
    } else {
        document.querySelector('.tab:nth-child(2)').classList.add('active');
        document.getElementById('dietTab').classList.add('active');
    }
}

function goToUserDetails() {
    document.getElementById('weekSelectionPage').classList.remove('active');
    document.getElementById('userDetailsPage').classList.add('active');
    document.getElementById('profileBtn').style.display = 'none';
}

function goToWeekSelection() {
    document.getElementById('daySelectionPage').classList.remove('active');
    document.getElementById('weekSelectionPage').classList.add('active');
    generateWeekGrid();
    updateProgressStats();
}

function goToDaySelection() {
    document.getElementById('planPage').classList.remove('active');
    document.getElementById('daySelectionPage').classList.add('active');
    Object.values(currentTimers).forEach(timer => {
        if (timer.interval) clearInterval(timer.interval);
    });
    currentTimers = {};
    completedExercises = 0;
    if (breakInterval) {
        clearInterval(breakInterval);
        breakInterval = null;
    }
    document.getElementById('breakOverlay').classList.remove('active');
    showWeek(currentWeek);
}

loadProgress();