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

  registerSuccess.textContent = "Account created successfully";
  registerSuccess.style.display = 'block';
  setTimeout(() => switchTab('login'), 1500);
});
