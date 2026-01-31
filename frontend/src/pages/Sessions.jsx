import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveSessions, revokeSession, revokeAllOtherSessions } from '../services/authService';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await getActiveSessions();
      if (data && data.sessions) {
        setSessions(data.sessions);
      } else {
        setError('Failed to load sessions');
      }
    } catch (err) {
      setError('Error loading sessions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleRevokeSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to revoke this session?')) {
      const success = await revokeSession(sessionId);
      if (success) {
        await loadSessions();
      } else {
        alert('Failed to revoke session');
      }
    }
  };

  const handleRevokeAllOther = async () => {
    if (window.confirm('This will log out all other devices. Continue?')) {
      const result = await revokeAllOtherSessions();
      if (result) {
        alert(`${result.count} session(s) revoked successfully`);
        await loadSessions();
      } else {
        alert('Failed to revoke sessions');
      }
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading sessions...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Active Sessions</h2>
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ padding: '8px 16px', marginRight: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Back to Dashboard
          </button>
          {sessions.length > 1 && (
            <button 
              onClick={handleRevokeAllOther}
              style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Logout All Other Devices
            </button>
          )}
        </div>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      {sessions.length === 0 ? (
        <p>No active sessions found.</p>
      ) : (
        <div>
          <p style={{ marginBottom: '20px' }}>You have {sessions.length} active session(s)</p>
          {sessions.map((session) => (
            <div 
              key={session.sessionId} 
              style={{ 
                border: session.isCurrent ? '2px solid #28a745' : '1px solid #ccc', 
                borderRadius: '8px', 
                padding: '15px', 
                marginBottom: '15px',
                backgroundColor: session.isCurrent ? '#d4edda' : '#fff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {session.deviceInfo.browser} on {session.deviceInfo.os}
                    {session.isCurrent && <span style={{ color: '#28a745', marginLeft: '10px' }}>(Current Session)</span>}
                  </div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Device:</strong> {session.deviceInfo.device}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>IP Address:</strong> {session.ipAddress}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Login Time:</strong> {new Date(session.loginTime).toLocaleString()}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Last Activity:</strong> {new Date(session.lastActivity).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <button 
                    onClick={() => handleRevokeSession(session.sessionId)}
                    style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
