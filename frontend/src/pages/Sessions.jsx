import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveSessions, revokeSession, revokeAllOtherSessions } from '../services/authService';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getActiveSessions();
      if (data && data.sessions) {
        setSessions(data.sessions);
      } else {
        setError('No sessions data received');
      }
    } catch (err) {
      const errorMessage = err.message || 'Error loading sessions';
      setError(errorMessage);
      console.error('Sessions error:', err);
      
      // If not authenticated, redirect to login
      if (errorMessage.includes('Not authenticated') || errorMessage.includes('401')) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleRevokeSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to revoke this session?')) {
      try {
        await revokeSession(sessionId);
        await loadSessions();
      } catch (err) {
        alert(`Failed to revoke session: ${err.message}`);
      }
    }
  };

  const handleRevokeAllOther = async () => {
    if (window.confirm('This will log out all other devices. Continue?')) {
      try {
        const result = await revokeAllOtherSessions();
        if (result && result.count !== undefined) {
          alert(`${result.count} session(s) revoked successfully`);
        }
        await loadSessions();
      } catch (err) {
        alert(`Failed to revoke sessions: ${err.message}`);
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
                      <strong>Session ID:</strong> <code style={{ backgroundColor: '#f4f4f4', padding: '2px 6px', borderRadius: '3px', fontSize: '0.85em' }}>{session.sessionId}</code>
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Device:</strong> {session.deviceInfo.device}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Browser:</strong> {session.deviceInfo.browser}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Operating System:</strong> {session.deviceInfo.os}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>IP Address:</strong> {session.ipAddress}
                    </p>
                    {session.userAgent && (
                      <p style={{ margin: '5px 0' }}>
                        <strong>User Agent:</strong> <span style={{ fontSize: '0.8em', color: '#999' }}>{session.userAgent}</span>
                      </p>
                    )}
                    {(session.location?.country || session.location?.state || session.location?.city) && (
                      <div style={{ margin: '5px 0' }}>
                        <strong>Location:</strong>
                        <div style={{ paddingLeft: '20px', marginTop: '5px' }}>
                          {session.location.country && <p style={{ margin: '3px 0' }}>🌍 Country: {session.location.country}</p>}
                          {session.location.state && <p style={{ margin: '3px 0' }}>📍 State: {session.location.state}</p>}
                          {session.location.city && <p style={{ margin: '3px 0' }}>🏙️ City: {session.location.city}</p>}
                          {session.location.street && <p style={{ margin: '3px 0' }}>🛣️ Street/District: {session.location.street}</p>}
                          {session.location.houseNumber && <p style={{ margin: '3px 0' }}>🏠 House Number: {session.location.houseNumber}</p>}
                          {session.location.postalCode && <p style={{ margin: '3px 0' }}>📮 Postal Code: {session.location.postalCode}</p>}
                          {session.location.latitude && session.location.longitude && (
                            <p style={{ margin: '3px 0' }}>📌 Coordinates: {session.location.latitude}, {session.location.longitude}</p>
                          )}
                        </div>
                      </div>
                    )}
                    <p style={{ margin: '5px 0' }}>
                      <strong>Login Time:</strong> {new Date(session.loginTime).toLocaleString()}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Last Activity:</strong> {new Date(session.lastActivity).toLocaleString()}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Expires At:</strong> {new Date(session.expiresAt).toLocaleString()}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Status:</strong> <span style={{ color: session.isActive ? '#28a745' : '#dc3545' }}>{session.isActive ? 'Active ✓' : 'Inactive'}</span>
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
