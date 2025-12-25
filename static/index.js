let userData = {
    age: 20,
    weight: 100,
    height: 188,
    duration: 60,
    programDays: 30,
    equipment: [],
    goals: [],
    startDate: new Date()
};

let progressData = {
    completedDays: [],
    currentStreak: 0,
    totalWorkouts: 0
};

let currentWeek = 1;
let currentDay = 1;
let currentTimers = {};
let breakInterval = null;
let completedExercises = 0;

// Load progress from localStorage
function loadProgress() {
    const saved = localStorage.getItem('healthPlannerProgress');
    if (saved) {
        progressData = JSON.parse(saved);
    }
}

// Save progress to localStorage
function saveProgress() {
    localStorage.setItem('healthPlannerProgress', JSON.stringify(progressData));
}

// Option button handlers
document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const parent = this.parentElement;
        const isMultiSelect = parent.id === 'equipmentGroup' || parent.id === 'goalsGroup';
        
        if (isMultiSelect) {
            this.classList.toggle('active');
        } else {
            parent.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            if (parent.id === 'durationGroup') {
                userData.duration = parseInt(this.dataset.value);
            } else if (parent.id === 'programDurationGroup') {
                userData.programDays = parseInt(this.dataset.value);
            }
        }
    });
});

function generatePlan() {
    userData.age = parseInt(document.getElementById('age').value) || 20;
    userData.weight = parseInt(document.getElementById('weight').value) || 100;
    userData.height = parseInt(document.getElementById('height').value) || 188;
    
    userData.equipment = Array.from(document.querySelectorAll('#equipmentGroup .option-btn.active'))
        .map(btn => btn.dataset.value);
    
    userData.goals = Array.from(document.querySelectorAll('#goalsGroup .option-btn.active'))
        .map(btn => btn.dataset.value);

    if (userData.goals.length === 0) {
        userData.goals = ['general'];
    }

    userData.startDate = new Date();
    
    loadProgress();
    
    document.getElementById('userDetailsPage').classList.remove('active');
    document.getElementById('weekSelectionPage').classList.add('active');
    document.getElementById('profileBtn').style.display = 'flex';
    
    generateWeekGrid();
    updateProgressStats();
}

