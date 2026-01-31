import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const data = await register({ name, email, password });
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        console.log('Registration successful:', data);
        navigate('/dashboard');
      } else {
        setError('Registration failed. Email may already exist.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Register</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={submit}>
        <div style={{ marginBottom: '15px' }}>
          <input 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            placeholder="Name" 
            value={name} 
            onChange={e=>setName(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            placeholder="Email" 
            type="email"
            value={email} 
            onChange={e=>setEmail(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            placeholder="Password" 
            type="password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)}
            required
            minLength="6"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}
