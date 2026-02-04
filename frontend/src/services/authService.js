const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function register(payload) {
  try {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      // Store both token and sessionId
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId);
      }
      return data;
    }
    const error = await res.json();
    console.error('Registration error:', error);
    throw new Error(error.message || 'Registration failed');
  } catch (err) {
    console.error('Network error:', err);
    throw err;
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
      const data = await res.json();
      // Store both token and sessionId
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId);
      }
      return data;
    }
    const error = await res.json();
    console.error('Login error:', error);
    throw new Error(error.message || 'Login failed');
  } catch (err) {
    console.error('Network error:', err);
    throw err;
  }
}

export async function logout() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    const res = await fetch(`${API}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // Clear local storage regardless of response
    localStorage.removeItem('token');
    localStorage.removeItem('sessionId');
    
    return res.ok;
  } catch (err) {
    console.error('Logout error:', err);
    // Still clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('sessionId');
    return false;
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
    
    // If session is invalid, clear storage
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('sessionId');
    }
    return null;
  } catch (err) {
    console.error('Network error:', err);
    return null;
  }
}

export async function getActiveSessions() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      throw new Error('Not authenticated');
    }
    const res = await fetch(`${API}/api/sessions/active`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      return await res.json();
    }
    const error = await res.json();
    console.error('Error fetching sessions:', error);
    throw new Error(error.message || 'Failed to fetch sessions');
  } catch (err) {
    console.error('Error fetching sessions:', err);
    throw err;
  }
}

export async function revokeSession(sessionId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }
    const res = await fetch(`${API}/api/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      return true;
    }
    const error = await res.json();
    throw new Error(error.message || 'Failed to revoke session');
  } catch (err) {
    console.error('Error revoking session:', err);
    throw err;
  }
}

export async function revokeAllOtherSessions() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }
    const res = await fetch(`${API}/api/sessions/revoke-all`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      return await res.json();
    }
    const error = await res.json();
    throw new Error(error.message || 'Failed to revoke sessions');
  } catch (err) {
    console.error('Error revoking all sessions:', err);
    throw err;
  }
}