function generateWeekGrid() {
    const totalWeeks = Math.ceil(userData.programDays / 7);
    const weekGrid = document.getElementById('weekGrid');
    weekGrid.innerHTML = '';
    
    const programText = userData.programDays === 7 ? '1 Week' : 
                        userData.programDays === 30 ? '1 Month' :
                        userData.programDays === 90 ? '3 Months' : '6 Months';
    document.getElementById('programSummary').textContent = 
        `${programText} Program - ${totalWeeks} weeks of transformation`;
    
    for (let i = 1; i <= totalWeeks; i++) {
        const weekBtn = document.createElement('div');
        weekBtn.className = 'week-btn';
        const weekStart = (i - 1) * 7 + 1;
        const weekEnd = Math.min(i * 7, userData.programDays);
        const daysInWeek = weekEnd - weekStart + 1;
        
        const completedInWeek = progressData.completedDays.filter(d => 
            d >= weekStart && d <= weekEnd
        ).length;
        
        if (completedInWeek === daysInWeek) {
            weekBtn.classList.add('completed');
        }
        
        weekBtn.innerHTML = `
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📅</div>
            <div>Week ${i}</div>
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
        
        if (progressData.completedDays.includes(i)) {
            dayBtn.classList.add('completed');
        }
        
        dayBtn.innerHTML = `
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">
                ${getDayEmoji(i)}
            </div>
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
    const emojis = ['💪', '🔥', '⚡', '🎯', '💯', '🚀', '⭐'];
    return emojis[(day - 1) % 7];
}

function getDayLabel(day) {
    if (progressData.completedDays.includes(day)) {
        return 'Completed ✓';
    }
    const today = Math.floor((new Date() - userData.startDate) / (1000 * 60 * 60 * 24)) + 1;
    if (day === today) {
        return 'Today';
    } else if (day < today) {
        return 'Missed';
    } else {
        return 'Upcoming';
    }
}

function showDay(day) {
    currentDay = day;
    document.getElementById('daySelectionPage').classList.remove('active');
    document.getElementById('planPage').classList.add('active');
    
    document.getElementById('dayTitle').textContent = `Day ${day} - Week ${currentWeek}`;
    
    generateWorkoutPlan(day);
    generateDietPlan(day);
    updateStats();
}

function generateWorkoutPlan(day) {
    const exercises = getExercises(day);
    const workoutList = document.getElementById('workoutList');
    workoutList.innerHTML = '';
    
    exercises.forEach((exercise, index) => {
        const card = document.createElement('div');
        card.className = 'workout-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="exercise-header">
                <div class="exercise-name">${exercise.name}</div>
                <div class="exercise-duration">${exercise.duration}</div>
            </div>
            <div class="exercise-details">${exercise.description}</div>
            <div class="timer-display" id="timer-${index}">
                ${exercise.duration}
            </div>
            <div class="timer-controls">
                <button class="timer-btn" onclick="startTimer(${index}, '${exercise.duration}')">Start</button>
                <button class="timer-btn" onclick="pauseTimer(${index})">Pause</button>
                <button class="timer-btn" onclick="resetTimer(${index}, '${exercise.duration}')">Reset</button>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" id="progress-${index}" style="width: 0%"></div>
            </div>
        `;
        workoutList.appendChild(card);
    });
}

function getExercises(day) {
    const hasEquipment = userData.equipment.length > 0 && !userData.equipment.includes('none');
    const duration = userData.duration * 60;
    const goals = userData.goals;
    const dayMod = day % 7;
    
    let allExercises = [];
    
    // Warmup
    allExercises.push(
        { name: 'Jumping Jacks', duration: '2:00', seconds: 120, description: 'Full body cardio warm-up', type: 'warmup' },
        { name: 'Arm Circles', duration: '1:00', seconds: 60, description: 'Shoulder mobility', type: 'warmup' },
        { name: 'Dynamic Stretches', duration: '2:00', seconds: 120, description: 'Prepare muscles', type: 'warmup' }
    );
    
    // Vary exercises based on day of week
    if (dayMod === 1 || dayMod === 4) { // Upper body focus
        if (hasEquipment && userData.equipment.includes('dumbbells')) {
            allExercises.push(
                { name: 'Dumbbell Chest Press', duration: '3:00', seconds: 180, description: '4 sets of 10 reps', type: 'strength' },
                { name: 'Dumbbell Rows', duration: '3:00', seconds: 180, description: '4 sets of 12 reps', type: 'strength' },
                { name: 'Dumbbell Shoulder Press', duration: '2:30', seconds: 150, description: '3 sets of 10 reps', type: 'strength' },
                { name: 'Dumbbell Bicep Curls', duration: '2:00', seconds: 120, description: '3 sets of 15 reps', type: 'strength' },
                { name: 'Dumbbell Tricep Extensions', duration: '2:00', seconds: 120, description: '3 sets of 12 reps', type: 'strength' }
            );
        } else {
            allExercises.push(
                { name: 'Push-ups', duration: '2:30', seconds: 150, description: '4 sets to failure', type: 'strength' },
                { name: 'Pike Push-ups', duration: '2:00', seconds: 120, description: '3 sets of 12 reps', type: 'strength' },
                { name: 'Tricep Dips', duration: '2:00', seconds: 120, description: '3 sets of 15 reps', type: 'strength' },
                { name: 'Diamond Push-ups', duration: '2:00', seconds: 120, description: '3 sets of 10 reps', type: 'strength' }
            );
        }
    } else if (dayMod === 2 || dayMod === 5) { // Lower body focus
        if (hasEquipment && userData.equipment.includes('dumbbells')) {
            allExercises.push(
                { name: 'Dumbbell Squats', duration: '3:00', seconds: 180, description: '4 sets of 12 reps', type: 'strength' },
                { name: 'Dumbbell Lunges', duration: '3:00', seconds: 180, description: '3 sets of 10 each leg', type: 'strength' },
                { name: 'Dumbbell Deadlifts', duration: '3:00', seconds: 180, description: '4 sets of 10 reps', type: 'strength' },
                { name: 'Dumbbell Calf Raises', duration: '2:00', seconds: 120, description: '3 sets of 20 reps', type: 'strength' }
            );
        } else {
            allExercises.push(
                { name: 'Bodyweight Squats', duration: '3:00', seconds: 180, description: '4 sets of 20 reps', type: 'strength' },
                { name: 'Lunges', duration: '3:00', seconds: 180, description: '3 sets of 15 each leg', type: 'strength' },
                { name: 'Jump Squats', duration: '2:00', seconds: 120, description: 'Explosive leg power', type: 'cardio' },
                { name: 'Glute Bridges', duration: '2:00', seconds: 120, description: '3 sets of 15 reps', type: 'strength' }
            );
        }
    } else if (dayMod === 3 || dayMod === 6) { // Cardio focus
        allExercises.push(
            { name: 'High Knees', duration: '2:00', seconds: 120, description: 'Cardiovascular endurance', type: 'cardio' },
            { name: 'Mountain Climbers', duration: '2:00', seconds: 120, description: 'Core and cardio', type: 'cardio' },
            { name: 'Burpees', duration: '2:30', seconds: 150, description: 'Full body HIIT', type: 'cardio' },
            { name: 'Skater Hops', duration: '2:00', seconds: 120, description: 'Lateral movement', type: 'cardio' },
            { name: 'Jump Rope (or simulate)', duration: '3:00', seconds: 180, description: 'Cardio conditioning', type: 'cardio' }
        );
    } else { // Rest/flexibility day
        allExercises.push(
            { name: 'Yoga Flow', duration: '4:00', seconds: 240, description: 'Sun salutations', type: 'flexibility' },
            { name: 'Hip Openers', duration: '3:00', seconds: 180, description: 'Pigeon pose variations', type: 'flexibility' },
            { name: 'Hamstring Stretches', duration: '2:00', seconds: 120, description: 'Forward folds', type: 'flexibility' }
        );
    }
    
    // Core exercises (added to most days)
    if (dayMod !== 0) {
        allExercises.push(
            { name: 'Plank Hold', duration: '2:00', seconds: 120, description: '4 sets of 30 seconds', type: 'core' },
            { name: 'Russian Twists', duration: '2:00', seconds: 120, description: '3 sets of 20 reps', type: 'core' },
            { name: 'Bicycle Crunches', duration: '2:00', seconds: 120, description: '3 sets of 20 reps', type: 'core' },
            { name: 'Leg Raises', duration: '2:00', seconds: 120, description: '3 sets of 15 reps', type: 'core' }
        );
    }
    
    // Cooldown
    allExercises.push(
        { name: 'Walking Recovery', duration: '2:00', seconds: 120, description: 'Lower heart rate', type: 'cooldown' },
        { name: 'Full Body Stretch', duration: '3:00', seconds: 180, description: 'Hold each stretch', type: 'cooldown' },
        { name: 'Deep Breathing', duration: '2:00', seconds: 120, description: 'Relaxation', type: 'cooldown' }
    );
    
    // Select exercises to match duration
    let selectedExercises = [];
    let currentDuration = 0;
    let breakTime = 0;
    
    // Warmup
    let warmups = allExercises.filter(ex => ex.type === 'warmup');
    for (let ex of warmups) {
        if (currentDuration + ex.seconds <= duration - 300) {
            selectedExercises.push(ex);
            currentDuration += ex.seconds;
            breakTime += 15;
        }
    }
    
    // Main exercises
    let mainExercises = allExercises.filter(ex => ex.type !== 'warmup' && ex.type !== 'cooldown');
    mainExercises.sort(() => Math.random() - 0.5);
    
    for (let ex of mainExercises) {
        if (currentDuration + ex.seconds + breakTime + 300 <= duration) {
            selectedExercises.push(ex);
            currentDuration += ex.seconds;
            breakTime += 15;
        }
    }
    
    // Cooldown
    let cooldowns = allExercises.filter(ex => ex.type === 'cooldown');
    for (let ex of cooldowns) {
        if (currentDuration + ex.seconds + breakTime <= duration) {
            selectedExercises.push(ex);
            currentDuration += ex.seconds;
        }
    }
    
    return selectedExercises;
}

function generateDietPlan(day) {
    const bmr = 10 * userData.weight + 6.25 * userData.height - 5 * userData.age + 5;
    const calories = Math.round(bmr * 1.5);
    const protein = Math.round(userData.weight * 2);
    
    const dietList = document.getElementById('dietList');
    dietList.innerHTML = '';
    
    // Vary meals slightly based on day
    const dayMod = day % 3;
    const proteinSource = dayMod === 0 ? 'Grilled chicken breast (200g)' : 
                            dayMod === 1 ? 'Grilled fish (200g)' : 
                            'Paneer/Tofu (200g)';
    
    const meals = [
        {
            time: 'Breakfast (8:00 AM)',
            name: 'Protein-Packed Start',
            items: [
                '4 Egg whites + 2 whole eggs',
                '2 slices whole grain toast',
                '1 banana',
                'Green tea'
            ],
            calories: Math.round(calories * 0.25),
            protein: Math.round(protein * 0.25),
            carbs: '45g',
            fats: '12g'
        },
        {
            time: 'Mid-Morning (11:00 AM)',
            name: 'Energy Booster',
            items: [
                'Greek yogurt (200g)',
                'Mixed berries',
                '30g almonds'
            ],
            calories: Math.round(calories * 0.15),
            protein: Math.round(protein * 0.2),
            carbs: '28g',
            fats: '15g'
        },
        {
            time: 'Lunch (1:30 PM)',
            name: 'Power Lunch',
            items: [
                proteinSource,
                'Brown rice (150g)',
                'Mixed vegetables',
                'Olive oil dressing'
            ],
            calories: Math.round(calories * 0.35),
            protein: Math.round(protein * 0.35),
            carbs: '55g',
            fats: '18g'
        },
        {
            time: 'Pre-Workout (4:00 PM)',
            name: 'Fuel Up',
            items: [
                'Banana',
                'Handful of dates',
                'Black coffee'
            ],
            calories: Math.round(calories * 0.1),
            protein: Math.round(protein * 0.05),
            carbs: '35g',
            fats: '2g'
        },
        {
            time: 'Dinner (7:30 PM)',
            name: 'Recovery Meal',
            items: [
                proteinSource,
                'Quinoa (100g)',
                'Large salad',
                'Avocado'
            ],
            calories: Math.round(calories * 0.15),
            protein: Math.round(protein * 0.15),
            carbs: '35g',
            fats: '20g'
        }
    ];
    
    meals.forEach((meal, index) => {
        const card = document.createElement('div');
        card.className = 'meal-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="meal-time">${meal.time}</div>
            <div class="meal-name">${meal.name}</div>
            <div class="meal-items">
                ${meal.items.map(item => `<div class="meal-item">${item}</div>`).join('')}
            </div>
            <div class="nutrition-info">
                <div class="nutrition-item">
                    <span class="nutrition-label">Calories</span>
                    <span class="nutrition-value">${meal.calories}</span>
                </div>
                <div class="nutrition-item">
                    <span class="nutrition-label">Protein</span>
                    <span class="nutrition-value">${meal.protein}g</span>
                </div>
                <div class="nutrition-item">
                    <span class="nutrition-label">Carbs</span>
                    <span class="nutrition-value">${meal.carbs}</span>
                </div>
                <div class="nutrition-item">
                    <span class="nutrition-label">Fats</span>
                    <span class="nutrition-value">${meal.fats}</span>
                </div>
            </div>
        `;
        dietList.appendChild(card);
    });
}

function updateStats() {
    const exercises = getExercises(currentDay);
    const totalMinutes = exercises.reduce((sum, ex) => sum + ex.seconds, 0) / 60;
    
    const bmr = 10 * userData.weight + 6.25 * userData.height - 5 * userData.age + 5;
    const calories = Math.round(bmr * 1.5);
    const protein = Math.round(userData.weight * 2);
    
    document.getElementById('totalExercises').textContent = exercises.length;
    document.getElementById('totalDuration').textContent = Math.round(totalMinutes);
    document.getElementById('calorieTarget').textContent = calories;
    document.getElementById('proteinTarget').textContent = protein + 'g';
    
    const bmi = (userData.weight / ((userData.height/100) ** 2)).toFixed(1);
    document.getElementById('userSummary').textContent = 
        `Age: ${userData.age} | Weight: ${userData.weight}kg | Height: ${userData.height}cm | BMI: ${bmi}`;
}

function updateProgressStats() {
    document.getElementById('totalDays').textContent = userData.programDays;
    document.getElementById('completedDays').textContent = progressData.completedDays.length;
    document.getElementById('streakDays').textContent = calculateStreak();
    
    const percentComplete = Math.round((progressData.completedDays.length / userData.programDays) * 100);
    document.getElementById('percentComplete').textContent = percentComplete + '%';
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
        progressData.totalWorkouts += getExercises(currentDay).length;
        saveProgress();
        
        alert('🎉 Congratulations! Day ' + currentDay + ' completed!');
        
        goToDaySelection();
    } else {
        alert('This day is already marked as complete!');
    }
}

