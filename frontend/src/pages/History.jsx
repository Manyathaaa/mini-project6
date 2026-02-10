import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/sessions/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate('/login');
          return;
        }
        throw new Error('Failed to load session history');
      }

      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (session) => {
    if (session.isActive) {
      return <span style={styles.activeBadge}>🟢 Active</span>;
    } else if (session.revokedReason) {
      return <span style={styles.revokedBadge}>🔴 Revoked</span>;
    } else {
      return <span style={styles.expiredBadge}>⚫ Expired</span>;
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading session history...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📜 Session History</h1>
        <div style={styles.buttonGroup}>
          <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
            ← Dashboard
          </button>
          <button onClick={() => navigate('/sessions')} style={styles.sessionsButton}>
            Active Sessions
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.info}>
        <p>📊 Showing last 50 sessions (active and revoked)</p>
        <p>Total: {history.length} session(s)</p>
      </div>

      {history.length === 0 ? (
        <div style={styles.noSessions}>
          <p>No session history found</p>
        </div>
      ) : (
        <div style={styles.sessionsList}>
          {history.map((session, index) => (
            <div key={session.sessionId} style={styles.sessionCard}>
              <div style={styles.sessionHeader}>
                <div>
                  <h3 style={styles.sessionTitle}>
                    {session.deviceInfo?.browser || 'Unknown Browser'} on{' '}
                    {session.deviceInfo?.os || 'Unknown OS'}
                  </h3>
                  <code style={styles.sessionId}>ID: {session.sessionId}</code>
                </div>
                {getStatusBadge(session)}
              </div>

              <div style={styles.sessionDetails}>
                <div style={styles.detailRow}>
                  <span style={styles.label}>🖥️ Device:</span>
                  <span>{session.deviceInfo?.device || 'Unknown'}</span>
                </div>

                <div style={styles.detailRow}>
                  <span style={styles.label}>🌐 IP Address:</span>
                  <span>{session.ipAddress || 'Unknown'}</span>
                </div>

                <div style={styles.detailRow}>
                  <span style={styles.label}>🔑 Login Time:</span>
                  <span>{formatDate(session.loginTime)}</span>
                </div>

                <div style={styles.detailRow}>
                  <span style={styles.label}>⏱️ Last Activity:</span>
                  <span>{formatDate(session.lastActivity)}</span>
                </div>

                {!session.isActive && session.revokedAt && (
                  <>
                    <div style={styles.detailRow}>
                      <span style={styles.label}>🚫 Revoked At:</span>
                      <span>{formatDate(session.revokedAt)}</span>
                    </div>
                    {session.revokedReason && (
                      <div style={styles.detailRow}>
                        <span style={styles.label}>📋 Reason:</span>
                        <span style={styles.reason}>{session.revokedReason}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  title: {
    fontSize: '32px',
    color: '#333',
    margin: 0,
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  sessionsButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#666',
    padding: '50px',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb',
  },
  info: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
    border: '1px solid #bee5eb',
  },
  noSessions: {
    textAlign: 'center',
    padding: '50px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    color: '#666',
  },
  sessionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  sessionCard: {
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sessionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid #eee',
  },
  sessionTitle: {
    fontSize: '18px',
    color: '#333',
    margin: '0 0 8px 0',
  },
  sessionId: {
    backgroundColor: '#f8f9fa',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#666',
    fontFamily: 'monospace',
  },
  activeBadge: {
    padding: '5px 12px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  revokedBadge: {
    padding: '5px 12px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  expiredBadge: {
    padding: '5px 12px',
    backgroundColor: '#e2e3e5',
    color: '#383d41',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  sessionDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
    minWidth: '140px',
  },
  reason: {
    fontStyle: 'italic',
    color: '#666',
  },
};

export default History;
