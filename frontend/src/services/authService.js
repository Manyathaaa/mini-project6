const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function register(payload) {
  const res = await fetch(`${API}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.ok ? res.json() : null;
}

export async function login(payload) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.ok ? res.json() : null;
}

export async function getProfile() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok ? res.json() : null;
}
