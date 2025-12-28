<<<<<<< HEAD
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
  document.getElementById(tab + 'Tab').classList.add('active');

  loginError.style.display = 'none';
  registerError.style.display = 'none';
  registerSuccess.style.display = 'none';
}

// LOGIN
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      username: loginUsername.value.trim(),
      password: loginPassword.value
    })
  });

  const data = await res.json();

  if (!res.ok) {
    loginError.textContent = data.error;
    loginError.style.display = 'block';
    return;
  }

  localStorage.setItem("user_id", data.user_id);
  alert("✅ Login successful");
  window.location.href = "/home";
});

// REGISTER
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (registerPassword.value !== registerConfirmPassword.value) {
    registerError.textContent = "Passwords do not match";
    registerError.style.display = 'block';
    return;
  }

  const res = await fetch('/api/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      username: registerUsername.value.trim(),
      email: registerEmail.value.trim(),
      password: registerPassword.value
    })
  });

  const data = await res.json();

  if (!res.ok) {
    registerError.textContent = data.error;
    registerError.style.display = 'block';
    return;
  }

  registerSuccess.textContent = "✅ Account created successfully";
  registerSuccess.style.display = 'block';
  setTimeout(() => switchTab('login'), 1500);
});
=======
let users = JSON.parse(localStorage.getItem('demoUsers')) || [];

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + 'Tab').classList.add('active');
    
    // Clear errors
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('registerError').style.display = 'none';
    document.getElementById('registerSuccess').style.display = 'none';
}

// Login handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorMsg = document.getElementById('loginError');
    
    errorMsg.style.display = 'none';
    
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
    alert('✅ Login successful! Welcome back, ' + username + '!');
    console.log('Login successful:', user);
    // Add your actual login logic here
    } else {
    errorMsg.textContent = 'Invalid username or password';
    errorMsg.style.display = 'block';
    }
});

// Register handler
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const errorMsg = document.getElementById('registerError');
    const successMsg = document.getElementById('registerSuccess');
    
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
    
    // Validation
    if (users.find(u => u.username === username)) {
    errorMsg.textContent = 'Username already exists';
    errorMsg.style.display = 'block';
    return;
    }
    
    if (users.find(u => u.email === email)) {
    errorMsg.textContent = 'Email already registered';
    errorMsg.style.display = 'block';
    return;
    }
    
    if (password !== confirmPassword) {
    errorMsg.textContent = 'Passwords do not match';
    errorMsg.style.display = 'block';
    return;
    }
    
    if (password.length < 6) {
    errorMsg.textContent = 'Password must be at least 6 characters';
    errorMsg.style.display = 'block';
    return;
    }
    
    // Create user
    const newUser = { username, email, password };
    users.push(newUser);
    localStorage.setItem('demoUsers', JSON.stringify(users));
    
    successMsg.textContent = '✅ Account created successfully! You can now login.';
    successMsg.style.display = 'block';
    
    // Switch to login tab
    setTimeout(() => switchTab('login'), 1500);
});
>>>>>>> fbf0f574421055968a69aea1b4777bfc9e3afdba
