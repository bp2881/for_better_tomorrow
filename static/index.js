let userData = { age: 20, weight: 100, height: 188, duration: 60, programDays: 30, equipment: [], goals: [], startDate: new Date() };
let progressData = { completedDays: [], currentStreak: 0, totalWorkouts: 0 };
let currentWeek = 1;
let currentDay = 1;
let currentTimers = {};
let breakInterval = null;
let completedExercises = 0;

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

function clearErrorMessage(groupId) {
    const errorMsg = document.getElementById(`${groupId}-error`);
    if (errorMsg) errorMsg.remove();
    const groupContainer = document.getElementById(groupId);
    if (groupContainer) groupContainer.classList.remove('error-shake');
}

function showErrorMessage(groupId, message) {
    clearErrorMessage(groupId);
    const groupContainer = document.getElementById(groupId);
    if (!groupContainer) return;
    
    const errorDiv = document.createElement('div');
    errorDiv.id = `${groupId}-error`;
    errorDiv.className = 'error-message option-btn';
    errorDiv.style.cssText = `
        color: #ff4444 !important; 
        background: rgba(255, 68, 68, 0.2) !important;
        border: 2px solid #ff4444 !important;
        font-weight: 600 !important;
        margin: 0.5rem 0 !important;
        flex: 1 !important;
        min-width: 150px !important;
        animation: shake 0.5s ease-in-out, pulse 1s infinite !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: default !important;
    `;
    errorDiv.textContent = message;
    
    groupContainer.insertBefore(errorDiv, groupContainer.firstChild);
    groupContainer.classList.add('error-shake');
    
    if (!document.getElementById('error-styles')) {
        const style = document.createElement('style');
        style.id = 'error-styles';
        style.textContent = `
            @keyframes shake {0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); }}
            @keyframes pulse {0%, 100% { opacity: 1; } 50% { opacity: 0.7; }}
            .error-shake { animation: shake 0.5s ease-in-out; }
        `;
        document.head.appendChild(style);
    }
}

// ✅ FIXED TIMER FUNCTIONS - GLOBAL ACCESS
window.startTimer = function(index, totalSeconds) {
    if (currentTimers[index]) clearInterval(currentTimers[index].interval);
    
    let remainingSeconds = currentTimers[index]?.remainingSeconds || totalSeconds;
    
    currentTimers[index] = {
        totalSeconds: totalSeconds,
        remainingSeconds: remainingSeconds,
        interval: setInterval(function() {
            remainingSeconds--;
            currentTimers[index].remainingSeconds = remainingSeconds;
            
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            const timerDisplay = document.getElementById(`timer-${index}`);
            if (timerDisplay) timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            const progressBar = document.getElementById(`progress-${index}`);
            if (progressBar) {
                const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
                progressBar.style.width = `${Math.min(progress, 100)}%`;
            }
            
            if (remainingSeconds <= 0) {
                clearInterval(currentTimers[index].interval);
                const timerDisplay = document.getElementById(`timer-${index}`);
                const progressBar = document.getElementById(`progress-${index}`);
                if (timerDisplay) timerDisplay.textContent = 'COMPLETE!';
                if (progressBar) progressBar.style.width = '100%';
                delete currentTimers[index];
            }
        }, 1000)
    };
};

window.pauseTimer = function(index) {
    if (currentTimers[index] && currentTimers[index].interval) {
        clearInterval(currentTimers[index].interval);
        currentTimers[index].interval = null;
    }
};

window.resetTimer = function(index, durationStr, totalSeconds) {
    if (currentTimers[index]) {
        clearInterval(currentTimers[index].interval);
        delete currentTimers[index];
    }
    const timerDisplay = document.getElementById(`timer-${index}`);
    const progressBar = document.getElementById(`progress-${index}`);
    if (timerDisplay) timerDisplay.textContent = durationStr;
    if (progressBar) progressBar.style.width = '0%';
};

