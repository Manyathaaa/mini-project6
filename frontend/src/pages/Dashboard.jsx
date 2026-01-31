import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile, logout } from '../services/authService';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        if (data) {
          setProfile(data);
          console.log('Profile loaded:', data);
        } else {
          setError('Failed to load profile');
        }
      } catch (err) {
        setError('Error loading profile');
        console.error('Profile error:', err);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
        <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
        <button onClick={handleLogout}>Go to Login</button>
      </div>
    );
  }

  if (!profile) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Dashboard</h2>
        <button 
          onClick={handleLogout}
          style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '4px', marginBottom: '20px' }}>
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Role:</strong> {profile.role}</p>
        <p><strong>User ID:</strong> {profile._id}</p>
        <p><strong>Created:</strong> {new Date(profile.createdAt).toLocaleString()}</p>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link 
          to="/sessions" 
          style={{ 
            display: 'inline-block',
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '4px',
            fontWeight: 'bold'
          }}
        >
          🔐 Manage Active Sessions
        </Link>
        <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
          View and manage devices where you're logged in
        </p>
      </div>
    </div>
  );
}