function showProfile() {
    document.getElementById('profileModal').classList.add('active');
    
    document.getElementById('modalTotalDays').textContent = userData.programDays;
    document.getElementById('modalCompletedDays').textContent = progressData.completedDays.length;
    document.getElementById('modalStreak').textContent = calculateStreak() + ' 🔥';
    document.getElementById('modalWorkouts').textContent = progressData.totalWorkouts;
    
    const completion = Math.round((progressData.completedDays.length / userData.programDays) * 100);
    document.getElementById('modalCompletion').textContent = completion + '%';
    
    const caloriesPerWorkout = userData.duration * 5;
    document.getElementById('modalCalories').textContent = 
        (progressData.completedDays.length * caloriesPerWorkout).toLocaleString();
    
    // Weekly progress
    const weeklyProgress = document.getElementById('weeklyProgress');
    weeklyProgress.innerHTML = '';
    const totalWeeks = Math.ceil(userData.programDays / 7);
    
    for (let i = 1; i <= totalWeeks; i++) {
        const weekStart = (i - 1) * 7 + 1;
        const weekEnd = Math.min(i * 7, userData.programDays);
        const completedInWeek = progressData.completedDays.filter(d => 
            d >= weekStart && d <= weekEnd
        ).length;
        const totalDaysInWeek = weekEnd - weekStart + 1;
        
        const weekBar = document.createElement('div');
        weekBar.style.cssText = 'margin-bottom: 1rem;';
        weekBar.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Week ${i}</span>
                <span style="color: var(--primary);">${completedInWeek}/${totalDaysInWeek}</span>
            </div>
            <div style="width: 100%; height: 10px; background: var(--bg-dark); border-radius: 10px; overflow: hidden;">
                <div style="width: ${(completedInWeek/totalDaysInWeek)*100}%; height: 100%; background: var(--primary); border-radius: 10px;"></div>
            </div>
        `;
        weeklyProgress.appendChild(weekBar);
    }
}

function closeProfile() {
    document.getElementById('profileModal').classList.remove('active');
}

function startTimer(index, durationStr) {
    if (currentTimers[index]) {
        clearInterval(currentTimers[index].interval);
    }
    
    const exercises = getExercises(currentDay);
    const totalSeconds = exercises[index].seconds;
    let remainingSeconds = currentTimers[index]?.remaining || totalSeconds;
    
    currentTimers[index] = {
        interval: setInterval(() => {
            remainingSeconds--;
            
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            document.getElementById(`timer-${index}`).textContent = 
                `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
            document.getElementById(`progress-${index}`).style.width = progress + '%';
            
            if (remainingSeconds <= 0) {
                clearInterval(currentTimers[index].interval);
                delete currentTimers[index];
                document.getElementById(`timer-${index}`).textContent = 'Complete!';
                document.getElementById(`progress-${index}`).style.width = '100%';
                
                completedExercises++;
                if (completedExercises < exercises.length) {
                    showBreak();
                }
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
        document.getElementById('breakOverlay').classList.remove('active');
    }
    
    showWeek(currentWeek);
}

// Load progress on page load
loadProgress();