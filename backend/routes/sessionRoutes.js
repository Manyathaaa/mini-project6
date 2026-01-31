const express = require('express');
const { 
  getActiveSessions, 
  revokeSession, 
  revokeAllOtherSessions,
  getSessionHistory 
} = require('../controllers/sessionController');
const { validateSession } = require('../middleware/sessionMiddleware');

const router = express.Router();

router.get('/active', validateSession, getActiveSessions);
router.get('/history', validateSession, getSessionHistory);
router.delete('/:sessionId', validateSession, revokeSession);
router.post('/revoke-all', validateSession, revokeAllOtherSessions);

module.exports = router;
