const API_BASE = '/api/auth';

const tabs = document.querySelectorAll('.auth-tab');
const forms = document.querySelectorAll('.auth-form');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

function redirectIfLoggedIn() {
  const token = localStorage.getItem('sonicflow_token');
  if (token) window.location.href = '/';
}
redirectIfLoggedIn();

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    forms.forEach((f) => f.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab + 'Form').classList.add('active');
    loginError.textContent = '';
    registerError.textContent = '';
  });
});

async function apiCall(endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

function setLoading(btn, loading) {
  btn.classList.toggle('loading', loading);
  btn.disabled = loading;
}

function handleSuccess(data) {
  localStorage.setItem('sonicflow_token', data.token);
  localStorage.setItem('sonicflow_user', JSON.stringify(data.user));
  window.location.href = '/';
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const btn = loginForm.querySelector('.auth-btn');
  setLoading(btn, true);
  try {
    const data = await apiCall('/login', {
      email: document.getElementById('loginEmail').value,
      password: document.getElementById('loginPassword').value,
    });
    handleSuccess(data);
  } catch (err) {
    loginError.textContent = err.message;
  } finally {
    setLoading(btn, false);
  }
});

function initPasswordToggles() {
  document.querySelectorAll('.password-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.password-wrap').querySelector('input');
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.querySelector('i').className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
      btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
  });
}
initPasswordToggles();

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  registerError.textContent = '';
  const btn = registerForm.querySelector('.auth-btn');
  setLoading(btn, true);
  try {
    const data = await apiCall('/register', {
      username: document.getElementById('regUsername').value,
      email: document.getElementById('regEmail').value,
      password: document.getElementById('regPassword').value,
    });
    handleSuccess(data);
  } catch (err) {
    registerError.textContent = err.message;
  } finally {
    setLoading(btn, false);
  }
});
