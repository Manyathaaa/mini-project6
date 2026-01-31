const Session = require('../models/Session');

// Get all active sessions for current user
exports.getActiveSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      userId: req.user._id,
      isActive: true
    }).sort({ lastActivity: -1 });
    
    // Format response
    const formattedSessions = sessions.map(session => ({
      sessionId: session.sessionId,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      location: session.location,
      loginTime: session.loginTime,
      lastActivity: session.lastActivity,
      isCurrent: session.sessionId === req.session.sessionId
    }));
    
    res.json({ sessions: formattedSessions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Revoke a specific session
exports.revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await Session.findOne({
      sessionId,
      userId: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    session.isActive = false;
    session.revokedReason = 'Manually revoked by user';
    session.revokedAt = new Date();
    await session.save();
    
    res.json({ message: 'Session revoked successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Revoke all other sessions (keep current)
exports.revokeAllOtherSessions = async (req, res) => {
  try {
    const result = await Session.updateMany(
      {
        userId: req.user._id,
        sessionId: { $ne: req.session.sessionId },
        isActive: true
      },
      {
        $set: {
          isActive: false,
          revokedReason: 'Revoked by user (logout all devices)',
          revokedAt: new Date()
        }
      }
    );
    
    res.json({ 
      message: `${result.modifiedCount} session(s) revoked successfully`,
      count: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get session activity/history
exports.getSessionHistory = async (req, res) => {
  try {
    const sessions = await Session.find({
      userId: req.user._id
    })
    .sort({ loginTime: -1 })
    .limit(50);
    
    const history = sessions.map(session => ({
      sessionId: session.sessionId,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      loginTime: session.loginTime,
      lastActivity: session.lastActivity,
      isActive: session.isActive,
      revokedAt: session.revokedAt,
      revokedReason: session.revokedReason
    }));
    
    res.json({ history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
