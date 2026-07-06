const covers = [
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500",
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500",
  "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500",
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500",
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500",
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=500",
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500",
  "https://images.unsplash.com/photo-1501612780327-45045538702b?w=500",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500"
];

function getCoverUrl(song) {
  if (!song || !song._id) return '';
  let hash = 0;
  const str = song._id.toString();
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return covers[Math.abs(hash) % covers.length];
}

const API = '/api';

function getToken() {
  return localStorage.getItem('sonicflow_token');
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('sonicflow_user'));
  } catch {
    return null;
  }
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();

  if (res.status === 401) {
    localStorage.removeItem('sonicflow_token');
    localStorage.removeItem('sonicflow_user');
    window.location.href = '/auth.html';
    return;
  }

  if (!res.ok) throw new Error(data.error || 'Request failed');

  return data;
}

let toastTimer;

function showToast(message, type = 'success') {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.className = 'toast toast-' + type;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

function logout() {
  localStorage.removeItem('sonicflow_token');
  localStorage.removeItem('sonicflow_user');
  window.location.href = '/auth.html';
}

function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function skeleton(count = 6) {
  return Array.from({ length: count }, () =>
    `<div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-line w-70"></div><div class="skeleton-line w-50"></div></div>`
  ).join('');
}