// ✅ FIXED - PROPER EVENT LISTENERS FOR FIRST PAGE OPTIONS
document.addEventListener('DOMContentLoaded', function() {
    // MODERN PROFILE ICON
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        profileBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" fill="currentColor"/>
                <path d="M20 19C20 16.79 18.21 15 16 15H8C5.79 15 4 16.79 4 19V20H20V19Z" fill="currentColor"/>
            </svg>
        `;
        profileBtn.title = 'View Profile';
        profileBtn.addEventListener('click', showProfile);
    }

    // ✅ FIXED Generate Plan Button
    const generateBtn = document.querySelector('.generate-btn');
    if (generateBtn) generateBtn.addEventListener('click', generatePlan);

    // ✅ FIXED - ALL OPTION BUTTONS ON FIRST PAGE
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.style.cursor = 'pointer'; // Ensure clickable
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const parent = this.parentElement;
            const groupId = parent.id;
            
            // Duration (single select)
            if (groupId === 'durationGroup') {
                userData.duration = parseInt(this.dataset.value);
                UIState.setSingle(groupId, this);
            }
            // Program Duration (single select)
            else if (groupId === 'programDurationGroup') {
                userData.programDays = parseInt(this.dataset.value);
                UIState.setSingle(groupId, this);
            }
            // Goals (single select)
            else if (groupId === 'goalsGroup') {
                UIState.setSingle(groupId, this);
                clearErrorMessage(groupId);
            }
            // Equipment (multi-select except "none")
            else if (groupId === 'equipmentGroup') {
                const isNone = this.dataset.value === 'none';
                const noneBtn = document.querySelector('#equipmentGroup [data-value="none"]');
                if (isNone) {
                    UIState.setSingle(groupId, this);
                } else {
                    if (noneBtn) noneBtn.classList.remove('active');
                    this.classList.toggle('active');
                }
                clearErrorMessage(groupId);
            }
            
            // Visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => this.style.transform = '', 150);
        });
        
        // Hover effect
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // Back buttons
    document.querySelector('#weekSelectionPage .back-btn')?.addEventListener('click', goToUserDetails);
    document.querySelector('#daySelectionPage .back-btn')?.addEventListener('click', goToWeekSelection);
    document.querySelector('#planPage .back-btn')?.addEventListener('click', goToDaySelection);
    document.querySelector('.complete-day-btn')?.addEventListener('click', completeDay);
    document.querySelector('.close-btn')?.addEventListener('click', closeProfile);

    // Tabs
    document.querySelectorAll('.tab').forEach((tab, index) => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.tab-content')[index].classList.add('active');
        });
    });

    loadProgress();
});

function generatePlan() {
    userData.age = parseInt(document.getElementById('age').value) || 20;
    userData.weight = parseInt(document.getElementById('weight').value) || 100;
    userData.height = parseInt(document.getElementById('height').value) || 188;
    userData.equipment = UIState.getActive('equipmentGroup');
    userData.goals = UIState.getActive('goalsGroup');

    console.log('Equipment selected:', userData.equipment); // Debug
    console.log('Goals selected:', userData.goals); // Debug

    if (UIState.getActive('goalsGroup').length !== 1) {
        showErrorMessage('goalsGroup', 'Select 1 Primary Goal');
        return;
    }
    if (UIState.getActive('equipmentGroup').length === 0) {
        showErrorMessage('equipmentGroup', 'Select Equipment');
        return;
    }

    clearErrorMessage('goalsGroup');
    clearErrorMessage('equipmentGroup');
    
    userData.startDate = new Date();
    loadProgress();
    
    document.getElementById('userDetailsPage').classList.remove('active');
    document.getElementById('weekSelectionPage').classList.add('active');
    document.getElementById('profileBtn').style.display = 'flex';
    
    generateWeekGrid();
    updateProgressStats();
}

// Include all other functions (showDay, generateWorkoutPlan, getExercises, etc.) exactly as before
function showDay(day) {
    currentDay = day;
    Object.values(currentTimers).forEach(timer => timer?.interval && clearInterval(timer.interval));
    currentTimers = {};
    
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
    if (!workoutList) return;
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
            <div class="timer-display" id="timer-${index}">${exercise.duration}</div>
            <div class="timer-controls">
                <button class="timer-btn" type="button" onclick="startTimer(${index}, ${exercise.seconds})">Start</button>
                <button class="timer-btn" type="button" onclick="pauseTimer(${index})">Pause</button>
                <button class="timer-btn" type="button" onclick="resetTimer(${index}, '${exercise.duration}', ${exercise.seconds})">Reset</button>
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
    const dayMod = day % 7;
    let exercises = [
        { name: 'Jumping Jacks', duration: '2:00', seconds: 120, description: 'Full body cardio warm-up' },
        { name: 'Arm Circles', duration: '1:00', seconds: 60, description: 'Shoulder mobility' },
        { name: 'Dynamic Stretches', duration: '2:00', seconds: 120, description: 'Prepare muscles' }
    ];

    if (dayMod === 1 || dayMod === 4) {
        if (hasEquipment && userData.equipment.includes('dumbbells')) {
            exercises.push(
                { name: 'Dumbbell Chest Press', duration: '3:00', seconds: 180, description: '4 sets of 10 reps' }
            );
        } else {
            exercises.push(
                { name: 'Push-ups', duration: '2:30', seconds: 150, description: '4 sets to failure' }
            );
        }
    }

    exercises.push(
        { name: 'Plank Hold', duration: '2:00', seconds: 120, description: 'Core strength' },
        { name: 'Walking Recovery', duration: '2:00', seconds: 120, description: 'Cool down' }
    );

    return exercises;
}

function generateWeekGrid() {
    const totalWeeks = Math.ceil(userData.programDays / 7);
    const weekGrid = document.getElementById('weekGrid');
    weekGrid.innerHTML = '';
    
    for (let i = 1; i <= totalWeeks; i++) {
        const weekBtn = document.createElement('div');
        weekBtn.className = 'week-btn';
        weekBtn.innerHTML = `<div style="font-size: 1.5rem;">Week ${i}</div>`;
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
    for (let i = 1; i <= 7; i++) {
        const dayBtn = document.createElement('div');
        dayBtn.className = 'day-btn';
        dayBtn.innerHTML = `<div>Day ${i}</div>`;
        dayBtn.onclick = () => showDay(i);
        dayGrid.appendChild(dayBtn);
    }
}

function goToUserDetails() {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('userDetailsPage').classList.add('active');
    document.getElementById('profileBtn').style.display = 'none';
}

function goToWeekSelection() {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('weekSelectionPage').classList.add('active');
    generateWeekGrid();
}

function showProfile() {
    document.getElementById('profileModal')?.classList.add('active');
}

function closeProfile() {
    document.getElementById('profileModal')?.classList.remove('active');
}
