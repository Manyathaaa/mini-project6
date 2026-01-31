const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const generateToken = (userId, sessionId = null) => {
  const sid = sessionId || uuidv4();
  return {
    token: jwt.sign(
      { 
        id: userId,
        sessionId: sid
      }, 
      process.env.JWT_SECRET || 'changeme', 
      { expiresIn: '7d' }
    ),
    sessionId: sid
  };
};

module.exports = generateToken;
