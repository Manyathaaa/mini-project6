const User = require('../models/User');
const Session = require('../models/Session');
const generateToken = require('../utils/generateToken');
const { getClientInfo } = require('../utils/deviceInfo');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });
    
    // Generate token with session
    const { token, sessionId } = generateToken(user._id);
    
    // Get client info
    const clientInfo = getClientInfo(req);
    
    // Create session
    const session = await Session.create({
      userId: user._id,
      sessionId,
      token,
      ...clientInfo,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
      sessionId
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      // Check for concurrent active sessions
      const activeSessions = await Session.countDocuments({
        userId: user._id,
        isActive: true
      });
      
      // Optional: Limit concurrent sessions (e.g., max 5 devices)
      const MAX_SESSIONS = 5;
      if (activeSessions >= MAX_SESSIONS) {
        // Revoke oldest session
        const oldestSession = await Session.findOne({
          userId: user._id,
          isActive: true
        }).sort({ loginTime: 1 });
        
        if (oldestSession) {
          oldestSession.isActive = false;
          oldestSession.revokedReason = 'Max concurrent sessions reached';
          oldestSession.revokedAt = new Date();
          await oldestSession.save();
        }
      }
      
      // Generate new token and session
      const { token, sessionId } = generateToken(user._id);
      const clientInfo = getClientInfo(req);
      
      // Create new session
      await Session.create({
        userId: user._id,
        sessionId,
        token,
        ...clientInfo,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
        sessionId
      });
    }
    res.status(401).json({ message: 'Invalid credentials' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (user) return res.json(user);
  res.status(404).json({ message: 'User not found' });
};

exports.logout = async (req, res) => {
  try {
    const session = req.session;
    if (session) {
      session.isActive = false;
      session.revokedReason = 'User logout';
      session.revokedAt = new Date();
      await session.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
