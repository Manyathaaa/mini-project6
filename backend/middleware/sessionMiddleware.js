const jwt = require('jsonwebtoken');
const Session = require('../models/Session');
const User = require('../models/User');
const { getClientInfo } = require('../utils/deviceInfo');

const validateSession = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
      
      // Find active session
      const session = await Session.findOne({
        sessionId: decoded.sessionId,
        userId: decoded.id,
        isActive: true
      });
      
      if (!session) {
        return res.status(401).json({ message: 'Session expired or invalid' });
      }
      
      // Check if session is expired
      if (session.expiresAt < new Date()) {
        session.isActive = false;
        session.revokedReason = 'Session expired';
        session.revokedAt = new Date();
        await session.save();
        return res.status(401).json({ message: 'Session expired' });
      }
      
      // Get client info (now async)
      const clientInfo = await getClientInfo(req);
      
      // Session hijacking detection: Check IP and User-Agent
      // For localhost/development, be more lenient
      const isLocalhost = session.ipAddress === '::1' || 
                         session.ipAddress.startsWith('127.') ||
                         clientInfo.ipAddress === '::1' ||
                         clientInfo.ipAddress.startsWith('127.');
      
      const ipMismatch = session.ipAddress !== clientInfo.ipAddress;
      const uaMismatch = session.userAgent !== clientInfo.userAgent;
      
      // Only block if BOTH IP and UA are different, or if it's not localhost
      if (!isLocalhost && ipMismatch && uaMismatch) {
        console.warn('⚠️ Suspicious activity detected:', {
          userId: decoded.id,
          sessionId: decoded.sessionId,
          ipMismatch,
          uaMismatch,
          expectedIP: session.ipAddress,
          actualIP: clientInfo.ipAddress,
          expectedUA: session.userAgent.substring(0, 50),
          actualUA: clientInfo.userAgent.substring(0, 50)
        });
        
        // Mark session as suspicious (optional: revoke immediately)
        session.isActive = false;
        session.revokedReason = 'Suspicious activity detected (IP/Device mismatch)';
        session.revokedAt = new Date();
        await session.save();
        
        return res.status(401).json({ 
          message: 'Suspicious activity detected. Session terminated for security.',
          reason: 'ip_or_device_mismatch'
        });
      }
      
      // Log mismatches but don't block for localhost
      if (isLocalhost && (ipMismatch || uaMismatch)) {
        console.log('ℹ️ Localhost mismatch (allowed):', {
          ipMismatch,
          uaMismatch
        });
      }
      
      // Update last activity
      session.lastActivity = new Date();
      await session.save();
      
      // Get user and attach to request
      req.user = await User.findById(decoded.id).select('-password');
      req.session = session;
      
      next();
    } catch (err) {
      console.error('Session validation error:', err);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { validateSession };
