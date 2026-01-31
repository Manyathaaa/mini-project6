const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function register(payload) {
  try {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
    const error = await res.json();
    console.error('Registration error:', error);
    return null;
  } catch (err) {
    console.error('Network error:', err);
    return null;
  }
}

export async function login(payload) {
  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
    const error = await res.json();
    console.error('Login error:', error);
    return null;
  } catch (err) {
    console.error('Network error:', err);
    return null;
  }
}

export async function getProfile() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return null;
    }
    const res = await fetch(`${API}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      return await res.json();
    }
    const error = await res.json();
    console.error('Profile error:', error);
    return null;
  } catch (err) {
    console.error('Network error:', err);
    return null;
  }
}
